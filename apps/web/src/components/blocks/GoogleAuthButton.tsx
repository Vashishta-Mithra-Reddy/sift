"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { FcGoogle } from "react-icons/fc";
import {
  DashboardCircleIcon,
  Settings01Icon,
  LogoutSquare01Icon,
  Loading03Icon
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { toast } from "sonner";

import { Button, buttonVariants } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup, // Make sure this is imported
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { useFCM } from "@/hooks/use-fcm";

interface GoogleAuthButtonProps {
  className?: string;
  text?: string;
  redirectUrl?: string;
}

export default function GoogleAuthButton({ 
  className, 
  text = "Continue with Google",
  redirectUrl = "/ai"
}: GoogleAuthButtonProps) {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();
  const { unregister } = useFCM({ preventInit: true });
  const [isSigningIn, setIsSigningIn] = useState(false);

  const getInitials = (name: string) => {
    return name
      ?.match(/(\b\S)?/g)
      ?.join("")
      ?.match(/(^\S|\S$)?/g)
      ?.join("")
      .toUpperCase() || "U";
  };

  const handleSignIn = async () => {
    if (isSigningIn) return;
    setIsSigningIn(true);
    
    try {
      await authClient.signIn.social({
        provider: "google",
        callbackURL: redirectUrl,
      });
    } catch (error) {
      toast.error("Something went wrong connecting to Google");
      setIsSigningIn(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await unregister();
      await authClient.signOut({
        fetchOptions: {
          onSuccess: () => {
            router.push("/");
            router.refresh();
            toast.success("Signed out successfully");
          },
        },
      });
    } catch (error) {
      toast.error("Failed to sign out");
    }
  };

  if (isPending) {
    return <Skeleton className={cn("h-10 w-full max-w-[200px] rounded-md", className)} />;
  }

  if (session) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger 
          className={cn(
            buttonVariants({ variant: "ghost" }), 
            "relative h-10 w-10 rounded-full p-0 overflow-hidden ring-2 ring-transparent transition-all hover:ring-primary/20 focus-visible:ring-offset-0 font-jakarta",
            className
          )}
        >
          <Avatar className="h-full w-full">
            <AvatarImage 
              src={session.user.image || ""} 
              alt={session.user.name || "User"} 
              className="object-cover"
            />
            <AvatarFallback className="bg-primary/10 text-primary font-medium">
              {getInitials(session.user.name || "")}
            </AvatarFallback>
          </Avatar>
        </DropdownMenuTrigger>
        
        <DropdownMenuContent className="w-56" align="end">
          {/* FIX: Wrapped DropdownMenuLabel in DropdownMenuGroup */}
          <DropdownMenuGroup>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium text-foreground leading-none truncate">
                  {session.user.name}
                </p>
                <p className="text-xs leading-none truncate">
                  {session.user.email}
                </p>
              </div>
            </DropdownMenuLabel>
          </DropdownMenuGroup>
          
          <DropdownMenuSeparator />
          
          <DropdownMenuGroup>
            <DropdownMenuItem 
              onClick={() => router.push("/dashboard")}
              className="cursor-pointer"
            >
              <HugeiconsIcon icon={DashboardCircleIcon} className="mr-2 h-4 w-4" />
              <span>Dashboard</span>
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={() => router.push("/settings")}
              className="cursor-pointer"
            >
              <HugeiconsIcon icon={Settings01Icon} className="mr-2 h-4 w-4" />
              <span>Settings</span>
            </DropdownMenuItem>
          </DropdownMenuGroup>
          
          <DropdownMenuSeparator />
          
          {/* Ensure LogOut is also in a group if your library enforces it, though usually Items are safe outside. 
              If this still crashes, wrap this MenuItem in a DropdownMenuGroup as well. */}
          <DropdownMenuItem
            onClick={handleSignOut}
            className="text-red-600 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-950/20 cursor-pointer"
          >
            <HugeiconsIcon icon={LogoutSquare01Icon} className="mr-2 h-4 w-4" />
            <span>Log out</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <Button
      variant="outline"
      size="lg"
      className={cn(
        "h-10 group relative text-md overflow-hidden border-2 bg-background px-6 transition-all hover:border-blue-500/50 hover:bg-blue-50/50 dark:hover:bg-blue-950/20 dark:hover:border-blue-500/30",
        isSigningIn && "opacity-80 cursor-not-allowed",
        className
      )}
      onClick={handleSignIn}
      disabled={isSigningIn}
    >
      <div className="flex items-center gap-2">
        {isSigningIn ? (
          <HugeiconsIcon icon={Loading03Icon} className="h-6 w-6 animate-spin text-muted-foreground" />
        ) : (
          <FcGoogle className="h-6 w-6 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3" />
        )}
        <span className="font-medium">
            {isSigningIn ? "Connecting..." : text}
        </span>
      </div>
    </Button>
  );
}
