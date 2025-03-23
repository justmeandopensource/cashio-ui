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
  Tabs,
  TabList,
  Tab,
  useColorModeValue,
  InputGroup,
  InputLeftAddon,
  Stack,
} from "@chakra-ui/react";
import axios, { AxiosError } from "axios";
import config from "@/config";
import ChakraDatePicker from "@components/shared/ChakraDatePicker";
import FormSplits from "./FormSplits";
import FormNotes from "@/components/shared/FormNotes";
import FormTags from "@/components/shared/FormTags";

// Define interfaces for the props and state
interface CreateTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  accountId?: string;
  ledgerId: string;
  currencySymbol: string;
  onTransactionAdded: () => void;
}

interface Category {
  category_id: string;
  name: string;
  type: string;
}

interface Account {
  account_id: string;
  name: string;
  type: string;
}

interface Split {
  amount: number;
  categoryId: string;
  notes?: string;
}

interface Tag {
  name: string;
}

const roundToTwoDecimals = (value: number): number => {
  return Math.round((value + Number.EPSILON) * 100) / 100;
};

const CreateTransactionModal: React.FC<CreateTransactionModalProps> = ({
  isOpen,
  onClose,
  accountId,
  ledgerId,
  currencySymbol,
  onTransactionAdded,
}) => {
  const [date, setDate] = useState<Date>(new Date());
  const [type, setType] = useState<"expense" | "income">("expense");
  const [categoryId, setCategoryId] = useState<string>("");
  const [notes, setNotes] = useState<string>("");
  const [amount, setAmount] = useState<number | null>(null);
  const [selectedAccountId, setSelectedAccountId] = useState<string>("");
  const [isSplit, setIsSplit] = useState<boolean>(false);
  const [splits, setSplits] = useState<Split[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const toast = useToast();

  // Theme colors
  const buttonColorScheme = "teal";
  const bgColor = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.600");
  const highlightColor = useColorModeValue("teal.50", "teal.900");

  const resetForm = () => {
    setDate(new Date());
    setType("expense");
    setCategoryId("");
    setNotes("");
    setAmount(null);
    setIsSplit(false);
    setSplits([]);
    setTags([]);
  };

  // Fetch categories based on the transaction type
  const fetchCategories = useCallback(async () => {
    try {
      const token = localStorage.getItem("access_token");
      const response = await axios.get<Category[]>(
        `${config.apiBaseUrl}/category/list?ignore_group=true`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      setCategories(response.data);
    } catch (error) {
      const axiosError = error as AxiosError<{ detail: string }>;
      toast({
        title: "Error",
        description:
          axiosError.response?.data?.detail || "Failed to fetch categories.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  }, [toast]);

  // Fetch accounts if no accountId is provided (from ledger page)
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
  }, [toast, ledgerId]);

  // Fetch categories when modal is opened
  // Fetch accounts if no accountId is provided
  useEffect(() => {
    if (isOpen) {
      resetForm();
      fetchCategories();
      if (!accountId) {
        fetchAccounts();
      }
    }
  }, [isOpen, accountId, fetchCategories, fetchAccounts]);

  // Handle split transaction toggle
  const handleSplitToggle = (isChecked: boolean) => {
    if (!amount || amount <= 0) {
      toast({
        title: "Error",
        description: "Amount required before enabling split transactions.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setIsSplit(isChecked);

    if (isChecked) {
      // Initialize with the total amount
      setSplits([{ amount: amount, categoryId: "" }]);
    } else {
      // Clear splits when toggle is turned off
      setSplits([]);
    }
  };

  // Calculate remaining amount
  const calculateRemainingAmount = () => {
    const allocatedAmount = roundToTwoDecimals(
      splits.reduce((sum, split) => {
        return roundToTwoDecimals(sum + roundToTwoDecimals(split.amount));
      }, 0),
    );

    return roundToTwoDecimals((amount || 0) - allocatedAmount);
  };

  // Handle form submission
  const handleSubmit = async () => {
    if (categories.length === 0) {
      toast({
        title: "Error",
        description: "No categories found. Please create categories first.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    // Validate all splits have categories if split is enabled
    if (isSplit) {
      const invalidSplits = splits.filter(
        (split) => !split.categoryId && split.amount > 0,
      );
      if (invalidSplits.length > 0) {
        toast({
          title: "Error",
          description: "Please select a category for each split.",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
        return;
      }

      // Check if the total split amount matches the transaction amount
      const totalSplitAmount = splits.reduce(
        (sum, split) => sum + split.amount,
        0,
      );

      if (Math.abs(totalSplitAmount - (amount || 0)) > 0.01) {
        // Allow for small rounding differences
        toast({
          title: "Error",
          description:
            "The sum of split amounts must equal the total transaction amount.",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
        return;
      }
    }

    setIsLoading(true);
    try {
      const token = localStorage.getItem("access_token");

      const payload = {
        account_id: parseInt(accountId || selectedAccountId, 10),
        category_id: parseInt(categoryId, 10),
        type: type,
        date: date.toISOString(),
        notes: notes,
        credit: type === "income" ? amount || 0 : 0,
        debit: type === "expense" ? amount || 0 : 0,
        is_transfer: false,
        transfer_id: null,
        transfer_type: null,
        is_split: isSplit,
        splits: isSplit
          ? splits
              .filter((split) => split.amount > 0)
              .map((split) => ({
                credit: type === "income" ? split.amount : 0,
                debit: type === "expense" ? split.amount : 0,
                category_id: parseInt(split.categoryId, 10),
                notes: split.notes,
              }))
          : [],
        tags: tags.map((tag) => ({ name: tag.name })),
      };

      const endpoint =
        type === "income"
          ? `${config.apiBaseUrl}/ledger/${ledgerId}/transaction/income`
          : `${config.apiBaseUrl}/ledger/${ledgerId}/transaction/expense`;

      await axios.post(endpoint, payload, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      toast({
        title: "Success",
        description: "Transaction added successfully.",
        status: "success",
        duration: 3000,
        isClosable: true,
      });

      onClose();
      onTransactionAdded();
    } catch (error) {
      const axiosError = error as AxiosError<{ detail: string }>;
      toast({
        title: "Error",
        description: axiosError.response?.data?.detail || "Transaction failed",
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
            Add Transaction
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
            {/* Basic Info - First Section */}
            <Box>
              <Tabs
                isFitted
                variant="enclosed"
                colorScheme={buttonColorScheme}
                mb={4}
                index={type === "expense" ? 0 : 1}
              >
                <TabList>
                  <Tab
                    _selected={{
                      color: `${buttonColorScheme}.500`,
                      borderBottomColor: `${buttonColorScheme}.500`,
                      fontWeight: "semibold",
                    }}
                    onClick={() => setType("expense")}
                  >
                    Expense
                  </Tab>
                  <Tab
                    _selected={{
                      color: `${buttonColorScheme}.500`,
                      borderBottomColor: `${buttonColorScheme}.500`,
                      fontWeight: "semibold",
                    }}
                    onClick={() => setType("income")}
                  >
                    Income
                  </Tab>
                </TabList>
              </Tabs>

              <Stack
                direction={{ base: "column", md: "row" }}
                spacing={4}
                mb={4}
              >
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
                    data-testid="createtransactionmodal-date-picker"
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
                      value={amount !== null ? amount.toString() : ""}
                      onChange={(e) => {
                        const value =
                          e.target.value === ""
                            ? null
                            : parseFloat(e.target.value) || 0;
                        setAmount(value);
                      }}
                      placeholder="0.00"
                      borderColor={borderColor}
                      autoFocus
                    />
                  </InputGroup>
                </FormControl>
              </Stack>

              {/* Account Dropdown (only shown if no accountId is provided) */}
              {!accountId && accounts.length > 0 && (
                <FormControl mb={4}>
                  <FormLabel fontSize="sm" fontWeight="medium">
                    Account
                  </FormLabel>
                  <Select
                    borderColor={borderColor}
                    placeholder="Select an account"
                    onChange={(e) => setSelectedAccountId(e.target.value)}
                    data-testid="createtransactionmodal-account-dropdown"
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
              )}

              {/* Notes */}
              <FormNotes
                ledgerId={ledgerId}
                notes={notes}
                setNotes={setNotes}
                isOpen={isOpen}
                borderColor={borderColor}
              />
            </Box>

            {/* Split Toggle */}
            <Box
              p={3}
              borderRadius="md"
              borderWidth="1px"
              borderColor={borderColor}
              bg={useColorModeValue("gray.50", "gray.700")}
            >
              <HStack justifyContent="space-between">
                <Text fontSize="sm" fontWeight="medium">
                  Split Transaction
                </Text>
                <Switch
                  colorScheme={buttonColorScheme}
                  isChecked={isSplit}
                  onChange={(e) => handleSplitToggle(e.target.checked)}
                  isDisabled={!amount} // Disable if amount is not entered
                />
              </HStack>
            </Box>

            {/* Category or Split Transaction Section */}
            {isSplit ? (
              <FormSplits
                splits={splits}
                calculateRemainingAmount={calculateRemainingAmount}
                currencySymbol={currencySymbol}
                amount={amount || 0}
                type={type}
                categories={categories}
                setSplits={setSplits}
                borderColor={borderColor}
                bgColor={bgColor}
                highlightColor={highlightColor}
                buttonColorScheme={buttonColorScheme}
              />
            ) : (
              /* Category Dropdown (when not split) */
              <FormControl>
                <FormLabel fontSize="sm" fontWeight="medium">
                  Category
                </FormLabel>
                <Select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  borderColor={borderColor}
                  placeholder="Select a category"
                  data-testid="createtransactionmodal-category-dropdown"
                >
                  {/* Group for Income Categories */}
                  <optgroup label="Income Categories">
                    {categories
                      .filter((category) => category.type === "income")
                      .map((category) => (
                        <option
                          key={category.category_id}
                          value={category.category_id}
                        >
                          {category.name}
                        </option>
                      ))}
                  </optgroup>
                  {/* Group for Expense Categories */}
                  <optgroup label="Expense Categories">
                    {categories
                      .filter((category) => category.type === "expense")
                      .map((category) => (
                        <option
                          key={category.category_id}
                          value={category.category_id}
                        >
                          {category.name}
                        </option>
                      ))}
                  </optgroup>
                </Select>
              </FormControl>
            )}

            {/* Tags Input */}
            <FormTags
              tags={tags}
              setTags={setTags}
              borderColor={borderColor}
              buttonColorScheme={buttonColorScheme}
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
                (isSplit &&
                  splits.some(
                    (split) => split.amount > 0 && !split.categoryId,
                  )) ||
                (!isSplit &&
                  (!categoryId ||
                    (accountId ? !accountId : !selectedAccountId))) ||
                !amount ||
                (isSplit && calculateRemainingAmount() !== 0) ||
                (isSplit && !accountId && !selectedAccountId)
              }
            >
              Save Transaction
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
              (isSplit &&
                splits.some(
                  (split) => split.amount > 0 && !split.categoryId,
                )) ||
              (!isSplit &&
                (!categoryId ||
                  (accountId ? !accountId : !selectedAccountId))) ||
              !amount ||
              (isSplit && calculateRemainingAmount() !== 0) ||
              (isSplit && !accountId && !selectedAccountId)
            }
          >
            Save Transaction
          </Button>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default CreateTransactionModal;
