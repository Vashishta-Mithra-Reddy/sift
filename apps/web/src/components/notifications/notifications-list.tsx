"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { 
  getUserNotifications, 
  markNotificationAsRead, 
  markAllNotificationsAsRead,
  deleteNotification,
  deleteAllNotifications
} from "@auxkaryakramah/auth/actions/notifications";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDistanceToNow } from "date-fns";
import { Notification01Icon, CheckmarkCircle02Icon, Delete02Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { toast } from "sonner";
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

interface NotificationsListProps {
  initialNotifications: Notification[];
}

export function NotificationsList({ initialNotifications }: NotificationsListProps) {
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>(initialNotifications);
  const [isLoading, setIsLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(initialNotifications.length >= 20);
  const LIMIT = 20;

  const fetchNotifications = async () => {
    setIsLoading(true);
    try {
      const data = await getUserNotifications(LIMIT, page * LIMIT);
      
      // @ts-ignore
      if (data.length < LIMIT) {
        setHasMore(false);
      }

      // @ts-ignore
      setNotifications((prev) => [...prev, ...data]);
      setPage((prev) => prev + 1);
    } catch (error) {
      toast.error("Failed to load notifications");
    } finally {
      setIsLoading(false);
    }
  };

  const handleMarkAsRead = async (id: string, link: string | null) => {
    try {
      await markNotificationAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
      
      if (link) {
        router.push(link as any);
      }
    } catch (error) {
      toast.error("Failed to mark as read");
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllNotificationsAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      toast.success("All notifications marked as read");
    } catch (error) {
      toast.error("Failed to mark all as read");
    }
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    try {
      await deleteNotification(id);
      setNotifications((prev) => prev.filter((n) => n.id !== id));
      toast.success("Notification deleted");
    } catch (error) {
      toast.error("Failed to delete notification");
    }
  };

  const handleDeleteAll = async () => {
    try {
      await deleteAllNotifications();
      setNotifications([]);
      toast.success("All notifications deleted");
    } catch (error) {
      toast.error("Failed to delete all notifications");
    }
  };

  return (
    <div className="md:py-4 font-jakarta">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold">Notifications</h1>
          <p className="text-muted-foreground">Manage your updates and alerts.</p>
        </div>
        <div className="flex flex-wrap gap-2 w-full md:w-auto">
          {notifications.length > 0 && (
            <AlertDialog >
              <AlertDialogTrigger className={buttonVariants({ variant: "destructive", size: "lg", className: "flex-1 md:flex-none" })}>
                <HugeiconsIcon icon={Delete02Icon} className="h-4 w-4" />
                Delete all
              </AlertDialogTrigger>
              <AlertDialogContent size="sm" className="font-jakarta">
                <AlertDialogHeader>
                  <AlertDialogTitle className="text-xl font-semibold">Delete all notifications?</AlertDialogTitle>
                  <AlertDialogDescription className={"py-1.5"}>
                    This action cannot be undone. This will permanently delete all your notifications.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDeleteAll} className={buttonVariants({ variant: "destructive"})+"border border-destructive/30"}>
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
          {notifications.some(n => !n.isRead) && (
            <Button variant="outline" size="lg" onClick={handleMarkAllAsRead} className="flex-1 md:flex-none">
              <HugeiconsIcon icon={CheckmarkCircle02Icon} className="h-4 w-4" />
              Mark all read
            </Button>
          )}
        </div>
      </div>

      <div className="space-y-4">
        {notifications.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent className="flex flex-col items-center justify-center space-y-4 min-h-[50vh]">
              <div className="p-4 bg-muted rounded-full">
                <HugeiconsIcon icon={Notification01Icon} className="h-8 w-8 text-muted-foreground" />
              </div>
              <div className="space-y-1">
                <CardTitle>No notifications</CardTitle>
                <CardDescription>You're all caught up! Check back later.</CardDescription>
              </div>
            </CardContent>
          </Card>
        ) : (
          notifications.map((notification) => (
            <Card 
              key={notification.id} 
              className={`transition-all py-0 gap-0 cursor-pointer ${!notification.isRead ? "border-primary/50 bg-primary/5" : ""}`}
              onClick={() => handleMarkAsRead(notification.id, notification.link)}
            >
              <CardHeader className="p-4 pb-2">
                <div className="flex justify-between items-start gap-4">
                  <div className="space-y-1">
                    <CardTitle className={`text-base ${!notification.isRead ? "text-primary" : ""}`}>
                      {notification.title}
                    </CardTitle>
                    <CardDescription className="text-xs">
                      {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    {!notification.isRead && (
                      <div className="h-2 w-2 rounded-full bg-primary shrink-0 mt-2" />
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 p-5 text-muted-foreground hover:text-destructive"
                      onClick={(e) => handleDelete(e, notification.id)}
                    >
                      <HugeiconsIcon icon={Delete02Icon} className="size-5" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <p className="text-sm text-muted-foreground">
                  {notification.body}
                </p>
              </CardContent>
            </Card>
          ))
        )}

        {hasMore && (
          <div className="flex justify-center pt-4">
            <Button 
              variant="ghost" 
              onClick={() => fetchNotifications()} 
              disabled={isLoading}
            >
              {isLoading ? "Loading..." : "Load More"}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}