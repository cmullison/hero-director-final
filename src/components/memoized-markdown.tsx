import { marked } from "marked";
import type { Tokens } from "marked";
import { memo, useMemo, useState, useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import "highlight.js/styles/atom-one-light.css";
import "highlight.js/styles/atom-one-dark.css";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";
import { Button } from "@/components/chat/button/Button";
import { SaveIcon, Copy, Check, Save } from "lucide-react";
import { cn } from "@/lib/utils";
import { InputPromptDialog } from "./dash-ui/input-prompt-dialog";

function parseMarkdownIntoBlocks(markdown: string): string[] {
  const tokens: TokensList = marked.lexer(markdown);
  return tokens.map((token: Tokens.Generic) => token.raw);
}

type TokensList = Array<Tokens.Generic & { raw: string }>;

// Type for the saveCodeBlock function prop
interface SaveCodeBlockParams {
  title: string;
  language: string;
  code: string;
}
type SaveCodeBlockFn = (params: SaveCodeBlockParams) => Promise<any>;

// Image component with error handling
const ImageWithFallback = memo(
  ({ src, alt, ...props }: React.ImgHTMLAttributes<HTMLImageElement>) => {
    const [hasError, setHasError] = useState(false);
    const [loading, setLoading] = useState(true);

    // Log image loading
    console.log(`Attempting to load image: ${src}`);

    return hasError ? (
      <div className="flex flex-col items-center justify-center bg-neutral-100 dark:bg-neutral-800 p-4 rounded-lg my-4 border border-dashed border-neutral-300 dark:border-neutral-700">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-neutral-500 mb-2"
        >
          <rect width="18" height="18" x="3" y="3" rx="2" ry="2"></rect>
          <circle cx="9" cy="9" r="2"></circle>
          <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"></path>
        </svg>
        <span className="text-sm text-neutral-500">
          {alt || "Image failed to load"}
        </span>
        <span className="text-xs text-red-500 mt-1">Error loading: {src}</span>
      </div>
    ) : (
      <div className="relative">
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-neutral-100 dark:bg-neutral-800 rounded-lg">
            <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full"></div>
          </div>
        )}
        <img
          src={src}
          alt={alt}
          onError={(e) => {
            console.error(`Failed to load image: ${src}`, e);
            setHasError(true);
            setLoading(false);
          }}
          onLoad={() => {
            console.log(`Successfully loaded image: ${src}`);
            setLoading(false);
          }}
          loading="lazy"
          className="max-w-full h-auto rounded-lg my-4 border border-neutral-200 dark:border-neutral-800"
          {...props}
        />
      </div>
    );
  }
);

ImageWithFallback.displayName = "ImageWithFallback";

interface MemoizedMarkdownBlockProps {
  content: string;
  saveCodeBlock?: SaveCodeBlockFn;
}

