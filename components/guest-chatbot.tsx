"use client";

import { useEffect, useRef, useState } from "react";
import { Bot, MessageCircle, Send, Sparkles, X } from "lucide-react";
import {
  getBotReply,
  QUICK_QUESTIONS,
  type ChatMessage,
} from "@/lib/chatbot-brain";
import { cn } from "@/lib/utils";

const WELCOME: ChatMessage = {
  id: 0,
  role: "bot",
  text: "Namaste! 🙏 I'm the ShaadiGen Concierge. Ask me anything about Aarav & Meera's wedding — rituals, timings, dress codes, food, RSVP, travel… I know it all!",
};

export function GuestChatbot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([WELCOME]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [unread, setUnread] = useState(true);
  const nextId = useRef(1);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    listRef.current?.scrollTo({
      top: listRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, typing, open]);

  function send(text: string) {
    const trimmed = text.trim();
    if (!trimmed || typing) return;
    setMessages((prev) => [
      ...prev,
      { id: nextId.current++, role: "user", text: trimmed },
    ]);
    setInput("");
    setTyping(true);
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        { id: nextId.current++, role: "bot", text: getBotReply(trimmed) },
      ]);
      setTyping(false);
    }, 700 + Math.min(trimmed.length * 18, 900));
  }

  return (
    <>
      {/* Floating launcher */}
      <button
        type="button"
        onClick={() => {
          setOpen((v) => !v);
          setUnread(false);
        }}
        aria-label={open ? "Close wedding assistant" : "Open wedding assistant"}
        className="fixed bottom-5 left-4 z-[80] flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-amber-500 to-rose-500 text-white shadow-xl transition-all hover:scale-110 hover:shadow-2xl sm:left-6"
      >
        {open ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
        {!open && unread && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500 text-[9px] font-bold text-white ring-2 ring-white">
            1
          </span>
        )}
      </button>

      {/* Chat panel */}
      {open && (
        <div className="animate-fade-up fixed bottom-24 left-4 right-4 z-[80] flex max-h-[70vh] flex-col overflow-hidden rounded-3xl border border-amber-200 bg-white shadow-2xl sm:left-6 sm:right-auto sm:w-[380px]">
          {/* Header */}
          <div className="flex items-center gap-3 bg-gradient-to-r from-amber-500 to-rose-500 px-5 py-4 text-white">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20">
              <Bot className="h-5 w-5" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold">ShaadiGen Concierge</p>
              <p className="flex items-center gap-1 text-[11px] text-white/85">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-300" />
                Online · answers instantly
              </p>
            </div>
            <Sparkles className="h-4 w-4 text-amber-200" />
          </div>

          {/* Messages */}
          <div
            ref={listRef}
            className="flex-1 space-y-3 overflow-y-auto bg-[#fffaf3] px-4 py-4"
          >
            {messages.map((m) => (
              <div
                key={m.id}
                className={cn(
                  "flex",
                  m.role === "user" ? "justify-end" : "justify-start",
                )}
              >
                <div
                  className={cn(
                    "max-w-[85%] whitespace-pre-line rounded-2xl px-4 py-2.5 text-[13px] leading-relaxed shadow-sm",
                    m.role === "user"
                      ? "rounded-br-md bg-gradient-to-r from-amber-500 to-rose-500 text-white"
                      : "rounded-bl-md border border-amber-100 bg-white text-stone-700",
                  )}
                >
                  {m.text}
                </div>
              </div>
            ))}
            {typing && (
              <div className="flex justify-start">
                <div className="flex items-center gap-1.5 rounded-2xl rounded-bl-md border border-amber-100 bg-white px-4 py-3 shadow-sm">
                  {[0, 1, 2].map((i) => (
                    <span
                      key={i}
                      className="h-2 w-2 animate-bounce rounded-full bg-amber-400"
                      style={{ animationDelay: `${i * 0.15}s` }}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Quick questions */}
          <div className="flex gap-2 overflow-x-auto border-t border-amber-100 bg-white px-3 py-2.5 [scrollbar-width:none]">
            {QUICK_QUESTIONS.map((qq) => (
              <button
                key={qq}
                type="button"
                onClick={() => send(qq)}
                className="shrink-0 rounded-full border border-amber-300 bg-amber-50 px-3 py-1.5 text-[11px] font-semibold text-amber-800 transition-all hover:bg-amber-100"
              >
                {qq}
              </button>
            ))}
          </div>

          {/* Input */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              send(input);
            }}
            className="flex items-center gap-2 border-t border-amber-100 bg-white p-3"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask anything about the wedding…"
              className="flex-1 rounded-full border border-stone-300 px-4 py-2.5 text-sm outline-none transition-all focus:border-amber-400 focus:ring-2 focus:ring-amber-200"
            />
            <button
              type="submit"
              disabled={!input.trim() || typing}
              aria-label="Send message"
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-r from-amber-500 to-rose-500 text-white shadow transition-all hover:scale-105 disabled:opacity-50"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
