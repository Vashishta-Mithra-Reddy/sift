"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { 
  UserIcon, 
  Settings02Icon, 
  Notification01Icon, 
  Shield01Icon, 
  PaintBoardIcon, 
  Logout01Icon,
  Loading03Icon,
  Mail01Icon
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

export default function SettingsPage() {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();
  const { theme, setTheme } = useTheme();
  const { permission, requestPermission } = useFCM({ preventInit: true });
  
  const [activeTab, setActiveTab] = useState("profile");
  const [isUpdating, setIsUpdating] = useState(false);

  if (isPending) {
    return (
      <div className="max-w-7xl w-full py-10 px-4 space-y-8">
        <div className="space-y-2">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-4 w-96" />
        </div>
        <div className="flex gap-6">
          <Skeleton className="h-96 w-64 hidden md:block" />
          <Skeleton className="h-96 flex-1" />
        </div>
      </div>
    );
  }

  if (!session) {
    router.push("/login");
    return null;
  }

  const handleUpdateProfile = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsUpdating(true);
    
    const formData = new FormData(e.currentTarget);
    const name = formData.get("name") as string;
    
    try {
      await updateProfileAction({ name });
      toast.success("Profile updated successfully");
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

  return (
    <div className="max-w-7xl w-full md:py-6 md:px-4">
      <div className="mb-8 space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">
          Manage your account settings and preferences.
        </p>
      </div>

      <Tabs 
        defaultValue="profile" 
        className="flex flex-col md:flex-row gap-8"
        orientation="vertical"
        onValueChange={setActiveTab}
      >
        <aside className="md:w-64 shrink-0">
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
        </aside>
        
        <div className="flex-1 max-w-4xl">
          <TabsContent value="profile" className="space-y-6 mt-0">
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
          </TabsContent>

          <TabsContent value="account" className="space-y-6 mt-0">
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
          </TabsContent>

          <TabsContent value="appearance" className="space-y-6 mt-0">
            <Card>
              <CardHeader>
                <CardTitle>Appearance</CardTitle>
                <CardDescription>
                  Customize the look and feel of the application.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <Label>Theme</Label>
                  <div className="flex md:flex-row flex-col items-start md:items-center gap-4">
                     <div className="flex flex-col gap-2">
                        <div 
                          className={cn(
                            "items-center rounded-md border-2 border-muted p-1 hover:border-accent cursor-pointer",
                            theme === 'light' && "border-primary"
                          )}
                          onClick={() => setTheme('light')}
                        >
                          <div className="space-y-2 rounded-sm bg-[#ecedef] p-2">
                            <div className="space-y-2 rounded-md bg-white p-2 shadow-sm">
                              <div className="h-2 w-[80px] rounded-lg bg-[#ecedef]" />
                              <div className="h-2 w-[100px] rounded-lg bg-[#ecedef]" />
                            </div>
                            <div className="flex items-center space-x-2 rounded-md bg-white p-2 shadow-sm">
                              <div className="h-4 w-4 rounded-full bg-[#ecedef]" />
                              <div className="h-2 w-[100px] rounded-lg bg-[#ecedef]" />
                            </div>
                            <div className="flex items-center space-x-2 rounded-md bg-white p-2 shadow-sm">
                              <div className="h-4 w-4 rounded-full bg-[#ecedef]" />
                              <div className="h-2 w-[100px] rounded-lg bg-[#ecedef]" />
                            </div>
                          </div>
                        </div>
                        <span className="block w-full p-2 text-center font-normal">Light</span>
                     </div>
                     
                     <div className="flex flex-col gap-2">
                        <div 
                          className={cn(
                            "items-center rounded-md border-2 border-muted bg-popover p-1 hover:bg-accent hover:text-accent-foreground cursor-pointer",
                            theme === 'dark' && "border-primary"
                          )}
                          onClick={() => setTheme('dark')}
                        >
                          <div className="space-y-2 rounded-sm bg-slate-950 p-2">
                            <div className="space-y-2 rounded-md bg-slate-800 p-2 shadow-sm">
                              <div className="h-2 w-[80px] rounded-lg bg-slate-400" />
                              <div className="h-2 w-[100px] rounded-lg bg-slate-400" />
                            </div>
                            <div className="flex items-center space-x-2 rounded-md bg-slate-800 p-2 shadow-sm">
                              <div className="h-4 w-4 rounded-full bg-slate-400" />
                              <div className="h-2 w-[100px] rounded-lg bg-slate-400" />
                            </div>
                            <div className="flex items-center space-x-2 rounded-md bg-slate-800 p-2 shadow-sm">
                              <div className="h-4 w-4 rounded-full bg-slate-400" />
                              <div className="h-2 w-[100px] rounded-lg bg-slate-400" />
                            </div>
                          </div>
                        </div>
                        <span className="block w-full p-2 text-center font-normal">Dark</span>
                     </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications" className="space-y-6 mt-0">
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
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
