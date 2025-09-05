import { useNavigate } from "react-router-dom";
import { useDisclosure } from "@chakra-ui/react";
import Layout from "@components/Layout";
import LedgerMain from "@features/ledger/components/LedgerMain";
import useLedgerStore from "@/components/shared/store";
import UpdateLedgerModal from "@components/modals/UpdateLedgerModal";

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
      <LedgerMain onUpdateLedger={onUpdateLedgerModalOpen} />

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
