import { Link, usePathname } from "expo-router";
import { Pressable, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { cn } from "@/lib/utils";

interface NavItem {
  href: "/bond" | "/compatibility" | "/checkin" | "/dashboard";
  label: string;
  icon: string;
}

const items: NavItem[] = [
  { href: "/bond", label: "Bond", icon: "🕯️" },
  { href: "/compatibility", label: "Compatibility", icon: "🔮" },
  { href: "/checkin", label: "Check-In", icon: "💬" },
  { href: "/dashboard", label: "You", icon: "✦" },
];

export function BottomNav() {
  const pathname = usePathname();
  const insets = useSafeAreaInsets();

  return (
    <View
      className="absolute inset-x-0 bottom-0 border-t border-border bg-bg/95"
      style={{ paddingBottom: insets.bottom }}
    >
      <View className="flex-row items-center justify-around px-2 py-2">
        {items.map((item) => {
          const active =
            pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link key={item.href} href={item.href} asChild>
              <Pressable className="items-center gap-1 rounded-xl px-3 py-2">
                <Text className="text-lg leading-none">{item.icon}</Text>
                <Text
                  className={cn(
                    "text-[10px] font-medium",
                    active ? "text-text" : "text-white/40",
                  )}
                >
                  {item.label}
                </Text>
                {active && <View className="h-[2px] w-4 rounded-full bg-accent" />}
              </Pressable>
            </Link>
          );
        })}
      </View>
    </View>
  );
}
