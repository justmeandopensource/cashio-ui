import React from "react";
import {
  Box,
  Heading,
  Text,
  Button,
  Flex,
  useColorModeValue,
  IconButton,
  VStack,
  Icon,
} from "@chakra-ui/react";
import { Plus, ArrowRight, ArrowLeft, Edit, CreditCard } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { formatNumberAsCurrency } from "@components/shared/utils";
import useLedgerStore from "@/components/shared/store";

interface Account {
  name: string;
  type: "asset" | "liability" | string;
  net_balance: number;
  ledger_id: string | number;
}

interface AccountMainHeaderProps {
  account: Account;
  onAddTransaction: () => void;
  onTransferFunds: () => void;
  onUpdateAccount: () => void;
}

const AccountMainHeader: React.FC<AccountMainHeaderProps> = ({
  account,
  onAddTransaction,
  onTransferFunds,
  onUpdateAccount,
}) => {
  const navigate = useNavigate();
  const { currencySymbol } = useLedgerStore();

  // Determine the color for the balance based on its value
  const balanceColor =
    account.type === "asset"
      ? account.net_balance >= 0
        ? "gray.600"
        : "red.400"
      : account.net_balance > 0
        ? "red.400"
        : "gray.600";

  // Use Chakra's color mode for consistent styling
  const bgColor = useColorModeValue("white", "gray.700");
  const buttonColorScheme = useColorModeValue("teal", "blue");

  const handleBackToLedger = () => {
    navigate("/ledger");
  };

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
        alignItems={{ base: "flex-start", lg: "center" }}
        flexDirection={{ base: "column", md: "column", lg: "row" }}
        gap={{ base: 4, md: 4, lg: 0 }}
      >
        {/* Left Section: Back Icon and Account Info */}
        <Flex alignItems="flex-start" gap={3}>
          {/* Back to Ledger Icon with Light Teal Hover Effect */}
          <IconButton
            aria-label="Back to Ledger"
            icon={<Icon as={ArrowLeft} boxSize={6} />}
            variant="ghost"
            color="teal.500"
            size="lg"
            onClick={handleBackToLedger}
            _hover={{ bg: "teal.50" }}
            alignSelf="flex-start"
            mt="-6px"
          />

          {/* Account name and balance stacked vertically */}
          <VStack spacing={1} alignItems="flex-start">
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
              <Flex align="center" gap={2}>
                <Icon as={CreditCard} w={8} h={8} color="teal.500" />
                <Heading as="h2" size="lg" color="teal.500">
                  {account.name}
                </Heading>
              </Flex>
              <IconButton
                aria-label="Edit Account"
                icon={<Edit />}
                variant="ghost"
                color="teal.500"
                size="sm"
                onClick={onUpdateAccount}
                className="edit-icon"
              />
            </Flex>

            {/* Balance moved below account name */}
            <Text fontSize="2xl" fontWeight="bold" color={balanceColor} ml={10}>
              {formatNumberAsCurrency(
                account.net_balance,
                currencySymbol as string,
              )}
            </Text>
          </VStack>
        </Flex>

        {/* Right Section: Add Transaction and Transfer Funds Buttons */}
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
          >
            Transfer Funds
          </Button>
        </Flex>
      </Flex>
    </Box>
  );
};

export default AccountMainHeader;
