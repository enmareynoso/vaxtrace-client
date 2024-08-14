import React from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

interface DatePickerProps {
  label: string;
  selectedDate: Date | null;
  onDateChange: (date: Date | null) => void;
  className?: string;
}

const CustomDatePicker: React.FC<DatePickerProps> = ({
  label,
  selectedDate,
  onDateChange,
  className,
}) => {
  return (
    <div className={`relative ${className}`}>
      <label className="block text-sm font-medium text-gray-700 dark:text-white">
        {label}
      </label>
      <DatePicker
        selected={selectedDate}
        onChange={(date) => onDateChange(date ?? new Date())}
        className="mt-1 block w-full border h-8 p-3 border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
        icon=""
      />
    </div>
  );
};

export default CustomDatePicker;
