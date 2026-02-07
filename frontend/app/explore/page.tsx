'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';
import Logo from '@/components/Logo';
import ChatPanel from '@/components/explore/ChatPanel';
import Canvas from '@/components/explore/Canvas';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  isStatus?: boolean;
}

export default function ExplorePage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [artifactHtml, setArtifactHtml] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSendMessage = useCallback(
    async (content: string) => {
      // Add user message
      const userMessage: Message = {
        id: `user-${Date.now()}`,
        role: 'user',
        content,
      };

      // Build the conversation for the API (text-only history)
      const conversationHistory = [...messages, userMessage]
        .filter((m) => !m.isStatus)
        .map((m) => ({
          role: m.role,
          content: m.content,
        }));

      setMessages((prev) => [...prev, userMessage]);
      setIsLoading(true);

      // ID for the assistant response we'll build up
      const assistantId = `assistant-${Date.now()}`;
      // ID for status messages (we'll replace these)
      const statusId = `status-${Date.now()}`;

      try {
        const response = await fetch(`${API_BASE_URL}/api/explore/chat`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ messages: conversationHistory }),
        });

        if (!response.ok) {
          const err = await response.json().catch(() => ({ message: 'Request failed' }));
          throw new Error(err.message || 'Request failed');
        }

        // Add initial status message
        setMessages((prev) => [
          ...prev,
          { id: statusId, role: 'assistant', content: 'Thinking...', isStatus: true },
        ]);

        // Read the SSE stream
        const reader = response.body!.getReader();
        const decoder = new TextDecoder();
        let buffer = '';
        let finalTextReceived = false;

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });

          // SSE events are separated by double newlines
          const parts = buffer.split('\n\n');
          buffer = parts.pop() || '';

          for (const part of parts) {
            const lines = part.split('\n');
            let eventType = '';
            let eventData = '';

            for (const line of lines) {
              if (line.startsWith('event: ')) {
                eventType = line.slice(7);
              } else if (line.startsWith('data: ')) {
                eventData = line.slice(6);
              }
            }

            if (!eventType || !eventData) continue;

            try {
              const data = JSON.parse(eventData);

              switch (eventType) {
                case 'status':
                  // Update the status message
                  setMessages((prev) =>
                    prev.map((m) =>
                      m.id === statusId
                        ? { ...m, content: data.message, isStatus: true }
                        : m
                    )
                  );
                  break;

                case 'text':
                  finalTextReceived = true;
                  // Replace status message with the real assistant message
                  setMessages((prev) =>
                    prev.map((m) =>
                      m.id === statusId
                        ? {
                            id: assistantId,
                            role: 'assistant' as const,
                            content: data.content,
                            isStatus: false,
                          }
                        : m
                    )
                  );
                  break;

                case 'artifact':
                  setArtifactHtml(data.html);
                  break;

                case 'error':
                  setMessages((prev) =>
                    prev.map((m) =>
                      m.id === statusId || m.id === assistantId
                        ? {
                            id: assistantId,
                            role: 'assistant' as const,
                            content: `Something went wrong: ${data.message}`,
                            isStatus: false,
                          }
                        : m
                    )
                  );
                  break;

                case 'done':
                  // If we never received text, remove the status message
                  if (!finalTextReceived) {
                    setMessages((prev) => prev.filter((m) => m.id !== statusId));
                  }
                  break;
              }
            } catch {
              // Ignore JSON parse errors in SSE stream
            }
          }
        }
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'An unexpected error occurred';
        setMessages((prev) => {
          // Remove any status message and add error
          const filtered = prev.filter((m) => m.id !== statusId);
          return [
            ...filtered,
            {
              id: assistantId,
              role: 'assistant',
              content: `Sorry, I couldn't process that request. ${errorMessage}`,
            },
          ];
        });
      } finally {
        setIsLoading(false);
      }
    },
    [messages]
  );

  return (
    <div className="h-screen flex flex-col bg-white">
      {/* Thin top bar */}
      <header className="border-b border-gray-200 px-4 py-2.5 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-4">
          <Link
            href="/"
            className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 transition-colors"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18"
              />
            </svg>
            <span className="hidden sm:inline">Marketplace</span>
          </Link>
          <div className="h-4 w-px bg-gray-200" />
          <div className="flex items-center gap-2">
            <Logo />
            <span className="text-sm font-medium text-gray-900">Explore</span>
          </div>
        </div>
      </header>

      {/* Main content: Canvas + Chat */}
      <div className="flex-1 flex overflow-hidden">
        {/* Canvas area */}
        <div className="flex-1 min-w-0">
          <Canvas html={artifactHtml} />
        </div>

        {/* Chat panel */}
        <div className="w-[380px] flex-shrink-0 border-l border-gray-200">
          <ChatPanel
            messages={messages}
            isLoading={isLoading}
            onSendMessage={handleSendMessage}
          />
        </div>
      </div>
    </div>
  );
}
