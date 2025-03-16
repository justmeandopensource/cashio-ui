import HomeLedgerCards from "@features/home/components/HomeLedgerCards";
import CreateLedgerModal from "@components/modals/CreateLedgerModal";

interface HomeMainProps {
  ledgers?: Array<{ ledger_id: string; name: string; currency_symbol: string }>;
  onOpen: () => void;
  isOpen: boolean;
  onClose: () => void;
  handleCreateLedger: (name: string, currency: string) => void;
}

const HomeMain = ({
  ledgers = [],
  onOpen,
  isOpen,
  onClose,
  handleCreateLedger,
}: HomeMainProps) => {
  return (
    <>
      <HomeLedgerCards ledgers={ledgers} onOpen={onOpen} />
      <CreateLedgerModal
        isOpen={isOpen}
        onClose={onClose}
        handleCreateLedger={handleCreateLedger}
      />
    </>
  );
};

export default HomeMain;
