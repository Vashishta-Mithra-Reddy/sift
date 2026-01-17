"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Notification01Icon, CheckmarkCircle02Icon, Loading03Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";

import { Button, buttonVariants } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

import { authClient } from "@/lib/auth-client";
import {
  getUnreadNotifications,
  getUnreadNotificationCount,
  markAllNotificationsAsRead,
  markNotificationAsRead,
} from "@auxkaryakramah/auth/actions/notifications";

type Notification = {
  id: string;
  title: string;
  body: string;
  link: string | null;
  isRead: boolean;
  type: string;
  createdAt: Date;
  data: unknown;
};

export function NotificationCenter() {
  const router = useRouter();
  const { data: session } = authClient.useSession();
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [markingAsRead, setMarkingAsRead] = useState<string | null>(null);

  const fetchNotifications = async () => {
    if (!session?.user?.id) return;
    setIsLoading(true);
    try {
      const [data, count] = await Promise.all([
        getUnreadNotifications(5), // Fetch latest 5 unread for dropdown
        getUnreadNotificationCount(),
      ]);
      // @ts-ignore
      setNotifications(data);
      setUnreadCount(count);
    } catch (error) {
      console.error("Failed to fetch notifications", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (open) {
      fetchNotifications();
    } else {
      // Refresh count when closed periodically or on mount
      if (session?.user?.id) {
        getUnreadNotificationCount().then(setUnreadCount);
      }
    }
  }, [open, session?.user?.id]);

  const handleMarkAsRead = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!session?.user?.id) return;
    setMarkingAsRead(id);
    try {
      await markNotificationAsRead(id);
      setNotifications((prev) =>
        prev.filter((n) => n.id !== id)
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      toast.error("Failed to mark as read");
    } finally {
        setMarkingAsRead(null);
    }
  };

  const handleNotificationClick = async (id: string, link: string | null) => {
    if (!session?.user?.id) return;
    try {
        if (!notifications.find(n => n.id === id)?.isRead) {
            await markNotificationAsRead(id);
            setNotifications((prev) =>
                prev.filter((n) => n.id !== id)
            );
            setUnreadCount((prev) => Math.max(0, prev - 1));
        }

        if (link) {
            setOpen(false);
            router.push(link as any);
        }
    } catch (error) {
        toast.error("Failed to process notification");
    }
  };

  const handleMarkAllAsRead = async () => {
    if (!session?.user?.id) return;
    try {
      await markAllNotificationsAsRead();
      setNotifications([]);
      setUnreadCount(0);
      toast.success("All marked as read");
    } catch (error) {
      toast.error("Failed to mark all as read");
    }
  };

  if (!session) return null;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger className={buttonVariants({ variant: "ghost", size: "icon", className: "relative flex items-center justify-center p-5" })}>
          <HugeiconsIcon icon={Notification01Icon} className="size-6" />
          {unreadCount > 0 && (
            <Badge
              // variant="destructive"
              className="font-outfit absolute -top-1 -right-1 size-5 flex items-center justify-center rounded-full p-0 text-[10px] bg-foreground text-background text-sm"
            >
              {unreadCount > 9 ? "9+" : unreadCount}
            </Badge>
          )}
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0 font-jakarta gap-0" align="end">
        <div className="flex items-center justify-between p-4">
          <h4 className="font-semibold leading-none">Notifications</h4>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-auto px-2 text-xs text-muted-foreground hover:text-foreground"
              onClick={handleMarkAllAsRead}
            >
              <HugeiconsIcon icon={CheckmarkCircle02Icon} className="mr-1 h-3 w-3" />
              Mark all read
            </Button>
          )}
        </div>
        <Separator />
        <ScrollArea className="max-h-[300px]">
          {isLoading ? (
            <div className="p-4 space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex gap-3">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-3 w-2/3" />
                  </div>
                </div>
              ))}
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-[200px] text-muted-foreground text-sm">
              <HugeiconsIcon icon={Notification01Icon} className="h-8 w-8 mb-2 opacity-20" />
              <p>No new notifications</p>
            </div>
          ) : (
            <div className="flex flex-col">
              {notifications.map((notification) => (
                <div
                  role="button"
                  tabIndex={0}
                  key={notification.id}
                  className={`flex flex-col items-start gap-1 p-4 text-left text-sm transition-colors hover:bg-muted/50 cursor-pointer ${
                    !notification.isRead ? "bg-muted/20" : ""
                  }`}
                  onClick={() => handleNotificationClick(notification.id, notification.link)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      handleNotificationClick(notification.id, notification.link);
                    }
                  }}
                >
                  <div className="flex w-full justify-between gap-2">
                    <span className={`font-medium ${!notification.isRead ? "text-primary" : ""}`}>
                      {notification.title}
                    </span>
                    <div className="flex items-center gap-1">
                      <span className="text-[10px] text-muted-foreground shrink-0">
                        {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                      </span>
                      {!notification.isRead && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-4 w-4 text-muted-foreground hover:text-primary z-10"
                          onClick={(e) => handleMarkAsRead(e, notification.id)}
                          title="Mark as read"
                          disabled={markingAsRead === notification.id}
                        >
                          {markingAsRead === notification.id ? (
                              <HugeiconsIcon icon={Loading03Icon} className="h-3 w-3 animate-spin" />
                          ) : (
                              <HugeiconsIcon icon={CheckmarkCircle02Icon} className="h-3 w-3" />
                          )}
                        </Button>
                      )}
                    </div>
                  </div>
                  <p className="text-muted-foreground line-clamp-2 text-xs">
                    {notification.body}
                  </p>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
        <Separator/>
        <div className="p-2">
          <Link href="/notifications" passHref onClick={() => setOpen(false)}>
            <Button variant="outline" className="w-full text-xs h-8">
              View all notifications
            </Button>
          </Link>
        </div>
      </PopoverContent>
    </Popover>
  );
}
