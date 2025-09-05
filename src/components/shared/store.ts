import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

interface LedgerState {
  ledgerId: string | undefined;
  ledgerName: string | undefined;
  currencySymbol: string | undefined;
  description: string | undefined;
  notes: string | undefined;
  createdAt: string | undefined;
  updatedAt: string | undefined;
  // eslint-disable-next-line no-unused-vars
  setLedger: (id: string, name: string, symbol: string, description: string, notes: string, createdAt: string, updatedAt: string) => void;
  clearLedger: () => void;
}

const useLedgerStore = create<LedgerState>()(
  persist(
    (set) => ({
      ledgerId: undefined,
      ledgerName: undefined,
      currencySymbol: undefined,
      description: undefined,
      notes: undefined,
      createdAt: undefined,
      updatedAt: undefined,
      setLedger: (id, name, symbol, description, notes, createdAt, updatedAt) =>
        set({
          ledgerId: id,
          ledgerName: name,
          currencySymbol: symbol,
          description: description,
          notes: notes,
          createdAt: createdAt,
          updatedAt: updatedAt,
        }),
      clearLedger: () =>
        set({
          ledgerId: undefined,
          ledgerName: undefined,
          currencySymbol: undefined,
          description: undefined,
          notes: undefined,
          createdAt: undefined,
          updatedAt: undefined,
        }),
    }),
    {
      name: "ledger-storage",
      storage: createJSONStorage(() => sessionStorage),
      partialize: (state) => ({
        ledgerId: state.ledgerId,
        ledgerName: state.ledgerName,
        currencySymbol: state.currencySymbol,
        description: state.description,
        notes: state.notes,
        createdAt: state.createdAt,
        updatedAt: state.updatedAt,
      }),
    },
  ),
);

export default useLedgerStore;
