import type { user } from "@/drizzle/schema";

export type UserSelect = typeof user.$inferSelect;
export type UserInsert = typeof user.$inferInsert;

export const USER_ROLE = {
  OWNER: "owner",
  ADMIN: "admin",
  TECH: "tech",
  SALES: "sales",
  DEV: "dev",
  QA: "qa",
  PO: "po",
  PM: "pm",
  FINANCE: "finance",
  TEACHER: "teacher",
  STUDENT: "student",
} as const;

export type UserRole = (typeof USER_ROLE)[keyof typeof USER_ROLE] | (string & {});

export const USER_PERMISSION = {
  USERS_READ: "users:read",
  USERS_DELETE: "users:delete",
  CLASSES_READ: "classes:read",
  CLASSES_WRITE: "classes:write",
  ACTIVITIES_READ: "activities:read",
  ACTIVITIES_WRITE: "activities:write",
} as const;

export type UserPermission = (typeof USER_PERMISSION)[keyof typeof USER_PERMISSION];

const READ_ALL: UserPermission[] = [
  USER_PERMISSION.USERS_READ,
  USER_PERMISSION.CLASSES_READ,
  USER_PERMISSION.ACTIVITIES_READ,
];

const TEACHER_PERMS: UserPermission[] = [
  USER_PERMISSION.USERS_READ,
  USER_PERMISSION.CLASSES_READ,
  USER_PERMISSION.CLASSES_WRITE,
  USER_PERMISSION.ACTIVITIES_READ,
  USER_PERMISSION.ACTIVITIES_WRITE,
];

const ADMIN_PERMS: UserPermission[] = [
  ...TEACHER_PERMS,
  USER_PERMISSION.USERS_DELETE,
];

export const ROLE_PERMISSIONS: Record<string, UserPermission[]> = {
  [USER_ROLE.OWNER]: ADMIN_PERMS,
  [USER_ROLE.ADMIN]: ADMIN_PERMS,
  [USER_ROLE.TECH]: READ_ALL,
  [USER_ROLE.SALES]: READ_ALL,
  [USER_ROLE.DEV]: READ_ALL,
  [USER_ROLE.QA]: READ_ALL,
  [USER_ROLE.PO]: READ_ALL,
  [USER_ROLE.PM]: READ_ALL,
  [USER_ROLE.FINANCE]: READ_ALL,
  [USER_ROLE.TEACHER]: TEACHER_PERMS,
  [USER_ROLE.STUDENT]: [USER_PERMISSION.CLASSES_READ, USER_PERMISSION.ACTIVITIES_READ],
};

export function hasPermission(role: string, permission: UserPermission): boolean {
  const key = (role || "").trim().toLowerCase();
  const perms = ROLE_PERMISSIONS[key] ?? [];
  return perms.includes(permission);
}

export type UserResult<T = void> =
  | { ok: true; data: T }
  | { ok: false; error: string };
