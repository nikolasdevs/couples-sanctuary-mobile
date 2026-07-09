import { View } from "react-native";

export default function Progress({ current, total }: { current: number; total: number }) {
  return (
    <View className="h-1 w-full rounded-full bg-neutral-800">
      <View
        className="h-1 rounded-full bg-amber-400"
        style={{ width: `${(current / total) * 100}%` }}
      />
    </View>
  );
}
