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
  ModalCloseButton,
  FormControl,
  FormLabel,
  FormHelperText,
  Input,
  InputGroup,
  InputLeftAddon,
  Select,
  Button,
  useToast,
  Box,
  VStack,
  useColorModeValue,
  Text,
} from "@chakra-ui/react";
import axios from "axios";
import config from "@/config";

interface GroupAccount {
  account_id: string | number;
  name: string;
}

interface Account {
  account_id: string | number;
  name: string;
  opening_balance: number;
  parent_account_id: string | number | null;
  type: "asset" | "liability";
  ledger_id: string | number;
}

interface UpdateAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  account: Account;
  currencySymbol: string;
  onUpdateCompleted: () => void;
}

interface UpdateAccountPayload {
  name?: string;
  opening_balance?: number;
  parent_account_id?: string | number | null;
}

const UpdateAccountModal: React.FC<UpdateAccountModalProps> = ({
  isOpen,
  onClose,
  account,
  currencySymbol,
  onUpdateCompleted,
}) => {
  const [name, setName] = useState<string>(account.name);
  const [openingBalance, setOpeningBalance] = useState<number>(
    account.opening_balance,
  );
  const [parentAccountId, setParentAccountId] = useState<
    string | number | null
  >(account.parent_account_id);
  const [groupAccounts, setGroupAccounts] = useState<GroupAccount[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const toast = useToast();

  // Color variables for consistent theming
  const buttonColorScheme = "teal";
  const bgColor = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.600");

  // Handle Enter key press
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>): void => {
    if (e.key === "Enter") {
      handleSubmit();
    }
  };

  // Fetch group accounts based on the account type
  useEffect(() => {
    const fetchGroupAccounts = async (): Promise<void> => {
      try {
        setIsLoading(true);
        const token = localStorage.getItem("access_token");
        const response = await axios.get<GroupAccount[]>(
          `${config.apiBaseUrl}/ledger/${account.ledger_id}/accounts/group?account_type=${account.type}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );
        setGroupAccounts(response.data);
      } catch (error) {
        toast({
          title: "Error",
          description:
            axios.isAxiosError(error) && error.response?.data?.message
              ? error.response.data.message
              : "Failed to fetch group accounts",
          status: "error",
          duration: 3000,
          position: "top",
          isClosable: true,
        });
      } finally {
        setIsLoading(false);
      }
    };

    if (isOpen) {
      fetchGroupAccounts();
    }
  }, [isOpen, account.ledger_id, account.type, toast]);

  const handleSubmit = async (): Promise<void> => {
    if (!name) {
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

    const payload: UpdateAccountPayload = {};

    // Add only the fields that have changed
    if (name !== account.name) payload.name = name;
    if (openingBalance !== account.opening_balance)
      payload.opening_balance = parseFloat(openingBalance.toString());
    if (parentAccountId !== account.parent_account_id)
      payload.parent_account_id = parentAccountId;

    // If no fields have changed, show an error toast
    if (Object.keys(payload).length === 0) {
      toast({
        title: "No changes detected",
        description: "Please update at least one field.",
        status: "warning",
        duration: 3000,
        position: "top",
        isClosable: true,
      });
      return;
    }

    try {
      setIsLoading(true);
      const token = localStorage.getItem("access_token");
      await axios.put(
        `${config.apiBaseUrl}/ledger/${account.ledger_id}/account/${account.account_id}/update`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      toast({
        title: "Success",
        description: "Account updated successfully",
        status: "success",
        duration: 2000,
        position: "top",
        isClosable: true,
      });
      onClose();
      onUpdateCompleted();
    } catch (error) {
      toast({
        title: "Error",
        description:
          axios.isAxiosError(error) && error.response?.data?.message
            ? error.response.data.message
            : "Failed to update account",
        status: "error",
        duration: 3000,
        position: "top",
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
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
            Update {account.type === "asset" ? "Asset" : "Liability"} Account
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
                placeholder={`e.g., ${account.type === "asset" ? "Cash, Bank Account" : "Credit Card, Mortgage"}`}
                value={name}
                onChange={(e) => setName(e.target.value)}
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
                Update the name of your {account.type} account
              </FormHelperText>
            </FormControl>

            <FormControl>
              <FormLabel fontWeight="medium">Opening Balance</FormLabel>
              <InputGroup>
                <InputLeftAddon>{currencySymbol}</InputLeftAddon>
                <Input
                  type="number"
                  value={openingBalance}
                  onChange={(e) =>
                    setOpeningBalance(parseFloat(e.target.value))
                  }
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
              <FormHelperText>Starting balance for this account</FormHelperText>
            </FormControl>

            {/* Show loading spinner while fetching group accounts */}
            {isLoading && groupAccounts.length === 0 && (
              <Flex justify="center" align="center" my={4}>
                <Spinner size="sm" color={buttonColorScheme + ".500"} />
                <Text ml={2} color="gray.500">
                  Loading parent accounts...
                </Text>
              </Flex>
            )}

            {groupAccounts.length > 0 && (
              <FormControl>
                <FormLabel fontWeight="medium">
                  Parent Account (Optional)
                </FormLabel>
                <Select
                  value={parentAccountId?.toString() || ""}
                  onChange={(e) =>
                    setParentAccountId(e.target.value ? e.target.value : null)
                  }
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
                  <option value="">None</option>
                  {groupAccounts.map((group) => (
                    <option
                      key={group.account_id.toString()}
                      value={group.account_id.toString()}
                    >
                      {group.name}
                    </option>
                  ))}
                </Select>
                <FormHelperText>
                  Organize this account under an existing group
                </FormHelperText>
              </FormControl>
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
              isLoading={isLoading}
              loadingText="Updating..."
            >
              Update Account
            </Button>
            <Button
              variant="outline"
              onClick={onClose}
              width="100%"
              size="lg"
              isDisabled={isLoading}
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
            isLoading={isLoading}
            loadingText="Updating..."
          >
            Update
          </Button>
          <Button variant="outline" onClick={onClose} isDisabled={isLoading}>
            Cancel
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default UpdateAccountModal;
