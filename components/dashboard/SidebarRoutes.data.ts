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
    label: "Administrar centros",
    href: "/admin/management/center",
  },
  {
    icon: Calendar,
    label: "Administrar vacunas",
    href: "/admin/management/vaccine",
  },
  {
    icon: Settings,
    label: "Administrar perfiles",
    href: "/admin/management/profile",
  },
  {
    icon: User,
    label: "Perfil",
    href: "/admin/profile",
  },
  {
    icon: LogOut,
    label: "Log out",
    href: "#", // Usaremos '#' y agregaremos la funcionalidad de logout
    action: "logout",
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
    href: "#", // Usaremos '#' y agregaremos la funcionalidad de logout
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
    href: "#", // Usaremos '#' y agregaremos la funcionalidad de logout
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
