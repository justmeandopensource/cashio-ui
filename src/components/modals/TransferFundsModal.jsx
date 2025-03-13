import { useState, useEffect } from "react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
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
  useBreakpointValue,
  InputGroup,
  InputLeftAddon,
  Stack,
} from "@chakra-ui/react";
import { ArrowDownIcon, ArrowUpIcon } from "@chakra-ui/icons";
import axios from "axios";
import ChakraDatePicker from "@components/shared/ChakraDatePicker";
import { currencySymbols } from "@components/shared/utils";
import config from "@/config";

const TransferFundsModal = ({
  isOpen,
  onClose,
  ledgerId,
  accountId,
  currencySymbol,
  onTransferCompleted,
}) => {
  const [date, setDate] = useState(new Date());
  const [fromAccountId, setFromAccountId] = useState(accountId || "");
  const [toAccountId, setToAccountId] = useState("");
  const [amount, setAmount] = useState("");
  const [notes, setNotes] = useState("");
  const [isDifferentLedger, setIsDifferentLedger] = useState(false);
  const [destinationLedgerId, setDestinationLedgerId] = useState("");
  const [destinationCurrencySymbolCode, setDestinationCurrencySymbolCode] =
    useState("");
  const [destinationAmount, setDestinationAmount] = useState("");
  const [ledgers, setLedgers] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [destinationAccounts, setDestinationAccounts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const toast = useToast();

  // Responsive design helpers
  const modalSize = useBreakpointValue({ base: "full", md: "lg" });
  const stackDirection = useBreakpointValue({ base: "column", md: "row" });

  // Theme colors
  const buttonColorScheme = "teal";
  const bgColor = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.600");
  const highlightColor = useColorModeValue("teal.50", "teal.900");

  const resetForm = () => {
    setDate(new Date());
    setFromAccountId(accountId || "");
    setToAccountId("");
    setAmount("");
    setNotes("");
    setIsDifferentLedger(false);
    setDestinationLedgerId("");
    setDestinationAmount("");
  };

  useEffect(() => {
    if (isOpen) {
      resetForm();
      fetchLedgers();
      fetchAccounts();
    }
  }, [isOpen]);

  useEffect(() => {
    if (isDifferentLedger && destinationLedgerId) {
      fetchDestinationAccounts(destinationLedgerId);
    }
  }, [isDifferentLedger, destinationLedgerId]);

  const fetchLedgers = async () => {
    try {
      const token = localStorage.getItem("access_token");
      const response = await axios.get(`${config.apiBaseUrl}/ledger/list`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setLedgers(response.data);
    } catch (error) {
      console.error("Error fetching ledgers:", error);
      toast({
        title: "Error",
        description: "Failed to fetch ledgers.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const fetchAccounts = async () => {
    try {
      const token = localStorage.getItem("access_token");
      const response = await axios.get(
        `${config.apiBaseUrl}/ledger/${ledgerId}/accounts?ignore_group=true`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      setAccounts(response.data);
    } catch (error) {
      console.error("Error fetching accounts:", error);
      toast({
        title: "Error",
        description: "Failed to fetch accounts.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const fetchDestinationAccounts = async (ledgerId) => {
    try {
      const token = localStorage.getItem("access_token");
      const response = await axios.get(
        `${config.apiBaseUrl}/ledger/${ledgerId}/accounts?ignore_group=true`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      setDestinationAccounts(response.data);
    } catch (error) {
      console.error("Error fetching destination accounts:", error);
      toast({
        title: "Error",
        description: "Failed to fetch destination accounts.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  // Filter out the current ledger from the "destination ledger" dropdown
  const getFilteredLedgers = (ledgers) => {
    return ledgers.filter((ledger) => ledger.ledger_id != ledgerId);
  };

  // Filter out the current account from the "to account" dropdown
  const getFilteredAccounts = (accounts) => {
    return accounts.filter((account) => account.account_id != fromAccountId);
  };

  const handleSubmit = async () => {
    if (!fromAccountId || !toAccountId || !amount) {
      toast({
        title: "Error",
        description: "Please fill all required fields.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setIsLoading(true);
    try {
      const token = localStorage.getItem("access_token");
      const payload = {
        source_account_id: parseInt(fromAccountId, 10),
        destination_account_id: parseInt(toAccountId, 10),
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
      console.error("Error transferring funds:", error);
      toast({
        title: "Error",
        description: error.response?.data?.detail || "Transfer failed",
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
      size={modalSize}
      motionPreset="slideInBottom"
    >
      <ModalOverlay backdropFilter="blur(2px)" />
      <ModalContent
        borderRadius={{ base: 0, sm: "md" }}
        mx={{ base: 0, sm: 4 }}
        my={{ base: 0, sm: "auto" }}
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
          <ModalCloseButton
            color={{ base: "white", sm: "gray.500" }}
            top={{ base: 10, sm: 4 }}
            right={{ base: 4, sm: 4 }}
          />
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
            {/* Basic Info Section */}
            <Stack direction={stackDirection} spacing={4} mb={4}>
              {/* Date Picker */}
              <FormControl flex="1">
                <FormLabel fontSize="sm" fontWeight="medium">
                  Date
                </FormLabel>
                <ChakraDatePicker
                  selected={date}
                  onChange={(date) => setDate(date)}
                  borderColor={borderColor}
                  shouldCloseOnSelect={true}
                  size="md"
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
                bg={useColorModeValue("gray.50", "gray.700")}
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
                    value={fromAccountId}
                    onChange={(e) => setFromAccountId(e.target.value)}
                    borderColor={borderColor}
                  >
                    <option value="">Select an account</option>
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
                          (ledger) =>
                            ledger.ledger_id === parseInt(e.target.value, 10),
                        );
                        setDestinationLedgerId(e.target.value);
                        setDestinationCurrencySymbolCode(
                          selectedLedger.currency_symbol,
                        );
                      }}
                      borderColor={borderColor}
                      bg={bgColor}
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
                        {destinationCurrencySymbolCode
                          ? currencySymbols[destinationCurrencySymbolCode]
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
                    <Text fontSize="xs" mt={1} color="gray.500">
                      Leave empty to use the same amount as source
                    </Text>
                  </FormControl>
                )}
              </VStack>
            </Box>

            {/* Notes */}
            <FormControl>
              <FormLabel fontSize="sm" fontWeight="medium">
                Notes
              </FormLabel>
              <Input
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Description (optional)"
                borderColor={borderColor}
              />
            </FormControl>
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
                (isDifferentLedger && !destinationLedgerId)
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
              (isDifferentLedger && !destinationLedgerId)
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
