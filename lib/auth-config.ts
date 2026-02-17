import { DefaultSession, DefaultUser } from "next-auth";
import { DefaultJWT } from "next-auth/jwt";
import CredentialsProvider from "next-auth/providers/credentials";
import { AuthOptions } from "next-auth";
import axios from "axios";

declare module "next-auth" {
  interface Session {
    user: {
      userToken: string;
      user_role: string;
    } & DefaultSession["user"];
  }
  interface User extends DefaultUser {
    userToken: string;
    user_role: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT extends DefaultJWT {
    userToken: string;
    user_role: string;
  }
}

export const authOptions: AuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: {
          label: "Email",
          type: "text",
          placeholder: "Enter email",
        },
        password: {
          label: "Password",
          type: "password",
          placeholder: "Enter Password",
        },
      },
      async authorize(credentials) {
        if (!credentials) return null;

        console.log(`${process.env.ACE_BASE}/auth/login`);
        try {
          const response = await axios.post(
            `${process.env.ACE_BASE}/auth/login`,
            {
              email: credentials.email,
              password: credentials.password,
            }
          );
          const user = response.data;

          if (user) {
            return {
              id: user.user.id,
              userToken: user?.access_token,
              email: user?.user.email ?? "",
              name: user?.user?.name ?? "",
              user_role: user?.user?.user_role ?? "",
            };
          }
        } catch (error) {
          console.error("Authorize error:", error);
          return null;
        }

        return null;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, trigger, user, session }) {
      if (user) {
        token.userToken = user.userToken;
        token.name = user.name;
        token.email = user.email;
        token.user_role = user.user_role;
      }

      return token;
    },
    async session({ session, token }) {
      if (token.userToken) {
        session.user.userToken = token.userToken;
        session.user.name = token.name;
        session.user.email = token.email;
        session.user.user_role = token.user_role;
      }
      return session;
    },
  },
};
