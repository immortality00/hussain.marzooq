import { DefaultSession } from "next-auth";

declare module "next-auth" {
  /**
   * Extend the Session type to include custom properties
   */
  interface Session {
    refreshToken?: string;
    user: {
      id: string;
    } & DefaultSession["user"];
  }
  
  /**
   * Extend the User type
   */
  interface User {
    id: string;
  }
}

declare module "next-auth/jwt" {
  /**
   * Extend the JWT type to include custom properties
   */
  interface JWT {
    id?: string;
    refreshToken?: string;
  }
} 