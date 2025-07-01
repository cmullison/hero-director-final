import { Hono } from "hono";
import type { Env, Database } from "../lib/types";
import { Kysely } from "kysely";
import { v4 as uuidv4 } from "uuid";
import { streamText } from "ai";
import type { Message, CoreMessage } from "ai";
import { model, anthropicModel, anthropicOpusModel, geminiModel } from "../lib/model";

type HonoContext = {
  Bindings: Env;
  Variables: {
    user: { id: string };
    db: Kysely<Database>;
  };
};

const chatAPI = new Hono<HonoContext>();

// Get all chats for a user
chatAPI.get("/", async (c) => {
  try {
    const user = c.get("user");
    const db = c.get("db");
    
    const chats = await db
      .selectFrom("chats")
      .selectAll()
      .where("userId", "=", user.id)
      .orderBy("createdAt", "desc")
      .execute();
    
    return c.json({ chats });
  } catch (error) {
    console.error("Error fetching chats:", error);
    return c.json({ error: "Failed to fetch chats" }, 500);
  }
});

// Get a specific chat with messages
chatAPI.get("/:id", async (c) => {
  try {
    const user = c.get("user");
    const db = c.get("db");
    const chatId = c.req.param("id");
    
    if (!chatId) {
      return c.json({ error: "Chat ID is required" }, 400);
    }
    
    const chat = await db
      .selectFrom("chats")
      .selectAll()
      .where("id", "=", chatId)
      .where("userId", "=", user.id)
      .executeTakeFirst();
    
    if (!chat) {
      return c.json({ error: "Chat not found" }, 404);
    }
    
    const messages = await db
      .selectFrom("messages")
      .selectAll()
      .where("chatId", "=", chatId)
      .orderBy("createdAt", "asc")
      .execute();
    
    return c.json({ chat, messages });
  } catch (error) {
    console.error("Error fetching chat:", error);
    return c.json({ error: "Failed to fetch chat" }, 500);
  }
});

// Create a new chat
chatAPI.post("/", async (c) => {
  try {
    const user = c.get("user");
    const db = c.get("db");
    const { title, model = "gpt-4o-mini" } = await c.req.json();
    
    const chatId = uuidv4();
    const now = new Date().toISOString();
    
    await db
      .insertInto("chats")
      .values({
        id: chatId,
        userId: user.id,
        title,
        model,
        createdAt: now,
        updatedAt: now,
      })
      .execute();
    
    const chat = await db
      .selectFrom("chats")
      .selectAll()
      .where("id", "=", chatId)
      .executeTakeFirst();
    
    return c.json({ chat });
  } catch (error) {
    console.error("Error creating chat:", error);
    return c.json({ error: "Failed to create chat" }, 500);
  }
});

// Delete a chat
chatAPI.delete("/:id", async (c) => {
  try {
    const user = c.get("user");
    const db = c.get("db");
    const chatId = c.req.param("id");
    
    if (!chatId) {
      return c.json({ error: "Chat ID is required" }, 400);
    }
    
    await db
      .deleteFrom("chats")
      .where("id", "=", chatId)
      .where("userId", "=", user.id)
      .execute();
    
    return c.json({ success: true });
  } catch (error) {
    console.error("Error deleting chat:", error);
    return c.json({ error: "Failed to delete chat" }, 500);
  }
});

