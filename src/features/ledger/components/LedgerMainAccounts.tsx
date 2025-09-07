import React, { useState } from "react";
import {
  Flex,
  Box,
  Table,
  Tbody,
  Tr,
  Td,
  Text,
  Button,
  Icon,
  useDisclosure,
  SimpleGrid,
  Link as ChakraLink,
  IconButton,
  Heading,
  Card,
  CardHeader,
  Stack,
} from "@chakra-ui/react";
import { Link as RouterLink } from "react-router-dom";
import { Plus, Repeat, Eye, EyeOff, Building, ShieldAlert } from "lucide-react";
import CreateAccountModal from "@components/modals/CreateAccountModal";
import { formatNumberAsCurrency } from "@components/shared/utils";
import useLedgerStore from "@/components/shared/store";

interface Account {
  account_id: string;
  name: string;
  type: "asset" | "liability";
  net_balance?: number;
  is_group: boolean;
  parent_account_id?: string;
}

interface LedgerMainAccountsProps {
  accounts: Account[];
  // eslint-disable-next-line no-unused-vars
  onAddTransaction: (accountId: string) => void;
  // eslint-disable-next-line no-unused-vars
  onTransferFunds: (accountId: string) => void;
}

const LedgerMainAccounts: React.FC<LedgerMainAccountsProps> = ({
  accounts,
  onAddTransaction,
  onTransferFunds,
}) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { currencySymbol } = useLedgerStore();
  const [accountType, setAccountType] = useState<"asset" | "liability" | null>(
    null,
  );
  const [parentAccountId, setParentAccountId] = useState<string | null>(null);
  const [showZeroBalanceAssets, setShowZeroBalanceAssets] = useState(false);
  const [showZeroBalanceLiabilities, setShowZeroBalanceLiabilities] =
    useState(false);
  const [expandedGroups, setExpandedGroups] = useState<{
    [key: string]: boolean;
  }>({});

  // Separate accounts into Assets and Liabilities
  const assetAccounts = accounts.filter((account) => account.type === "asset");
  const liabilityAccounts = accounts.filter(
    (account) => account.type === "liability",
  );

  // Toggle expansion of group accounts
  const toggleGroupExpansion = (accountId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    setExpandedGroups((prev) => ({
      ...prev,
      [accountId]: !prev[accountId],
    }));
  };

  // Helper function to determine text color based on account type, balance, and whether it's a group account
  const getBalanceColor = (
    balance: number,
    accountType: "asset" | "liability",
    isGroup: boolean,
  ) => {
    if (accountType === "asset") {
      if (isGroup && balance >= 0) {
        return "teal.600";
      } else if (balance < 0) {
        return "red.400";
      }
    } else if (accountType === "liability") {
      if (isGroup && balance < 0) {
        return "teal.600";
      } else if (balance > 0) {
        return "red.400";
      }
    }
    return "gray.700";
  };

  // Function to compute the balance for group accounts
  const computeGroupBalance = (accountId: string): number => {
    let totalBalance = 0;

    const childAccounts = accounts.filter(
      (account) => account.parent_account_id === accountId,
    );

    childAccounts.forEach((childAccount) => {
      if (childAccount.is_group) {
        totalBalance += computeGroupBalance(childAccount.account_id);
      } else {
        totalBalance += childAccount.net_balance || 0;
      }
    });

    return totalBalance;
  };

  // Open modal for creating a new account
  const handleCreateAccountClick = (
    type: "asset" | "liability",
    parentId: string | null = null,
  ) => {
    setAccountType(type);
    setParentAccountId(parentId);
    onOpen();
  };

  // Function to render accounts in table format (for larger screens)
  const renderAccountsTable = (
    accounts: Account[],
    parentId: string | null = null,
    level: number = 0,
    showZeroBalance: boolean,
  ) => {
    return accounts
      .filter((account) => account.parent_account_id === parentId)
      .filter(
        (account) =>
          showZeroBalance ||
          (account.is_group
            ? computeGroupBalance(account.account_id) !== 0
            : account.net_balance !== 0),
      )
      .map((account) => {
        const balance = account.is_group
          ? computeGroupBalance(account.account_id)
          : account.net_balance || 0;
        const balanceColor = getBalanceColor(
          balance,
          account.type,
          account.is_group,
        );
        return (
          <React.Fragment key={account.account_id}>
            <Tr
              bg={account.is_group ? "teal.50" : "transparent"}
              _hover={{ bg: "gray.50" }}
              position="relative"
              sx={
                !account.is_group
                  ? {
                      "&:hover .action-icons": {
                        opacity: 1,
                      },
                    }
                  : {}
              }
            >
              <Td pl={`${level * 24 + 8}px`}>
                {!account.is_group ? (
                  <ChakraLink
                    as={RouterLink}
                    to={`/account/${account.account_id}`}
                    _hover={{ textDecoration: "none" }}
                  >
                    <Text
                      fontWeight="normal"
                      color="secondaryTextColor"
                      fontSize="sm"
                      _hover={{ color: "teal.500" }}
                    >
                      {account.name}
                    </Text>
                  </ChakraLink>
                ) : (
                  <Text fontWeight="bold" color="teal.600" fontSize="md">
                    {account.name}
                  </Text>
                )}
              </Td>
              <Td isNumeric>
                <Text
                  fontWeight={account.is_group ? "bold" : "normal"}
                  color={balanceColor}
                  fontSize={account.is_group ? "md" : "sm"}
                >
                  {formatNumberAsCurrency(balance, currencySymbol as string)}
                </Text>
              </Td>
              <Td>
                <Box display="flex" gap={2}>
                  {account.is_group && (
                    <ChakraLink
                      onClick={() =>
                        handleCreateAccountClick(
                          account.type,
                          account.account_id,
                        )
                      }
                      _hover={{ textDecoration: "none" }}
                      data-testid={`ledgermainaccounts-group-account-plus-icon-${account.account_id}`}
                    >
                      <Icon
                        as={Plus}
                        size={16}
                        color="teal.500"
                        _hover={{ color: "teal.600" }}
                      />
                    </ChakraLink>
                  )}
                  {!account.is_group && (
                    <Flex
                      gap={2}
                      opacity={0}
                      transition="opacity 0.2s"
                      className="action-icons"
                    >
                      <ChakraLink
                        onClick={() => onAddTransaction(account.account_id)}
                        _hover={{ textDecoration: "none" }}
                      >
                        <Icon
                          as={Plus}
                          size={16}
                          color="teal.500"
                          _hover={{ color: "teal.600" }}
                        />
                      </ChakraLink>
                      <ChakraLink
                        onClick={() => onTransferFunds(account.account_id)}
                        _hover={{ textDecoration: "none" }}
                      >
                        <Icon
                          as={Repeat}
                          size={16}
                          color="teal.500"
                          _hover={{ color: "teal.600" }}
                        />
                      </ChakraLink>
                    </Flex>
                  )}
                </Box>
              </Td>
            </Tr>
            {renderAccountsTable(
              accounts,
              account.account_id,
              level + 1,
              showZeroBalance,
            )}
          </React.Fragment>
        );
      });
  };

  // Function to render accounts in card format (for mobile/tablet)
  const renderAccountsAccordion = (
    accounts: Account[],
    parentId: string | null = null,
    level: number = 0,
    showZeroBalance: boolean,
  ) => {
    const filteredAccounts = accounts
      .filter((account) => account.parent_account_id === parentId)
      .filter(
        (account) =>
          showZeroBalance ||
          (account.is_group
            ? computeGroupBalance(account.account_id) !== 0
            : account.net_balance !== 0),
      );

    if (filteredAccounts.length === 0) return null;

    return (
      <Stack
        spacing={3}
        pl={level > 0 ? 4 : 0}
        mt={level > 0 ? 3 : 0}
        mb={level > 0 ? 3 : 0}
      >
        {filteredAccounts.map((account) => {
          const balance = account.is_group
            ? computeGroupBalance(account.account_id)
            : account.net_balance || 0;
          const balanceColor = getBalanceColor(
            balance,
            account.type,
            account.is_group,
          );
          const hasChildren = accounts.some(
            (a) => a.parent_account_id === account.account_id,
          );
          const isExpanded = expandedGroups[account.account_id];

          return (
            <Card
              key={account.account_id}
              variant={account.is_group ? "filled" : "outline"}
              bg={account.is_group ? "teal.50" : "white"}
              borderColor={account.is_group ? "teal.200" : "gray.200"}
              size="sm"
              boxShadow="sm"
              _hover={{ boxShadow: "md" }}
            >
              <CardHeader
                py={2}
                px={3}
                onClick={
                  account.is_group && hasChildren
                    ? (e) => toggleGroupExpansion(account.account_id, e)
                    : undefined
                }
                cursor={account.is_group && hasChildren ? "pointer" : "default"}
              >
                <Flex justifyContent="space-between" alignItems="flex-start">
                  <Flex direction="column" flex="1">
                    <Flex alignItems="center" gap={2} mb={1}>
                      {!account.is_group ? (
                        <ChakraLink
                          as={RouterLink}
                          to={`/account/${account.account_id}`}
                          _hover={{ textDecoration: "none" }}
                        >
                          <Text
                            fontWeight={account.is_group ? "medium" : "normal"}
                            color={account.is_group ? "teal.700" : "secondaryTextColor"}
                          >
                            {account.name}
                          </Text>
                        </ChakraLink>
                      ) : (
                        <Text fontWeight="medium" color="teal.700">
                          {account.name}
                        </Text>
                      )}
                    </Flex>
                    <Text
                      fontWeight={account.is_group ? "medium" : "normal"}
                      color={balanceColor}
                    >
                      {formatNumberAsCurrency(
                        balance,
                        currencySymbol as string,
                      )}
                    </Text>
                  </Flex>
                  {!account.is_group ? (
                    <Flex gap={2} align="center" justify="flex-end">
                      <ChakraLink
                        onClick={(e) => {
                          e.stopPropagation();
                          onAddTransaction(account.account_id);
                        }}
                        _hover={{ textDecoration: "none" }}
                      >
                        <Icon
                          as={Plus}
                          size={16}
                          color="teal.500"
                          _hover={{ color: "teal.600" }}
                        />
                      </ChakraLink>
                      <ChakraLink
                        onClick={(e) => {
                          e.stopPropagation();
                          onTransferFunds(account.account_id);
                        }}
                        _hover={{ textDecoration: "none" }}
                      >
                        <Icon
                          as={Repeat}
                          size={16}
                          color="teal.500"
                          _hover={{ color: "teal.600" }}
                        />
                      </ChakraLink>
                    </Flex>
                  ) : (
                    <ChakraLink
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCreateAccountClick(
                          account.type,
                          account.account_id,
                        );
                      }}
                      _hover={{ textDecoration: "none" }}
                    >
                      <Icon
                        as={Plus}
                        size={16}
                        color="teal.500"
                        _hover={{ color: "teal.600" }}
                      />
                    </ChakraLink>
                  )}
                </Flex>
              </CardHeader>
              {account.is_group && hasChildren && isExpanded && (
                <Box px={3} pb={3}>
                  {renderAccountsAccordion(
                    accounts,
                    account.account_id,
                    level + 1,
                    showZeroBalance,
                  )}
                </Box>
              )}
            </Card>
          );
        })}
      </Stack>
    );
  };

  // Empty state component
  const EmptyState: React.FC<{
    title: string;
    message: string;
    buttonText: string;
    onClick: () => void;
  }> = ({ title, message, buttonText, onClick }) => (
    <Box textAlign="center" py={6} px={4}>
      <Text fontSize="lg" fontWeight="medium" mb={2}>
        {title}
      </Text>
      <Text color="secondaryTextColor" mb={4} fontSize="sm">
        {message}
      </Text>
      <Button
        leftIcon={<Plus />}
        onClick={onClick}
        size="sm"
        colorScheme="teal"
      >
        {buttonText}
      </Button>
    </Box>
  );

  return (
    <Box bg="gray.50" p={{ base: 3, md: 4, lg: 6 }} borderRadius="lg">
      <SimpleGrid
        columns={{ base: 1, md: 1, lg: 2 }}
        spacing={{ base: 4, md: 6 }}
      >
        <Box
          bg="white"
          p={{ base: 3, md: 4 }}
          borderRadius="md"
          boxShadow="sm"
          _hover={{ boxShadow: "md", transition: "all 0.2s" }}
        >
          <Flex
            justifyContent="space-between"
            alignItems="center"
            mb={4}
            flexWrap={{ base: "wrap", sm: "nowrap" }}
          >
            <Flex align="center" gap={2}>
              <Icon as={Building} size={20} color="teal.500" />
              <Heading size="md" color="teal.500" mb={{ base: 1, sm: 0 }}>
                Assets
              </Heading>
            </Flex>
            <Flex align="center" gap={2}>
              <Button
                size="xs"
                variant="ghost"
                colorScheme="teal"
                onClick={() => setShowZeroBalanceAssets(!showZeroBalanceAssets)}
                leftIcon={showZeroBalanceAssets ? <EyeOff size={14} /> : <Eye size={14} />}
              >
                {showZeroBalanceAssets
                  ? "Hide zero balances"
                  : "Show zero balances"}
              </Button>
              <IconButton
                icon={<Plus />}
                size="sm"
                colorScheme="teal"
                variant="ghost"
                aria-label="Add Asset Account"
                data-testid="ledgermainaccounts-add-asset-account-plus-icon"
                onClick={() => handleCreateAccountClick("asset")}
              />
            </Flex>
          </Flex>
          {assetAccounts.length === 0 ? (
            <EmptyState
              title="No Asset Accounts"
              message="You don't have any asset accounts yet."
              buttonText="Create Asset Account"
              onClick={() => handleCreateAccountClick("asset")}
            />
          ) : (
            <>
              <Box display={{ base: "none", xl: "block" }}>
                <Table
                  variant="simple"
                  size="sm"
                  data-testid="ledgermainaccounts-asset-accounts-table"
                >
                  <Tbody>
                    {renderAccountsTable(
                      assetAccounts,
                      null,
                      0,
                      showZeroBalanceAssets,
                    )}
                  </Tbody>
                </Table>
              </Box>
              <Box display={{ base: "block", xl: "none" }}>
                {renderAccountsAccordion(
                  assetAccounts,
                  null,
                  0,
                  showZeroBalanceAssets,
                )}
              </Box>
            </>
          )}
        </Box>
        <Box
          bg="white"
          p={{ base: 3, md: 4 }}
          borderRadius="md"
          boxShadow="sm"
          _hover={{ boxShadow: "md", transition: "all 0.2s" }}
        >
          <Flex
            justifyContent="space-between"
            alignItems="center"
            mb={4}
            flexWrap={{ base: "wrap", sm: "nowrap" }}
          >
            <Flex align="center" gap={2}>
              <Icon as={ShieldAlert} size={20} color="teal.500" />
              <Heading size="md" color="teal.500" mb={{ base: 1, sm: 0 }}>
                Liabilities
              </Heading>
            </Flex>
            <Flex align="center" gap={2}>
              <Button
                size="xs"
                variant="ghost"
                colorScheme="teal"
                onClick={() =>
                  setShowZeroBalanceLiabilities(!showZeroBalanceLiabilities)
                }
                leftIcon={showZeroBalanceLiabilities ? <EyeOff size={14} /> : <Eye size={14} />}
              >
                {showZeroBalanceLiabilities
                  ? "Hide zero balances"
                  : "Show zero balances"}
              </Button>
              <IconButton
                icon={<Plus />}
                size="sm"
                colorScheme="teal"
                variant="ghost"
                aria-label="Add Liability Account"
                data-testid="ledgermainaccounts-add-liability-account-plus-icon"
                onClick={() => handleCreateAccountClick("liability")}
              />
            </Flex>
          </Flex>
          {liabilityAccounts.length === 0 ? (
            <EmptyState
              title="No Liability Accounts"
              message="You don't have any liability accounts yet."
              buttonText="Create Liability Account"
              onClick={() => handleCreateAccountClick("liability")}
            />
          ) : (
            <>
              <Box display={{ base: "none", xl: "block" }}>
                <Table
                  variant="simple"
                  size="sm"
                  data-testid="ledgermainaccounts-liability-accounts-table"
                >
                  <Tbody>
                    {renderAccountsTable(
                      liabilityAccounts,
                      null,
                      0,
                      showZeroBalanceLiabilities,
                    )}
                  </Tbody>
                </Table>
              </Box>
              <Box display={{ base: "block", xl: "none" }}>
                {renderAccountsAccordion(
                  liabilityAccounts,
                  null,
                  0,
                  showZeroBalanceLiabilities,
                )}
              </Box>
            </>
          )}
        </Box>
      </SimpleGrid>
      <CreateAccountModal
        isOpen={isOpen}
        onClose={onClose}
        accountType={accountType === "asset" ? "asset" : "liability"}
        parentAccountId={parentAccountId}
      />
    </Box>
  );
};

export default LedgerMainAccounts;
