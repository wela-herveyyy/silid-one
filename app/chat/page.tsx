"use client";

import {
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  Book,
  Check,
  CheckCircle,
  Clock,
  Database,
  FileText,
  HelpCircle,
  Image as ImageIcon,
  MessageSquare,
  Paperclip,
  Plus,
  Users,
} from "lucide-react";
import Link from "next/link";
import { useState, type FormEvent } from "react";
import { SilidChatbotIcon } from "@/components/atoms/SilidChatbotIcon";
import { GiyaContentApprovalCard } from "@/components/organisms/GiyaContentApprovalCard";
import { useLmsSession } from "@/components/templates/LmsSessionProvider";

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

export default function GiyaStandaloneChatPage() {
  const { giyaChat, sendGiyaMessage, decideGiyaApproval } = useLmsSession();
  const [prompt, setPrompt] = useState("");
  const [view, setView] = useState<"chat" | "history">("chat");
  const [showTour, setShowTour] = useState(giyaChat.length <= 1);
  const [tourStep, setTourStep] = useState(0);

  const activeIntro = INTRO_STEPS[tourStep];

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;
    setShowTour(false);
    setView("chat");
    sendGiyaMessage(prompt);
    setPrompt("");
  };

  return (
    <div className="fixed inset-0 flex h-screen w-screen flex-col overflow-hidden bg-[#fffdfa] font-sans antialiased">
      {/* Top Toolbar matching GiyaChatScreen / vue_giya_chat.png 1:1 */}
      <header className="relative z-20 flex h-14 shrink-0 items-center justify-between border-b border-slate-200/80 bg-white px-4 sm:px-5">
        <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1">
          <Link
            href="/class"
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-800"
            aria-label="Back to Silid"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>

          <div className="flex items-center gap-2 pr-2">
            <SilidChatbotIcon className="h-8 w-8" />
            <span className="font-semibold text-slate-900">Silid</span>
          </div>

          <nav className="flex gap-1 text-xs font-semibold" aria-label="AI views">
            <button
              type="button"
              onClick={() => setView("chat")}
              className={`min-h-9 rounded-lg px-3 py-1.5 transition-colors ${
                view === "chat"
                  ? "border border-orange-200/60 bg-orange-50 text-orange-800"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              }`}
            >
              Chat
            </button>
            <button
              type="button"
              onClick={() => setView("history")}
              className={`min-h-9 rounded-lg px-3 py-1.5 transition-colors ${
                view === "history"
                  ? "border border-orange-200/60 bg-orange-50 text-orange-800"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              }`}
            >
              Prompt history
            </button>
          </nav>

          <button
            type="button"
            onClick={() => {
              setShowTour(false);
              setView("chat");
            }}
            className="inline-flex min-h-9 items-center gap-1.5 rounded-lg px-3 text-xs font-semibold text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900"
          >
            <Plus className="h-4 w-4" />
            <span>New chat</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setTourStep(0);
              setShowTour((prev) => !prev);
            }}
            className="inline-flex min-h-9 items-center gap-1.5 rounded-lg px-3 text-xs font-semibold text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900"
          >
            <HelpCircle className="h-4 w-4" />
            <span>Tour</span>
          </button>
        </div>

        <div className="hidden items-center gap-4 text-xs font-semibold text-slate-700 sm:flex">
          <span>AI credits</span>
          <span className="rounded-full bg-orange-50 px-2.5 py-1 text-orange-700">120 left</span>
        </div>
      </header>

      {/* Main Centered Content matching vue_giya_chat.png */}
      <main className="flex-1 overflow-y-auto px-4 py-8">
        <div className="mx-auto max-w-2xl">
          {showTour ? (
            <div className="mx-auto max-w-md space-y-5 pt-4">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
                <span>
                  Step {tourStep + 1} of {INTRO_STEPS.length}
                </span>
                <button
                  type="button"
                  onClick={() => setShowTour(false)}
                  className="text-slate-600 hover:text-slate-900"
                >
                  Skip
                </button>
              </div>

              <div className="flex justify-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-orange-100 bg-orange-50/70 shadow-sm">
                  <SilidChatbotIcon className="h-10 w-10" />
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200/80 bg-white p-6 text-center shadow-sm">
                <span className="inline-flex rounded-full bg-orange-50 px-3 py-1 text-[11px] font-bold text-orange-700">
                  {activeIntro.subtitle}
                </span>
                <h2 className="mt-3 text-lg font-bold text-slate-900">{activeIntro.title}</h2>
                <p className="mt-2 text-xs leading-relaxed text-slate-600">
                  {activeIntro.description}
                </p>

                <div className="mt-4 flex flex-wrap justify-center gap-2">
                  {activeIntro.badges.map((b) => {
                    const BadgeIcon = b.icon;
                    return (
                      <span
                        key={b.label}
                        className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1 text-[11px] font-medium text-slate-700"
                      >
                        <BadgeIcon className="h-3.5 w-3.5 text-slate-500" />
                        {b.label}
                      </span>
                    );
                  })}
                </div>

                <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-4">
                  <div className="flex gap-1">
                    {INTRO_STEPS.map((_, idx) => (
                      <span
                        key={idx}
                        className={`h-1.5 rounded-full transition-all ${
                          idx === tourStep ? "w-5 bg-orange-600" : "w-1.5 bg-slate-200"
                        }`}
                      />
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      if (tourStep < INTRO_STEPS.length - 1) {
                        setTourStep((p) => p + 1);
                      } else {
                        setShowTour(false);
                      }
                    }}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-orange-600 px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-orange-700"
                  >
                    <span>{activeIntro.buttonText}</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ) : view === "history" ? (
            <div className="space-y-3">
              <h2 className="text-sm font-bold text-slate-900">Prompt History</h2>
              {giyaChat
                .filter((m) => m.senderRole === "user")
                .map((m) => (
                  <div
                    key={m.id}
                    className="rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-800 shadow-sm"
                  >
                    <p>{m.text}</p>
                    <p className="mt-1 text-xs text-slate-400">{m.timestamp}</p>
                  </div>
                ))}
            </div>
          ) : (
            <div className="space-y-5">
              {giyaChat.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex flex-col ${
                    msg.senderRole === "user" ? "items-end" : "items-start"
                  }`}
                >
                  <div
                    className={`max-w-xl rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                      msg.senderRole === "user"
                        ? "bg-orange-600 text-white shadow-sm"
                        : "border border-slate-200 bg-white text-slate-800 shadow-sm"
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
                  <span className="mt-1 px-1 text-[11px] text-slate-400">{msg.timestamp}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Bottom Centered Composer matching vue_giya_chat.png 1:1 */}
      <footer className="shrink-0 bg-[#fffdfa] px-4 pb-5 pt-2">
        <form
          onSubmit={handleSubmit}
          className="mx-auto max-w-2xl rounded-2xl border border-slate-200/90 bg-white p-4 shadow-sm focus-within:border-orange-400 focus-within:ring-2 focus-within:ring-orange-500/15"
        >
          <input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Message Silid or attach a file..."
            className="w-full bg-transparent text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none"
          />
          <div className="mt-4 flex items-center justify-between">
            <div className="flex items-center gap-2 text-slate-400">
              <button
                type="button"
                aria-label="Attach image"
                className="rounded-lg p-1.5 hover:bg-slate-100 hover:text-slate-700"
              >
                <ImageIcon className="h-4 w-4" />
              </button>
              <button
                type="button"
                aria-label="Attach file"
                className="rounded-lg p-1.5 hover:bg-slate-100 hover:text-slate-700"
              >
                <Paperclip className="h-4 w-4" />
              </button>
            </div>
            <button
              type="submit"
              className="inline-flex h-9 items-center gap-1.5 rounded-xl bg-orange-600 px-4 text-xs font-semibold text-white transition-colors hover:bg-orange-700"
            >
              <span>Send</span>
              <ArrowUp className="h-3.5 w-3.5" />
            </button>
          </div>
        </form>
        <p className="mt-2 text-center text-[11px] text-slate-500">
          AI can make mistakes. Review before using in class.
        </p>
      </footer>
    </div>
  );
}
