import { LucideIcon } from "lucide-react";

export type SidebarItemType = {
  label: string;
  icon: LucideIcon;
  href: string;
  action?: string;
};

export type SidebarItemProps = {
  item: SidebarItemType;
};
