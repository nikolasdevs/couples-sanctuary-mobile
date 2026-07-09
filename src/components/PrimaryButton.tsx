import { ActivityIndicator, Pressable, Text } from "react-native";

interface PrimaryButtonProps {
  label: string;
  loadingLabel?: string;
  loading?: boolean;
  disabled?: boolean;
  onPress: () => void;
}

export function PrimaryButton({
  label,
  loadingLabel,
  loading,
  disabled,
  onPress,
}: PrimaryButtonProps) {
  const isDisabled = disabled || loading;
  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      className="w-full flex-row items-center justify-center rounded-full bg-accent py-3.5 active:opacity-80 disabled:opacity-50"
    >
      {loading && (
        <ActivityIndicator size="small" color="#f5f5f5" className="mr-2" />
      )}
      <Text className="text-sm font-semibold text-text">
        {loading ? (loadingLabel ?? label) : label}
      </Text>
    </Pressable>
  );
}
