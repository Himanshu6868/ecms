import { DefaultSession } from "next-auth";
import { Role } from "@/types/domain";

declare module "next-auth" {
  interface Session {
    user: DefaultSession["user"] & {
      id: string;
      role: Role;
      isInternal: boolean;
    };
  }

  interface User {
    role: Role;
    isInternal: boolean;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: Role;
    isInternal?: boolean;
  }
}
