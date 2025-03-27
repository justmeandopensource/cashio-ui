import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

interface LedgerState {
  ledgerId: string | undefined;
  ledgerName: string | undefined;
  currencySymbol: string | undefined;
  // eslint-disable-next-line no-unused-vars
  setLedger: (id: string, name: string, symbol: string) => void;
  clearLedger: () => void;
}

const useLedgerStore = create<LedgerState>()(
  persist(
    (set) => ({
      ledgerId: undefined,
      ledgerName: undefined,
      currencySymbol: undefined,
      setLedger: (id, name, symbol) =>
        set({
          ledgerId: id,
          ledgerName: name,
          currencySymbol: symbol,
        }),
      clearLedger: () =>
        set({
          ledgerId: undefined,
          ledgerName: undefined,
          currencySymbol: undefined,
        }),
    }),
    {
      name: "ledger-storage",
      storage: createJSONStorage(() => sessionStorage),
      partialize: (state) => ({
        ledgerId: state.ledgerId,
        ledgerName: state.ledgerName,
        currencySymbol: state.currencySymbol,
      }),
    },
  ),
);

export default useLedgerStore;
