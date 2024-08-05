import { LucideIcon } from "lucide-react";

export type SidebarItemType = {
  label: string;
  icon: LucideIcon;
  href: string;
};

export type SidebarItemProps = {
  item: SidebarItemType;
};
