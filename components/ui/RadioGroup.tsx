import React from "react";

interface RadioOption {
  title: string;
  value: string;
}

interface RadioGroupProps {
  title: string;
  options: RadioOption[];
  selectedValue: string;
  onChange: (value: string) => void;
  className?: string;
}

export const RadioGroup: React.FC<RadioGroupProps> = ({
  title,
  options,
  selectedValue,
  onChange,
  className,
}) => {
  return (
    <div className={`space-y-2 ${className}`}>
      <span className="block text-sm font-medium text-gray-700">{title}</span>
      <div className="flex space-x-4">
        {options.map((option) => (
          <label key={option.value} className="inline-flex items-center">
            <input
              type="radio"
              name={title}
              value={option.value}
              checked={selectedValue === option.value}
              onChange={() => onChange(option.value)}
              className="form-radio h-4 w-4 text-blue-600"
            />
            <span className="ml-2 text-gray-700">{option.title}</span>
          </label>
        ))}
      </div>
    </div>
  );
};
