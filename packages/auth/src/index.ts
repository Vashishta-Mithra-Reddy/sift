import { db } from "@sift/db";
import * as schema from "@sift/db/schema/auth";
import { env } from "@sift/env/server";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: schema,
  }),
  baseURL: env.BETTER_AUTH_URL,
  trustedOrigins: [env.CORS_ORIGIN],
  socialProviders: {
    google: { 
      clientId: process.env.GOOGLE_OAUTH_CLIENT_ID as string, 
      clientSecret: process.env.GOOGLE_OAUTH_CLIENT_SECRET as string, 
    }, 
  },
  emailAndPassword: {
    enabled: true,
  },
  plugins: [nextCookies()],
});
