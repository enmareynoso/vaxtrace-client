import React from "react";

interface RadioButtonProps {
  label: string;
  value: string;
  checked: boolean;
  onChange: () => void;
  className?: string;
}

const RadioButton: React.FC<RadioButtonProps> = ({
  label,
  value,
  checked,
  onChange,
  className,
}) => {
  return (
    <button
      onClick={onChange}
      className={`border rounded-md px-4 py-2 ${
        checked ? "bg-blue-500 text-white" : "bg-white text-black"
      } ${className}`}
    >
      {label}
    </button>
  );
};

export default RadioButton;
