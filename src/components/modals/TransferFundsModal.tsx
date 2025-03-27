import React, { useState, useEffect, useCallback } from "react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  Button,
  FormControl,
  FormLabel,
  Input,
  Select,
  Switch,
  Text,
  VStack,
  HStack,
  useToast,
  Box,
  useColorModeValue,
  InputGroup,
  InputLeftAddon,
  Stack,
} from "@chakra-ui/react";
import { ArrowDownIcon, ArrowUpIcon } from "@chakra-ui/icons";
import axios, { AxiosError } from "axios";
import ChakraDatePicker from "@components/shared/ChakraDatePicker";
import config from "@/config";
import FormNotes from "../shared/FormNotes";
import useLedgerStore from "../shared/store";

interface Ledger {
  ledger_id: string;
  name: string;
  currency_symbol: string;
}

interface Account {
  account_id: string;
  name: string;
  type: string;
}

interface TransferFundsModalProps {
  isOpen: boolean;
  onClose: () => void;
  accountId?: string;
  onTransferCompleted: () => void;
}

const TransferFundsModal: React.FC<TransferFundsModalProps> = ({
  isOpen,
  onClose,
  accountId,
  onTransferCompleted,
}) => {
  const [date, setDate] = useState<Date>(new Date());
  const [fromAccountId, setFromAccountId] = useState<string>(
    accountId?.toString() || "",
  );
  const [toAccountId, setToAccountId] = useState<string>("");
  const [amount, setAmount] = useState<string>("");
  const [notes, setNotes] = useState<string>("");
  const [isDifferentLedger, setIsDifferentLedger] = useState<boolean>(false);
  const [destinationLedgerId, setDestinationLedgerId] = useState<string>("");
  const [destinationCurrencySymbol, setDestinationCurrencySymbol] =
    useState<string>("");
  const [destinationAmount, setDestinationAmount] = useState<string>("");
  const [ledgers, setLedgers] = useState<Ledger[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [destinationAccounts, setDestinationAccounts] = useState<Account[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const toast = useToast();

  const { ledgerId, currencySymbol } = useLedgerStore();
  // Theme colors
  const buttonColorScheme = "teal";
  const bgColor = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.600");
  const highlightColor = useColorModeValue("teal.50", "teal.900");
  const formBgColor = useColorModeValue("gray.50", "gray.700");

  const resetForm = useCallback(() => {
    setDate(new Date());
    setFromAccountId(accountId?.toString() || "");
    setToAccountId("");
    setAmount("");
    setNotes("");
    setIsDifferentLedger(false);
    setDestinationLedgerId("");
    setDestinationAmount("");
  }, [accountId]);

  const fetchLedgers = useCallback(async () => {
    try {
      const token = localStorage.getItem("access_token");
      const response = await axios.get<Ledger[]>(
        `${config.apiBaseUrl}/ledger/list`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      setLedgers(response.data);
    } catch (error) {
      const axiosError = error as AxiosError<{ detail: string }>;
      toast({
        title: "Error",
        description:
          axiosError.response?.data?.detail || "Failed to fetch ledgers.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  }, [toast]);

  const fetchAccounts = useCallback(async () => {
    try {
      const token = localStorage.getItem("access_token");
      const response = await axios.get<Account[]>(
        `${config.apiBaseUrl}/ledger/${ledgerId}/accounts?ignore_group=true`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      setAccounts(response.data);
    } catch (error) {
      const axiosError = error as AxiosError<{ detail: string }>;
      toast({
        title: "Error",
        description:
          axiosError.response?.data?.detail || "Failed to fetch accounts.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  }, [ledgerId, toast]);

  useEffect(() => {
    if (isOpen) {
      resetForm();
      fetchLedgers();
      fetchAccounts();
    }
  }, [isOpen, resetForm, fetchLedgers, fetchAccounts]);

  const fetchDestinationAccounts = useCallback(
    async (ledgerId: string) => {
      try {
        const token = localStorage.getItem("access_token");
        const response = await axios.get<Account[]>(
          `${config.apiBaseUrl}/ledger/${ledgerId}/accounts?ignore_group=true`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );
        setDestinationAccounts(response.data);
      } catch (error) {
        const axiosError = error as AxiosError<{ detail: string }>;
        toast({
          title: "Error",
          description:
            axiosError.response?.data?.detail || "Failed to fetch accounts.",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      }
    },
    [toast],
  );

  useEffect(() => {
    if (isDifferentLedger && destinationLedgerId) {
      fetchDestinationAccounts(destinationLedgerId);
    }
  }, [isDifferentLedger, destinationLedgerId, fetchDestinationAccounts]);

  // Filter out the current ledger from the "destination ledger" dropdown
  const getFilteredLedgers = (ledgers: Ledger[]) => {
    return ledgers.filter((ledger) => ledger.ledger_id != ledgerId);
  };

  // Filter out the current account from the "to account" dropdown
  const getFilteredAccounts = (accounts: Account[]) => {
    return accounts.filter((account) => account.account_id != fromAccountId);
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("access_token");
      const payload = {
        source_account_id: fromAccountId,
        destination_account_id: toAccountId,
        date: date.toISOString(),
        source_amount: parseFloat(amount),
        notes: notes || "Fund Transfer",
        destination_amount: destinationAmount
          ? parseFloat(destinationAmount)
          : null,
      };

      await axios.post(
        `${config.apiBaseUrl}/ledger/${ledgerId}/transaction/transfer`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      toast({
        title: "Success",
        description: "Transfer completed successfully.",
        status: "success",
        duration: 3000,
        isClosable: true,
      });

      onClose();
      onTransferCompleted();
    } catch (error) {
      const axiosError = error as AxiosError<{ detail: string }>;
      toast({
        title: "Error",
        description: axiosError.response?.data?.detail || "Transfer failed",
        status: "error",
        duration: 3000,
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
      size={{ base: "full", md: "lg" }}
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
            Transfer Funds
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
            {/* Basic Info Section */}
            <Stack direction={{ base: "column", md: "row" }} spacing={4} mb={4}>
              {/* Date Picker */}
              <FormControl flex="1">
                <FormLabel fontSize="sm" fontWeight="medium">
                  Date
                </FormLabel>
                <ChakraDatePicker
                  selected={date}
                  onChange={(date: Date | null) => {
                    if (date) {
                      setDate(date);
                    }
                  }}
                  shouldCloseOnSelect={true}
                  data-testid="transferfundsmodal-date-picker"
                />
              </FormControl>

              {/* Amount Input */}
              <FormControl flex="1">
                <FormLabel fontSize="sm" fontWeight="medium">
                  Amount
                </FormLabel>
                <InputGroup>
                  <InputLeftAddon>{currencySymbol}</InputLeftAddon>
                  <Input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.00"
                    borderColor={borderColor}
                    autoFocus
                  />
                </InputGroup>
              </FormControl>
            </Stack>

            {/* From Account Selection */}
            {!accountId && (
              <Box
                p={4}
                borderWidth="1px"
                borderRadius="md"
                borderColor={borderColor}
                bg={formBgColor}
                mb={4}
              >
                <FormControl>
                  <HStack alignItems="center" mb={2}>
                    <ArrowUpIcon color="red.500" />
                    <FormLabel fontSize="sm" fontWeight="medium" mb={0}>
                      From Account
                    </FormLabel>
                  </HStack>
                  <Select
                    borderColor={borderColor}
                    placeholder="Select an account"
                    onChange={(e) => setFromAccountId(e.target.value)}
                    data-testid="transferfundsmodal-from-account-dropdown"
                  >
                    {/* Group for Asset Accounts */}
                    <optgroup label="Asset Accounts">
                      {accounts
                        .filter((account) => account.type === "asset")
                        .map((account) => (
                          <option
                            key={account.account_id}
                            value={account.account_id}
                          >
                            {account.name}
                          </option>
                        ))}
                    </optgroup>
                    {/* Group for Liability Accounts */}
                    <optgroup label="Liability Accounts">
                      {accounts
                        .filter((account) => account.type === "liability")
                        .map((account) => (
                          <option
                            key={account.account_id}
                            value={account.account_id}
                          >
                            {account.name}
                          </option>
                        ))}
                    </optgroup>
                  </Select>
                </FormControl>
              </Box>
            )}

            {/* Different Ledger Toggle */}
            <Box
              p={3}
              borderRadius="md"
              borderWidth="1px"
              borderColor={borderColor}
              bg={useColorModeValue("gray.50", "gray.700")}
              mb={4}
            >
              <HStack justifyContent="space-between">
                <Text fontSize="sm" fontWeight="medium">
                  Transfer to Different Ledger
                </Text>
                <Switch
                  colorScheme={buttonColorScheme}
                  isChecked={isDifferentLedger}
                  onChange={(e) => setIsDifferentLedger(e.target.checked)}
                />
              </HStack>
            </Box>

            {/* Destination Section */}
            <Box
              p={4}
              borderWidth="1px"
              borderRadius="md"
              borderColor={borderColor}
              bg={highlightColor}
              mb={4}
            >
              <VStack spacing={4} align="stretch">
                {/* Destination Ledger (if different ledger) */}
                {isDifferentLedger && (
                  <FormControl>
                    <FormLabel fontSize="sm" fontWeight="medium">
                      Destination Ledger
                    </FormLabel>
                    <Select
                      value={destinationLedgerId}
                      onChange={(e) => {
                        const selectedLedger = ledgers.find(
                          (ledger) => ledger.ledger_id == e.target.value,
                        );
                        setDestinationLedgerId(e.target.value);
                        if (selectedLedger) {
                          setDestinationCurrencySymbol(
                            selectedLedger.currency_symbol,
                          );
                        }
                        setToAccountId("");
                      }}
                      borderColor={borderColor}
                      bg={bgColor}
                      data-testid="transferfundsmodal-to-ledger-dropdown"
                    >
                      <option value="">Select a ledger</option>
                      {getFilteredLedgers(ledgers).map((ledger) => (
                        <option key={ledger.ledger_id} value={ledger.ledger_id}>
                          {ledger.name}
                        </option>
                      ))}
                    </Select>
                  </FormControl>
                )}

                {/* To Account Selection */}
                <FormControl>
                  <HStack alignItems="center" mb={2}>
                    <ArrowDownIcon color="green.500" />
                    <FormLabel fontSize="sm" fontWeight="medium" mb={0}>
                      To Account
                    </FormLabel>
                  </HStack>
                  <Select
                    value={toAccountId}
                    onChange={(e) => setToAccountId(e.target.value)}
                    borderColor={borderColor}
                    bg={bgColor}
                    data-testid="transferfundsmodal-to-account-dropdown"
                  >
                    <option value="">Select an account</option>
                    {/* Group for Asset Accounts */}
                    <optgroup label="Asset Accounts">
                      {getFilteredAccounts(
                        isDifferentLedger ? destinationAccounts : accounts,
                      )
                        .filter((account) => account.type === "asset")
                        .map((account) => (
                          <option
                            key={account.account_id}
                            value={account.account_id}
                          >
                            {account.name}
                          </option>
                        ))}
                    </optgroup>
                    {/* Group for Liability Accounts */}
                    <optgroup label="Liability Accounts">
                      {getFilteredAccounts(
                        isDifferentLedger ? destinationAccounts : accounts,
                      )
                        .filter((account) => account.type === "liability")
                        .map((account) => (
                          <option
                            key={account.account_id}
                            value={account.account_id}
                          >
                            {account.name}
                          </option>
                        ))}
                    </optgroup>
                  </Select>
                </FormControl>

                {/* Destination Amount (if different ledger) */}
                {isDifferentLedger && (
                  <FormControl>
                    <FormLabel fontSize="sm" fontWeight="medium">
                      Destination Amount
                    </FormLabel>
                    <InputGroup>
                      <InputLeftAddon>
                        {destinationCurrencySymbol
                          ? destinationCurrencySymbol
                          : currencySymbol}
                      </InputLeftAddon>
                      <Input
                        type="number"
                        value={destinationAmount}
                        onChange={(e) => setDestinationAmount(e.target.value)}
                        placeholder="0.00"
                        borderColor={borderColor}
                        bg={bgColor}
                      />
                    </InputGroup>
                  </FormControl>
                )}
              </VStack>
            </Box>

            {/* Notes */}
            <FormNotes
              ledgerId={ledgerId as string}
              notes={notes}
              setNotes={setNotes}
              borderColor={borderColor}
            />
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
              isDisabled={
                !fromAccountId ||
                !toAccountId ||
                !amount ||
                (isDifferentLedger &&
                  (!destinationLedgerId || !destinationAmount))
              }
            >
              Complete Transfer
            </Button>
            <Button
              variant="outline"
              onClick={onClose}
              size="lg"
              width="100%"
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
            px={6}
            onClick={handleSubmit}
            isLoading={isLoading}
            isDisabled={
              !fromAccountId ||
              !toAccountId ||
              !amount ||
              (isDifferentLedger &&
                (!destinationLedgerId || !destinationAmount))
            }
          >
            Complete Transfer
          </Button>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default TransferFundsModal;
