"use client";

import {
  Bell,
  ChevronDown,
  Clock,
  Eye,
  EyeOff,
  Image as ImageIcon,
  Link2,
  MessageSquare,
  MoreVertical,
  Paperclip,
  Pin,
  Video,
  X,
} from "lucide-react";
import { useParams } from "next/navigation";
import { useState, type FormEvent } from "react";
import { Avatar } from "@/components/atoms/Avatar";
import { RichHtmlContent } from "@/components/atoms/RichHtmlContent";
import { ClassTabNav } from "@/components/molecules/ClassTabNav";
import { RichTextEditor } from "@/components/molecules/RichTextEditor";
import { ClassWorkspaceTemplate } from "@/components/templates/ClassWorkspaceTemplate";
import { useLmsSession } from "@/components/templates/LmsSessionProvider";
import { hasEditorContent } from "@/lib/richEditorContent";

export default function ClassFeedPage() {
  const { classId } = useParams<{ classId: string }>();
  const { user, role, classes, posts, addPost, addPostComment } = useLmsSession();

  const [postModalOpen, setPostModalOpen] = useState(false);
  const [draft, setDraft] = useState("");
  const [openComments, setOpenComments] = useState<Record<string, boolean>>({});
  const [commentDrafts, setCommentDrafts] = useState<Record<string, string>>({});

  // Subject Meeting interactive state matching live_09_class_socials.png & live_22_meeting_dropdown.png
  const [meetingMenuOpen, setMeetingMenuOpen] = useState(false);
  const [meetingUrl, setMeetingUrl] = useState("");
  const [customUrlPrompt, setCustomUrlPrompt] = useState(false);
  const [visibleToStudents, setVisibleToStudents] = useState(true);
  const [postRequestEnabled, setPostRequestEnabled] = useState(false);
  const [postReqExpanded, setPostReqExpanded] = useState(false);
  const [scheduledExpanded, setScheduledExpanded] = useState(false);

  const decodedClassId = (() => {
    try {
      return decodeURIComponent(classId);
    } catch {
      return classId;
    }
  })();
  const classItem = classes.find((c) => c.id === classId || c.id === decodedClassId) ?? classes[0];
  const classPosts = posts.filter((p) => p.classId === classId || classId !== "none");
  const firstName = user.name.split(" ")[0] || "there";

  const handlePublish = (e: FormEvent) => {
    e.preventDefault();
    if (!hasEditorContent(draft)) return;
    addPost(decodedClassId, draft);
    setDraft("");
    setPostModalOpen(false);
  };

  return (
    <ClassWorkspaceTemplate classId={classId}>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
        {/* Left Sidebar matching live_09_class_socials.png 1:1 */}
        <aside className="space-y-4 lg:col-span-1">
          <div className="space-y-4 rounded-[20px] border-2 border-orange-100 bg-white/70 p-5 backdrop-blur-sm">
            <p className="text-[11px] font-extrabold uppercase tracking-[0.15em] text-orange-400">
              Subject Meeting
            </p>

            {/* Add Meeting Link Dropdown (matches live_22_meeting_dropdown.png) */}
            <div className="relative space-y-2">
              {meetingUrl ? (
                <div className="space-y-2">
                  <a
                    href={meetingUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-orange-500 px-3 py-2 text-xs font-semibold text-white transition-colors hover:bg-orange-600"
                  >
                    <Video className="h-4 w-4 shrink-0" />
                    <span>Join Online Class</span>
                  </a>
                  <button
                    type="button"
                    onClick={() => setMeetingUrl("")}
                    className="w-full text-center text-[11px] font-medium text-gray-400 hover:text-orange-600"
                  >
                    Remove meeting link
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setMeetingMenuOpen((p) => !p)}
                  className="flex w-full items-center justify-between rounded-xl border border-orange-200 bg-white px-3.5 py-2.5 text-xs font-semibold text-orange-600 transition-colors hover:bg-orange-50"
                >
                  <span className="inline-flex items-center gap-2">
                    <Video className="h-3.5 w-3.5" />
                    Add Meeting Link
                  </span>
                  <ChevronDown
                    className={`h-3.5 w-3.5 transition-transform ${meetingMenuOpen ? "rotate-180" : ""}`}
                  />
                </button>
              )}

              {meetingMenuOpen ? (
                <div className="animate-dropdown-enter absolute left-0 right-0 top-full z-30 mt-1 overflow-hidden rounded-xl border border-gray-200 bg-white py-1 shadow-xl">
                  <button
                    type="button"
                    onClick={() => {
                      setMeetingUrl("https://meet.google.com/new");
                      setMeetingMenuOpen(false);
                    }}
                    className="flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-xs font-medium text-gray-700 hover:bg-orange-50 hover:text-orange-600"
                  >
                    <Video className="h-3.5 w-3.5 text-gray-400" />
                    Google Meet
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setCustomUrlPrompt(true);
                      setMeetingMenuOpen(false);
                    }}
                    className="flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-xs font-medium text-gray-700 hover:bg-orange-50 hover:text-orange-600"
                  >
                    <Link2 className="h-3.5 w-3.5 text-gray-400" />
                    Custom URL
                  </button>
                </div>
              ) : null}

              {customUrlPrompt ? (
                <div className="flex gap-1.5 pt-1">
                  <input
                    type="url"
                    placeholder="https://meet..."
                    value={meetingUrl}
                    onChange={(e) => setMeetingUrl(e.target.value)}
                    className="h-8 flex-1 rounded-lg border border-gray-200 bg-white px-2.5 text-xs focus:border-orange-500 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setCustomUrlPrompt(false)}
                    className="h-8 rounded-lg bg-orange-500 px-2.5 text-xs font-semibold text-white"
                  >
                    Set
                  </button>
                </div>
              ) : null}

              <button
                type="button"
                onClick={() => setVisibleToStudents((v) => !v)}
                className="flex w-full items-center gap-2 rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-xs font-medium text-gray-500 transition-colors hover:border-gray-300"
              >
                {visibleToStudents ? (
                  <Eye className="h-3.5 w-3.5 text-gray-400" />
                ) : (
                  <EyeOff className="h-3.5 w-3.5 text-gray-400" />
                )}
                <span>{visibleToStudents ? "Visible to students" : "Hidden from students"}</span>
              </button>
            </div>

            <div className="h-px bg-orange-100" aria-hidden="true" />

            {/* Post Request */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-gray-800">Post Request</span>
                <button
                  type="button"
                  role="switch"
                  aria-checked={postRequestEnabled}
                  onClick={() => setPostRequestEnabled((v) => !v)}
                  className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                    postRequestEnabled ? "bg-orange-500" : "bg-gray-200"
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                      postRequestEnabled ? "translate-x-4" : "translate-x-0.5"
                    }`}
                  />
                </button>
              </div>
              <button
                type="button"
                onClick={() => setPostReqExpanded((p) => !p)}
                className="flex w-full items-center justify-between text-xs font-medium text-gray-500 hover:text-gray-800"
              >
                <span>Requesting to Post (0)</span>
                <ChevronDown
                  className={`h-3.5 w-3.5 transition-transform ${postReqExpanded ? "rotate-180" : ""}`}
                />
              </button>
              {postReqExpanded ? (
                <p className="rounded-lg bg-orange-50/50 p-2 text-[11px] text-gray-400">
                  No pending student posts.
                </p>
              ) : null}
            </div>

            <div className="h-px bg-orange-100" aria-hidden="true" />

            {/* Scheduled Post */}
            <div className="space-y-2">
              <p className="text-xs font-bold text-gray-800">Scheduled Post</p>
              <button
                type="button"
                onClick={() => setScheduledExpanded((p) => !p)}
                className="flex w-full items-center justify-between text-xs font-medium text-gray-500 hover:text-gray-800"
              >
                <span>Scheduled Post (0)</span>
                <ChevronDown
                  className={`h-3.5 w-3.5 transition-transform ${scheduledExpanded ? "rotate-180" : ""}`}
                />
              </button>
              {scheduledExpanded ? (
                <p className="rounded-lg bg-orange-50/50 p-2 text-[11px] text-gray-400">
                  No scheduled posts queued.
                </p>
              ) : null}
            </div>
          </div>

          <div className="hidden overflow-hidden rounded-[20px] border-2 border-orange-100 bg-white/70 px-4 py-4 backdrop-blur-sm lg:block">
            <p className="mb-3 text-[11px] font-extrabold uppercase tracking-[0.15em] text-orange-400">
              Class Menu
            </p>
            <ClassTabNav
              classId={encodeURIComponent(classItem?.id ?? decodedClassId)}
              role={role}
              variant="sidebar"
            />
          </div>
        </aside>

        {/* Right Feed */}
        <div className="min-w-0 space-y-4 lg:col-span-3">
          {/* Composer Bar opening Create a Post Modal */}
          <div className="mb-2 overflow-hidden border-y border-gray-200 bg-white sm:mb-0 -mx-4 w-[calc(100%+2rem)] sm:mx-0 sm:w-full sm:rounded-xl sm:border sm:shadow-sm">
            <div className="flex items-center gap-3 px-3 py-3 sm:px-5 sm:py-4">
              <Avatar name={user.name} size="md" className="shrink-0" />
              <button
                type="button"
                className="flex-1 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-left text-sm text-gray-400 transition-all duration-150 hover:border-gray-300 hover:bg-gray-100"
                onClick={() => setPostModalOpen(true)}
              >
                What&apos;s on your mind, {firstName}?
              </button>
            </div>

            <div className="flex items-stretch divide-x divide-gray-100 border-t border-gray-100">
              <button
                type="button"
                className="inline-flex flex-1 flex-col items-center justify-center gap-1 py-3 text-xs font-medium text-gray-500 transition hover:bg-gray-50 hover:text-gray-700 sm:flex-row sm:gap-1.5 sm:py-4"
                onClick={() => setPostModalOpen(true)}
              >
                <ImageIcon className="h-4 w-4 shrink-0 text-green-500 sm:h-3.5 sm:w-3.5" />
                <span>Share a photo?</span>
              </button>
              <button
                type="button"
                className="inline-flex flex-1 flex-col items-center justify-center gap-1 py-3 text-xs font-medium text-gray-500 transition hover:bg-gray-50 hover:text-gray-700 sm:flex-row sm:gap-1.5 sm:py-4"
                onClick={() => setPostModalOpen(true)}
              >
                <Paperclip className="h-4 w-4 shrink-0 text-orange-500 sm:h-3.5 sm:w-3.5" />
                <span>Got a file?</span>
              </button>
              <button
                type="button"
                className="inline-flex flex-1 flex-col items-center justify-center gap-1 py-3 text-xs font-medium text-gray-500 transition hover:bg-gray-50 hover:text-gray-700 sm:flex-row sm:gap-1.5 sm:py-4"
                onClick={() => setPostModalOpen(true)}
              >
                <Bell className="h-4 w-4 shrink-0 text-blue-500 sm:h-3.5 sm:w-3.5" />
                <span className="sm:hidden">Announce?</span>
                <span className="hidden sm:inline">Announce something?</span>
              </button>
            </div>
          </div>

          {classPosts.length === 0 ? (
            <div className="mt-4 flex flex-col items-center justify-center border-y border-dashed border-gray-200 bg-white px-6 py-12 text-center -mx-4 w-[calc(100%+2rem)] sm:mx-0 sm:w-full sm:rounded-xl sm:border">
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-orange-50 text-orange-500">
                <MessageSquare className="h-5 w-5" />
              </div>
              <p className="text-sm font-semibold text-gray-700">No posts yet</p>
              <p className="mt-1 text-xs text-gray-500">
                Be the first to share something with the class.
              </p>
            </div>
          ) : (
            classPosts.map((post) => {
              const showComments = openComments[post.id] ?? post.comments.length > 0;
              return (
                <article
                  key={post.id}
                  className="overflow-hidden border-y border-gray-200 bg-white -mx-4 w-[calc(100%+2rem)] sm:mx-0 sm:w-full sm:rounded-xl sm:border sm:shadow-sm"
                >
                  <div className="p-5">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-3">
                        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-600 text-xs font-bold text-white">
                          {post.authorName
                            .split(/\s+/)
                            .slice(0, 2)
                            .map((w) => w[0])
                            .join("")}
                        </span>
                        <div>
                          <p className="text-sm font-bold text-gray-900">{post.authorName}</p>
                          <p className="text-xs text-gray-400">{post.createdAtLabel}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {post.pinned ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-orange-50 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-orange-600">
                            <Pin className="h-3 w-3" />
                            Pinned
                          </span>
                        ) : null}
                        <span className="rounded-lg p-1.5 text-gray-400">
                          <MoreVertical className="h-4 w-4" />
                        </span>
                      </div>
                    </div>

                    <RichHtmlContent html={post.body} className="mt-3" />
                  </div>

                  <div className="border-t border-gray-100 px-5 py-3">
                    <button
                      type="button"
                      onClick={() =>
                        setOpenComments((prev) => ({ ...prev, [post.id]: !showComments }))
                      }
                      className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-500 hover:text-gray-800"
                    >
                      <MessageSquare className="h-3.5 w-3.5" />
                      <span>
                        {post.comments.length > 0
                          ? `Comment (${post.comments.length})`
                          : "Comment"}
                      </span>
                    </button>

                    {showComments ? (
                      <div className="mt-3 space-y-2.5">
                        {post.comments.map((comment) => (
                          <div key={comment.id} className="rounded-xl bg-gray-50 px-3 py-2 text-xs">
                            <span className="font-semibold text-gray-900">
                              {comment.authorName}
                            </span>
                            <span className="ml-2 text-gray-400">{comment.createdAtLabel}</span>
                            <RichHtmlContent html={comment.body} className="mt-1 text-xs text-gray-600" />
                          </div>
                        ))}

                        <form
                          onSubmit={(e) => {
                            e.preventDefault();
                            const text = commentDrafts[post.id] ?? "";
                            if (!text.trim()) return;
                            addPostComment(post.id, text);
                            setCommentDrafts((prev) => ({ ...prev, [post.id]: "" }));
                          }}
                          className="flex gap-2"
                        >
                          <input
                            type="text"
                            value={commentDrafts[post.id] ?? ""}
                            onChange={(e) =>
                              setCommentDrafts((prev) => ({ ...prev, [post.id]: e.target.value }))
                            }
                            placeholder="Write a comment..."
                            className="h-9 flex-1 rounded-lg border border-gray-200 bg-gray-50 px-3 text-sm text-gray-800 placeholder:text-gray-400 focus:border-orange-500 focus:bg-white focus:outline-none"
                          />
                          <button
                            type="submit"
                            className="inline-flex h-9 items-center rounded-lg border border-gray-200 bg-white px-4 text-xs font-semibold text-gray-700 transition-colors hover:border-orange-400 hover:bg-orange-50 hover:text-orange-600"
                          >
                            Reply
                          </button>
                        </form>
                      </div>
                    ) : null}
                  </div>
                </article>
              );
            })
          )}
        </div>
      </div>

      {/* Create a Post Modal matching live_21_create_post_modal.png 1:1 */}
      {postModalOpen ? (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/35 p-4 backdrop-blur-[2px]"
          onClick={() => setPostModalOpen(false)}
        >
          <form
            onSubmit={handlePublish}
            onClick={(e) => e.stopPropagation()}
            className="animate-dropdown-enter w-full max-w-xl overflow-hidden rounded-2xl border border-orange-100 bg-white shadow-2xl"
          >
            <div className="flex items-start justify-between bg-gradient-to-r from-orange-50 to-amber-50/40 px-6 py-4">
              <div>
                <p className="text-xs font-extrabold uppercase tracking-wider text-orange-500">
                  Create a Post
                </p>
                <p className="mt-0.5 text-xs text-gray-500">
                  Share an update, resource, or announcement with your class.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setPostModalOpen(false)}
                aria-label="Close modal"
                className="flex h-7 w-7 items-center justify-center rounded-full bg-white text-gray-400 shadow-sm hover:text-gray-700"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="p-5">
              <RichTextEditor
                variant="full"
                value={draft}
                onChange={setDraft}
                placeholder="Share with your class"
                autoFocus
                ariaLabel="Create post HTML editor"
              />

              <div className="mt-4 flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => setPostModalOpen(false)}
                  className="inline-flex h-10 items-center gap-1.5 rounded-xl bg-gray-300 px-4 text-xs font-semibold text-gray-700 hover:bg-gray-400/70"
                >
                  <Clock className="h-3.5 w-3.5" />
                  Schedule
                </button>
                <button
                  type="submit"
                  disabled={!hasEditorContent(draft)}
                  className={`h-10 flex-1 rounded-xl text-xs font-semibold transition-colors ${
                    hasEditorContent(draft)
                      ? "bg-orange-500 text-white hover:bg-orange-600"
                      : "bg-gray-300 text-white"
                  }`}
                >
                  Create Post
                </button>
              </div>
            </div>
          </form>
        </div>
      ) : null}
    </ClassWorkspaceTemplate>
  );
}
