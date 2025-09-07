import { useNavigate } from "react-router-dom";
import { Button, useDisclosure, Box } from "@chakra-ui/react";
import Layout from "@components/Layout";
import LedgerMain from "@features/ledger/components/LedgerMain";
import useLedgerStore from "@/components/shared/store";
import UpdateLedgerModal from "@components/modals/UpdateLedgerModal";
import PageContainer from "@components/shared/PageContainer";
import PageHeader from "@components/shared/PageHeader";
import { BookText, Settings } from "lucide-react";

const Ledger = () => {
  const navigate = useNavigate();
  const { ledgerId, ledgerName, currencySymbol, description, notes, setLedger } = useLedgerStore();
  const {
    isOpen: isUpdateLedgerModalOpen,
    onOpen: onUpdateLedgerModalOpen,
    onClose: onUpdateLedgerModalClose,
  } = useDisclosure();

  const handleUpdateCompleted = (
    updatedName: string,
    updatedCurrencySymbol: string,
    updatedDescription: string,
    updatedNotes: string
  ) => {
    if (ledgerId) {
      setLedger(ledgerId, updatedName, updatedCurrencySymbol, updatedDescription, updatedNotes, "", "");
    }
  };

  // handle logout
  const handleLogout = (): void => {
    localStorage.removeItem("access_token");
    navigate("/login");
  };

  return (
    <Layout handleLogout={handleLogout}>
      <PageHeader
        title={ledgerName || "Ledger"}
        subtitle={description || "Manage your ledger accounts and transactions"}
        icon={BookText}
        actions={
          <Button
            leftIcon={<Settings size={20} />}
            color="white"
            variant="ghost"
            onClick={onUpdateLedgerModalOpen}
            _hover={{ bg: "whiteAlpha.200" }}
          >
            Update
          </Button>
        }
      />
      <Box flex={1} overflowY="auto">
        <PageContainer>
          <LedgerMain />
        </PageContainer>
      </Box>

      {ledgerName && currencySymbol && (
        <UpdateLedgerModal
          isOpen={isUpdateLedgerModalOpen}
          onClose={onUpdateLedgerModalClose}
          currentLedgerName={ledgerName}
          currentCurrencySymbol={currencySymbol}
          currentDescription={description}
          currentNotes={notes}
          onUpdateCompleted={handleUpdateCompleted}
        />
      )}
    </Layout>
  );
};

export default Ledger;