// Simplified version of the MemoizedMarkdownBlock
const MemoizedMarkdownBlock = memo(
  ({ content, saveCodeBlock }: MemoizedMarkdownBlockProps) => {
    const [isPromptOpen, setIsPromptOpen] = useState(false);
    const [codeBlockToSave, setCodeBlockToSave] = useState<{
      language: string;
      code: string;
    } | null>(null);

    // Handle theme switching for code blocks
    useEffect(() => {
      const isDark = document.documentElement.classList.contains("dark");

      // Remove existing theme classes and add the appropriate one
      const codeBlocks = document.querySelectorAll("pre code");
      codeBlocks.forEach((block) => {
        const pre = block.parentElement;
        if (pre) {
          pre.className = pre.className.replace(/hljs-theme-\w+/g, "");
          pre.classList.add(isDark ? "hljs-theme-dark" : "hljs-theme-light");
        }
      });

      // Inject CSS to override highlight.js themes based on current theme
      const existingStyle = document.getElementById("hljs-theme-override");
      if (existingStyle) {
        existingStyle.remove();
      }

      const style = document.createElement("style");
      style.id = "hljs-theme-override";

      if (isDark) {
        // Force dark theme styles
        style.textContent = `
          .hljs {
            background: #282c34 !important;
            color: #abb2bf !important;
          }
        `;
      } else {
        // Force light theme styles
        style.textContent = `
          .hljs {
            background: #fafafa !important;
            color: #383a42 !important;
          }
        `;
      }

      document.head.appendChild(style);

      // Listen for theme changes
      const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          if (
            mutation.type === "attributes" &&
            mutation.attributeName === "class"
          ) {
            const isDark = document.documentElement.classList.contains("dark");
            const style = document.getElementById("hljs-theme-override");
            if (style) {
              if (isDark) {
                style.textContent = `
                  .hljs {
                    background: #282c34 !important;
                    color: #abb2bf !important;
                  }
                `;
              } else {
                style.textContent = `
                  .hljs {
                    background: #fafafa !important;
                    color: #383a42 !important;
                  }
                `;
              }
            }
          }
        });
      });

      observer.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ["class"],
      });

      return () => {
        observer.disconnect();
        const style = document.getElementById("hljs-theme-override");
        if (style) {
          style.remove();
        }
      };
    }, []);

    return (
      <>
        <div className="markdown-body relative group">
          {/* @ts-ignore - Ignore all TypeScript errors for ReactMarkdown component rendering */}
          <ReactMarkdown
            remarkPlugins={[remarkGfm, remarkMath]}
            rehypePlugins={[rehypeKatex, rehypeHighlight]}
            components={{
              code(props) {
                const { children, className, node } = props;
                const match = /language-(\w+)/.exec(className || "");
                const language = match ? match[1] : "";
                const codeText = String(children).replace(/\n$/, "");

                const isBlock =
                  node?.position?.start?.line !== node?.position?.end?.line ||
                  (className && match);

                if (isBlock && language) {
                  const handleOpenSaveDialog = () => {
                    if (saveCodeBlock) {
                      setCodeBlockToSave({ language, code: codeText });
                      setIsPromptOpen(true);
                    }
                  };
                  try {
                    return (
                      <div className="relative group my-4">
                        <pre className="relative rounded-lg overflow-x-auto">
                          <code className={className}>{children}</code>
                          {saveCodeBlock && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={handleOpenSaveDialog}
                              className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-black/50 hover:bg-black/70 text-white px-2 py-1 rounded"
                              aria-label="Save code block"
                            >
                              <SaveIcon size={12} className="mr-1" />
                              Save
                            </Button>
                          )}
                        </pre>
                      </div>
                    );
                  } catch (e) {
                    console.error("Error rendering code block:", e);
                    return (
                      <pre className="rounded-lg overflow-x-auto">
                        <code className={className}>{children}</code>
                      </pre>
                    );
                  }
                }

                if (isBlock && !language) {
                  return (
                    <pre className="rounded-lg overflow-x-auto my-4">
                      <code className={className}>{children}</code>
                    </pre>
                  );
                }

                // Inline code
                return (
                  <code
                    className={cn(
                      className,
                      "bg-neutral-200 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 px-1.5 py-0.5 rounded text-sm font-mono"
                    )}
                  >
                    {children}
                  </code>
                );
              },
              a(props) {
                const { href, children } = props;
                return (
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:text-primary/90 underline-offset-4 hover:underline transition-colors"
                  >
                    {children}
                  </a>
                );
              },
              img(props) {
                return <ImageWithFallback {...props} />;
              },
              table(props) {
                return (
                  <div className="overflow-x-auto my-4">
                    <table {...props} />
                  </div>
                );
              },
            }}
          >
            {content}
          </ReactMarkdown>
        </div>
        {codeBlockToSave && (
          <InputPromptDialog
            isOpen={isPromptOpen}
            setIsOpen={setIsPromptOpen}
            dialogTitle="Save Code Block"
            promptLabel="Enter a title for the code block:"
            placeholder="e.g., My Python Script"
            initialValue=""
            onSave={(title) => {
              if (saveCodeBlock && codeBlockToSave) {
                saveCodeBlock({
                  title,
                  language: codeBlockToSave.language,
                  code: codeBlockToSave.code,
                });
              }
              setCodeBlockToSave(null);
            }}
          />
        )}
      </>
    );
  },
  (prevProps, nextProps) => prevProps.content === nextProps.content
);

MemoizedMarkdownBlock.displayName = "MemoizedMarkdownBlock";

export const MemoizedMarkdown = memo(
  ({
    content,
    id,
    className,
    saveCodeBlock,
  }: {
    content: string;
    id: string;
    className?: string;
    saveCodeBlock?: SaveCodeBlockFn;
  }) => {
    const memoizedBlocks = useMemo(() => {
      const blocks = parseMarkdownIntoBlocks(content);
      return blocks.map((block, index) => (
        <MemoizedMarkdownBlock
          content={block}
          key={`${id}-block_${index}`}
          saveCodeBlock={saveCodeBlock}
        />
      ));
    }, [content, id, saveCodeBlock]);

    return (
      <div className={cn("prose dark:prose-invert break-words", className)}>
        {memoizedBlocks}
      </div>
    );
  },
  (prevProps, nextProps) =>
    prevProps.content === nextProps.content &&
    prevProps.id === nextProps.id &&
    prevProps.saveCodeBlock === nextProps.saveCodeBlock &&
    prevProps.className === nextProps.className
);

MemoizedMarkdown.displayName = "MemoizedMarkdown";
