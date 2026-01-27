import { create } from "zustand";
import { persist } from "zustand/middleware";

export type Currency = "USD" | "NGN" | "EUR" | "GBP";

interface CurrencyState {
  currency: Currency;
  rate: number; // Rate relative to USD (base)
  setCurrency: (currency: Currency) => void;
}

const rates: Record<Currency, number> = {
  USD: 1,
  NGN: 1500, // Example rate
  EUR: 0.92,
  GBP: 0.79,
};

export const useCurrency = create<CurrencyState>()(
  persist(
    (set) => ({
      currency: "USD",
      rate: 1,
      setCurrency: (currency) => set({ currency, rate: rates[currency] }),
    }),
    {
      name: "lumiere-currency",
    }
  )
);

export function formatPrice(cents: number, currency: Currency, rate: number) {
  const amount = (cents / 100) * rate;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency,
  }).format(amount);
}
