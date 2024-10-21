"use client";

import { Separator } from "@/components/ui/separator";
import { SidebarItem } from "./SidebarItem";
import { userRoutes, centerRoutes, supportRoutes } from "./SidebarRoutes.data";
import { UserRole } from "@/lib/types/UserRoles";
import { SidebarItemType } from "./SidebarItem.types";

interface SidebarRoutesProps {
  userRole: UserRole;
}

export function SidebarRoutes({ userRole }: Readonly<SidebarRoutesProps>) {
  let routes: SidebarItemType[] = [];

  switch (userRole) {
    case "user":
      routes = [...userRoutes];
      break;
    case "center":
      routes = [...centerRoutes];
      break;
    default:
      routes = [...supportRoutes];
      break;
  }

  return (
    <div className="flex flex-col justify-between h-full">
      <div>
        <div className="p-2 md:p-6">
          <p className="text-slate-500 mb-2">GENERAL</p>
          {routes.map((item) => (
            <SidebarItem key={item.label} item={item} />
          ))}
        </div>
      </div>

      <div>
        <Separator />
        <footer className="mt-2 p-2 text-center">
          Vaxtrace 2024. All rights reserved
        </footer>
      </div>
    </div>
  );
}
