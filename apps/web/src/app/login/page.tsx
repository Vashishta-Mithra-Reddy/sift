"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";

import SignInForm from "@/components/sign-in-form";
import SignUpForm from "@/components/sign-up-form";

export default function LoginPage() {
  const [showSignIn, setShowSignIn] = useState(true);
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();

  useEffect(() => {
    if (session) {
      router.push("/ai");
    }
  }, [session, router]);

  if (isPending) return null; // Or a loading spinner

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4 relative overflow-hidden">
      <div className="w-full max-w-md relative z-10">
        <AnimatePresence mode="wait" initial={false}>
          {showSignIn ? (
            <motion.div
              key="signin"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.2 }}
            >
              <SignInForm onSwitchToSignUp={() => setShowSignIn(false)} />
            </motion.div>
          ) : (
            <motion.div
              key="signup"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              <SignUpForm onSwitchToSignIn={() => setShowSignIn(true)} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
