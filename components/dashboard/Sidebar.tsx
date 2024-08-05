"use client";

import React from "react";
import { adminRoutes, userRoutes, centerRoutes } from "./SidebarRoutes.data";
import { UserRole } from "@/lib/types/UserRoles";
import { Logo } from "../common/Logo";
import { SidebarRoutes } from "./SidebarRoutes";

interface SidebarProps {
  userRole: UserRole;
}

export function Sidebar({ userRole }: SidebarProps) {
  const getRoutes = () => {
    switch (userRole) {
      case "admin":
        return adminRoutes;
      case "user":
        return userRoutes;
      case "center":
        return centerRoutes;
      default:
        return [];
    }
  };

  return (
    <div className="h-screen">
      <div className="flex flex-col h-full border-r">
        <Logo />
        <SidebarRoutes userRole={userRole} />
      </div>
    </div>
  );
}
