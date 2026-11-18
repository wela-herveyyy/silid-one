"use client";

import { ArrowRight, Book, Check, CheckCircle, Clock, Database, FileText, HelpCircle, Maximize2, MessageSquare, Send, Users, X } from "lucide-react";
import Link from "next/link";
import { useState, type CSSProperties, type FormEvent } from "react";
import { SilidChatbotIcon } from "@/components/atoms/SilidChatbotIcon";
import { GiyaContentApprovalCard } from "@/components/organisms/GiyaContentApprovalCard";
import { useLmsSession } from "@/components/templates/LmsSessionProvider";
import type { AssistantDockEdge } from "@/lib/assistantDock";

const INTRO_STEPS = [
  {
    title: "Meet your AI assistant",
    subtitle: "Silid teaching assistant",
    description:
      "An assistant built into your classes to draft curriculum, prepare assessments, and query student submissions directly.",
    badges: [
      { icon: Book, label: "Lesson planning" },
      { icon: Database, label: "Connected to your roster" },
    ],
    buttonText: "See capabilities",
  },
  {
    title: "Curriculum and assessments",
    subtitle: "Draft in seconds",
    description:
      "Generate multi-format quizzes with answer keys, create assignment prompts with rubric instructions, and structure lesson reading guides ready to review.",
    badges: [
      { icon: CheckCircle, label: "Quizzes with answer keys" },
      { icon: FileText, label: "Assignment briefs" },
    ],
    buttonText: "Classroom analytics",
  },
  {
    title: "Submissions and roster",
    subtitle: "Live class records",
    description:
      "Look up your active class rosters, inspect submission compliance for any activity, and identify students who have missing work.",
    badges: [
      { icon: Users, label: "Class roster" },
      { icon: Clock, label: "Missing work tracking" },
    ],
    buttonText: "Classroom feed",
  },
  {
    title: "Class announcements",
    subtitle: "Stream updates",
    description:
      "Draft announcements and share links directly to your class stream, targeting specific sections with formatted notices.",
    badges: [
      { icon: MessageSquare, label: "Stream announcements" },
      { icon: Check, label: "Direct publishing" },
    ],
    buttonText: "Get started",
  },
];

interface GiyaChatDrawerProps {
  open: boolean;
  onClose: () => void;
  dockSide?: AssistantDockEdge;
  panelStyle?: CSSProperties;
}

