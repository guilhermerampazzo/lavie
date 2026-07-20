import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: "admin" | "equipe" | "revendedora";
    } & DefaultSession["user"];
    accessToken: string;
  }

  interface User {
    role: "admin" | "equipe" | "revendedora";
    accessToken: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role: "admin" | "equipe" | "revendedora";
    accessToken: string;
  }
}
