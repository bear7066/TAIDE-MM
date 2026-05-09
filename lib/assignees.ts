import type { Session } from "next-auth";
import { allowedUsers } from "./auth";

export function getAssignableUsers(session?: Session | null) {
  if (allowedUsers.length > 0) return allowedUsers;

  const login = session?.user ? (session.user as any).githubLogin : null;
  return typeof login === "string" && login.trim() ? [login.trim().toLowerCase()] : [];
}

export function normalizeAssignees(value: unknown, session?: Session | null) {
  if (!Array.isArray(value)) return [];

  const assignable = new Set(getAssignableUsers(session));
  return Array.from(
    new Set(
      value
        .map((v) => String(v).trim().toLowerCase())
        .filter((v) => v && (assignable.size === 0 || assignable.has(v)))
    )
  );
}
