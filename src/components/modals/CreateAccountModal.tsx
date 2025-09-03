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
  InputGroup,
  InputLeftAddon,
} from "@chakra-ui/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import useLedgerStore from "../shared/store";
import { Plus, X } from "lucide-react";
import { toastDefaults } from "../shared/utils";

interface GroupAccount {
  account_id: string;
  name: string;
}

interface CreateAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
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
  accountType,
  parentAccountId,
}) => {
  const toast = useToast();
  const queryClient = useQueryClient();
  const { ledgerId, currencySymbol } = useLedgerStore();
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
      try {
        const response = await api.get<GroupAccount[]>(
          `/ledger/${ledgerId}/accounts/group?account_type=${accountType}`
        );
        return response.data;
      } catch (error) {
        const axiosError = error as AxiosError<{ detail: string }>;
        if (axiosError.response?.status === 401) {
          throw error; // Let the interceptor handle the redirect
        }
        throw new Error(axiosError.response?.data?.detail || "Failed to fetch group accounts");
      }
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
      const response = await api.post(
        `/ledger/${ledgerId}/account/create`,
        payload
      );
      return response.data;
    },
    onSuccess: () => {
      toast({
        description: "Account created successfully.",
        status: "success",
        ...toastDefaults,
      });
      resetForm();
      onClose();
      queryClient.invalidateQueries({
        queryKey: ["accounts"],
      });
    },
    onError: (error: AxiosError<{ detail: string }>) => {
      if (error.response?.status !== 401) {
        toast({
          description: error.response?.data?.detail || "Failed to create account.",
          status: "error",
          ...toastDefaults,
        });
      }
    },
  });

  // Handle form submission
  const handleSubmit = (): void => {
    if (!accountName) {
      toast({
        description: "Please enter an account name.",
        status: "warning",
        ...toastDefaults,
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
        maxHeight={{ base: "100%", md: "80vh" }}
        display="flex"
        flexDirection="column"
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
            <Flex alignItems="center">
              <Plus size={24} style={{ marginRight: '8px' }} />
              Create {accountType === "asset" ? "Asset" : "Liability"} Account
            </Flex>
          </ModalHeader>
        </Box>

        <ModalBody
          px={{ base: 4, sm: 6 }}
          py={{ base: 4, sm: 4 }}
          flex="1"
          display="flex"
          flexDirection="column"
          overflow="auto"
          maxHeight={{ md: "calc(80vh - 140px)" }}
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
                <InputGroup>
                  <InputLeftAddon>{currencySymbol}</InputLeftAddon>
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
                </InputGroup>
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
              isDisabled={!accountName || isGroupAccountsError}
              loadingText="Creating..."
              leftIcon={<Plus />}
            >
              Create Account
            </Button>
            <Button
              variant="outline"
              onClick={onClose}
              width="100%"
              size="lg"
              isDisabled={createAccountMutation.isPending}
              leftIcon={<X />}
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
            px={6}
            onClick={handleSubmit}
            isLoading={createAccountMutation.isPending}
            isDisabled={!accountName || isGroupAccountsError}
            loadingText="Creating..."
            leftIcon={<Plus />}
          >
            Create
          </Button>
          <Button
            variant="outline"
            onClick={onClose}
            isDisabled={createAccountMutation.isPending}
            leftIcon={<X />}
          >
            Cancel
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default CreateAccountModal;
