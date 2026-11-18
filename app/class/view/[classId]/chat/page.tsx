"use client";

import { Archive, Inbox, MessageSquare, Minimize2, Plus, Search, Send } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useMemo, useState, type FormEvent } from "react";
import { useLmsSession } from "@/components/templates/LmsSessionProvider";

export default function ClassChatPage() {
  const { classId } = useParams<{ classId: string }>();
  const { classes, classChat, sendClassMessage, role } = useLmsSession();
  const [showArchived, setShowArchived] = useState(false);
  const [selectedRoomId, setSelectedRoomId] = useState("room-1");
  const [searchQuery, setSearchQuery] = useState("");
  const [text, setText] = useState("");

  const classItem = classes.find((c) => c.id === classId) ?? classes[0];

  const [rooms, setRooms] = useState([
    { id: "room-1", name: `${classItem?.subjectCode ?? "Class"} Main Thread`, archived: false },
    { id: "room-2", name: "Group Project Q&A", archived: false },
    { id: "room-3", name: "1st Quarter Review", archived: true },
  ]);

  const displayedRooms = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return rooms.filter(
      (r) => r.archived === showArchived && (!q || r.name.toLowerCase().includes(q)),
    );
  }, [rooms, showArchived, searchQuery]);

  const activeRoom = rooms.find((r) => r.id === selectedRoomId);

  const handleCreateRoom = () => {
    const nextId = `room-${rooms.length + 1}`;
    setRooms((prev) => [{ id: nextId, name: `Discussion ${rooms.length + 1}`, archived: false }, ...prev]);
    setShowArchived(false);
    setSelectedRoomId(nextId);
  };

  const handleSend = (e: FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    sendClassMessage(text);
    setText("");
  };

  return (
    <div className="fixed inset-0 z-[70] flex overflow-hidden bg-slate-100 font-sans antialiased">
      {/* Narrow Icon Rail + Rooms Sidebar (matches ChatFullView.vue / vue_class_chat.png 1:1) */}
      <div className="flex h-full shrink-0">
        <nav
          className="flex w-14 shrink-0 flex-col items-center border-r border-slate-200 bg-slate-50 py-5"
          aria-label="Messages navigation"
        >
          <button
            type="button"
            onClick={() => setShowArchived(false)}
            className={`mb-6 flex h-10 w-10 items-center justify-center rounded-xl transition-all ${
              !showArchived
                ? "bg-gradient-to-br from-orange-500 to-orange-600 text-white shadow-sm shadow-orange-500/25"
                : "text-slate-400 hover:text-slate-600"
            }`}
            title="Messages"
          >
            <MessageSquare className="h-5 w-5" />
          </button>

          {role !== "Student" ? (
            <button
              type="button"
              onClick={() => setShowArchived((prev) => !prev)}
              className={`flex h-10 w-10 items-center justify-center rounded-xl transition-all ${
                showArchived
                  ? "bg-gradient-to-br from-orange-500 to-orange-600 text-white shadow-sm shadow-orange-500/25"
                  : "text-slate-400 hover:text-slate-600"
              }`}
              title={showArchived ? "Hide archived rooms" : "Show archived rooms"}
            >
              <Archive className="h-5 w-5" />
            </button>
          ) : null}
        </nav>

        <aside className="flex h-full w-72 flex-col border-r border-slate-200 bg-white lg:w-[320px] xl:w-[360px]">
          <div className="flex items-center justify-between gap-3 px-5 pb-4 pt-5">
            <div className="min-w-0">
              <h1 className="text-lg font-bold leading-tight tracking-tight text-slate-900">
                {showArchived ? "Archive" : "Messages"}
              </h1>
              <p className="mt-0.5 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                {displayedRooms.length} {displayedRooms.length === 1 ? "room" : "rooms"}
              </p>
            </div>
            <Link
              href={`/class/view/${classId}`}
              className="-mr-2 rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
              title="Exit fullscreen"
            >
              <Minimize2 className="h-4 w-4" />
            </Link>
          </div>

          <div className="px-4 pb-6 pt-2">
            <div className="flex gap-2">
              <div className="group relative min-w-0 flex-1">
                <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-orange-500" />
                <input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  type="text"
                  placeholder="Search rooms..."
                  className="w-full rounded-lg border border-slate-300 bg-slate-50 py-2.5 pl-10 pr-4 text-sm text-slate-800 placeholder-slate-400 transition-all focus:border-orange-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/25"
                />
              </div>

              {role !== "Student" ? (
                <button
                  type="button"
                  onClick={handleCreateRoom}
                  className="flex shrink-0 items-center gap-1.5 rounded-lg bg-gradient-to-br from-orange-500 to-orange-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm shadow-orange-500/25 transition-all hover:from-orange-600 hover:to-orange-700 active:scale-[0.97]"
                  title="New room"
                >
                  <Plus className="h-4 w-4" />
                  <span className="hidden lg:inline">New</span>
                </button>
              ) : null}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-3 pb-4">
            {displayedRooms.length === 0 ? (
              <div className="flex flex-col items-center py-12 text-center">
                <Inbox className="mb-2 h-6 w-6 text-slate-400" />
                <p className="text-sm font-semibold text-slate-700">No rooms found</p>
                <p className="mt-1 text-xs text-slate-400">Create your first room to get started</p>
              </div>
            ) : (
              <ul className="space-y-1">
                {displayedRooms.map((room) => {
                  const active = room.id === selectedRoomId;
                  return (
                    <li key={room.id}>
                      <button
                        type="button"
                        onClick={() => setSelectedRoomId(room.id)}
                        className={`flex w-full items-center gap-3 rounded-xl px-3.5 py-3 text-left transition-colors ${
                          active
                            ? "bg-orange-50 text-orange-700"
                            : "text-slate-700 hover:bg-slate-50"
                        }`}
                      >
                        <span
                          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-xs font-bold ${
                            active
                              ? "bg-orange-500 text-white"
                              : "bg-slate-100 text-slate-600"
                          }`}
                        >
                          {room.name[0]}
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-semibold">{room.name}</p>
                          <p className="truncate text-xs text-slate-400">
                            {classItem?.subjectName ?? "Class"}
                          </p>
                        </div>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </aside>
      </div>

      {/* Main Chat Pane */}
      <main className="flex min-w-0 flex-1 flex-col bg-slate-50/70">
        {!activeRoom ? (
          <div className="flex flex-1 flex-col items-center justify-center p-8 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-400 to-orange-600 text-white shadow-lg shadow-orange-500/20">
              <MessageSquare className="h-7 w-7" />
            </div>
            <h2 className="text-lg font-bold text-slate-900">Your Messages</h2>
            <p className="mt-1 max-w-xs text-sm text-slate-500">
              Select a conversation from the sidebar to start messaging with your class
            </p>
          </div>
        ) : (
          <>
            <header className="flex h-16 shrink-0 items-center justify-between border-b border-slate-200 bg-white px-6">
              <div>
                <h2 className="text-sm font-bold text-slate-900">{activeRoom.name}</h2>
                <p className="text-xs text-slate-500">
                  {classItem?.subjectName ?? "Class"} · Active Thread
                </p>
              </div>
              <Link
                href={`/class/view/${classId}`}
                className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50"
              >
                Back to Class
              </Link>
            </header>

            <div className="flex-1 space-y-4 overflow-y-auto p-6">
              {classChat.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex flex-col ${
                    msg.senderRole === "user" ? "items-end" : "items-start"
                  }`}
                >
                  <div
                    className={`max-w-md rounded-2xl px-4 py-3 text-sm shadow-sm ${
                      msg.senderRole === "user"
                        ? "bg-gradient-to-br from-orange-500 to-orange-600 text-white"
                        : "border border-slate-200 bg-white text-slate-800"
                    }`}
                  >
                    <p className="text-xs font-semibold opacity-80">{msg.senderName}</p>
                    <p className="mt-1">{msg.text}</p>
                  </div>
                  <span className="mt-1 px-1 text-[11px] text-slate-400">{msg.timestamp}</span>
                </div>
              ))}
            </div>

            <form
              onSubmit={handleSend}
              className="flex gap-2 border-t border-slate-200 bg-white p-4"
            >
              <input
                type="text"
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Write a message to the class..."
                className="h-10 flex-1 rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-900 placeholder:text-slate-400 focus:border-orange-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/20"
              />
              <button
                type="submit"
                className="inline-flex h-10 items-center gap-2 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 px-5 text-sm font-semibold text-white shadow-sm transition-colors hover:from-orange-600 hover:to-orange-700"
              >
                <Send className="h-4 w-4" />
                <span>Send</span>
              </button>
            </form>
          </>
        )}
      </main>
    </div>
  );
}
