"use client";

import React from "react";
import { Menu, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Sidebar } from "./Sidebar";
import { ToggleTheme } from "../common/ToogleTheme";
import { UserRole } from "@/lib/types/UserRoles";

interface NavbarProps {
  userRole: UserRole;
}

export function Navbar({ userRole }: NavbarProps) {
  return (
    <nav
      className="flex items-center px-2 gap-x-4 md:px-6 
        justify-between w-full bg-background border-b h-20"
    >
      {/* Sidebar Trigger for Mobile */}
      <div className="block xl:hidden">
        <Sheet>
          <SheetTrigger className="flex items-center">
            <Menu />
          </SheetTrigger>
          <SheetContent side="left">
            {/* Passing the userRole to the Sidebar */}
            <Sidebar userRole={userRole} />
          </SheetContent>
        </Sheet>
      </div>

      {/* Search Input */}
      <div className="relative w-[300px]">
        <Input
          placeholder="Search..."
          className="rounded-lg"
          label={""}
          value={""}
          onChange={() => {}}
        />
        <Search strokeWidth={1} className="absolute top-2 right-2" />
      </div>

      {/* Theme Toggle */}
      <div className="flex gap-x-2 items-center">
        <ToggleTheme />
      </div>
    </nav>
  );
}
