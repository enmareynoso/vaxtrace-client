import { Navbar, Sidebar } from "@/components/dashboard";
import { ReactNode } from "react";

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="flex w-full h-full">
      <div className="hidden xl:block w-80 h-full xl:fixed">
        <Sidebar userRole={"center"} />
      </div>
      <div className="w-full xl:ml-80">
        <Navbar userRole={"center"} />
        <div className="p-6 bg-[#fafbfc] dark:bg-secondary">{children}</div>
      </div>
    </div>
  );
}
