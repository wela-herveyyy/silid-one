"use client";

import { usePathname } from "next/navigation";
import { createContext, useContext, useState, type ReactNode } from "react";
import { FloatingGiyaWidget } from "@/components/organisms/FloatingGiyaWidget";
import {
  useLiveSessionHydration,
  type FrappeSessionMeta,
  type LiveUserProfile,
} from "@/components/templates/lmsSessionProvider.hooks";
import {
  addComponentAction,
  createActivityAction,
  createCourseAction,
  createCustomClassAction,
  deleteComponentAction,
  markNotificationsReadAction,
  sendClassChatAction,
  setAttendanceAction,
  toggleDeleteActivityAction,
  toggleMemberFlagAction,
  updateComponentAction,
  updateCourseStatusAction,
} from "@/lib/domain/actions/lms_mutations.actions";
import {
  createClassPostAction,
  createPostCommentAction,
  toggleClassArchiveAction,
  updateClassAppearanceAction,
} from "@/lib/domain/actions/lms_session.actions";
import type {
  AttendanceEntry,
  ChatMessageItem,
  ClassActivityItem,
  ClassCardItem,
  ClassMemberItem,
  ClassPostItem,
  ClassworkComponentItem,
  CourseStatus,
  ExternalCourseItem,
  NotificationItem,
  SubmissionScoreRow,
  UserRole,
} from "@/types/lms";

interface LmsContextValue {
  user: LiveUserProfile;
  role: UserRole;
  setRole: (role: UserRole) => void;
  frappeMeta: FrappeSessionMeta;
  designTheme: "modern" | "playful";
  setDesignTheme: (theme: "modern" | "playful") => void;
  classes: ClassCardItem[];
  externalCourses: ExternalCourseItem[];
  notifications: NotificationItem[];
  posts: ClassPostItem[];
  activities: ClassActivityItem[];
  submissions: SubmissionScoreRow[];
  attendance: AttendanceEntry[];
  components: ClassworkComponentItem[];
  members: ClassMemberItem[];
  classChat: ChatMessageItem[];
  giyaChat: ChatMessageItem[];
  giyaDrawerOpen: boolean;
  setGiyaDrawerOpen: (open: boolean) => void;
  toggleArchiveClass: (id: string) => void;
  addClass: (item: Omit<ClassCardItem, "id">) => string;
  updateClass: (id: string, patch: Partial<ClassCardItem>) => void;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  addPost: (classId: string, body: string) => void;
  addPostComment: (postId: string, body: string) => void;
  addActivity: (item: Omit<ClassActivityItem, "id" | "submittedCount" | "totalStudents">) => string;
  toggleDeleteActivity: (id: string) => void;
  setAttendanceStatus: (studentId: string, status: AttendanceEntry["status"]) => void;
  addComponent: (termName: string, categoryName: string, weightPercent: number) => void;
  updateComponent: (id: string, categoryName: string, weightPercent: number) => void;
  deleteComponent: (id: string) => void;
  toggleMemberEnabled: (memberId: string) => void;
  toggleMemberPermit: (memberId: string) => void;
  removeMember: (memberId: string) => void;
  setCourseStatus: (courseId: string, status: CourseStatus) => void;
  addCourse: (course: Omit<ExternalCourseItem, "id" | "publishedAt" | "lessons">) => string;
  sendClassMessage: (text: string) => void;
  sendGiyaMessage: (text: string) => void;
  decideGiyaApproval: (messageId: string, decision: "approved" | "rejected") => void;
}

const LmsContext = createContext<LmsContextValue | null>(null);

const EMPTY_USER: LiveUserProfile = {
  name: "Account",
  email: "",
  schoolName: "Silid LMS",
};

function activeClassIdFromPath(pathname: string, classes: ClassCardItem[]): string {
  if (pathname.startsWith("/class/view/")) {
    const seg = pathname.slice("/class/view/".length).split("/")[0] || "";
    try {
      if (seg) return decodeURIComponent(seg);
    } catch {
      if (seg) return seg;
    }
  }
  return classes[0]?.id ?? "";
}

