import React from "react";
import { LucideIcon } from "lucide-react";

interface CustomIconProps {
  icon: LucideIcon;
  className?: string;
}

export const CustomIcon: React.FC<CustomIconProps> = ({
  icon: Icon,
  className,
}) => <Icon className={className} />;
