import { useState } from "react";

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  images?: string[];
}

export function useChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
  };

  const handleSubmit = async (
    e: React.FormEvent,
    data?: { images?: { url: string; name: string }[]; context?: string }
  ) => {
    e.preventDefault();
    if (!input.trim()) return;

    // We don't show the context in the UI message, but we send it to the backend
    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      images: data?.images?.map((img) => img.url),
    };

    const newMessages = [...messages, userMessage];
    
    // If context exists, we append it to the last message for the API call only
    const messagesToBackend = data?.context 
      ? [...newMessages.slice(0, -1), { ...userMessage, content: `${input}\n\n[CONTEXT]\n${data.context}` }]
      : newMessages;

    setMessages(newMessages);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: messagesToBackend }),
      });

      if (!response.ok) throw new Error("Failed to fetch response");
      const result = await response.json();

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: result.text,
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    messages,
    input,
    setInput,
    handleInputChange,
    handleSubmit,
    isLoading,
  };
}
