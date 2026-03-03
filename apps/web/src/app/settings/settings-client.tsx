"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { 
  UserIcon, 
  Settings02Icon, 
  Notification01Icon, 
  Shield01Icon, 
  PaintBoardIcon, 
  Logout01Icon,
  Loading03Icon,
  Mail01Icon,
  Sun01Icon,
  Moon01Icon,
  ComputerIcon
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { toast } from "sonner";
import { useTheme } from "next-themes";
import { Badge } from "@/components/ui/badge";
import { updateProfileAction } from "./actions";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { useFCM } from "@/hooks/use-fcm";
import { useBackground, type BackgroundPattern } from "@/components/providers/background-provider";
import { motion, type Variants } from "framer-motion";

interface SettingsPageClientProps {
  session: any;
}

export default function SettingsPageClient({ session }: SettingsPageClientProps) {
  const router = useRouter();
  // Session is passed as prop, so we don't need useSession here
  // const { data: session, isPending } = authClient.useSession();
  
  const { theme, setTheme } = useTheme();
  const { permission, requestPermission } = useFCM({ preventInit: true });
  const { showBackground, setShowBackground, pattern, setPattern } = useBackground();
  
  const [activeTab, setActiveTab] = useState("profile");
  const [isUpdating, setIsUpdating] = useState(false);

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  const contentAnimation:Variants = {
    hidden: { opacity: 0, y: 20 },
    show: { 
      opacity: 1, 
      y: 0, 
      transition: { 
        type: "spring",
        stiffness: 260,
        damping: 20,
        delay: 0.2 // Delay content until after sidebar starts
      } 
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsUpdating(true);
    
    const formData = new FormData(e.currentTarget);
    const name = formData.get("name") as string;
    
    try {
      await updateProfileAction({ name });
      toast.success("Profile updated successfully");
      router.refresh(); // Refresh to update server-side session data if name changed
    } catch (error) {
      toast.error("Failed to update profile");
      console.error(error);
    } finally {
      setIsUpdating(false);
    }
  };

  const userInitials = session.user.name
    ?.match(/(\b\S)?/g)
    ?.join("")
    ?.match(/(^\S|\S$)?/g)
    ?.join("")
    .toUpperCase() || "U";

  const patterns: { id: BackgroundPattern; label: string; preview: string }[] = [
    { 
      id: "hatching", 
      label: "Hatching", 
      preview: "bg-[repeating-linear-gradient(45deg,transparent,transparent_5px,#00000020_5px,#00000020_6px)] dark:bg-[repeating-linear-gradient(45deg,transparent,transparent_5px,#ffffff20_5px,#ffffff20_6px)]" 
    },
    { 
      id: "grid", 
      label: "Grid", 
      preview: "bg-[linear-gradient(to_right,#00000020_1px,transparent_1px),linear-gradient(to_bottom,#00000020_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#ffffff20_1px,transparent_1px),linear-gradient(to_bottom,#ffffff20_1px,transparent_1px)] bg-[size:12px_12px]" 
    },
    { 
      id: "dots", 
      label: "Dots", 
      preview: "bg-[radial-gradient(#00000040_1.5px,transparent_1.5px)] dark:bg-[radial-gradient(#ffffff40_1.5px,transparent_1.5px)] bg-[size:12px_12px]" 
    },
    { 
      id: "cross", 
      label: "Cross", 
      preview: "bg-[radial-gradient(#00000040_1.5px,transparent_1.5px),radial-gradient(#00000040_1.5px,transparent_1.5px)] dark:bg-[radial-gradient(#ffffff40_1.5px,transparent_1.5px),radial-gradient(#ffffff40_1.5px,transparent_1.5px)] bg-[size:12px_12px] [background-position:0_0,6px_6px]" 
    },
    {
      id: "paper",
      label: "Paper",
      preview: "bg-[linear-gradient(to_bottom,#00000020_1px,transparent_1px)] dark:bg-[linear-gradient(to_bottom,#ffffff20_1px,transparent_1px)] bg-[size:100%_16px]"
    },
    {
      id: "math",
      label: "Math",
      preview: "bg-[linear-gradient(to_right,#00000020_1px,transparent_1px),linear-gradient(to_bottom,#00000020_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#ffffff20_1px,transparent_1px),linear-gradient(to_bottom,#ffffff20_1px,transparent_1px)] bg-[size:8px_8px]"
    },
    {
      id: "diamonds",
      label: "Diamonds",
      preview: "bg-[linear-gradient(45deg,#00000020_1px,transparent_1px),linear-gradient(-45deg,#00000020_1px,transparent_1px)] dark:bg-[linear-gradient(45deg,#ffffff20_1px,transparent_1px),linear-gradient(-45deg,#ffffff20_1px,transparent_1px)] bg-[size:12px_12px]"
    },
    {
      id: "rain",
      label: "Rain",
      preview: "bg-[linear-gradient(to_right,#00000020_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#ffffff20_1px,transparent_1px)] bg-[size:12px_100%]"
    }
  ];

  return (
    <div className="max-w-7xl w-full md:px-4">
      <div className="mb-8 space-y-2 bg-background dark:bg-transparent rounded-xl">
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">
          Manage your account settings and preferences.
        </p>
      </div>

      <Tabs 
        defaultValue="profile" 
        className="flex flex-col md:flex-row gap-8 mr-0 pr-0 space-x-0 space-y-0"
        orientation="vertical"
        onValueChange={setActiveTab}
      >
        <motion.aside 
          className="md:w-64 shrink-0"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 260, damping: 20 }}
        >
          <TabsList className="w-full h-auto py-2 px-2">
            <TabsTrigger 
              value="profile" 
              className="w-full justify-start px-3 py-2 h-10 font-medium transition-colors gap-2"
            >
              <HugeiconsIcon icon={UserIcon} className="h-4 w-4" />
              Profile
            </TabsTrigger>

            <TabsTrigger 
              value="notifications" 
              className="w-full justify-start px-3 py-2 h-10 font-medium transition-colors gap-2"
            >
              <HugeiconsIcon icon={Notification01Icon} className="h-4 w-4" />
              Notifications
            </TabsTrigger>
            <TabsTrigger 
              value="appearance" 
              className="w-full justify-start px-3 py-2 h-10 font-medium transition-colors gap-2"
            >
              <HugeiconsIcon icon={PaintBoardIcon} className="h-4 w-4" />
              Appearance
            </TabsTrigger>
            <TabsTrigger 
              value="account"  
              className="w-full justify-start px-3 py-2 h-10 font-medium transition-colors gap-2"
            >
              <HugeiconsIcon icon={Shield01Icon} className="h-4 w-4" />
              Account
            </TabsTrigger>
          </TabsList>
        </motion.aside>
        
        <div className="flex-1 max-w-5xl">
          <TabsContent value="profile" className="space-y-6 mt-0">
            <motion.div variants={contentAnimation} initial="hidden" animate="show" key="profile">
            <Card>
              <CardHeader>
                <CardTitle>Profile</CardTitle>
                <CardDescription>
                  This is how others will see you on the site.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center gap-6">
                  <Avatar className="h-24 w-24">
                    <AvatarImage src={session.user.image || ""} />
                    <AvatarFallback className="text-xl">{userInitials}</AvatarFallback>
                  </Avatar>
                </div>
                
                <form onSubmit={handleUpdateProfile} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Display Name</Label>
                    <Input id="name" name="name" defaultValue={session.user.name || ""} placeholder="Your name" />
                    <p className="text-[0.8rem] text-muted-foreground">
                      This is your public display name.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" defaultValue={session.user.email || ""} disabled />
                    <p className="text-[0.8rem] text-muted-foreground">
                      Email cannot be changed directly.
                    </p>
                  </div>

                  <div>
                    <Button type="submit" className="h-9 px-4" disabled={isUpdating}>
                      {isUpdating && <HugeiconsIcon icon={Loading03Icon} className="mr-2 h-4 w-4 animate-spin" />}
                      Update Profile
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
            </motion.div>
          </TabsContent>

          <TabsContent value="appearance" className="space-y-6 mt-0">
            <motion.div variants={contentAnimation} initial="hidden" animate="show" key="appearance">
            <Card>
              <CardHeader>
                <CardTitle>Appearance</CardTitle>
                <CardDescription>
                  Customize the look and feel of the application.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <Label className="text-base">Theme</Label>
                    <p className="text-sm text-muted-foreground">
                      Select your preferred theme.
                    </p>
                  </div>
                  <div className="flex items-center gap-2 border rounded-lg p-1">
                    <Button 
                      variant={theme === "light" ? "secondary" : "ghost"} 
                      size="sm" 
                      onClick={() => setTheme("light")}
                      className="h-8 w-8 px-0"
                    >
                      <span className="sr-only">Light</span>
                      <HugeiconsIcon icon={Sun01Icon} className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant={theme === "dark" ? "secondary" : "ghost"} 
                      size="sm" 
                      onClick={() => setTheme("dark")}
                      className="h-8 w-8 px-0"
                    >
                      <span className="sr-only">Dark</span>
                      <HugeiconsIcon icon={Moon01Icon} className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant={theme === "system" ? "secondary" : "ghost"} 
                      size="sm" 
                      onClick={() => setTheme("system")}
                      className="h-8 w-8 px-0"
                    >
                      <span className="sr-only">System</span>
                      <HugeiconsIcon icon={ComputerIcon} className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                <div className="flex items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <Label className="text-base">Background Effect</Label>
                    <p className="text-sm text-muted-foreground">
                      Show the hatching pattern background.
                    </p>
                  </div>
                  <Switch 
                    checked={showBackground}
                    onCheckedChange={setShowBackground}
                  />
                </div>

                {showBackground && (
                  <motion.div 
                    className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                  >
                    {patterns.map((p) => (
                      <div 
                        key={p.id}
                        className={cn(
                          "cursor-pointer rounded-lg border-2 p-1 transition-all hover:bg-accent",
                          pattern === p.id ? "border-primary bg-accent" : "border-muted"
                        )}
                        onClick={() => setPattern(p.id)}
                      >
                        <div className={cn("h-24 w-full rounded-md mb-2 border", p.preview)} />
                        <p className="text-xs font-medium text-center pb-1">{p.label}</p>
                      </div>
                    ))}
                  </motion.div>
                )}
              </CardContent>
            </Card>
            </motion.div>
          </TabsContent>

          <TabsContent value="account" className="space-y-6 mt-0">
            <motion.div variants={contentAnimation} initial="hidden" animate="show" key="account">
            <Card>
              <CardHeader>
                <CardTitle>Account Security</CardTitle>
                <CardDescription>
                  Manage your account security settings.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <div className="flex items-center justify-between rounded-lg border p-4 opacity-50 cursor-not-allowed">
                    <div className="space-y-0.5">
                      <Label className="text-base">Two-factor Authentication</Label>
                      <p className="text-sm text-muted-foreground">
                        Managed by your Google account.
                      </p>
                    </div>
                    <Switch disabled />
                  </div>
                </div>
              </CardContent>
            </Card>
            </motion.div>
          </TabsContent>

          <TabsContent value="notifications" className="space-y-6 mt-0">
            <motion.div variants={contentAnimation} initial="hidden" animate="show" key="notifications">
            <Card>
              <CardHeader>
                <CardTitle>Notifications</CardTitle>
                <CardDescription>
                  Configure how you receive alerts about your sifts and mastery.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <Label className="text-base">Daily Reminders</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive daily reminders to complete your active recall sessions.
                    </p>
                  </div>
                  <Switch 
                    checked={permission === 'granted'}
                    onCheckedChange={async (checked) => {
                      if (checked) {
                        if (permission === 'default') {
                          await requestPermission();
                        } else if (permission === 'denied') {
                          toast.error("Notifications are blocked", {
                            description: "Please enable notifications in your browser settings.",
                          });
                        }
                      } else {
                        toast.info("Notifications disabled in browser settings");
                      }
                    }}
                  />
                </div>
                <div className="flex items-center justify-between rounded-lg border p-4 opacity-60">
                  <div className="space-y-0.5">
                    <Label className="text-base">Weekly Mastery Digest</Label>
                    <p className="text-sm text-muted-foreground">
                      Email summary of your Echoes progress and retention scores.
                    </p>
                  </div>
                  <Switch checked disabled />
                </div>
              </CardContent>
            </Card>
            </motion.div>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
