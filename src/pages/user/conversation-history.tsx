import React, { useEffect, useState } from "react";
import { Loader2, Search, MessageCircleIcon } from "lucide-react";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
} from "@/components/dash-ui/pagination";
import { Button } from "@/components/ui/button";
// Data structure for a single conversation, matching backend expectations
interface Conversation {
  id: string;
  agentName: string;
  userName?: string | null; // userName can be null or undefined
  conversationStart: string; // ISO date string
  lastSaved: string; // ISO date string
  messageCount: number;
  firstMessage?: string; // First message of the conversation
}

// API response structure for fetching conversations
interface ConversationsResponse {
  success: boolean;
  conversations?: Conversation[];
  message?: string;
  totalCount?: number;
}

const CONVERSATIONS_PER_PAGE = 10;

const ConversationHistory: React.FC = () => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [filteredConversations, setFilteredConversations] = useState<
    Conversation[]
  >([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalConversations, setTotalConversations] = useState<number>(0);
  const [searchQuery, setSearchQuery] = useState<string>("");

  useEffect(() => {
    const fetchConversations = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const offset = (currentPage - 1) * CONVERSATIONS_PER_PAGE;
        const response = await fetch(
          `/api/get-conversations?limit=${CONVERSATIONS_PER_PAGE}&offset=${offset}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
            credentials: "include",
          }
        );

        const result: ConversationsResponse = await response.json();

        if (!response.ok) {
          throw new Error(
            result.message || `HTTP error! status: ${response.status}`
          );
        }

        if (result.success && result.conversations) {
          setConversations(result.conversations);
          setFilteredConversations(result.conversations);
          if (result.totalCount !== undefined) {
            setTotalConversations(result.totalCount);
          }
        } else {
          setError(result.message || "Failed to fetch conversations.");
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "An unexpected error occurred.";
        setError(errorMessage);
        console.error("Error fetching conversations:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchConversations();
  }, [currentPage]);

  // Filter conversations when search query changes
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredConversations(conversations);
      return;
    }

    const query = searchQuery.toLowerCase().trim();
    const filtered = conversations.filter(
      (convo) =>
        convo.agentName.toLowerCase().includes(query) ||
        (convo.userName && convo.userName.toLowerCase().includes(query))
    );

    setFilteredConversations(filtered);
  }, [searchQuery, conversations]);

  // Calculate total pages
  const totalPages = Math.ceil(totalConversations / CONVERSATIONS_PER_PAGE);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      setSearchQuery(""); // Clear search when changing pages
      window.scrollTo(0, 0);
    }
  };

  // Generate page numbers to display with ellipsis
  const getPageNumbers = () => {
    const pages = [];

    // Always show first page
    pages.push(1);

    if (currentPage > 3) {
      pages.push("ellipsis-start");
    }

    // Show current page and adjacent pages
    for (
      let i = Math.max(2, currentPage - 1);
      i <= Math.min(totalPages - 1, currentPage + 1);
      i++
    ) {
      if (i > 1 && i < totalPages) {
        pages.push(i);
      }
    }

    if (currentPage < totalPages - 2) {
      pages.push("ellipsis-end");
    }

    // Always show last page if there is more than one page
    if (totalPages > 1) {
      pages.push(totalPages);
    }

    return pages;
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-40">
        <p className="text-neutral-500 dark:text-neutral-400">
          <Loader2 className="animate-spin" />
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className="p-4 my-4 text-sm text-red-700 bg-red-100 rounded-lg dark:bg-red-200 dark:text-red-800"
        role="alert"
      >
        <span className="font-medium">Error:</span> {error}
      </div>
    );
  }

  if (conversations.length === 0) {
    return (
      <div className="text-center py-10">
        <p className="text-neutral-600 dark:text-neutral-400">
          No conversation history found.
        </p>
      </div>
    );
  }

  // Helper to format date
  const formatDate = (dateString: string) => {
    if (!dateString) return "Invalid date";
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="text-foreground p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-4 sm:mb-6">
        <h2 className="text-xl sm:text-2xl font-semibold text-primary">
          Conversation History
        </h2>

        <div>
          <div className="rounded-lg border shadow-md overflow-hidden">
            <div className="flex items-center px-3 bg-muted">
              <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
              <input
                type="text"
                placeholder="Search conversations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full border-0 flex-1 py-3 outline-none bg-muted text-sm placeholder:text-muted-foreground"
              />
            </div>
          </div>
        </div>
      </div>

      {filteredConversations.length === 0 && searchQuery ? (
        <div className="text-center py-10">
          <p className="text-neutral-600 dark:text-neutral-400">
            No conversations found matching "{searchQuery}".
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredConversations.map((convo) => (
            <div
              key={convo.id}
              className="p-4 border border-border rounded-lg hover:shadow-lg transition-shadow duration-200 bg-neutral-50 dark:bg-neutral-900/50"
            >
              <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-2">
                <h3 className="text-lg font-medium text-foreground">
                  {convo.agentName.startsWith("user-") ||
                  convo.agentName.startsWith("dash-main")
                    ? "Dashboard Agent"
                    : convo.agentName}
                </h3>
                <Button variant="outline">
                  <MessageCircleIcon className="w-4 h-4 mr-2" />
                  <span className="text-xs text-muted-foreground mt-1 sm:mt-0">
                    Messages: {convo.messageCount}
                  </span>
                </Button>
              </div>
              <div className="text-sm text-muted-foreground space-y-1">
                <p>
                  Started:{" "}
                  <span className="font-medium text-foreground">
                    {formatDate(convo.conversationStart)}
                  </span>
                </p>
                <p>
                  Last Saved:{" "}
                  <span className="font-medium text-foreground">
                    {formatDate(convo.lastSaved)}
                  </span>
                </p>
                {convo.firstMessage && (
                  <p className="mt-2 text-right line-clamp-2 text-foreground italic">
                    "{convo.firstMessage}"
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {totalPages > 1 && !searchQuery && (
        <Pagination className="mt-8">
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                onClick={() => handlePageChange(currentPage - 1)}
                className={
                  currentPage === 1
                    ? "pointer-events-none opacity-50"
                    : "cursor-pointer"
                }
              />
            </PaginationItem>

            {getPageNumbers().map((page, idx) =>
              page === "ellipsis-start" || page === "ellipsis-end" ? (
                <PaginationItem key={`ellipsis-${idx}`}>
                  <PaginationEllipsis />
                </PaginationItem>
              ) : (
                <PaginationItem key={`page-${page}`}>
                  <PaginationLink
                    isActive={currentPage === page}
                    onClick={() => handlePageChange(Number(page))}
                    className="cursor-pointer"
                  >
                    {page}
                  </PaginationLink>
                </PaginationItem>
              )
            )}

            <PaginationItem>
              <PaginationNext
                onClick={() => handlePageChange(currentPage + 1)}
                className={
                  currentPage === totalPages
                    ? "pointer-events-none opacity-50"
                    : "cursor-pointer"
                }
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </div>
  );
};

export default ConversationHistory;
