import { Briefcase, Home, MapPinned } from "lucide-react-native";

export const LABEL_ICONS: Record<string, React.ReactNode> = {
  Home: <Home size={20} color="#D7A11B" />,
  Work: <Briefcase size={20} color="#4F46E5" />,
  Other: <MapPinned size={20} color="#059669" />,
};

export const LABEL_COLORS: Record<string, string> = {
  Home: "bg-orange-50 text-orange-700",
  Work: "bg-indigo-50 text-indigo-700",
  Other: "bg-emerald-50 text-emerald-700",
};