export function GiyaChatDrawer({
  open,
  onClose,
  dockSide = "right",
  panelStyle,
}: GiyaChatDrawerProps) {
  const { giyaChat, sendGiyaMessage, decideGiyaApproval } = useLmsSession();
  const [prompt, setPrompt] = useState("");
  const [showIntro, setShowIntro] = useState(false);
  const [introIndex, setIntroIndex] = useState(0);

  if (!open) return null;

  const activeIntro = INTRO_STEPS[introIndex];

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;
    sendGiyaMessage(prompt);
    setPrompt("");
  };

  return (
    <div
      className="fixed inset-0 z-[100] bg-slate-950/30 backdrop-blur-[1px]"
      onClick={onClose}
    >
      <aside
        aria-label="Silid Chatbot"
        data-dock-edge={dockSide}
        style={panelStyle}
        onClick={(e) => e.stopPropagation()}
        className={`animate-panel-enter fixed z-[101] flex min-h-0 min-w-0 flex-col overflow-hidden rounded-2xl border border-orange-100 bg-[#fffdfa] shadow-2xl ${
          !panelStyle ? "inset-y-4 right-4 w-full max-w-md" : ""
        }`}
      >
        <div className="flex h-16 shrink-0 items-center justify-between border-b border-orange-100 px-4">
          <div className="flex items-center gap-2.5">
            <SilidChatbotIcon className="h-9 w-9" />
            <div>
              <p className="text-sm font-bold text-gray-900">Silid Chatbot</p>
              <p className="text-[11px] font-medium text-orange-600">Giya AI Assistant</p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => {
                setIntroIndex(0);
                setShowIntro((prev) => !prev);
              }}
              aria-label="Walkthrough tour"
              title="Walkthrough tour"
              className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-orange-50 hover:text-orange-600"
            >
              <HelpCircle className="h-4 w-4" />
            </button>
            <Link
              href="/chat"
              onClick={onClose}
              aria-label="Open full screen chat"
              className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700"
            >
              <Maximize2 className="h-4 w-4" />
            </Link>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close drawer"
              className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {showIntro ? (
          <div className="flex flex-1 flex-col items-center justify-center bg-gradient-to-b from-orange-50/60 to-white p-6 text-center">
            <SilidChatbotIcon className="h-24 w-24" />
            <p className="mt-4 text-xs font-bold uppercase tracking-wider text-orange-600">
              {activeIntro.subtitle}
            </p>
            <h3 className="mt-1 text-xl font-extrabold text-gray-900">{activeIntro.title}</h3>
            <p className="mt-3 text-sm leading-relaxed text-gray-600">{activeIntro.description}</p>

            <div className="mt-5 flex flex-wrap justify-center gap-2">
              {activeIntro.badges.map((b) => {
                const Icon = b.icon;
                return (
                  <span
                    key={b.label}
                    className="inline-flex items-center gap-1.5 rounded-full border border-orange-200 bg-orange-50 px-3 py-1 text-xs font-medium text-orange-700"
                  >
                    <Icon className="h-3.5 w-3.5" />
                    {b.label}
                  </span>
                );
              })}
            </div>

            <div className="mt-8 flex items-center gap-3">
              {introIndex > 0 ? (
                <button
                  type="button"
                  onClick={() => setIntroIndex((i) => i - 1)}
                  className="rounded-full border border-gray-200 px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-50"
                >
                  Back
                </button>
              ) : null}
              <button
                type="button"
                onClick={() => {
                  if (introIndex < INTRO_STEPS.length - 1) {
                    setIntroIndex((i) => i + 1);
                  } else {
                    setShowIntro(false);
                  }
                }}
                className="inline-flex items-center gap-1.5 rounded-full bg-orange-500 px-5 py-2 text-xs font-semibold text-white shadow-sm hover:bg-orange-600"
              >
                <span>{activeIntro.buttonText}</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="flex-1 space-y-4 overflow-y-auto bg-gray-50/70 p-4">
              {giyaChat.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex flex-col ${
                    msg.senderRole === "user" ? "items-end" : "items-start"
                  }`}
                >
                  <div
                    className={`max-w-[90%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                      msg.senderRole === "user"
                        ? "bg-orange-500 text-white"
                        : "border border-gray-200 bg-white text-gray-900 shadow-sm"
                    }`}
                  >
                    <p>{msg.text}</p>
                    {msg.approvalCard ? (
                      <GiyaContentApprovalCard
                        card={msg.approvalCard}
                        onApprove={() => decideGiyaApproval(msg.id, "approved")}
                        onReject={() => decideGiyaApproval(msg.id, "rejected")}
                      />
                    ) : null}
                  </div>
                  <span className="mt-1 px-1 text-[11px] text-gray-400">{msg.timestamp}</span>
                </div>
              ))}
            </div>

            <div className="border-t border-gray-100 bg-white p-4">
              <form onSubmit={handleSubmit} className="flex items-center gap-2">
                <input
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Ask Silid chatbot..."
                  className="h-10 flex-1 rounded-full border border-gray-200 bg-gray-50 px-4 text-sm text-gray-900 placeholder:text-gray-400 focus:border-orange-500 focus:bg-white focus:outline-none"
                />
                <button
                  type="submit"
                  aria-label="Send prompt"
                  className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-orange-500 text-white shadow-sm transition-colors hover:bg-orange-600"
                >
                  <Send className="h-4 w-4" />
                </button>
              </form>
            </div>
          </>
        )}
      </aside>
    </div>
  );
}
