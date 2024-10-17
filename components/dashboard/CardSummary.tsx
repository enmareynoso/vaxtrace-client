import React from "react";
import { MoveDownRight, MoveUpRight } from "lucide-react";
import { CardSummaryProps } from "./CardSummary.types";
import { CustomTooltip } from "../common/CustomTooltip";
import { CustomIcon } from "../common/Customicon";
import { cn } from "@/lib/utils/utils";

export const CardSummary: React.FC<CardSummaryProps> = ({
  icon: Icon,
  total,
  title,
  average,
  tooltipText,
  className,
}) => (
  <div
    className={cn(
      "rounded-lg shadow-lg p-4 bg-white dark:bg-gray-800 transition-colors duration-300",
      "transition-transform transform hover:-translate-y-3",
      className
    )}
  >
    <div className="flex justify-between items-start">
      <div className="flex items-center">
        <CustomIcon
          icon={Icon}
          className="h-8 w-8 text-cyan-800 dark:text-cyan-600"
        />
        <div className="ml-4">
          <div className="flex items-start space-x-2">
            <h3 className="text-lg font-semibold">{title}</h3>
          </div>
          <div className="flex items-center mt-2">
            <p className="text-xl font-medium text-cyan-900 dark:text-cyan-700">
              {total}
            </p>
            {average !== undefined && (
              <div className="flex items-center ml-4 px-2 py-0.5 rounded-full bg-gray-200 dark:bg-gray-700">
                <p className="text-xs font-medium">{average}%</p>
                {average > 0 ? (
                  <MoveUpRight className="ml-1 text-green-500 w-3 h-3" />
                ) : (
                  <MoveDownRight className="ml-1 text-red-500 w-3 h-3" />
                )}
              </div>
            )}
          </div>
        </div>
      </div>
      {/* Icono de info alineado a la derecha */}
      {tooltipText && (
        <div className="flex items-start">
          <CustomTooltip content={tooltipText} />
        </div>
      )}
    </div>
  </div>
);
