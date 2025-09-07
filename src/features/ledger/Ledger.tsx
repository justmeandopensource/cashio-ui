import { useNavigate } from "react-router-dom";
import { Button, useDisclosure, Box, HStack, IconButton } from "@chakra-ui/react";
import Layout from "@components/Layout";
import LedgerMain from "@features/ledger/components/LedgerMain";
import useLedgerStore from "@/components/shared/store";
import UpdateLedgerModal from "@components/modals/UpdateLedgerModal";
import PageContainer from "@components/shared/PageContainer";
import PageHeader from "@components/shared/PageHeader";
import { BookText, Settings, Info, Plus, ArrowRightLeft } from "lucide-react";
import LedgerDetailsModal from "@components/modals/LedgerDetailsModal";
import { useState } from "react";
import CreateTransactionModal from "@components/modals/CreateTransactionModal";
import TransferFundsModal from "@components/modals/TransferFundsModal";
import { useQueryClient } from "@tanstack/react-query";

const Ledger = () => {
  const navigate = useNavigate();
  const { ledgerId, ledgerName, currencySymbol, description, notes, setLedger } = useLedgerStore();
  const queryClient = useQueryClient();

  const { isOpen: isUpdateLedgerModalOpen, onOpen: onUpdateLedgerModalOpen, onClose: onUpdateLedgerModalClose } = useDisclosure();
  const { isOpen: isLedgerDetailsModalOpen, onOpen: onLedgerDetailsModalOpen, onClose: onLedgerDetailsModalClose } = useDisclosure();

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [selectedAccountId, setSelectedAccountId] = useState<string | undefined>(undefined);
  const [transactionToCopy, setTransactionToCopy] = useState<any | undefined>(undefined);

  const handleAddTransaction = (accountId: string | undefined = undefined) => {
    setSelectedAccountId(accountId);
    setIsCreateModalOpen(true);
  };

  const handleTransferFunds = (accountId: string | undefined = undefined) => {
    setSelectedAccountId(accountId);
    setIsTransferModalOpen(true);
  };

  const refreshAccountsData = async (): Promise<void> => {
    await queryClient.invalidateQueries({ queryKey: ["accounts", ledgerId] });
  };

  const refreshTransactionsData = async (): Promise<void> => {
    await queryClient.invalidateQueries({
      queryKey: ["transactions"],
    });
  };

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
          <HStack>
            <IconButton
              aria-label="Ledger details"
              icon={<Info size={20} />}
              variant="ghost"
              color="white"
              onClick={onLedgerDetailsModalOpen}
              _hover={{ bg: "whiteAlpha.200" }}
            />
            <IconButton
              aria-label="Update ledger"
              icon={<Settings size={20} />}
              variant="ghost"
              color="white"
              onClick={onUpdateLedgerModalOpen}
              _hover={{ bg: "whiteAlpha.200" }}
            />
            <Button
              leftIcon={<Plus size={20} />}
              color="white"
              variant="ghost"
              onClick={() => handleAddTransaction(undefined)}
              _hover={{ bg: "whiteAlpha.200" }}
            >
              Add Transaction
            </Button>
            <Button
              leftIcon={<ArrowRightLeft size={20} />}
              color="white"
              variant="ghost"
              onClick={() => handleTransferFunds(undefined)}
              _hover={{ bg: "whiteAlpha.200" }}
            >
              Transfer Funds
            </Button>
          </HStack>
        }
      />
      <Box flex={1} overflowY="auto">
        <PageContainer>
          <LedgerMain onAddTransaction={handleAddTransaction} onTransferFunds={handleTransferFunds} />
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

      <LedgerDetailsModal
        isOpen={isLedgerDetailsModalOpen}
        onClose={onLedgerDetailsModalClose}
        ledgerName={ledgerName || ""}
        currencySymbol={currencySymbol || ""}
        description={description || ""}
        notes={notes || ""}
      />

      <CreateTransactionModal
        isOpen={isCreateModalOpen}
        onClose={() => {
          setIsCreateModalOpen(false);
          setTransactionToCopy(undefined);
        }}
        accountId={selectedAccountId}
        onTransactionAdded={() => {
          refreshAccountsData();
          refreshTransactionsData();
        }}
        initialData={transactionToCopy}
      />

      <TransferFundsModal
        isOpen={isTransferModalOpen}
        onClose={() => {
          setIsTransferModalOpen(false);
          setTransactionToCopy(undefined);
        }}
        accountId={selectedAccountId}
        onTransferCompleted={() => {
          refreshAccountsData();
          refreshTransactionsData();
        }}
        initialData={transactionToCopy}
      />
    </Layout>
  );
};

export default Ledger;
