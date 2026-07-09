import { Text, TextInput, View, type TextInputProps } from "react-native";

interface AuthTextFieldProps extends TextInputProps {
  label: string;
}

export function AuthTextField({ label, ...inputProps }: AuthTextFieldProps) {
  return (
    <View>
      <Text className="text-xs font-medium text-muted">{label}</Text>
      <TextInput
        placeholderTextColor="#71717a"
        className="mt-1.5 w-full rounded-lg border border-border bg-white/5 px-4 py-3 text-sm text-text"
        {...inputProps}
      />
    </View>
  );
}
