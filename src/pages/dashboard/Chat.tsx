import { useState, useEffect, useRef } from "react";
import { useChat } from "@ai-sdk/react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import {
  Trash2,
  Send,
  Plus,
  MessageSquare,
  Paperclip,
  X,
  File,
  Image,
  FileText,
  Settings,
  Bot,
  User,
  Search,
  Lightbulb,
  Eye,
  Code,
  FileText as SummarizeIcon,
  MoreHorizontal,
  Sparkles,
  Camera,
  Mic,
  ChevronDown,
  ArrowUp,
} from "lucide-react";
import ReactMarkdown from "react-markdown";

interface Chat {
  id: string;
  title: string | null;
  model: string;
  createdAt: string;
  updatedAt: string;
}

interface ChatResponse {
  chat: Chat;
}

interface ChatsResponse {
  chats: Chat[];
}

const Chat = () => {
  const [chats, setChats] = useState<Chat[]>([]);
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [isCreatingChat, setIsCreatingChat] = useState(false);
  const [files, setFiles] = useState<FileList | undefined>(undefined);
  const [selectedModel, setSelectedModel] = useState(
    "claude-4-sonnet-20250219"
  );
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    isLoading,
    reload,
    stop,
    setMessages,
    append,
  } = useChat({
    api: selectedChatId ? `/api/chat/${selectedChatId}/messages` : undefined,
    sendExtraMessageFields: true, // Send id and createdAt fields
    onError: (error) => {
      console.error("Chat error:", error);
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive",
      });
    },
  });

  // Fetch user's chats on mount
  useEffect(() => {
    fetchChats();
  }, []);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  // Load messages when chat is selected
  useEffect(() => {
    if (selectedChatId) {
      fetchChatMessages(selectedChatId);
    }
  }, [selectedChatId]);

  const fetchChats = async () => {
    try {
      const response = await fetch("/api/chat");
      if (!response.ok) throw new Error("Failed to fetch chats");
      const data: ChatsResponse = await response.json();
      setChats(data.chats);

      // Select the most recent chat if none selected
      if (data.chats.length > 0 && !selectedChatId) {
        setSelectedChatId(data.chats[0].id);
      }
    } catch (error) {
      console.error("Error fetching chats:", error);
      toast({
        title: "Error",
        description: "Failed to load chats",
        variant: "destructive",
      });
    }
  };

  const fetchChatMessages = async (chatId: string) => {
    try {
      const response = await fetch(`/api/chat/${chatId}`);
      if (!response.ok) throw new Error("Failed to fetch messages");
      const data: { chat: Chat; messages: any[] } = await response.json();

      // Transform messages to the format expected by useChat
      const transformedMessages = data.messages.map((msg: any) => ({
        id: msg.id,
        role: msg.role === "tool" ? "system" : msg.role,
        content: msg.content,
        createdAt: new Date(msg.createdAt),
      }));

      setMessages(transformedMessages);
    } catch (error) {
      console.error("Error fetching messages:", error);
      toast({
        title: "Error",
        description: "Failed to load messages",
        variant: "destructive",
      });
    }
  };

  const createNewChat = async () => {
    try {
      setIsCreatingChat(true);
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: "New Chat",
          model: selectedModel,
        }),
      });

      if (!response.ok) throw new Error("Failed to create chat");
      const data: ChatResponse = await response.json();

      setChats([data.chat, ...chats]);
      setSelectedChatId(data.chat.id);
      setFiles(undefined);

      toast({
        title: "Success",
        description: "New chat created",
      });
    } catch (error) {
      console.error("Error creating chat:", error);
      toast({
        title: "Error",
        description: "Failed to create chat",
        variant: "destructive",
      });
    } finally {
      setIsCreatingChat(false);
    }
  };

  const deleteChat = async (chatId: string) => {
    try {
      const response = await fetch(`/api/chat/${chatId}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete chat");

      setChats(chats.filter((chat) => chat.id !== chatId));
      if (selectedChatId === chatId) {
        setSelectedChatId(chats.length > 1 ? chats[0].id : null);
      }

      toast({
        title: "Success",
        description: "Chat deleted",
      });
    } catch (error) {
      console.error("Error deleting chat:", error);
      toast({
        title: "Error",
        description: "Failed to delete chat",
        variant: "destructive",
      });
    }
  };

  const updateChatTitle = async (chatId: string, title: string) => {
    try {
      const response = await fetch(`/api/chat/${chatId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title }),
      });

      if (!response.ok) throw new Error("Failed to update chat");

      setChats(
        chats.map((chat) => (chat.id === chatId ? { ...chat, title } : chat))
      );
    } catch (error) {
      console.error("Error updating chat:", error);
    }
  };

  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith("image/")) return <Image className="w-4 h-4" />;
    if (fileType.includes("pdf")) return <FileText className="w-4 h-4" />;
    return <File className="w-4 h-4" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  return (
    <div className="h-full flex bg-gray-50">
      {/* Sidebar */}
      <div
        className={`${isSidebarOpen ? "w-64" : "w-0"} transition-all duration-300 bg-gray-900 overflow-hidden flex flex-col`}
      >
        <div className="p-4 border-b border-gray-800">
          <Button
            onClick={createNewChat}
            disabled={isCreatingChat}
            className="w-full bg-gray-800 hover:bg-gray-700 text-white border border-gray-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            New chat
          </Button>
        </div>

        <ScrollArea className="flex-1 px-3">
          <div className="space-y-1 py-2">
            {chats.map((chat) => (
              <div
                key={chat.id}
                className={`group cursor-pointer rounded-lg px-3 py-2 transition-all hover:bg-gray-800 ${
                  selectedChatId === chat.id
                    ? "bg-gray-800 text-white"
                    : "text-gray-300 hover:text-white"
                }`}
                onClick={() => setSelectedChatId(chat.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {chat.title || "New chat"}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 text-gray-400 hover:text-white"
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteChat(chat.id);
                    }}
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>

        <div className="p-4 border-t border-gray-800">
          <Select value={selectedModel} onValueChange={setSelectedModel}>
            <SelectTrigger className="w-full bg-gray-800 border-gray-700 text-white">
              <SelectValue placeholder="Select model" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="claude-4-sonnet-20250219">
                Claude 4 Sonnet
              </SelectItem>
              <SelectItem value="o4-mini">o4 mini</SelectItem>
              <SelectItem value="gemini-2.5-pro">Gemini 2.5 Pro</SelectItem>
              <SelectItem value="claude-4-opus-20250219">
                Claude 4 Opus
              </SelectItem>
              <SelectItem value="gpt-4.1">GPT-4.1</SelectItem>
              <SelectItem value="o3">o3</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <div className="bg-white border-b px-4 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="hover:bg-gray-100"
            >
              <MessageSquare className="h-5 w-5" />
            </Button>
            <h2 className="text-lg font-semibold text-gray-800">
              {selectedModel.includes("claude")
                ? "Claude"
                : selectedModel.includes("gemini")
                  ? "Gemini"
                  : "GPT"}{" "}
              {selectedModel.includes("mini") ? "Mini" : ""}
            </h2>
          </div>
          <Button variant="ghost" size="icon">
            <Settings className="h-5 w-5 text-gray-600" />
          </Button>
        </div>

        {selectedChatId ? (
          <>
            {/* Messages Area */}
            <ScrollArea ref={scrollAreaRef} className="flex-1">
              <div className="max-w-3xl mx-auto px-4 py-8">
                {messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center py-20">
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center mb-6">
                      <Sparkles className="w-10 h-10 text-white" />
                    </div>
                    <h1 className="text-4xl font-semibold text-gray-900 mb-4">
                      What can I help with?
                    </h1>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex gap-3 ${
                          message.role === "user" ? "" : ""
                        }`}
                      >
                        {/* Avatar */}
                        <div className="flex-shrink-0">
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center ${
                              message.role === "user"
                                ? "bg-gray-700 text-white"
                                : "bg-gradient-to-br from-violet-500 to-purple-600 text-white"
                            }`}
                          >
                            {message.role === "user" ? (
                              <User className="w-4 h-4" />
                            ) : (
                              <Sparkles className="w-4 h-4" />
                            )}
                          </div>
                        </div>

                        {/* Message Content */}
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-semibold text-gray-900 mb-1">
                            {message.role === "user" ? "You" : "Assistant"}
                          </div>
                          <div className="prose prose-sm max-w-none text-gray-800">
                            {message.role === "assistant" ? (
                              <ReactMarkdown
                                components={{
                                  code({
                                    node,
                                    className,
                                    children,
                                    ...props
                                  }: any) {
                                    const inline =
                                      !className ||
                                      !className.startsWith("language-");
                                    return (
                                      <code
                                        className={`${
                                          inline
                                            ? "bg-gray-100 text-gray-800 px-1.5 py-0.5 rounded text-sm font-mono"
                                            : "block bg-gray-900 text-gray-100 p-4 rounded-lg mt-2 text-sm font-mono overflow-x-auto"
                                        } ${className || ""}`}
                                        {...props}
                                      >
                                        {children}
                                      </code>
                                    );
                                  },
                                  p: ({ children }) => (
                                    <p className="mb-3 last:mb-0 leading-relaxed">
                                      {children}
                                    </p>
                                  ),
                                  ul: ({ children }) => (
                                    <ul className="list-disc list-inside mb-3 space-y-1">
                                      {children}
                                    </ul>
                                  ),
                                  ol: ({ children }) => (
                                    <ol className="list-decimal list-inside mb-3 space-y-1">
                                      {children}
                                    </ol>
                                  ),
                                }}
                              >
                                {message.content}
                              </ReactMarkdown>
                            ) : (
                              <p className="whitespace-pre-wrap leading-relaxed">
                                {message.content}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}

                    {isLoading && (
                      <div className="flex gap-3">
                        <div className="flex-shrink-0">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 text-white flex items-center justify-center">
                            <Sparkles className="w-4 h-4" />
                          </div>
                        </div>
                        <div className="flex-1">
                          <div className="text-sm font-semibold text-gray-900 mb-1">
                            Assistant
                          </div>
                          <div className="flex space-x-1">
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                            <div
                              className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                              style={{ animationDelay: "0.1s" }}
                            />
                            <div
                              className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                              style={{ animationDelay: "0.2s" }}
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </ScrollArea>

            {/* Input Area */}
            <div className="border-t bg-white">
              <div className="max-w-3xl mx-auto px-4 py-4">
                {/* Quick Actions */}
                {messages.length === 0 && (
                  <div className="flex flex-wrap gap-2 mb-4 justify-center">
                    <Button
                      variant="outline"
                      size="sm"
                      className="rounded-full text-gray-700 hover:bg-gray-100"
                      onClick={() => {
                        const prompts = [
                          "Explain quantum computing in simple terms",
                          "Write a Python function to reverse a string",
                          "What are the benefits of meditation?",
                          "How do I make the perfect omelette?",
                        ];
                        const randomPrompt =
                          prompts[Math.floor(Math.random() * prompts.length)];
                        append({ role: "user", content: randomPrompt });
                      }}
                    >
                      <Lightbulb className="w-4 h-4 mr-2" />
                      Brainstorm
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="rounded-full text-gray-700 hover:bg-gray-100"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Camera className="w-4 h-4 mr-2" />
                      Analyze images
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="rounded-full text-gray-700 hover:bg-gray-100"
                      onClick={() =>
                        append({
                          role: "user",
                          content: "Help me write some code",
                        })
                      }
                    >
                      <Code className="w-4 h-4 mr-2" />
                      Code
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="rounded-full text-gray-700 hover:bg-gray-100"
                      onClick={() =>
                        append({
                          role: "user",
                          content: "Summarize this text for me",
                        })
                      }
                    >
                      <SummarizeIcon className="w-4 h-4 mr-2" />
                      Summarize text
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="rounded-full text-gray-700 hover:bg-gray-100"
                    >
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </div>
                )}

                {/* File preview */}
                {files && files.length > 0 && (
                  <div className="mb-3">
                    <div className="flex flex-wrap gap-2">
                      {Array.from(files).map((file, index) => (
                        <div
                          key={index}
                          className="flex items-center space-x-2 bg-gray-100 rounded-lg px-3 py-2"
                        >
                          {getFileIcon(file.type)}
                          <span className="text-sm text-gray-700">
                            {file.name}
                          </span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-4 w-4"
                            onClick={() => {
                              const newFiles = Array.from(files).filter(
                                (_, i) => i !== index
                              );
                              const dataTransfer = new DataTransfer();
                              newFiles.forEach((f) =>
                                dataTransfer.items.add(f)
                              );
                              setFiles(dataTransfer.files);
                            }}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Input Form */}
                <form
                  onSubmit={(e) => {
                    handleSubmit(e, {
                      experimental_attachments: files,
                    });
                    setFiles(undefined);
                    if (fileInputRef.current) {
                      fileInputRef.current.value = "";
                    }
                  }}
                  className="relative"
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    onChange={(e) => {
                      if (e.target.files) {
                        setFiles(e.target.files);
                      }
                    }}
                    className="hidden"
                  />

                  <div className="relative flex items-end gap-2">
                    <div className="flex-1 relative">
                      <Textarea
                        value={input}
                        onChange={handleInputChange}
                        placeholder="Ask anything"
                        className="resize-none rounded-xl border-gray-300 bg-gray-50 pr-12 min-h-[52px] max-h-32 py-3.5 px-4 text-gray-900 placeholder:text-gray-500 focus:bg-white focus:border-gray-400"
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && !e.shiftKey) {
                            e.preventDefault();
                            handleSubmit(e as any, {
                              experimental_attachments: files,
                            });
                            setFiles(undefined);
                            if (fileInputRef.current) {
                              fileInputRef.current.value = "";
                            }
                          }
                        }}
                      />
                      <div className="absolute left-3 bottom-3 flex items-center space-x-1">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-gray-500 hover:text-gray-700"
                          onClick={() => fileInputRef.current?.click()}
                        >
                          <Paperclip className="h-4 w-4" />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-gray-500 hover:text-gray-700"
                        >
                          <Search className="h-4 w-4" />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-gray-500 hover:text-gray-700"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="absolute right-3 bottom-3">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-gray-500 hover:text-gray-700"
                        >
                          <Mic className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <Button
                      type="submit"
                      size="icon"
                      disabled={isLoading || (!input.trim() && !files)}
                      className="h-10 w-10 rounded-full bg-gray-700 hover:bg-gray-800 disabled:bg-gray-300 transition-colors"
                    >
                      <ArrowUp className="h-4 w-4" />
                    </Button>
                  </div>
                </form>

                <p className="text-xs text-center text-gray-500 mt-3">
                  By messaging Assistant, you agree to our Terms and have read
                  our Privacy Policy.
                </p>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-white">
            <div className="text-center max-w-2xl px-4">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center mx-auto mb-6">
                <Sparkles className="w-10 h-10 text-white" />
              </div>
              <h1 className="text-4xl font-semibold text-gray-900 mb-8">
                What can I help with?
              </h1>

              <Button
                onClick={createNewChat}
                disabled={isCreatingChat}
                className="bg-gray-700 hover:bg-gray-800"
              >
                <Plus className="w-4 h-4 mr-2" />
                Start new chat
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Chat;
