import * as icons from "lucide-react-native/icons";

interface DynamicIconProps {
  name: string;
  color?: string;
  size?: number;
  strokeWidth?: number;
}

const DynamicIcon = ({
  name,
  color = "black",
  size = 20,
  strokeWidth = 2,
}: DynamicIconProps) => {
  // Lucide names are PascalCase: "shopping-bag" → "ShoppingBag"
  const pascalName = name
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join("") as keyof typeof icons;

  const LucideIcon = icons[pascalName];

  if (!LucideIcon) return null; // graceful fallback

  return <LucideIcon color={color} size={size} strokeWidth={strokeWidth} />;
};
