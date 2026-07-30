"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
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
      <motion.button
        type="button"
        onClick={() => {
          setOpen((v) => !v);
          setUnread(false);
        }}
        aria-label={open ? "Close wedding assistant" : "Open wedding assistant"}
        whileHover={{ scale: 1.12, rotate: open ? 0 : -6 }}
        whileTap={{ scale: 0.94 }}
        className="btn-gold fixed bottom-5 left-4 z-[80] flex h-14 w-14 items-center justify-center rounded-full sm:left-6"
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.span
            key={open ? "close" : "chat"}
            initial={{ opacity: 0, rotate: -60, scale: 0.6 }}
            animate={{ opacity: 1, rotate: 0, scale: 1 }}
            exit={{ opacity: 0, rotate: 60, scale: 0.6 }}
            transition={{ duration: 0.18 }}
            className="flex"
          >
            {open ? (
              <X className="h-6 w-6" />
            ) : (
              <MessageCircle className="h-6 w-6" />
            )}
          </motion.span>
        </AnimatePresence>
        {!open && unread && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500 text-[9px] font-bold text-white ring-2 ring-white">
            1
          </span>
        )}
      </motion.button>

      {/* Chat panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 34, scale: 0.94, filter: "blur(6px)" }}
            animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: 24, scale: 0.95, filter: "blur(4px)" }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="glass-card fixed bottom-24 left-4 right-4 z-[80] flex max-h-[70vh] flex-col overflow-hidden rounded-3xl !bg-white/85 sm:left-6 sm:right-auto sm:w-[390px]"
          >
            {/* Header */}
            <div className="flex items-center gap-3 border-b border-[#e9dcc2] bg-gradient-to-r from-[#f7ecd6] to-[#f2dfc3] px-5 py-4">
              <span className="btn-gold flex h-10 w-10 items-center justify-center rounded-full">
                <Bot className="h-5 w-5" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="font-serif text-sm font-bold text-stone-900">
                  ShaadiGen Concierge
                </p>
                <p className="flex items-center gap-1.5 text-[11px] font-medium text-[#8a6a2f]">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
                  Online · answers instantly
                </p>
              </div>
              <Sparkles className="h-4 w-4 text-[#c9a24b]" />
            </div>

            {/* Messages */}
            <div
              ref={listRef}
              className="flex-1 space-y-3 overflow-y-auto px-4 py-4"
            >
              {messages.map((m) => (
                <motion.div
                  key={m.id}
                  initial={{ opacity: 0, y: 10, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                  className={cn(
                    "flex",
                    m.role === "user" ? "justify-end" : "justify-start",
                  )}
                >
                  <div
                    className={cn(
                      "max-w-[85%] whitespace-pre-line rounded-2xl px-4 py-2.5 text-[13px] leading-relaxed shadow-sm",
                      m.role === "user"
                        ? "btn-gold rounded-br-md"
                        : "rounded-bl-md border border-white/90 bg-white/90 text-stone-700",
                    )}
                  >
                    {m.text}
                  </div>
                </motion.div>
              ))}
              {typing && (
                <div className="flex justify-start">
                  <div className="flex items-center gap-1.5 rounded-2xl rounded-bl-md border border-white/90 bg-white/90 px-4 py-3 shadow-sm">
                    {[0, 1, 2].map((i) => (
                      <span
                        key={i}
                        className="h-2 w-2 animate-bounce rounded-full bg-[#c9a24b]"
                        style={{ animationDelay: `${i * 0.15}s` }}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Quick questions */}
            <div className="flex gap-2 overflow-x-auto border-t border-[#e9dcc2]/70 px-3 py-2.5 [scrollbar-width:none]">
              {QUICK_QUESTIONS.map((qq) => (
                <button
                  key={qq}
                  type="button"
                  onClick={() => send(qq)}
                  className="shrink-0 rounded-full border border-[#dcc48f]/70 bg-white/70 px-3.5 py-1.5 text-[11px] font-semibold text-[#8a6a2f] backdrop-blur transition-all duration-200 hover:-translate-y-0.5 hover:bg-white"
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
              className="flex items-center gap-2 border-t border-[#e9dcc2]/70 p-3"
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask anything about the wedding…"
                className="flex-1 rounded-full border border-white/90 bg-white/75 px-4 py-2.5 text-sm shadow-sm outline-none transition-all duration-300 focus:border-[#d9c491] focus:bg-white"
              />
              <motion.button
                type="submit"
                disabled={!input.trim() || typing}
                aria-label="Send message"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.92 }}
                className="btn-gold flex h-10 w-10 shrink-0 items-center justify-center rounded-full disabled:opacity-50"
              >
                <Send className="h-4 w-4" />
              </motion.button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
