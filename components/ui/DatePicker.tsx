import React from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { CalendarIcon } from "lucide-react";

interface DatePickerProps {
  selectedDate: Date | null;
  onDateChange: (date: Date | null) => void;
  className?: string;
}

const CustomDatePicker: React.FC<DatePickerProps> = ({
  selectedDate,
  onDateChange,
  className,
}) => {
  return (
    <div className={`relative ${className}`}>
      <DatePicker
        selected={selectedDate}
        onChange={(date) => onDateChange(date ?? new Date())}
        className="w-full pl-4 pr-4 py-2 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
      />
      <CalendarIcon className="absolute top-1/2 right-10 transform -translate-y-1/2 h-5 w-5 text-gray-400 dark:text-white" />
    </div>
  );
};

export default CustomDatePicker;
