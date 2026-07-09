import { Link } from "expo-router";
import { Pressable, Text, View } from "react-native";

import { cn } from "@/lib/utils";

interface PillarCardProps {
  href: "/bond" | "/compatibility" | "/checkin";
  icon: string;
  title: string;
  subtitle: string;
  accent: string; // hex color for the top accent bar
  status?: string;
  locked?: boolean;
}

export function PillarCard({
  href,
  icon,
  title,
  subtitle,
  accent,
  status,
  locked,
}: PillarCardProps) {
  const content = (
    <View
      className={cn(
        "relative flex-1 items-center gap-2 rounded-2xl border border-border bg-white/5 p-4",
        locked && "opacity-50",
      )}
    >
      <View
        className="absolute inset-x-0 top-0 h-[2px] rounded-t-2xl opacity-60"
        style={{ backgroundColor: accent }}
      />
      <Text className="text-3xl">{icon}</Text>
      <Text className="text-sm font-semibold text-text">{title}</Text>
      <Text className="text-center text-xs leading-relaxed text-white/50">
        {subtitle}
      </Text>

      {status && (
        <View className="mt-1 rounded-lg border border-border bg-black/30 px-2 py-1">
          <Text className="text-center text-[10px] font-medium text-white/60">
            {status}
          </Text>
        </View>
      )}

      {locked && <Text className="mt-1 text-[11px] text-white/40">Coming soon</Text>}
    </View>
  );

  if (locked) return content;

  return (
    <Link href={href} asChild>
      <Pressable className="flex-1 active:opacity-80">{content}</Pressable>
    </Link>
  );
}
