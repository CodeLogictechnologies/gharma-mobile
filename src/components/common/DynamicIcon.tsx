import * as icons from "lucide-react-native/icons";

interface DynamicIconProps {
  name: string;
  color?: string;
  size?: number;
  strokeWidth?: number;
}

export const DynamicIcon = ({
  name,
  color = "black",
  size = 20,
  strokeWidth = 2,
}: DynamicIconProps) => {
  const pascalName = name
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join("") as keyof typeof icons;

  const LucideIcon = icons[pascalName];

  if (!LucideIcon) return null;

  return <LucideIcon color={color} size={size} strokeWidth={strokeWidth} />;
};