// Send a message and get AI response - properly handles useChat format
chatAPI.post("/:id/messages", async (c) => {
  try {
    const user = c.get("user");
    const db = c.get("db");
    const chatId = c.req.param("id");
    
    if (!chatId) {
      return c.json({ error: "Chat ID is required" }, 400);
    }
    
    // Parse the request from useChat hook
    const body = await c.req.json();
    const messages = body.messages as Message[];
    
    if (!messages || !Array.isArray(messages)) {
      return c.json({ error: "Messages array is required" }, 400);
    }
    
    // Verify chat belongs to user
    const chat = await db
      .selectFrom("chats")
      .selectAll()
      .where("id", "=", chatId)
      .where("userId", "=", user.id)
      .executeTakeFirst();
    
    if (!chat) {
      return c.json({ error: "Chat not found" }, 404);
    }
    
    // Save the last user message if it's new
    const lastMessage = messages[messages.length - 1];
    if (lastMessage && lastMessage.role === "user") {
      // Check if message already exists
      const existingMessage = await db
        .selectFrom("messages")
        .selectAll()
        .where("id", "=", lastMessage.id)
        .executeTakeFirst();
      
      if (!existingMessage) {
        await db
          .insertInto("messages")
          .values({
            id: lastMessage.id,
            chatId,
            role: "user",
            content: lastMessage.content,
            toolInvocations: null,
            createdAt: new Date().toISOString(),
          })
          .execute();
      }
    }
    
    // Transform messages for the AI SDK with proper attachment handling
    const transformedMessages: CoreMessage[] = messages.map(msg => {
      // Handle attachments for multi-modal models
      if (msg.experimental_attachments && msg.experimental_attachments.length > 0) {
        // Convert attachments to multi-part content for the AI SDK
        const parts: Array<{ type: 'text', text: string } | { type: 'image', image: string | URL }> = [];
        
        // Add the text content if present
        if (msg.content) {
          parts.push({ type: "text", text: msg.content });
        }
        
        // Add each attachment as an image part
        for (const attachment of msg.experimental_attachments) {
          if (attachment.contentType?.startsWith('image/') && attachment.url) {
            parts.push({
              type: "image",
              image: attachment.url,
            });
          } else if (attachment.contentType?.startsWith('text/') && attachment.url) {
            // For text files, we could fetch and include the content
            // For now, just mention the file
            parts.push({
              type: "text",
              text: `[Attached file: ${attachment.name}]`
            });
          }
        }
        
        return {
          role: msg.role as "user" | "assistant" | "system",
          content: parts,
        } as CoreMessage;
      }
      
      // Regular message without attachments
      return {
        role: msg.role as "user" | "assistant" | "system",
        content: msg.content,
      } as CoreMessage;
    });
    
    // Choose model based on chat settings
    const selectedModel = chat.model.startsWith("claude-opus") 
      ? anthropicOpusModel
      : chat.model.startsWith("claude")
      ? anthropicModel
      : chat.model.startsWith("gemini")
      ? geminiModel
      : model;
    
    // Stream AI response
    const result = await streamText({
      model: selectedModel,
      messages: transformedMessages,
      onFinish: async ({ text }) => {
        // Save assistant message
        const assistantMessageId = uuidv4();
        await db
          .insertInto("messages")
          .values({
            id: assistantMessageId,
            chatId,
            role: "assistant",
            content: text,
            toolInvocations: null,
            createdAt: new Date().toISOString(),
          })
          .execute();
          
        // Update chat's updatedAt
        await db
          .updateTable("chats")
          .set({ updatedAt: new Date().toISOString() })
          .where("id", "=", chatId)
          .execute();
      },
    });
    
    return result.toDataStreamResponse();
  } catch (error) {
    console.error("Error sending message:", error);
    return c.json({ error: "Failed to send message" }, 500);
  }
});

// Update chat title
chatAPI.patch("/:id", async (c) => {
  try {
    const user = c.get("user");
    const db = c.get("db");
    const chatId = c.req.param("id");
    const { title } = await c.req.json();
    
    if (!chatId) {
      return c.json({ error: "Chat ID is required" }, 400);
    }
    
    await db
      .updateTable("chats")
      .set({ 
        title,
        updatedAt: new Date().toISOString() 
      })
      .where("id", "=", chatId)
      .where("userId", "=", user.id)
      .execute();
    
    return c.json({ success: true });
  } catch (error) {
    console.error("Error updating chat:", error);
    return c.json({ error: "Failed to update chat" }, 500);
  }
});

export { chatAPI }; 