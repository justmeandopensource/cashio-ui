import {
  Box,
  Heading,
  Button,
  Flex,
  useColorModeValue,
  IconButton,
  useDisclosure,
} from "@chakra-ui/react";
import { Plus, ArrowRight, ArrowLeft, Edit, Info } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { FC, useState } from "react";
import useLedgerStore from "@/components/shared/store";
import { BookText } from 'lucide-react';
import LedgerDetailsModal from "@/components/modals/LedgerDetailsModal";
import api from "@/lib/api";

interface LedgerMainHeaderProps {
  onAddTransaction: () => void;
  onTransferFunds: () => void;
  onUpdateLedger: () => void;
  hasAccounts: boolean;
}

const LedgerMainHeader: FC<LedgerMainHeaderProps> = ({
  onAddTransaction,
  onTransferFunds,
  onUpdateLedger,
  hasAccounts,
}) => {
  const navigate = useNavigate();

  const {
    ledgerId,
    ledgerName,
    currencySymbol,
    description,
    notes,
    createdAt,
    updatedAt,
    setLedger
  } = useLedgerStore();

  // State for fetched ledger details
  const [fetchedLedgerData, setFetchedLedgerData] = useState<{
    name: string;
    currency_symbol: string;
    description?: string;
    notes?: string;
    created_at: string;
    updated_at: string;
  } | null>(null);

  // Modal state for ledger details
  const {
    isOpen: isDetailsModalOpen,
    onOpen: onDetailsModalOpen,
    onClose: onDetailsModalClose,
  } = useDisclosure();

  // Fetch full ledger details from API
  const fetchLedgerDetails = async () => {
    if (!ledgerId) return;

    try {
      const response = await api.get(`/ledger/${ledgerId}`);
      const ledgerData = response.data;

      // Update store with complete data
      setLedger(
        ledgerId,
        ledgerData.name,
        ledgerData.currency_symbol,
        ledgerData.description,
        ledgerData.notes,
        ledgerData.created_at,
        ledgerData.updated_at
      );

      setFetchedLedgerData(ledgerData);
    } catch (error) {
      console.error("Failed to fetch ledger details:", error);
    }
  };

  // Handle opening the details modal
  const handleOpenDetailsModal = async () => {
    // Fetch fresh data if dates are not available in store
    if (!createdAt || !updatedAt) {
      await fetchLedgerDetails();
    }
    onDetailsModalOpen();
  };

  // Use Chakra's color mode for consistent styling
  const bgColor = useColorModeValue("white", "gray.700");
  const buttonColorScheme = useColorModeValue("teal", "blue");

  return (
    <Box
      bg={bgColor}
      p={{ base: 4, md: 5, lg: 6 }}
      borderRadius="lg"
      boxShadow="lg"
      mb={8}
    >
      <Flex
        justifyContent="space-between"
        alignItems="flex-start"
        flexDirection={{ base: "column", md: "column", lg: "row" }}
        gap={{ base: 4, md: 4, lg: 0 }}
      >
        {/* Left Section: Back Icon and Ledger Name */}
        <Flex alignItems="center" gap={3}>
          {/* Back to Home Icon */}
          <IconButton
            aria-label="Back to Home"
            icon={<ArrowLeft />}
            variant="ghost"
            color="teal.500"
            size="lg"
            onClick={() => navigate("/")}
            _hover={{ bg: "teal.50" }}
          />

          {/* Ledger Name and Edit Icon */}
          <Flex
            alignItems="center"
            gap={2}
            sx={{
              "& .edit-icon": {
                visibility: "hidden",
              },
              "&:hover .edit-icon": {
                visibility: "visible",
              },
            }}
          >
            <BookText size={28} color="teal" />
            <Heading as="h2" size="lg" color="teal.500">
              {ledgerName}
            </Heading>
            <IconButton
              aria-label="View Ledger Details"
              icon={<Info />}
              variant="ghost"
              color="teal.500"
              size="sm"
              onClick={handleOpenDetailsModal}
              className="edit-icon"
            />
            <IconButton
              aria-label="Edit Ledger"
              icon={<Edit />}
              variant="ghost"
              color="teal.500"
              size="sm"
              onClick={onUpdateLedger}
              className="edit-icon"
            />
          </Flex>
        </Flex>

        {/* Right Section: Add Transaction and Transfer Funds Buttons */}
        {hasAccounts && (
          <Flex
            gap={3}
            flexDirection={{ base: "column", md: "column", lg: "row" }}
            w={{ base: "100%", md: "100%", lg: "auto" }}
          >
            {/* Button to Add a New Transaction */}
            <Button
              leftIcon={<Plus />}
              colorScheme={buttonColorScheme}
              variant="solid"
              onClick={onAddTransaction}
              w={{ base: "100%", md: "100%", lg: "auto" }}
              data-testid="ledgermainheader-add-transaction-btn"
            >
              Add Transaction
            </Button>

            {/* Button to Transfer Funds */}
            <Button
              rightIcon={<ArrowRight />}
              colorScheme={buttonColorScheme}
              variant="outline"
              onClick={onTransferFunds}
              w={{ base: "100%", md: "100%", lg: "auto" }}
              data-testid="ledgermainheader-transfer-funds-btn"
            >
              Transfer Funds
            </Button>
          </Flex>
        )}
      </Flex>

      {/* Ledger Details Modal */}
      <LedgerDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={onDetailsModalClose}
        ledgerName={fetchedLedgerData?.name || ledgerName || ""}
        currencySymbol={fetchedLedgerData?.currency_symbol || currencySymbol || ""}
        description={fetchedLedgerData?.description || description}
        notes={fetchedLedgerData?.notes || notes}
        createdAt={fetchedLedgerData?.created_at || createdAt}
        updatedAt={fetchedLedgerData?.updated_at || updatedAt}
      />
    </Box>
  );
};

export default LedgerMainHeader;
