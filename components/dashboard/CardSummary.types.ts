import { LucideIcon } from "lucide-react";

export interface CardSummaryProps {
  icon: LucideIcon;
  total: string;
  title: string;
  average?: number;
  tooltipText?: string;
}
