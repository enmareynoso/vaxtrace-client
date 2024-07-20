import { FC } from "react";

interface CheckboxProps {
  label: string;
  checked: boolean;
  onChange: () => void;
}

const Checkbox: FC<CheckboxProps> = ({ label, checked, onChange }) => {
  return (
    <label className="text-white">
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="mr-2"
      />
      {label}
    </label>
  );
};

export default Checkbox;
