import { formatEGP } from "@/lib/money";

export function MoneyCell({ amount }: { amount: number }) {
  const formatted = formatEGP(amount);
  // Split on space: "120 ج.م" → ["120", "ج.م"]
  const parts = formatted.split(" ");
  const number = parts[0];
  const unit = parts.slice(1).join(" ");

  return (
    <span className="tabular-nums">
      <span dir="ltr">{number}</span>
      {unit && <span> {unit}</span>}
    </span>
  );
}
