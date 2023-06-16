import create from "zustand";

/**
 * Zustand Store
 *
 * You can add global state to the app using this useGlobalState, to get & set
 * values from anywhere in the app.
 *
 * Think about it as a global useState.
 */

type TGlobalState = {
  nativeCurrencyPrice: number;
  gateScore: number | null; // Add gateScore to the state
  setNativeCurrencyPrice: (newNativeCurrencyPriceState: number) => void;
  setGateScore: (newGateScoreState: number) => void; // Add setGateScore function
};

export const useGlobalState = create<TGlobalState>(set => ({
  nativeCurrencyPrice: 0,
  gateScore: null,
  setNativeCurrencyPrice: (newValue: number): void => set(() => ({ nativeCurrencyPrice: newValue })),
  setGateScore: (newGateScore: number | null): void => set(() => ({ gateScore: newGateScore })),
}));
