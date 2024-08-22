import { LucideIcon } from "lucide-react";

export type SidebarItemType = {
  label: string;
  icon: LucideIcon;
  href: string;
  action?: string; // Propiedad opcional 'action'
};

export type SidebarItemProps = {
  item: SidebarItemType;
};
