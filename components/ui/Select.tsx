import React from "react";

interface Option {
  value: string;
  label: string;
}

interface SelectProps {
  title: string;
  options: Option[];
  className?: string;
  value?: string;
  onChange?: (event: React.ChangeEvent<HTMLSelectElement>) => void;
}

const Select: React.FC<SelectProps> = ({
  title,
  options,
  className,
  value,
  onChange,
}) => {
  return (
    <div className={className}>
      <label className="block text-sm font-medium text-gray-700 dark:text-white">
        {title}
      </label>
      <select
        value={value}
        onChange={onChange}
        className="mt-1 block w-full border h-10 p-2 border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
      >
        <option value="">Select...</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
};

export default Select;
