// Mobile utility - cn() not needed with NativeWind
export function cn(...inputs: string[]): string {
  return inputs.filter(Boolean).join(" ");
}
