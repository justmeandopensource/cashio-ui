import HomeLedgerCards from "@features/home/components/HomeLedgerCards";
import CreateLedgerModal from "@components/modals/CreateLedgerModal";
import PageContainer from "@components/shared/PageContainer";
import HomeMainHeader from "./HomeMainHeader";
import { Box } from "@chakra-ui/react";

interface HomeMainProps {
  ledgers?: Array<{ ledger_id: string; name: string; currency_symbol: string; description: string; notes: string; created_at: string; updated_at: string }>;
  onOpen: () => void;
  isOpen: boolean;
  onClose: () => void;
  // eslint-disable-next-line no-unused-vars
  handleCreateLedger: (name: string, currency: string, description: string, notes: string) => void;
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
      <HomeMainHeader onCreateLedger={onOpen} />
      <Box flex={1} overflowY="auto">
        <PageContainer>
          <HomeLedgerCards ledgers={ledgers} onOpen={onOpen} />
        </PageContainer>
      </Box>
      <CreateLedgerModal
        isOpen={isOpen}
        onClose={onClose}
        handleCreateLedger={handleCreateLedger}
      />
    </>
  );
};

export default HomeMain;