export function LmsSessionProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [user, setUser] = useState<LiveUserProfile>(EMPTY_USER);
  const [role, setRole] = useState<UserRole>("Teacher");
  const [designTheme, setDesignTheme] = useState<"modern" | "playful">("modern");
  const [classes, setClasses] = useState<ClassCardItem[]>([]);
  const [externalCourses, setExternalCourses] = useState<ExternalCourseItem[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [posts, setPosts] = useState<ClassPostItem[]>([]);
  const [activities, setActivities] = useState<ClassActivityItem[]>([]);
  const [submissions, setSubmissions] = useState<SubmissionScoreRow[]>([]);
  const [attendance, setAttendance] = useState<AttendanceEntry[]>([]);
  const [components, setComponents] = useState<ClassworkComponentItem[]>([]);
  const [members, setMembers] = useState<ClassMemberItem[]>([]);
  const [classChat, setClassChat] = useState<ChatMessageItem[]>([]);
  const [giyaChat, setGiyaChat] = useState<ChatMessageItem[]>([
    {
      id: "giya-welcome",
      senderName: "Giya",
      senderRole: "assistant",
      timestamp: "Ready",
      text: "Ask me to draft a quiz, assignment, or term aligned to your connected Silid classes.",
    },
  ]);
  const [giyaDrawerOpen, setGiyaDrawerOpen] = useState(false);

  const frappeMeta = useLiveSessionHydration({
    setUser,
    setRole,
    setClasses,
    setExternalCourses,
    setNotifications,
    setPosts,
    setActivities,
    setComponents,
    setMembers,
    setAttendance,
    setSubmissions,
    setClassChat,
  });

  const activeClassId = activeClassIdFromPath(pathname, classes);

  const toggleArchiveClass = (id: string) => {
    const current = classes.find((item) => item.id === id);
    const nextArchive = current ? !current.archived : true;
    setClasses((prev) =>
      prev.map((item) => (item.id === id ? { ...item, archived: nextArchive } : item)),
    );
    void toggleClassArchiveAction({ classCardId: id, archive: nextArchive });
  };

  const addClass = (item: Omit<ClassCardItem, "id">) => {
    const tempId = `cls-${Date.now()}`;
    setClasses((prev) => [{ ...item, id: tempId }, ...prev]);
    void createCustomClassAction(item).then((res) => {
      if (res.ok) {
        setClasses((prev) =>
          prev.map((c) => (c.id === tempId ? { ...c, id: res.data.id } : c)),
        );
      }
    });
    return tempId;
  };

  const updateClass = (id: string, patch: Partial<ClassCardItem>) => {
    setClasses((prev) => prev.map((item) => (item.id === id ? { ...item, ...patch } : item)));
    if (patch.accentColor !== undefined || patch.archived !== undefined) {
      void updateClassAppearanceAction({
        classCardId: id,
        color: patch.accentColor,
        archive: patch.archived,
      });
    }
  };

  const markNotificationRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((item) => (item.id === id ? { ...item, isRead: true } : item)),
    );
    void markNotificationsReadAction(id);
  };

  const markAllNotificationsRead = () => {
    setNotifications((prev) => prev.map((item) => ({ ...item, isRead: true })));
    void markNotificationsReadAction();
  };

  const addPost = (classId: string, body: string) => {
    const trimmed = body.trim();
    if (!trimmed) return;
    const tempId = `post-${Date.now()}`;
    setPosts((prev) => [
      {
        id: tempId,
        classId,
        authorName: user.name,
        authorRole: role === "Student" ? "Student" : "Teacher",
        createdAtLabel: "Just now",
        body: trimmed,
        comments: [],
      },
      ...prev,
    ]);
    void createClassPostAction({ classCardId: classId, message: trimmed }).then((res) => {
      if (res.ok) {
        setPosts((prev) => prev.map((p) => (p.id === tempId ? { ...p, id: res.data.id } : p)));
      }
    });
  };

  const addPostComment = (postId: string, body: string) => {
    const trimmed = body.trim();
    if (!trimmed) return;
    setPosts((prev) =>
      prev.map((p) =>
        p.id === postId
          ? {
              ...p,
              comments: [
                ...p.comments,
                {
                  id: `com-${Date.now()}`,
                  authorName: user.name,
                  body: trimmed,
                  createdAtLabel: "Just now",
                },
              ],
            }
          : p,
      ),
    );
    void createPostCommentAction({ postId, message: trimmed });
  };

  const addActivity = (
    item: Omit<ClassActivityItem, "id" | "submittedCount" | "totalStudents">,
  ) => {
    const tempId = `act-${Date.now()}`;
    const isBank = pathname.startsWith("/activity-bank");
    setActivities((prev) => [
      {
        ...item,
        id: tempId,
        submittedCount: 0,
        totalStudents: members.filter((m) => m.role === "Student").length,
      },
      ...prev,
    ]);
    void createActivityAction({ item, bank: isBank }).then((res) => {
      if (res.ok) {
        setActivities((prev) =>
          prev.map((a) => (a.id === tempId ? { ...a, id: res.data.id } : a)),
        );
      }
    });
    return tempId;
  };

  const toggleDeleteActivity = (id: string) => {
    const curr = activities.find((a) => a.id === id);
    const nextDeleted = curr ? !curr.deleted : true;
    setActivities((prev) =>
      prev.map((a) => (a.id === id ? { ...a, deleted: nextDeleted } : a)),
    );
    void toggleDeleteActivityAction({ id, deleted: nextDeleted });
  };

  const setAttendanceStatus = (studentId: string, status: AttendanceEntry["status"]) => {
    setAttendance((prev) =>
      prev.map((entry) => (entry.studentId === studentId ? { ...entry, status } : entry)),
    );
    if (activeClassId) {
      void setAttendanceAction({ classCardId: activeClassId, studentId, status });
    }
  };

  const addComponent = (termName: string, categoryName: string, weightPercent: number) => {
    const tempId = `cmp-${Date.now()}`;
    setComponents((prev) => [
      ...prev,
      { id: tempId, termName, categoryName, weightPercent, active: true },
    ]);
    if (activeClassId) {
      void addComponentAction({
        classCardId: activeClassId,
        categoryName,
        weightPercent,
      }).then((res) => {
        if (res.ok) {
          setComponents((prev) =>
            prev.map((c) => (c.id === tempId ? { ...c, id: res.data.id } : c)),
          );
        }
      });
    }
  };

  const updateComponent = (id: string, categoryName: string, weightPercent: number) => {
    setComponents((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, categoryName, weightPercent } : item,
      ),
    );
    void updateComponentAction({
      id,
      classCardId: activeClassId || undefined,
      categoryName,
      weightPercent,
    });
  };

  const deleteComponent = (id: string) => {
    setComponents((prev) => prev.filter((item) => item.id !== id));
    void deleteComponentAction(id, activeClassId || undefined);
  };

  const toggleMemberEnabled = (memberId: string) => {
    const curr = members.find((m) => m.id === memberId);
    const nextEnabled = curr ? !curr.enabled : true;
    setMembers((prev) =>
      prev.map((m) => (m.id === memberId ? { ...m, enabled: nextEnabled } : m)),
    );
    if (activeClassId) {
      void toggleMemberFlagAction({
        classCardId: activeClassId,
        userId: memberId,
        enabled: nextEnabled,
      });
    }
  };

  const toggleMemberPermit = (memberId: string) => {
    const curr = members.find((m) => m.id === memberId);
    const nextPermit = curr ? !curr.permit : true;
    setMembers((prev) =>
      prev.map((m) => (m.id === memberId ? { ...m, permit: nextPermit } : m)),
    );
    if (activeClassId) {
      void toggleMemberFlagAction({
        classCardId: activeClassId,
        userId: memberId,
        hasPermit: nextPermit,
      });
    }
  };

  const removeMember = (memberId: string) => {
    setMembers((prev) => prev.filter((m) => m.id !== memberId));
    if (activeClassId) {
      void toggleMemberFlagAction({
        classCardId: activeClassId,
        userId: memberId,
        enabled: false,
      });
    }
  };

  const setCourseStatus = (courseId: string, status: CourseStatus) => {
    setExternalCourses((prev) =>
      prev.map((c) => (c.id === courseId ? { ...c, status } : c)),
    );
    void updateCourseStatusAction({ courseId, status });
  };

  const addCourse = (course: Omit<ExternalCourseItem, "id" | "publishedAt" | "lessons">) => {
    const tempId = `ext-${Date.now()}`;
    setExternalCourses((prev) => [
      { ...course, id: tempId, publishedAt: "Today", lessons: [] },
      ...prev,
    ]);
    void createCourseAction(course).then((res) => {
      if (res.ok) {
        setExternalCourses((prev) =>
          prev.map((c) => (c.id === tempId ? { ...c, id: res.data.id } : c)),
        );
      }
    });
    return tempId;
  };

  const sendClassMessage = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;
    setClassChat((prev) => [
      ...prev,
      {
        id: `cmsg-${Date.now()}`,
        senderName: user.name,
        senderRole: "user",
        timestamp: "Just now",
        text: trimmed,
      },
    ]);
    if (activeClassId) {
      void sendClassChatAction({ classCardId: activeClassId, message: trimmed });
    }
  };

  const sendGiyaMessage = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;
    const nowId = Date.now();
    const today = new Date().toISOString().slice(0, 10);
    setGiyaChat((prev) => [
      ...prev,
      {
        id: `gmsg-${nowId}`,
        senderName: user.name,
        senderRole: "user",
        timestamp: "Just now",
        text: trimmed,
      },
      {
        id: `gmsg-${nowId + 1}`,
        senderName: "Giya",
        senderRole: "assistant",
        timestamp: "Just now",
        text: "Draft prepared for your active class. Approve to save directly to MySQL:",
        approvalCard: {
          toolName: "create_quiz",
          contentType: "quiz",
          title: trimmed.slice(0, 60),
          topic: trimmed.slice(0, 40),
          termName: "1st Term",
          categoryName: "Quiz",
          publishedDate: today,
          deadline: today,
          questionCount: 5,
          status: "pending",
        },
      },
    ]);
  };

  const decideGiyaApproval = (messageId: string, decision: "approved" | "rejected") => {
    const target = giyaChat.find((m) => m.id === messageId)?.approvalCard;
    setGiyaChat((prev) =>
      prev.map((m) =>
        m.id === messageId && m.approvalCard
          ? { ...m, approvalCard: { ...m.approvalCard, status: decision } }
          : m,
      ),
    );
    if (decision === "approved" && target && activeClassId) {
      addActivity({
        classId: activeClassId,
        type: target.contentType === "assignment" ? "assignment" : "quiz",
        title: target.title,
        topic: target.topic || target.title,
        termName: target.termName || "1st Term",
        categoryName: target.categoryName || "Quiz",
        publishedDate: target.publishedDate,
        deadline: target.deadline,
        noDeadline: !target.deadline,
        points: 10,
        description: target.topic || target.title,
      });
    }
  };

  return (
    <LmsContext.Provider
      value={{
        user,
        role,
        setRole,
        frappeMeta,
        designTheme,
        setDesignTheme,
        classes,
        externalCourses,
        notifications,
        posts,
        activities,
        submissions,
        attendance,
        components,
        members,
        classChat,
        giyaChat,
        giyaDrawerOpen,
        setGiyaDrawerOpen,
        toggleArchiveClass,
        addClass,
        updateClass,
        markNotificationRead,
        markAllNotificationsRead,
        addPost,
        addPostComment,
        addActivity,
        toggleDeleteActivity,
        setAttendanceStatus,
        addComponent,
        updateComponent,
        deleteComponent,
        toggleMemberEnabled,
        toggleMemberPermit,
        removeMember,
        setCourseStatus,
        addCourse,
        sendClassMessage,
        sendGiyaMessage,
        decideGiyaApproval,
      }}
    >
      {children}
      <FloatingGiyaWidget
        role={role}
        drawerOpen={giyaDrawerOpen}
        onOpenDrawer={() => setGiyaDrawerOpen(true)}
        onCloseDrawer={() => setGiyaDrawerOpen(false)}
      />
    </LmsContext.Provider>
  );
}

export function useLmsSession() {
  const ctx = useContext(LmsContext);
  if (!ctx) {
    throw new Error("useLmsSession must be used inside LmsSessionProvider");
  }
  return ctx;
}
