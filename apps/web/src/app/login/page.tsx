import type { Metadata } from "next";
import LoginPageClient from "./login-client";

export const metadata: Metadata = {
  title: "Login",
  description: "Sign in to start your AI learning paths.",
};

export default function LoginPage() {
  return <LoginPageClient />;
}
