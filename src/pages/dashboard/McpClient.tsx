import React, { useRef, useState } from "react";
import { useAgent } from "agents/react";
import { nanoid } from "nanoid";
import type { MCPServersState } from "agents";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, Plus, Trash2, Server, Zap } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";

interface ChatMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: Date;
}

let sessionId = localStorage.getItem("mcpSessionId");
if (!sessionId) {
  sessionId = nanoid(8);
  localStorage.setItem("mcpSessionId", sessionId);
}

export default function McpClient() {
  const [isConnected, setIsConnected] = useState(false);
  const mcpUrlInputRef = useRef<HTMLInputElement>(null);
  const mcpNameInputRef = useRef<HTMLInputElement>(null);
  const [chatInput, setChatInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [mcpState, setMcpState] = useState<MCPServersState>({
    servers: {},
    tools: [],
    prompts: [],
    resources: [],
  });

  const agent = useAgent<any, never>({
    agent: "mcp-agent",
    name: sessionId!,
    onOpen: () => setIsConnected(true),
    onClose: () => setIsConnected(false),
    onMcpUpdate: (mcpServers: MCPServersState) => {
      setMcpState(mcpServers);
    },
  });

  function openPopup(authUrl: string) {
    window.open(
      authUrl,
      "popupWindow",
      "width=600,height=800,resizable=yes,scrollbars=yes,toolbar=yes,menubar=no,location=no,directories=no,status=yes"
    );
  }

  const handleMcpSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!mcpUrlInputRef.current || !mcpUrlInputRef.current.value.trim()) return;
    const serverUrl = mcpUrlInputRef.current.value;

    if (!mcpNameInputRef.current || !mcpNameInputRef.current.value.trim())
      return;
    const serverName = mcpNameInputRef.current.value;

    agent.call("addUserMcpServer", [serverName, serverUrl]);
    setMcpState({
      ...mcpState,
      servers: {
        ...mcpState.servers,
        placeholder: {
          name: serverName,
          server_url: serverUrl,
          state: "connecting",
          auth_url: null,
          instructions: null,
          capabilities: null,
        },
      },
    });

    // Clear inputs
    mcpUrlInputRef.current.value = "";
    mcpNameInputRef.current.value = "";
  };

  const handleSendMessage = async () => {
    if (!chatInput.trim()) return;

    const newMessage: ChatMessage = {
      id: nanoid(),
      role: "user",
      content: chatInput,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, newMessage]);
    setChatInput("");

    // Here you would normally send the message to your agent
    // For now, we'll just add a placeholder response
    setTimeout(() => {
      const response: ChatMessage = {
        id: nanoid(),
        role: "assistant",
        content:
          "MCP chat functionality will be connected to your agent backend.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, response]);
    }, 1000);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">MCP Client</h1>
        <Badge variant={isConnected ? "default" : "secondary"}>
          {isConnected ? "Connected" : "Disconnected"}
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Servers and Tools */}
        <div className="space-y-6">
          {/* Add Server Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Server className="h-5 w-5" />
                MCP Servers
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleMcpSubmit} className="space-y-3">
                <Input
                  ref={mcpNameInputRef}
                  placeholder="Server Name"
                  className="w-full"
                />
                <Input
                  ref={mcpUrlInputRef}
                  placeholder="Server URL"
                  className="w-full"
                />
                <Button type="submit" className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Server
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Connected Servers */}
          <Card>
            <CardHeader>
              <CardTitle>Connected Servers</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {Object.entries(mcpState.servers).map(([id, server]) => (
                <div key={id} className="p-3 border rounded-lg space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold">{server.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {server.server_url}
                      </p>
                    </div>
                    <Badge
                      variant={
                        server.state === "ready"
                          ? "default"
                          : server.state === "authenticating"
                            ? "secondary"
                            : "outline"
                      }
                    >
                      {server.state}
                    </Badge>
                  </div>
                  {server.state === "authenticating" && server.auth_url && (
                    <Button
                      size="sm"
                      onClick={() => openPopup(server.auth_url as string)}
                      className="w-full"
                    >
                      Authorize
                    </Button>
                  )}
                </div>
              ))}

              {Object.keys(mcpState.servers).length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No servers connected
                </p>
              )}

              <div className="flex gap-2 mt-4">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => agent.call("disconnectServers")}
                  className="flex-1"
                >
                  Disconnect All
                </Button>
                <Button
                  size="sm"
                  onClick={() => agent.call("connectServers")}
                  className="flex-1"
                >
                  Connect All
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Available Tools */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Available Tools ({mcpState.tools.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[300px]">
                <div className="space-y-2">
                  {mcpState.tools.map((tool) => (
                    <div
                      key={`${tool.name}-${tool.serverId}`}
                      className="p-3 border rounded-lg hover:bg-accent/50 transition-colors"
                    >
                      <p className="font-medium">{tool.name}</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        {tool.description || "No description available"}
                      </p>
                      <Badge variant="outline" className="mt-2">
                        {tool.serverId}
                      </Badge>
                    </div>
                  ))}

                  {mcpState.tools.length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      No tools available
                    </p>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Chat Interface */}
        <div className="lg:col-span-2">
          <Card className="h-[800px] flex flex-col">
            <CardHeader>
              <CardTitle>MCP Chat</CardTitle>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col">
              {/* Messages Area */}
              <ScrollArea className="flex-1 pr-4 mb-4">
                <div className="space-y-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${
                        message.role === "user"
                          ? "justify-end"
                          : "justify-start"
                      }`}
                    >
                      <div
                        className={`max-w-[80%] p-3 rounded-lg ${
                          message.role === "user"
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted"
                        }`}
                      >
                        <p className="text-sm">{message.content}</p>
                        <p className="text-xs opacity-70 mt-1">
                          {message.timestamp.toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  ))}

                  {messages.length === 0 && (
                    <div className="text-center text-muted-foreground py-8">
                      <p>Start a conversation with your MCP servers</p>
                      <p className="text-sm mt-2">
                        Connect a server and use the available tools
                      </p>
                    </div>
                  )}
                </div>
              </ScrollArea>

              {/* Input Area */}
              <div className="flex gap-2">
                <Textarea
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type your message..."
                  className="flex-1 min-h-[60px] max-h-[120px]"
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={!chatInput.trim()}
                  size="icon"
                  className="h-[60px] w-[60px]"
                >
                  <Send className="h-5 w-5" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Additional Server Info (Prompts & Resources) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Prompts ({mcpState.prompts.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[200px]">
              <div className="space-y-2">
                {mcpState.prompts.map((prompt) => (
                  <div
                    key={`${prompt.name}-${prompt.serverId}`}
                    className="p-3 border rounded-lg"
                  >
                    <p className="font-medium">{prompt.name}</p>
                    <Badge variant="outline" className="mt-1">
                      {prompt.serverId}
                    </Badge>
                  </div>
                ))}

                {mcpState.prompts.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center">
                    No prompts available
                  </p>
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Resources ({mcpState.resources.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[200px]">
              <div className="space-y-2">
                {mcpState.resources.map((resource) => (
                  <div
                    key={`${resource.name}-${resource.serverId}`}
                    className="p-3 border rounded-lg"
                  >
                    <p className="font-medium">{resource.name}</p>
                    <Badge variant="outline" className="mt-1">
                      {resource.serverId}
                    </Badge>
                  </div>
                ))}

                {mcpState.resources.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center">
                    No resources available
                  </p>
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
