import {
  Box,
  Heading,
  Button,
  Flex,
  useColorModeValue,
  IconButton,
} from "@chakra-ui/react";
import {
  AddIcon,
  ArrowForwardIcon,
  ArrowBackIcon,
  EditIcon,
} from "@chakra-ui/icons";
import { useNavigate } from "react-router-dom";
import { FC } from "react";

interface Ledger {
  name: string;
  // Add other ledger properties as needed
}

interface LedgerMainHeaderProps {
  ledger: Ledger;
  onAddTransaction: () => void;
  onTransferFunds: () => void;
  hasAccounts: boolean;
}

const LedgerMainHeader: FC<LedgerMainHeaderProps> = ({
  ledger,
  onAddTransaction,
  onTransferFunds,
  hasAccounts,
}) => {
  const navigate = useNavigate();

  // Use Chakra's color mode for consistent styling
  const bgColor = useColorModeValue("white", "gray.700");
  const buttonColorScheme = useColorModeValue("teal", "blue");

  return (
    <Box
      bg={bgColor}
      p={{ base: 4, md: 5, lg: 6 }}
      borderRadius="lg"
      boxShadow="md"
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
            icon={<ArrowBackIcon boxSize={6} />}
            variant="ghost"
            color="teal.500"
            size="lg"
            onClick={() => navigate("/")}
            _hover={{ bg: "teal.50" }}
          />

          {/* Ledger Name and Edit Icon */}
          <Flex alignItems="center" gap={2}>
            <Heading as="h2" size="lg" color="teal.500">
              {ledger.name}
            </Heading>
            <IconButton
              aria-label="Edit Account"
              icon={<EditIcon boxSize={4} />}
              variant="ghost"
              color="teal.500"
              size="sm"
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
              leftIcon={<AddIcon />}
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
              rightIcon={<ArrowForwardIcon />}
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
    </Box>
  );
};

export default LedgerMainHeader;
