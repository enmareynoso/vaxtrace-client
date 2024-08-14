import React, { ReactNode } from "react";
import { UserRole } from "@/lib/types/UserRoles";
import { Layout } from "../layout";

interface UserLayoutProps {
  children: ReactNode;
}

const UserLayout = ({ children }: UserLayoutProps) => {
  const userRole: UserRole = "user"; // Role should be determined dynamically

  return <Layout userRole={userRole}>{children}</Layout>;
};

export default UserLayout;
