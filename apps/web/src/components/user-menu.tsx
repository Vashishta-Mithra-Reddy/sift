import Link from "next/link";
import { useRouter } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { authClient } from "@/lib/auth-client";
import { Button } from "./ui/button";
import { Skeleton } from "./ui/skeleton";
import { LogOut, User, Settings } from "lucide-react";
import { useFCM } from "@/hooks/use-fcm";

export default function UserMenu() {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();
  const { unregister } = useFCM({ preventInit: true });

  if (isPending) {
    return <Skeleton className="h-9 w-9 rounded-full" />;
  }

  if (!session) {
    return (
      <Link href="/login">
        <Button variant="default" size="lg" className="px-4 py-4">Sign In</Button>
      </Link>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        {/* <Button variant="ghost" className="relative h-9 w-9 rounded-full"> */}
          <Avatar className="h-9 w-9">
            <AvatarImage src={session.user.image || ""} alt={session.user.name || ""} />
            <AvatarFallback>{session.user.name?.charAt(0).toUpperCase()}</AvatarFallback>
          </Avatar>
        {/* </Button> */}
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56 font-jakarta" align="end">
        <DropdownMenuGroup>
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              {/* <Badge className="text-xs leading-none capitalize mb-2">
                {session.user.role || "Guest"}
              </Badge> */}
              <p className="text-sm font-medium text-foreground/90 leading-none line-clamp-1 truncate"> 
                {session.user.name}
              </p>
              <p className="text-xs leading-none text-muted-foreground">
                {session.user.email}
              </p>
            </div>
          </DropdownMenuLabel>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem >
             <Link href="/dashboard" className="cursor-pointer flex items-center justify-start w-full h-full">
                <User className="mr-2 h-4 w-4" />
                <span>Dashboard</span>
             </Link>
          </DropdownMenuItem>
          <DropdownMenuItem >
             <Link href="/settings" className="cursor-pointer flex items-center justify-start w-full h-full">
                <Settings className="mr-2 h-4 w-4" />
                <span>Settings</span>
             </Link>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="text-red-600 cursor-pointer w-full h-full"
          onClick={async () => {
            await unregister();
            authClient.signOut({
              fetchOptions: {
                onSuccess: () => {
                  router.push("/");
                },
              },
            });
          }}
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
