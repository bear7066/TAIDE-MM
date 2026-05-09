import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";

export const allowedUsers = (process.env.ALLOWED_GITHUB_USERS || "")
  .split(",")
  .map((u) => u.trim().toLowerCase())
  .filter(Boolean);

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [GitHub],
  callbacks: {
    async jwt({ token, profile }) {
      // GitHub profile.login 是 username
      if (profile?.login) {
        token.githubLogin = String(profile.login).toLowerCase();
        // 判斷是否為編輯者 (白名單為空 = 所有登入者皆可編輯)
        token.canEdit =
          allowedUsers.length === 0 ||
          allowedUsers.includes(String(profile.login).toLowerCase());
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).githubLogin = token.githubLogin;
        (session.user as any).canEdit = token.canEdit ?? false;
      }
      return session;
    },
  },
  pages: {
    // 登入失敗導回首頁
    error: "/",
  },
});

// 給 API route 用的權限檢查 helper
export async function requireEditor() {
  const session = await auth();
  if (!session?.user || !(session.user as any).canEdit) {
    return null;
  }
  return session;
}
