import { Modal, Pressable, Text, View } from "react-native";

import { decks } from "@/data";

export default function CategoryRedirect({
  onSelect,
}: {
  onSelect: (category: string) => void;
}) {
  const categories = Object.keys(decks);

  return (
    <Modal transparent animationType="fade" visible>
      <View className="flex-1 items-center justify-center bg-black/70 px-6">
        <View className="w-full max-w-lg rounded-2xl border border-white/10 bg-[#161616] p-6">
          <Text className="text-center text-2xl font-semibold tracking-tight text-text">
            Choose a gentler direction
          </Text>
          <Text className="mt-3 text-center text-sm leading-relaxed text-zinc-200">
            Pick a theme that feels safer right now.
          </Text>

          <View className="mt-6 flex-row flex-wrap gap-3">
            {categories.map((cat) => (
              <Pressable
                key={cat}
                onPress={() => onSelect(cat)}
                className="grow basis-[45%] items-center rounded-xl border border-white/12 bg-white/5 px-3 py-3 active:bg-white/10"
              >
                <Text className="text-sm font-semibold capitalize text-text">{cat}</Text>
              </Pressable>
            ))}
          </View>
        </View>
      </View>
    </Modal>
  );
}
