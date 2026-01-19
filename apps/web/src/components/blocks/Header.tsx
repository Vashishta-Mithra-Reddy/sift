"use client";

import { useState } from "react";
// import { Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
// import MenuToggle from "./MenuToggle";
import Link from "next/link";
import { NAVIGATION_ITEMS } from "@/app/config/navigation";
import { authClient } from "@/lib/auth-client";
import UserMenu from "@/components/user-menu";
// import { NotificationCenter } from "../notifications/notification-center";

interface HeaderProps {
  authButton?: React.ReactNode;
}

export default function Header({ authButton }: HeaderProps) {
  const [open, setOpen] = useState(false);
  
  const { data: session } = authClient.useSession();

  const filteredNavItems = NAVIGATION_ITEMS.filter((item) => {
    if (item.hideOnDesktop) return false;
    return true;
  });

  return (
    <header className={
      `sticky top-0 z-50 border-b backdrop-blur font-jakarta ${
        open ? "bg-white/90 dark:bg-black/80" : "bg-white/80 dark:bg-black/60"
      }`
    }>
      <nav className="mx-auto flex py-2.5 items-center justify-between px-4 max-w-7xl">
        {/* Logo */}
        <Link href="/" className="text-xl font-semibold flex items-center">
          <p className="text-3xl font-bold text-foreground tracking-tighter">sift.</p>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-6 text-sm font-medium">
          {filteredNavItems.map((item) => (
             <Link 
                key={item.key} 
                href={item.href}
                className="hover:text-primary transition-colors"
             >
                {item.label}
             </Link>
          ))}
          {/* <NotificationCenter /> */}
          <div className="flex items-center gap-2">
              {/* <ModeToggle /> */}
              <UserMenu />
          </div>
        </div>

        {/* Mobile Actions */}
        <div className="flex md:hidden items-center gap-3">
          {/* <ModeToggle /> */}
          {/* <NotificationCenter /> */}
          <UserMenu />
          {/* <MenuToggle 
            isOpen={open} 
            setIsOpen={setOpen} 
            className="text-gray-800 dark:text-white"
            /> */}

        </div>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.35, ease: "easeInOut" }}
            className="md:hidden overflow-hidden border-t bg-white/80 backdrop-blur dark:bg-black/60"
          >
            <motion.div
              initial="hidden"
              animate="show"
              exit="hidden"
              variants={{
                hidden: {},
                show: {
                  transition: { staggerChildren: 0.08 },
                },
              }}
              className="flex flex-col px-4 py-4 space-y-4 text-sm font-medium"
            >
              {filteredNavItems.map((item) => (
                <motion.a
                  key={item.key}
                  href={item.pathname}
                  onClick={() => setOpen(false)}
                  variants={{
                    hidden: { y: -6, opacity: 0 },
                    show: { y: 0, opacity: 1 },
                  }}
                  transition={{ duration: 0.25, ease: "easeOut" }}
                  className="py-2 border-gray-100 dark:border-gray-800 last:border-0"
                >
                  {item.label}
                </motion.a>
              ))}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
