"use client";

import {
  BarChart4,
  Building2,
  PanelsTopLeft,
  Settings,
  ShieldCheck,
  Calendar,
  User,
  LogOut,
} from "lucide-react";
import { SidebarItemType } from "./SidebarItem.types";

// Rutas para el administrador
export const adminRoutes: SidebarItemType[] = [
  {
    icon: PanelsTopLeft,
    label: "Dashboard",
    href: "/admin/dashboard",
  },
  {
    icon: Building2,
    label: "Manage Centers",
    href: "/admin/management/center",
  },
  {
    icon: Calendar,
    label: "Manage Vaccines",
    href: "/admin/management/vaccine",
  },
  {
    icon: Settings,
    label: "Profile Management",
    href: "/admin/management/profile",
  },
  {
    icon: User,
    label: "Profile",
    href: "/admin/profile",
  },
];

// Rutas para el usuario
export const userRoutes: SidebarItemType[] = [
  {
    icon: PanelsTopLeft,
    label: "Dashboard",
    href: "/user/dashboard",
  },
  {
    icon: Calendar,
    label: "Vaccine Record",
    href: "/user/record",
  },
  {
    icon: BarChart4,
    label: "Vaccine Information",
    href: "/user/vaccine-info",
  },
  {
    icon: User,
    label: "Profile",
    href: "/user/profile",
  },
];

// Rutas para el centro de vacunación
export const centerRoutes: SidebarItemType[] = [
  {
    icon: PanelsTopLeft,
    label: "Dashboard",
    href: "/center/dashboard",
  },
  {
    icon: Building2,
    label: "Register Vaccination",
    href: "/center/register-vaccination",
  },
  {
    icon: BarChart4,
    label: "Vaccine Information",
    href: "/center/vaccine-info",
  },
  {
    icon: User,
    label: "Profile",
    href: "/center/profile",
  },
];

// Rutas comunes de soporte (pueden ser opcionales y compartidas)
export const supportRoutes: SidebarItemType[] = [
  {
    icon: Settings,
    label: "General Setting",
    href: "/",
  },
  {
    icon: ShieldCheck,
    label: "Security",
    href: "/",
  },
  {
    icon: LogOut,
    label: "Log out",
    href: "/auth/login",
  },
];
