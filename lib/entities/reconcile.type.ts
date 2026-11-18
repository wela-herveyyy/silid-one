export type ReconcileRole = "student" | "teacher" | "admin";

export type ReconcileParticipantInput = {
  name: string;
  email: string;
  role: string;
  imageUrl?: string | null;
};

export type ReconcileClassInput = {
  schoolCode: string;
  schoolName?: string;
  schoolSite?: string;
  departmentName?: string;
  sectionName: string;
  level?: string;
  classroomName?: string;
  subjectName: string;
  subjectCode: string;
  period?: string;
  roster: ReconcileParticipantInput[];
  disableEmails?: string[];
  allowedTeacherEmails?: string[];
  rosterComplete?: boolean;
  expectedParticipantCount?: number;
  /** True for explicit teacher Sync button; false for background Frappe webhook push. */
  reEnableDisabled?: boolean;
  keepExistingRole?: boolean;
};

export type ReconcileResult = {
  schoolId: string;
  classroomId: string;
  classCardId: string;
  usersCreated: number;
  usersUpdated: number;
  participantsInserted: number;
  participantsEnabled: number;
  participantsDisabled: number;
  disableStaleSkipped: boolean;
};

export type ReconcileActionResult<T = ReconcileResult> =
  | { ok: true; data: T }
  | { ok: false; error: string };
