import React from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import {
  MessageSquare,
  History,
  Archive,
  Search,
  Settings,
  Plus,
  ExternalLink,
  Users,
} from "lucide-react";
import ConversationHistory from "@/pages/user/conversation-history";

export default function DashboardConversations() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30">
      {/* Hero Section with Gradient Background */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-indigo-600/10 to-purple-600/10" />
        <div className="relative p-6 space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                Conversations
              </h1>
              <p className="text-gray-600 mt-1">
                View and manage your chat history and interactions
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button size="sm" variant="outline" className="h-9">
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
              <Button
                size="sm"
                className="h-9 bg-gradient-to-r from-blue-600 to-indigo-600"
              >
                <Plus className="h-4 w-4 mr-2" />
                New Chat
              </Button>
            </div>
          </div>

          {/* Conversation Blocks - Gradient Style */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 group">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-indigo-600" />
              <CardContent className="relative p-6 text-white">
                <div className="flex items-center justify-between mb-3">
                  <MessageSquare className="h-8 w-8" />
                  <History className="h-5 w-5 opacity-70" />
                </div>
                <h3 className="font-semibold text-lg mb-1">Recent Chats</h3>
                <p className="text-blue-100 text-sm mb-3">
                  Your latest conversations
                </p>
                <Button
                  size="sm"
                  variant="secondary"
                  className="bg-white/20 hover:bg-white/30 text-white border-white/30 group-hover:bg-white/30"
                >
                  View
                  <ExternalLink className="h-3 w-3 ml-2" />
                </Button>
              </CardContent>
            </Card>

            <Card className="relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 group">
              <div className="absolute inset-0 bg-gradient-to-br from-green-500 to-emerald-600" />
              <CardContent className="relative p-6 text-white">
                <div className="flex items-center justify-between mb-3">
                  <Archive className="h-8 w-8" />
                  <MessageSquare className="h-5 w-5 opacity-70" />
                </div>
                <h3 className="font-semibold text-lg mb-1">Archived</h3>
                <p className="text-green-100 text-sm mb-3">
                  Saved conversation history
                </p>
                <Button
                  size="sm"
                  variant="secondary"
                  className="bg-white/20 hover:bg-white/30 text-white border-white/30 group-hover:bg-white/30"
                >
                  Browse
                  <ExternalLink className="h-3 w-3 ml-2" />
                </Button>
              </CardContent>
            </Card>

            <Card className="relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 group">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-pink-600" />
              <CardContent className="relative p-6 text-white">
                <div className="flex items-center justify-between mb-3">
                  <Search className="h-8 w-8" />
                  <Archive className="h-5 w-5 opacity-70" />
                </div>
                <h3 className="font-semibold text-lg mb-1">Search</h3>
                <p className="text-purple-100 text-sm mb-3">
                  Find conversations & topics
                </p>
                <Button
                  size="sm"
                  variant="secondary"
                  className="bg-white/20 hover:bg-white/30 text-white border-white/30 group-hover:bg-white/30"
                >
                  Search
                  <ExternalLink className="h-3 w-3 ml-2" />
                </Button>
              </CardContent>
            </Card>

            <Card className="relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 group">
              <div className="absolute inset-0 bg-gradient-to-br from-orange-500 to-red-600" />
              <CardContent className="relative p-6 text-white">
                <div className="flex items-center justify-between mb-3">
                  <Users className="h-8 w-8" />
                  <MessageSquare className="h-5 w-5 opacity-70" />
                </div>
                <h3 className="font-semibold text-lg mb-1">Shared</h3>
                <p className="text-orange-100 text-sm mb-3">
                  Team & collaborative chats
                </p>
                <Button
                  size="sm"
                  variant="secondary"
                  className="bg-white/20 hover:bg-white/30 text-white border-white/30 group-hover:bg-white/30"
                >
                  Manage
                  <ExternalLink className="h-3 w-3 ml-2" />
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="p-6 space-y-6">
        <ConversationHistory />
      </div>
    </div>
  );
}
