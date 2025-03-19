import React, { useState, useEffect } from "react";
import {
  Flex,
  Spinner,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  FormControl,
  FormLabel,
  FormHelperText,
  Input,
  Select,
  Checkbox,
  Button,
  useToast,
  Box,
  VStack,
  useColorModeValue,
  Text,
} from "@chakra-ui/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import config from "@/config";

interface GroupAccount {
  account_id: string;
  name: string;
}

interface CreateAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  ledgerId: string;
  accountType: "asset" | "liability";
  parentAccountId?: string | null;
}

interface CreateAccountPayload {
  name: string;
  is_group: boolean;
  parent_account_id: string | null;
  type: string;
  opening_balance?: number;
}

const CreateAccountModal: React.FC<CreateAccountModalProps> = ({
  isOpen,
  onClose,
  ledgerId,
  accountType,
  parentAccountId,
}) => {
  const toast = useToast();
  const queryClient = useQueryClient();
  const [accountName, setAccountName] = useState<string>("");
  const [isGroupAccount, setIsGroupAccount] = useState<boolean>(false);
  const [parentAccount, setParentAccount] = useState<string>(
    parentAccountId || "",
  );
  const [openingBalance, setOpeningBalance] = useState<string>("");

  // Color variables for consistent theming
  const buttonColorScheme = "teal";
  const bgColor = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.600");

  // Update parentAccount state when parentAccountId prop changes
  useEffect(() => {
    setParentAccount(parentAccountId || "");
  }, [parentAccountId]);

  // Fetch group accounts when the modal is opened
  const {
    data: groupAccounts,
    isLoading: isGroupAccountsLoading,
    isError: isGroupAccountsError,
  } = useQuery({
    queryKey: ["groupAccounts", ledgerId, accountType],
    queryFn: async (): Promise<GroupAccount[]> => {
      const token = localStorage.getItem("access_token");
      const response = await fetch(
        `${config.apiBaseUrl}/ledger/${ledgerId}/accounts/group?account_type=${accountType}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (!response.ok) {
        throw new Error("Failed to fetch group accounts");
      }

      return response.json();
    },
    enabled: isOpen && !parentAccountId, // Only fetch group accounts when the modal is open and no parentAccountId is provided
  });

  // Reset form fields
  const resetForm = (): void => {
    setAccountName("");
    setIsGroupAccount(false);
    setParentAccount(parentAccountId || "");
    setOpeningBalance("");
  };

  // Handle Enter key press
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>): void => {
    if (e.key === "Enter") {
      handleSubmit();
    }
  };

  // Mutation for creating a new account
  const createAccountMutation = useMutation({
    mutationFn: async (payload: CreateAccountPayload) => {
      const token = localStorage.getItem("access_token");
      const response = await fetch(
        `${config.apiBaseUrl}/ledger/${ledgerId}/account/create`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        },
      );

      if (!response.ok) {
        throw new Error("Failed to create account");
      }

      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Account created successfully.",
        status: "success",
        duration: 2000,
        position: "top",
        isClosable: true,
      });
      resetForm();
      onClose();
      queryClient.invalidateQueries({
        queryKey: ["accounts", String(ledgerId)],
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create account.",
        status: "error",
        duration: 3000,
        position: "top",
        isClosable: true,
      });
    },
  });

  // Handle form submission
  const handleSubmit = (): void => {
    if (!accountName) {
      toast({
        title: "Required Field",
        description: "Please enter an account name.",
        status: "warning",
        duration: 3000,
        position: "top",
        isClosable: true,
      });
      return;
    }

    const payload: CreateAccountPayload = {
      name: accountName,
      is_group: isGroupAccount,
      parent_account_id: parentAccount || null,
      type: accountType,
    };

    // Add opening_balance only if it's provided and the account is not a group account
    if (!isGroupAccount && openingBalance) {
      payload.opening_balance = parseFloat(openingBalance);
    }

    createAccountMutation.mutate(payload);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size={{ base: "full", sm: "md" }}
      motionPreset="slideInBottom"
    >
      <ModalOverlay backdropFilter="blur(2px)" />
      <ModalContent
        borderRadius={{ base: 0, sm: "md" }}
        mx={{ base: 0, sm: 4 }}
        my={{ base: 0, sm: "auto" }}
        h={{ base: "100vh", sm: "auto" }}
      >
        <Box
          pt={{ base: 10, sm: 4 }}
          pb={{ base: 2, sm: 0 }}
          px={{ base: 4, sm: 0 }}
          bg={{ base: buttonColorScheme + ".500", sm: "transparent" }}
          color={{ base: "white", sm: "inherit" }}
          borderTopRadius={{ base: 0, sm: "md" }}
        >
          <ModalHeader
            fontSize={{ base: "xl", sm: "lg" }}
            p={{ base: 0, sm: 6 }}
            pb={{ base: 4, sm: 2 }}
          >
            Create {accountType === "asset" ? "Asset" : "Liability"} Account
          </ModalHeader>
        </Box>

        <ModalBody
          px={{ base: 4, sm: 6 }}
          py={{ base: 4, sm: 4 }}
          flex="1"
          display="flex"
          flexDirection="column"
          justifyContent={{ base: "space-between", sm: "flex-start" }}
        >
          <VStack spacing={6} align="stretch" w="100%">
            <FormControl isRequired>
              <FormLabel fontWeight="medium">Account Name</FormLabel>
              <Input
                placeholder={`e.g., ${accountType === "asset" ? "Cash, Bank Account" : "Credit Card, Mortgage"}`}
                value={accountName}
                onChange={(e) => setAccountName(e.target.value)}
                onKeyPress={handleKeyPress}
                borderWidth="1px"
                borderColor={borderColor}
                bg={bgColor}
                size="md"
                borderRadius="md"
                _hover={{ borderColor: buttonColorScheme + ".300" }}
                _focus={{
                  borderColor: buttonColorScheme + ".500",
                  boxShadow: "0 0 0 1px " + buttonColorScheme + ".500",
                }}
              />
              <FormHelperText>
                Enter a descriptive name for your {accountType} account
              </FormHelperText>
            </FormControl>

            <FormControl>
              <Checkbox
                isChecked={isGroupAccount}
                onChange={(e) => setIsGroupAccount(e.target.checked)}
                colorScheme={buttonColorScheme}
                size="md"
              >
                <Text fontWeight="medium">Group Account</Text>
              </Checkbox>
              <FormHelperText ml="6">
                Group accounts can contain other accounts but cannot hold
                transactions
              </FormHelperText>
            </FormControl>

            {!isGroupAccount && (
              <FormControl>
                <FormLabel fontWeight="medium">Opening Balance</FormLabel>
                <Input
                  type="number"
                  value={openingBalance}
                  onChange={(e) => setOpeningBalance(e.target.value)}
                  placeholder="0.00"
                  borderWidth="1px"
                  borderColor={borderColor}
                  bg={bgColor}
                  size="md"
                  borderRadius="md"
                  _hover={{ borderColor: buttonColorScheme + ".300" }}
                  _focus={{
                    borderColor: buttonColorScheme + ".500",
                    boxShadow: "0 0 0 1px " + buttonColorScheme + ".500",
                  }}
                />
                <FormHelperText>
                  Starting balance for this account (optional)
                </FormHelperText>
              </FormControl>
            )}

            {/* Show loading spinner while fetching group accounts */}
            {isGroupAccountsLoading && (
              <Flex justify="center" align="center" my={4}>
                <Spinner size="sm" color={buttonColorScheme + ".500"} />
              </Flex>
            )}

            {!parentAccountId && groupAccounts && groupAccounts.length > 0 && (
              <FormControl>
                <FormLabel fontWeight="medium">
                  Parent Account (Optional)
                </FormLabel>
                <Select
                  value={parentAccount}
                  onChange={(e) => setParentAccount(e.target.value)}
                  placeholder="Select parent account"
                  borderWidth="1px"
                  borderColor={borderColor}
                  bg={bgColor}
                  size="md"
                  borderRadius="md"
                  _hover={{ borderColor: buttonColorScheme + ".300" }}
                  _focus={{
                    borderColor: buttonColorScheme + ".500",
                    boxShadow: "0 0 0 1px " + buttonColorScheme + ".500",
                  }}
                >
                  {groupAccounts.map((account) => (
                    <option key={account.account_id} value={account.account_id}>
                      {account.name}
                    </option>
                  ))}
                </Select>
                <FormHelperText>
                  Organize this account under an existing group
                </FormHelperText>
              </FormControl>
            )}

            {/* Show error message if fetching group accounts fails */}
            {isGroupAccountsError && (
              <Text color="red.500" fontSize="sm" mt={2}>
                Failed to load group accounts. Please try again.
              </Text>
            )}
          </VStack>

          {/* Mobile-only action buttons that stay at bottom */}
          <Box display={{ base: "block", sm: "none" }} mt={6}>
            <Button
              onClick={handleSubmit}
              colorScheme={buttonColorScheme}
              size="lg"
              width="100%"
              mb={3}
              isLoading={createAccountMutation.isPending}
              loadingText="Creating..."
            >
              Create Account
            </Button>
            <Button
              variant="outline"
              onClick={onClose}
              width="100%"
              size="lg"
              isDisabled={createAccountMutation.isPending}
            >
              Cancel
            </Button>
          </Box>
        </ModalBody>

        {/* Desktop-only footer */}
        <ModalFooter display={{ base: "none", sm: "flex" }}>
          <Button
            colorScheme={buttonColorScheme}
            mr={3}
            onClick={handleSubmit}
            px={6}
            isLoading={createAccountMutation.isPending}
            loadingText="Creating..."
          >
            Create
          </Button>
          <Button
            variant="outline"
            onClick={onClose}
            isDisabled={createAccountMutation.isPending}
          >
            Cancel
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default CreateAccountModal;
