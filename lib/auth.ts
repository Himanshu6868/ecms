import bcrypt from "bcryptjs";
import NextAuth, { type NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { dbQuery, supabase } from "@/lib/db";
import { otpVerifySchema } from "@/lib/validations";
import { Role, User } from "@/types/domain";

export const authConfig: NextAuthConfig = {
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  providers: [
    Credentials({
      name: "OTP",
      credentials: { email: { label: "Email", type: "email" }, otp: { label: "OTP", type: "text" } },
      authorize: async (credentials) => {
        const parsed = otpVerifySchema.safeParse(credentials);
        if (!parsed.success) {
          return null;
        }
        const email = parsed.data.email.trim().toLowerCase();
        const result = await dbQuery<User>(() =>
          supabase.from("users").select("*").eq("email", email).single(),
        );
        if (result.error) {
          return null;
        }
        const user = result.data;
        if (!user.otp_hash || !user.otp_expires_at) {
          return null;
        }
        const stillValid = new Date(user.otp_expires_at).getTime() > Date.now();
        if (!stillValid) {
          return null;
        }
        const otpValid = await bcrypt.compare(parsed.data.otp, user.otp_hash);
        if (!otpValid) {
          return null;
        }
        await supabase
          .from("users")
          .update({ otp_hash: null, otp_expires_at: null, otp_verified_at: new Date().toISOString(), otp_retry_count: 0 })
          .eq("id", user.id);
        return { id: user.id, name: user.name, email: user.email, role: user.role };
      },
    }),
  ],
  callbacks: {
    jwt: async ({ token, user }) => {
      if (user) {
        token.role = (user as { role: Role }).role;
      }
      return token;
    },
    session: async ({ session, token }) => {
      if (session.user) {
        session.user.id = token.sub ?? "";
        session.user.role = (token.role as Role | undefined) ?? "CUSTOMER";
      }
      return session;
    },
  },
};

export const { handlers, signIn, signOut, auth } = NextAuth(authConfig);
