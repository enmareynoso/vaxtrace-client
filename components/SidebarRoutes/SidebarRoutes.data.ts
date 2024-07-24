import {
    BarChart4,
    Building2,
    PanelsTopLeft,
    Settings,
    ShieldCheck,
    CircleHelpIcon,
    Calendar,
  } from "lucide-react";
  
  export const dataGeneralSidebar = [
    {
      icon: PanelsTopLeft,
      label: "Dashboard",
      href: "/admin/dashboard",
    },
    {
      icon: Building2,
      label: "Hospital",
      href: "/",
    },
    {
      icon: Calendar,
      label: "Vaccine Record",
      href: "/",
    },
  ];
  
  export const dataToolsSidebar = [
    {
      icon: CircleHelpIcon,
      label: "Faqs",
      href: "/",
    },
    {
      icon: BarChart4,
      label: "Vaccine Information",
      href: "/",
    },
  ];
  
  export const dataSupportSidebar = [
    {
      icon: Settings,
      label: "Setting",
      href: "/",
    },
    {
      icon: ShieldCheck,
      label: "Security",
      href: "/",
    },
  ];