import { CustomIconProps } from "./Customicon.types";

export function CustomIcon(props: CustomIconProps) {
  const { icon: Icon } = props;
  return (
    <div className="p-2 bg-slate-400/2 rounded-lg">
      <Icon strokeWidth={1} className="w-6 h-6 text-slate-500" />
    </div>
  );
}
