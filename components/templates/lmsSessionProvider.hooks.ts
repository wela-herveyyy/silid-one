"use client";

import { usePathname } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import {
  getClassWorkspaceDataAction,
  getLiveSessionStateAction,
} from "@/lib/domain/actions/lms_session.actions";
import type { SchoolVersion } from "@/lib/entities/frappe.type";
import type {
  AttendanceEntry,
  ChatMessageItem,
  ClassActivityItem,
  ClassCardItem,
  ClassMemberItem,
  ClassPostItem,
  ClassworkComponentItem,
  ExternalCourseItem,
  NotificationItem,
  SubmissionScoreRow,
  UserRole,
} from "@/types/lms";

export type LiveUserProfile = {
  name: string;
  email: string;
  schoolName: string;
};

export type FrappeSessionMeta = {
  connected: boolean;
  schoolName: string;
  schoolCode: string;
  schoolSite: string;
  schoolVersion: SchoolVersion;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
};

const PUBLIC_PATHS = ["/login", "/landing", "/forbidden"];

export function useLiveSessionHydration(params: {
  setUser: (user: LiveUserProfile) => void;
  setRole: (role: UserRole) => void;
  setClasses: (classes: ClassCardItem[]) => void;
  setExternalCourses: (courses: ExternalCourseItem[]) => void;
  setNotifications: (notifications: NotificationItem[]) => void;
  setPosts: (posts: ClassPostItem[]) => void;
  setActivities: (activities: ClassActivityItem[]) => void;
  setComponents: (components: ClassworkComponentItem[]) => void;
  setMembers: (members: ClassMemberItem[]) => void;
  setAttendance: (attendance: AttendanceEntry[]) => void;
  setSubmissions: (submissions: SubmissionScoreRow[]) => void;
  setClassChat: (messages: ChatMessageItem[]) => void;
}) {
  const {
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
  } = params;

  const pathname = usePathname();
  const isPublic = PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(`${p}/`));

  const [connected, setConnected] = useState(false);
  const [schoolName, setSchoolName] = useState("");
  const [schoolCode, setSchoolCode] = useState("");
  const [schoolSite, setSchoolSite] = useState("");
  const [schoolVersion, setSchoolVersion] = useState<SchoolVersion>("v2");
  const [loading, setLoading] = useState(!isPublic);
  const [error, setError] = useState<string | null>(null);

  const applyResponse = useCallback(
    (res: Awaited<ReturnType<typeof getLiveSessionStateAction>>) => {
      setLoading(false);
      if (!res.ok) {
        setConnected(false);
        return;
      }

      setUser(res.data.user);
      setRole(res.data.role);
      setConnected(res.data.connected);
      setSchoolName(res.data.schoolName);
      setSchoolCode(res.data.schoolCode);
      setSchoolSite(res.data.schoolSite);
      setSchoolVersion(res.data.schoolVersion);
      setError(res.data.sourceError ?? null);
      setClasses(res.data.classes);
      setExternalCourses(res.data.courses);
      setNotifications(res.data.notifications);
      if (!pathname.startsWith("/class/view/")) {
        setActivities(res.data.bankActivities);
      }
    },
    [
      pathname,
      setActivities,
      setClasses,
      setExternalCourses,
      setNotifications,
      setRole,
      setUser,
    ],
  );

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    const res = await getLiveSessionStateAction({ forceSync: true });
    applyResponse(res);
  }, [applyResponse]);

  useEffect(() => {
    if (isPublic) return;
    let active = true;
    void getLiveSessionStateAction().then((res) => {
      if (active) applyResponse(res);
    });
    return () => {
      active = false;
    };
  }, [applyResponse, isPublic, pathname]);

  useEffect(() => {
    if (!pathname.startsWith("/class/view/")) return;
    const rawSegment = pathname.slice("/class/view/".length).split("/")[0] || "";
    if (!rawSegment) return;
    let decodedId = rawSegment;
    try {
      decodedId = decodeURIComponent(rawSegment);
    } catch {
      decodedId = rawSegment;
    }

    let active = true;
    void getClassWorkspaceDataAction(decodedId).then((res) => {
      if (!active || !res.ok) return;
      setPosts(res.data.posts);
      setActivities(res.data.activities);
      setComponents(res.data.components);
      setMembers(res.data.members);
      setAttendance(res.data.attendance);
      setSubmissions(res.data.submissions);
      setClassChat(res.data.classChat);
    });

    return () => {
      active = false;
    };
  }, [
    pathname,
    setActivities,
    setAttendance,
    setClassChat,
    setComponents,
    setMembers,
    setPosts,
    setSubmissions,
  ]);

  return {
    connected,
    schoolName,
    schoolCode,
    schoolSite,
    schoolVersion,
    loading,
    error,
    refresh,
  };
}
