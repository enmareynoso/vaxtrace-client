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

// Rutas para el usuario
export const userRoutes: SidebarItemType[] = [
  {
    icon: PanelsTopLeft,
    label: "Dashboard",
    href: "/user/dashboard",
  },
  {
    icon: Calendar,
    label: "Record de vacunas",
    href: "/user/record",
  },
  {
    icon: BarChart4,
    label: "Información de vacuna",
    href: "/user/vaccine-info",
  },
  {
    icon: User,
    label: "Perfil",
    href: "/user/profile",
  },
  {
    icon: LogOut,
    label: "Cerrar sesión",
    href: "#",
    action: "logout",
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
    label: "Registro",
    href: "/center/register-vaccination",
  },
  {
    icon: BarChart4,
    label: "Información de vacuna",
    href: "/center/vaccine-info",
  },
  {
    icon: User,
    label: "Perfil",
    href: "/center/profile",
  },
  {
    icon: LogOut,
    label: "Cerrar sesión",
    href: "#",
    action: "logout",
  },
];

// Rutas comunes de soporte (pueden ser opcionales y compartidas)
export const supportRoutes: SidebarItemType[] = [
  {
    icon: Settings,
    label: "Ajustes generales",
    href: "/",
  },
  {
    icon: ShieldCheck,
    label: "Seguridad",
    href: "/",
  },
];
