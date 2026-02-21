"use client";

import { useChat } from "@/hooks/use-chat";
import { useEffect, useRef, useState } from "react";
import { X, User, Bot } from "lucide-react";
import ReactMarkdown from 'react-markdown';

export default function Chat() {
  const {
    messages,
    input,
    setInput,
    handleInputChange,
    handleSubmit,
    isLoading,
  } = useChat();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const [allImages, setAllImages] = useState<
    { url: string; key: string; name: string }[]
  >([]);
  const [filteredImages, setFilteredImages] = useState<
    { url: string; key: string; name: string }[]
  >([]);
  const [showMenu, setShowMenu] = useState(false);

  // Track mentioned images
  const [mentionedImages, setMentionedImages] = useState<
    { url: string; name: string }[]
  >([]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    const storedAssets = localStorage.getItem("my-assets");
    if (storedAssets) {
      setAllImages(JSON.parse(storedAssets));
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleInputChangeWrapper = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value, selectionStart } = e.target;
    handleInputChange(e);

    if (selectionStart === null) return;

    const textBeforeCursor = value.slice(0, selectionStart);
    const segments = textBeforeCursor.split(" ");
    const currentWord = segments[segments.length - 1];

    if (currentWord.startsWith("@")) {
      const query = currentWord.slice(1).toLowerCase();
      const filtered = allImages.filter((img) =>
        (img.name || "").toLowerCase().includes(query),
      );
      setFilteredImages(filtered);
      setShowMenu(true);
    } else {
      setShowMenu(false);
    }
  };

  const insertMention = (imageName: string, imageUrl: string) => {
    if (!inputRef.current) return;

    const cursorPosition = inputRef.current.selectionStart || 0;
    const textBefore = input.slice(0, cursorPosition);
    const textAfter = input.slice(cursorPosition);

    const lastSpaceIndex = textBefore.lastIndexOf(" ");
    const startOfMention = lastSpaceIndex === -1 ? 0 : lastSpaceIndex + 1;

    const newValue =
      input.slice(0, startOfMention) + `@${imageName} ` + textAfter;
    setInput(newValue);

    // Add to mentioned images
    setMentionedImages((prev) => {
      if (prev.some((item) => item.url === imageUrl)) return prev;
      return [...prev, { url: imageUrl, name: imageName }];
    });

    setShowMenu(false);
    inputRef.current.focus();
  };

  const removeMention = (index: number) => {
    setMentionedImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmitWrapper = (e: React.FormEvent) => {
    handleSubmit(e, { images: mentionedImages });
    setMentionedImages([]); // Clear mentions after submit
  };

  return (
    <div className="flex flex-col h-screen w-full max-w-md mx-auto bg-white border-x border-gray-200">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex items-end gap-2 ${
              message.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
            {message.role === "assistant" && (
              <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
                <Bot size={14} className="text-gray-600" />
              </div>
            )}
            <div
              className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm ${
                message.role === "user"
                  ? "bg-blue-600 text-white rounded-br-none"
                  : "bg-gray-100 text-gray-800 rounded-bl-none"
              }`}
            >
              {message.role === "assistant" ? (
                <ReactMarkdown
                  components={{
                    p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                    ul: ({ children }) => <ul className="list-disc ml-4 mb-2">{children}</ul>,
                    ol: ({ children }) => <ol className="list-decimal ml-4 mb-2">{children}</ol>,
                    li: ({ children }) => <li className="mb-1">{children}</li>,
                    a: ({ href, children }) => (
                      <a href={href} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                        {children}
                      </a>
                    ),
                    code: ({ children }) => (
                      <code className="bg-black/10 rounded px-1 py-0.5 font-mono text-xs">{children}</code>
                    ),
                    pre: ({ children }) => (
                      <pre className="bg-gray-900 text-gray-100 p-3 rounded-lg overflow-x-auto mb-2 mt-2">{children}</pre>
                    ),
                  }}
                >
                  {message.content}
                </ReactMarkdown>
              ) : (
                message.content
              )}
            </div>
            {message.role === "user" && (
              <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                <User size={14} className="text-blue-600" />
              </div>
            )}
          </div>
        ))}
        {isLoading && (
          <div className="flex items-end gap-2 justify-start">
            <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
              <Bot size={14} className="text-gray-600" />
            </div>
            <div className="bg-gray-100 rounded-2xl rounded-bl-none px-4 py-3 space-y-2 min-w-[140px]">
              <div className="h-2.5 bg-gray-300 rounded w-3/4 animate-pulse"></div>
              <div className="h-2.5 bg-gray-300 rounded w-1/2 animate-pulse"></div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <form
        onSubmit={handleSubmitWrapper}
        className="p-4 border-t border-gray-200 bg-white"
      >
        {/* Mentioned Images Pills */}
        {mentionedImages.length > 0 && (
          <div className="mb-2 flex flex-wrap gap-2">
            {mentionedImages.map((img, idx) => (
              <div
                key={idx}
                className="inline-flex items-center gap-1 bg-gray-100 text-gray-600 px-2 py-1 rounded-md text-xs border border-gray-200"
              >
                <span className="font-medium">@{img.name}</span>
                <button
                  type="button"
                  onClick={() => removeMention(idx)}
                  className="ml-1 hover:text-red-500 transition-colors"
                >
                  <X size={12} />
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="relative">
          {showMenu && filteredImages.length > 0 && (
            <div className="absolute bottom-full left-0 w-full mb-2 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto z-10">
              {filteredImages.map((img, idx) => (
                <button
                  key={idx}
                  type="button"
                  className="w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center gap-2"
                  onClick={() => insertMention(img.name, img.url)}
                >
                  <div className="w-6 h-6 rounded bg-gray-200 overflow-hidden flex-shrink-0">
                    <img
                      src={img.url}
                      alt={img.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <span className="text-sm truncate">{img.name}</span>
                </button>
              ))}
            </div>
          )}

          <input
            ref={inputRef}
            type="text"
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={input}
            placeholder={
              isLoading
                ? "Waiting for response..."
                : "Type @ to mention an image..."
            }
            onChange={handleInputChangeWrapper}
            disabled={isLoading}
          />
        </div>
      </form>
    </div>
  );
}
