"use client";

import { useChat } from "@/hooks/use-chat";
import { useEffect, useRef, useState } from "react";
import { X, User, Bot, Send, Plus, Code, Sparkles } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { Editor } from "grapesjs";

interface EditorAssistantProps {
  editor: Editor | null;
}

export function EditorAssistant({ editor }: EditorAssistantProps) {
  const {
    messages,
    input,
    setInput,
    handleInputChange,
    handleSubmit,
    isLoading,
  } = useChat();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const [allImages, setAllImages] = useState<{ url: string; key: string; name: string }[]>([]);
  const [filteredImages, setFilteredImages] = useState<{ url: string; key: string; name: string }[]>([]);
  const [showMenu, setShowMenu] = useState(false);
  const [mentionedImages, setMentionedImages] = useState<{ url: string; name: string }[]>([]);
  const [selectedElement, setSelectedElement] = useState<string | null>(null);

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

  useEffect(() => {
    if (!editor) return;

    const updateSelection = () => {
      const selected = editor.getSelected();
      if (selected) {
        const type = selected.get("type");
        const tagName = selected.get("tagName");
        const label = (type && type !== "default" && type !== "text") ? type : tagName;
        setSelectedElement(label ? label.toUpperCase() : "ELEMENT");
      } else {
        setSelectedElement(null);
      }
    };

    editor.on("component:selected", updateSelection);
    editor.on("component:deselected", updateSelection);
    updateSelection();

    return () => {
      editor.off("component:selected", updateSelection);
      editor.off("component:deselected", updateSelection);
    };
  }, [editor]);

  const handleInputChangeWrapper = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const { value, selectionStart } = e.target;
    handleInputChange(e);

    if (selectionStart === null) return;

    const textBeforeCursor = value.slice(0, selectionStart);
    const segments = textBeforeCursor.split(" ");
    const currentWord = segments[segments.length - 1];

    if (currentWord.startsWith("@")) {
      const query = currentWord.slice(1).toLowerCase();
      const filtered = allImages.filter((img) =>
        (img.name || "").toLowerCase().includes(query)
      );
      setFilteredImages(filtered);
      setShowMenu(true);
    } else {
      setShowMenu(false);
    }

    // Dynamic height adjustment
    e.target.style.height = "auto";
    e.target.style.height = `${Math.min(e.target.scrollHeight, 200)}px`;
  };

  const insertMention = (imageName: string, imageUrl: string) => {
    if (!inputRef.current) return;
    const cursorPosition = inputRef.current.selectionStart || 0;
    const textBefore = input.slice(0, cursorPosition);
    const textAfter = input.slice(cursorPosition);
    const lastSpaceIndex = textBefore.lastIndexOf(" ");
    const startOfMention = lastSpaceIndex === -1 ? 0 : lastSpaceIndex + 1;
    const newValue = input.slice(0, startOfMention) + `@${imageName} ` + textAfter;
    setInput(newValue);
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
    // Capture Editor Context
    let context = "";
    if (editor) {
      const selected = editor.getSelected();
      if (selected) {
        context = `SELECTED ELEMENT HTML:\n${selected.toHTML()}\n\nSELECTED ELEMENT CSS:\n${JSON.stringify(selected.getStyle())}`;
      }
    }

    handleSubmit(e, { images: mentionedImages, context });
    setMentionedImages([]);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmitWrapper(e as unknown as React.FormEvent);
    }
  };

  const handleAddToCanvas = (html: string) => {
    if (!editor) return;
    const selected = editor.getSelected();
    if (selected) {
      selected.replaceWith(html);
    } else {
      editor.addComponents(html);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center text-gray-400 text-sm mt-10">
            <Bot className="mx-auto h-8 w-8 mb-2 opacity-50" />
            <p>Select an element on the canvas and ask me to change it.</p>
          </div>
        )}
        {messages.map((message) => {
          // Try to parse JSON content from assistant
          let explanation = message.content;
          let htmlCode = "";
          
          if (message.role === "assistant") {
            try {
              const parsed = JSON.parse(message.content);
              if (parsed.html || parsed.explanation) {
                explanation = parsed.explanation || "";
                htmlCode = parsed.html || "";
              }
            } catch (e) {
              // Fallback to raw text if not valid JSON
            }
          }

          return (
            <div key={message.id} className={`flex flex-col gap-1 ${message.role === "user" ? "items-end" : "items-start"}`}>
              <div className={`max-w-[90%] rounded-lg px-3 py-2 text-sm ${message.role === "user" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-800"}`}>
                {message.role === "assistant" ? (
                  <>
                    <ReactMarkdown components={{
                        code: ({ children }) => <code className="bg-black/10 rounded px-1 font-mono text-xs">{children}</code>,
                        pre: ({ children }) => <pre className="bg-gray-900 text-gray-100 p-2 rounded overflow-x-auto my-2 text-xs">{children}</pre>,
                      }}
                    >
                      {explanation}
                    </ReactMarkdown>
                    
                    {htmlCode && (
                      <div className="mt-3 border border-gray-200 rounded-md overflow-hidden bg-white">
                        <div className="bg-gray-50 px-3 py-2 border-b border-gray-200 flex justify-between items-center">
                          <div className="flex items-center gap-1 text-xs font-medium text-gray-500">
                            <Code size={12} />
                            <span>Generated Code</span>
                          </div>
                          <button 
                            onClick={() => handleAddToCanvas(htmlCode)}
                            className="flex items-center gap-1 text-xs bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700 transition-colors"
                          >
                            <Plus size={12} /> Add to Canvas
                          </button>
                        </div>
                        <div className="p-2 bg-gray-900 overflow-x-auto">
                          <pre className="text-gray-300 text-xs font-mono">{htmlCode.slice(0, 100)}...</pre>
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  message.content
                )}
              </div>
            </div>
          );
        })}
        {isLoading && (
          <div className="flex items-center gap-2 text-gray-400 text-xs">
            <Bot size={12} /> Thinking...
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSubmitWrapper} className="p-3 border-t border-gray-200 bg-white relative">
        {selectedElement && (
          <div className="mb-2 flex items-center justify-between bg-blue-50 border border-blue-100 rounded-lg px-3 py-2 animate-in fade-in slide-in-from-bottom-1">
            <div className="flex items-center gap-2 text-xs text-blue-700 font-medium">
              <Sparkles size={14} />
              <span>Editing: {selectedElement}</span>
            </div>
            <button 
              type="button" 
              onClick={() => editor?.select(undefined)}
              className="text-blue-400 hover:text-blue-600"
            >
              <X size={14} />
            </button>
          </div>
        )}

        {mentionedImages.length > 0 && (
          <div className="mb-2 flex flex-wrap gap-1">
            {mentionedImages.map((img, idx) => (
              <div key={idx} className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded text-xs border border-blue-100">
                <span>@{img.name}</span>
                <button type="button" onClick={() => removeMention(idx)}><X size={10} /></button>
              </div>
            ))}
          </div>
        )}

        {showMenu && filteredImages.length > 0 && (
          <div className="absolute bottom-full left-0 w-full mb-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-40 overflow-y-auto z-20">
            {filteredImages.map((img, idx) => (
              <button key={idx} type="button" className="w-full text-left px-3 py-2 hover:bg-gray-50 flex items-center gap-2 text-xs" onClick={() => insertMention(img.name, img.url)}>
                <img src={img.url} alt={img.name} className="w-4 h-4 rounded object-cover" />
                <span className="truncate">{img.name}</span>
              </button>
            ))}
          </div>
        )}

        <div className="relative flex items-center">
          <textarea
            ref={inputRef}
            className="w-full pl-3 pr-10 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none overflow-hidden"
            rows={1}
            value={input}
            placeholder={isLoading ? "Waiting for response..." : "Ask AI..."}
            onChange={handleInputChangeWrapper}
            onKeyDown={handleKeyDown}
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="absolute right-2 bottom-2 p-1 text-blue-600 hover:bg-blue-50 rounded disabled:opacity-50"
          >
            <Send size={16} />
          </button>
        </div>
      </form>
    </div>
  );
}
