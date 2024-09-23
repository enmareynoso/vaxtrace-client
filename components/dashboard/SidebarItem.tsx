"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { SidebarItemProps } from "./SidebarItem.types";
import { cn } from "@/lib/utils/utils";
import cookies from "js-cookie";

export function SidebarItem({ item }: SidebarItemProps) {
  const { href, icon: Icon, label, action } = item;
  const pathname = usePathname();
  const router = useRouter();
  const activePath = pathname === href;

  const handleLogout = () => {
    cookies.remove("access_token");
    cookies.remove("refresh_token");
    router.push("/auth/login");
  };

  if (action === "logout") {
    return (
      <button
        onClick={handleLogout}
        className={`flex gap-x-2 mt-2 text-slate-700 dark:text-white text-sm items-center
          hover:bg-slate-300/20 p-2 rounded-lg cursor-pointer w-full ${
            activePath && "bg-slate-400/20"
          }`}
      >
        <Icon className="h-5 w-5" strokeWidth={1} />
        {label}
      </button>
    );
  }

  return (
    <Link
      href={href}
      className={`flex gap-x-2 mt-2 text-slate-700 dark:text-white text-sm items-center
        hover:bg-slate-300/20 p-2 rounded-lg cursor-pointer ${
          activePath && "bg-slate-400/20"
        }`}
    >
      <Icon className="h-5 w-5" strokeWidth={1} />
      {label}
    </Link>
  );
}
