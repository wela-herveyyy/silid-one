export type UserRole = "Teacher" | "Student" | "Admin" | "Partner";

export type ClassKind = "normal" | "sms";

export interface ClassCardItem {
  id: string;
  subjectName: string;
  subjectCode: string;
  sectionName: string;
  schoolYear: string;
  teacherName: string;
  schedule: string;
  studentCount: number;
  kind: ClassKind;
  accentColor: string;
  archived?: boolean;
}

export interface CourseLessonItem {
  id: string;
  weekLabel: string;
  title: string;
  summary: string;
  durationMinutes: number;
  contentParagraphs: string[];
}

export type CourseStatus = "published" | "draft" | "archived";

export interface ExternalCourseItem {
  id: string;
  title: string;
  description: string;
  gradeLabel: string;
  topicTags: string[];
  authorName: string;
  publishedAt: string;
  status: CourseStatus;
  referenceUrl: string;
  accentColor: string;
  lessons: CourseLessonItem[];
}

export interface NotificationItem {
  id: string;
  title: string;
  body: string;
  createdAtLabel: string;
  isRead: boolean;
}

export interface ClassPostComment {
  id: string;
  authorName: string;
  body: string;
  createdAtLabel: string;
}

export interface ClassPostItem {
  id: string;
  classId: string;
  authorName: string;
  authorRole: "Teacher" | "Student";
  createdAtLabel: string;
  body: string;
  pinned?: boolean;
  comments: ClassPostComment[];
}

export type ActivityClassification = "quiz" | "assignment" | "material";

export type QuestionType =
  | "multiple-choice"
  | "true-false"
  | "identification"
  | "essay"
  | "enumeration"
  | "matching"
  | "attachments";

export type StudentVisibilityMode =
  | "All Students"
  | "Only one or multiple students"
  | "Only students with permit"
  | "Except one or multiple students";

export interface ActivityOptions {
  timeLimit?: number;
  proctoring?: boolean;
  revealAnswers?: boolean;
  shuffleQuestions?: boolean;
  autoComputeQuizScore?: boolean;
  askForFeedback?: boolean;
  noDeadline?: boolean;
  disableDownloadAttachedFiles?: boolean;
  studentVisibilityMode?: StudentVisibilityMode;
}

export interface MatchingPairItem {
  id: string;
  left: string;
  right: string;
  wrong?: string;
}

export interface QuizQuestionItem {
  id: string;
  type: QuestionType;
  prompt: string;
  points: number;
  choices?: string[];
  correctAnswer: string;
  correctAnswers?: string[];
  alternativeAnswers?: string[];
  shuffleChoices?: boolean;
  ignorePunctuation?: boolean;
  ignoreCase?: boolean;
  matchingPairs?: MatchingPairItem[];
  referenceAttachments?: string[];
  explanation?: string;
}

export interface ClassActivityItem {
  id: string;
  classId: string;
  type: ActivityClassification;
  title: string;
  topic: string;
  termName: string;
  categoryName: string;
  publishedDate: string;
  deadline: string | null;
  noDeadline: boolean;
  points: number;
  description: string;
  submittedCount: number;
  totalStudents: number;
  deleted?: boolean;
  options?: ActivityOptions;
  questions?: QuizQuestionItem[];
}

export interface SubmissionScoreRow {
  studentId: string;
  studentName: string;
  sectionName: string;
  submittedAt: string;
  score: number;
  maxScore: number;
  status: "Graded" | "Submitted" | "Missing";
  feedback?: string;
}

export interface AttendanceEntry {
  studentId: string;
  studentName: string;
  status: "present" | "late" | "absent" | "excused";
}

export interface ClassworkComponentItem {
  id: string;
  termName: string;
  categoryName: string;
  weightPercent: number;
  active: boolean;
}

export interface ClassMemberItem {
  id: string;
  name: string;
  email: string;
  role: "Teacher" | "Student";
  gender?: "MALE" | "FEMALE";
  status: "Active" | "Invited";
  enabled?: boolean;
  permit?: boolean;
  badgesEarned: number;
}

export interface ChatMessageItem {
  id: string;
  senderName: string;
  senderRole: "user" | "assistant" | "peer";
  timestamp: string;
  text: string;
  approvalCard?: {
    toolName: string;
    contentType: "quiz" | "assignment" | "material" | "term";
    title: string;
    topic?: string;
    termName?: string;
    categoryName?: string;
    publishedDate: string;
    deadline: string | null;
    questionCount?: number;
    status: "pending" | "approved" | "rejected";
  };
}
