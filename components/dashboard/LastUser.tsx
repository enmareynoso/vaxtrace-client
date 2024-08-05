import { CustomIcon } from "@/components/common/Customicon";
import { Building } from "lucide-react";
import React from "react";

export const LastUser: React.FC = () => {
  return (
    <div className="p-5 rounded-lg shadow-sm bg-background">
      <div className="flex items-center gap-x-2">
        <CustomIcon icon={Building} />
        <p className="text-xl">ALL USERS</p>
      </div>
      <div>
        <p>Table</p>
      </div>
    </div>
  );
};
