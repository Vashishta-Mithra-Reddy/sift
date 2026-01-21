import { 
  Home01Icon, 
  BookOpen01Icon,
  FlashIcon,
  ChartHistogramIcon,
  Settings01Icon,
  AiCloud01Icon,
  Globe02Icon
} from "@hugeicons/core-free-icons";
import { type UrlObject } from "url";

export type NavItem = {
  key: string;
  label: string;
  href: UrlObject;
  pathname: string;
  icon: any;
  hideOnDesktop?: boolean;
  roles?: string[]; // Optional for now
};

export const NAVIGATION_ITEMS: NavItem[] = [
  // {
  //   key: "home",
  //   label: "Home",
  //   href: { pathname: "/" },
  //   pathname: "/",
  //   icon: Home01Icon,
  //   hideOnDesktop: true,
  // },
  {
    key: "explore",
    label: "Explore",
    href: { pathname: "/explore" },
    pathname: "/explore",
    icon: Globe02Icon,
  },
  {
    key: "ai",
    label: "AI Studio",
    href: { pathname: "/ai" },
    pathname: "/ai",
    icon: AiCloud01Icon,
  },
  {
    key: "dashboard",
    label: "Library",
    href: { pathname: "/dashboard" },
    pathname: "/dashboard",
    icon: BookOpen01Icon,
  },
  {
    key: "sifts",
    label: "Sifts",
    href: { pathname: "/sifts" },
    pathname: "/sifts",
    icon: FlashIcon,
  },
  {
    key: "echoes",
    label: "Echoes",
    href: { pathname: "/echoes" },
    pathname: "/echoes",
    icon: ChartHistogramIcon,
  },
  // {
  //   key: "settings",
  //   label: "Settings",
  //   href: { pathname: "/settings" },
  //   pathname: "/settings",
  //   icon: Settings01Icon,
  //   hideOnDesktop: true, // Typically in user menu on desktop
  // }
];
