import { useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";

import { apiFetch, ApiError } from "@/lib/apiClient";

type SubmitState = "idle" | "submitting" | "success" | "error";

const feelingOptions = [
  "Calm",
  "Connecting",
  "Thought-provoking",
  "Emotional",
  "Challenging",
  "Not for us",
];

const closerOptions = ["Yes, Deeply", "Yes, Better", "Yes, A little", "Not Really", "Unsure"];

function ChipGroup({
  options,
  value,
  onChange,
}: {
  options: string[];
  value: string | null;
  onChange: (v: string) => void;
}) {
  return (
    <View className="flex-row flex-wrap gap-2">
      {options.map((opt) => (
        <Pressable
          key={opt}
          onPress={() => onChange(opt)}
          className={`rounded-full border px-3.5 py-2 ${
            value === opt ? "border-accent bg-accent/15" : "border-white/10 bg-white/5"
          }`}
        >
          <Text className={`text-xs font-medium ${value === opt ? "text-text" : "text-white/60"}`}>
            {opt}
          </Text>
        </Pressable>
      ))}
    </View>
  );
}

export default function FeedbackForm() {
  const [rating, setRating] = useState<number | null>(null);
  const [feeling, setFeeling] = useState<string | null>(null);
  const [closer, setCloser] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [state, setState] = useState<SubmitState>("idle");
  const [error, setError] = useState<string | null>(null);

  const canSubmit = rating !== null && feeling !== null && closer !== null && state !== "submitting";

  const handleSubmit = async () => {
    if (rating === null || feeling === null || closer === null || state === "submitting") return;

    setState("submitting");
    setError(null);

    try {
      await apiFetch("/api/feedback", {
        method: "POST",
        auth: false,
        body: { rating, feeling, closer, message: message.trim(), source: "end-page" },
      });
      setState("success");
      setMessage("");
      setRating(null);
      setFeeling(null);
      setCloser(null);
    } catch (err) {
      setState("error");
      setError(err instanceof ApiError ? err.message : "Unable to send feedback.");
    }
  };

  return (
    <View className="w-full max-w-xl rounded-2xl border border-white/10 bg-white/5 p-6">
      <View className="mb-4 self-start rounded-full border border-white/10 bg-black/30 px-4 py-2">
        <Text className="text-xs font-semibold tracking-widest text-white/75">
          ANONYMOUS FEEDBACK
        </Text>
      </View>

      <Text className="text-xl font-semibold tracking-tight text-text">
        Help us refine the sanctuary
      </Text>
      <Text className="mt-3 text-sm leading-relaxed text-white/70">
        Your feedback is anonymous. It helps us improve the experience for
        couples.
      </Text>

      <View className="mt-6 gap-5">
        <View>
          <Text className="mb-2 text-sm font-semibold text-white/80">
            How would you rate this experience?
          </Text>
          <View className="flex-row gap-2">
            {[1, 2, 3, 4, 5].map((v) => (
              <Pressable
                key={v}
                onPress={() => setRating(v)}
                className={`h-10 w-10 items-center justify-center rounded-full border ${
                  rating === v ? "border-accent bg-accent/15" : "border-white/10 bg-white/5"
                }`}
              >
                <Text className={`text-sm font-semibold ${rating === v ? "text-text" : "text-white/60"}`}>
                  {v}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        <View>
          <Text className="mb-2 text-sm font-semibold text-white/80">
            How did this experience feel?
          </Text>
          <ChipGroup options={feelingOptions} value={feeling} onChange={setFeeling} />
        </View>

        <View>
          <Text className="mb-2 text-sm font-semibold text-white/80">
            Did this bring you closer to your partner?
          </Text>
          <ChipGroup options={closerOptions} value={closer} onChange={setCloser} />
        </View>

        <View>
          <Text className="mb-2 text-sm font-semibold text-white/80">
            Anything you&apos;d like to share with us? (Optional)
          </Text>
          <TextInput
            value={message}
            onChangeText={(t) => setMessage(t.slice(0, 1000))}
            placeholder="Share anything that felt meaningful, confusing, or missing."
            placeholderTextColor="rgba(255,255,255,0.4)"
            multiline
            numberOfLines={4}
            textAlignVertical="top"
            className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white"
          />
          <Text className="mt-1 text-xs text-white/40">{message.length}/1000</Text>
        </View>

        {state === "success" ? (
          <View className="rounded-xl border border-emerald-400/30 bg-emerald-500/10 px-4 py-3">
            <Text className="text-sm text-emerald-200">
              Thank you. Your feedback has been sent.
            </Text>
          </View>
        ) : (
          <Pressable
            onPress={handleSubmit}
            disabled={!canSubmit}
            className={`w-full items-center rounded-full py-3.5 ${
              canSubmit ? "bg-accent" : "bg-white/10"
            }`}
          >
            <Text className={`text-sm font-semibold ${canSubmit ? "text-white" : "text-white/40"}`}>
              {state === "submitting" ? "Sending..." : "Send feedback"}
            </Text>
          </Pressable>
        )}

        {state === "error" && error && (
          <Text className="text-xs text-rose-200">{error}</Text>
        )}
      </View>
    </View>
  );
}
