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
import FormSplits from "../CreateTransactionModal/FormSplits";
import FormNotes from "@/components/shared/FormNotes";
import FormTags from "@/components/shared/FormTags";
import useLedgerStore from "@/components/shared/store";
import { toastDefaults } from "@/components/shared/utils";

// Define interfaces for the props and state
interface EditTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  transaction: any;
  onTransactionUpdated: () => void;
}

interface Category {
  category_id: string;
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

interface InitialTransactionState {
  date: Date;
  type: "expense" | "income";
  categoryId: string;
  notes: string;
  amount: string;
  isSplit: boolean;
  splits: Split[];
  tags: Tag[];
}

const roundToTwoDecimals = (value: number): number => {
  return Math.round((value + Number.EPSILON) * 100) / 100;
};

const EditTransactionModal: React.FC<EditTransactionModalProps> = ({
  isOpen,
  onClose,
  transaction,
  onTransactionUpdated,
}) => {
  const [date, setDate] = useState<Date>(new Date());
  const [type, setType] = useState<"expense" | "income">("expense");
  const [categoryId, setCategoryId] = useState<string>("");
  const [notes, setNotes] = useState<string>("");
  const [amount, setAmount] = useState<string>("");
  const [isSplit, setIsSplit] = useState<boolean>(false);
  const [splits, setSplits] = useState<Split[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [initialTransactionState, setInitialTransactionState] = useState<InitialTransactionState | null>(null);
  const toast = useToast();

  const { ledgerId, currencySymbol } = useLedgerStore();
  // Theme colors
  const buttonColorScheme = "teal";
  const bgColor = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.600");
  const highlightColor = useColorModeValue("teal.50", "teal.900");

  const fetchSplits = useCallback(async (transactionId: string): Promise<Split[]> => {
    try {
      const token = localStorage.getItem("access_token");
      const response = await axios.get<Split[]>(
        `${config.apiBaseUrl}/ledger/${ledgerId}/transaction/${transactionId}/splits`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      const fetchedSplits = response.data.map(split => ({
        amount: split.debit > 0 ? split.debit : split.credit,
        categoryId: split.category_id.toString(),
        notes: split.notes,
      }));
      setSplits(fetchedSplits);
      return fetchedSplits;
    } catch (error) {
      const axiosError = error as AxiosError<{ detail: string }>;
      toast({
        description:
          axiosError.response?.data?.detail || "Failed to fetch splits.",
        status: "error",
        ...toastDefaults,
      });
      return [];
    }
  }, [ledgerId, toast]);

  useEffect(() => {
    if (isOpen && transaction) {
      const initialType = transaction.credit > 0 ? "income" : "expense";
      const initialAmount = transaction.credit > 0 ? transaction.credit.toString() : transaction.debit.toString();
      const initialDate = new Date(transaction.date);
      const initialNotes = transaction.notes || "";
      const initialTags = transaction.tags || [];
      const initialCategoryId = transaction.category_id ? String(transaction.category_id) : "";
      const initialIsSplit = transaction.is_split;

      setDate(initialDate);
      setNotes(initialNotes);
      setTags(initialTags);
      setType(initialType);
      setCategoryId(initialCategoryId);
      setAmount(initialAmount);
      setIsSplit(initialIsSplit);

      if (initialIsSplit) {
        fetchSplits(transaction.transaction_id).then((fetchedSplits) => {
          setInitialTransactionState({
            date: initialDate,
            type: initialType,
            categoryId: initialCategoryId,
            notes: initialNotes,
            amount: initialAmount,
            isSplit: initialIsSplit,
            splits: fetchedSplits,
            tags: initialTags,
          });
        });
      } else {
        setInitialTransactionState({
          date: initialDate,
          type: initialType,
          categoryId: initialCategoryId,
          notes: initialNotes,
          amount: initialAmount,
          isSplit: initialIsSplit,
          splits: [], // No splits for non-split transactions
          tags: initialTags,
        });
      }
    }
  }, [isOpen, transaction, fetchSplits]);

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
        description:
          axiosError.response?.data?.detail || "Failed to fetch categories.",
        status: "error",
        ...toastDefaults,
      });
    }
  }, [toast]);

  useEffect(() => {
    if (isOpen) {
      fetchCategories();
    }
  }, [isOpen, fetchCategories]);

  // Handle split transaction toggle
  const handleSplitToggle = (isChecked: boolean) => {
    if (!amount || parseFloat(amount) <= 0) {
      toast({
        description: "Amount required before enabling split transactions.",
        status: "error",
        ...toastDefaults,
      });
      return;
    }

    setIsSplit(isChecked);

    if (isChecked) {
      // Initialize with the total amount
      setSplits([{ amount: parseFloat(amount), categoryId: "" }]);
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

    return roundToTwoDecimals((parseFloat(amount) || 0) - allocatedAmount);
  };

  // Handle form submission
  const handleSubmit = async () => {
    if (categories.length === 0) {
      toast({
        description: "No categories found. Please create categories first.",
        status: "error",
        ...toastDefaults,
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
          description: "Please select a category for each split.",
          status: "error",
          ...toastDefaults,
        });
        return;
      }

      // Check if the total split amount matches the transaction amount
      const totalSplitAmount = splits.reduce(
        (sum, split) => sum + split.amount,
        0,
      );

      if (Math.abs(totalSplitAmount - (parseFloat(amount) || 0)) > 0.01) {
        // Allow for small rounding differences
        toast({
          description:
            "The sum of split amounts must equal the total transaction amount.",
          status: "error",
          ...toastDefaults,
        });
        return;
      }
    }

    setIsLoading(true);
    try {
      const token = localStorage.getItem("access_token");
      const payload = {
        category_id: parseInt(categoryId, 10),
        type: type,
        date: date.toISOString(),
        notes: notes,
        credit: type === "income" ? parseFloat(amount) || 0 : 0,
        debit: type === "expense" ? parseFloat(amount) || 0 : 0,
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
      const endpoint = `${config.apiBaseUrl}/ledger/${ledgerId}/transaction/${transaction.transaction_id}`;
      await axios.put(endpoint, payload, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      toast({
        description: "Transaction updated successfully.",
        status: "success",
        ...toastDefaults,
      });

      onClose();
      onTransactionUpdated();
    } catch (error) {
      const axiosError = error as AxiosError<{ detail: string }>;
      toast({
        description: axiosError.response?.data?.detail || "Transaction failed",
        status: "error",
        ...toastDefaults,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const hasFormChanged = useCallback(() => {
    if (!initialTransactionState) return false; // Initially disable save button

    // Compare primitive values
    if (
      date.toISOString() !== initialTransactionState.date.toISOString() ||
      type !== initialTransactionState.type ||
      categoryId !== initialTransactionState.categoryId ||
      notes !== initialTransactionState.notes ||
      parseFloat(amount) !== parseFloat(initialTransactionState.amount) ||
      isSplit !== initialTransactionState.isSplit
    ) {
      return true;
    }

    // Deep compare splits array
    if (splits.length !== initialTransactionState.splits.length) {
      return true;
    }
    for (let i = 0; i < splits.length; i++) {
      if (
        splits[i].amount !== initialTransactionState.splits[i].amount ||
        splits[i].categoryId !== initialTransactionState.splits[i].categoryId ||
        splits[i].notes !== initialTransactionState.splits[i].notes
      ) {
        return true;
      }
    }

    // Deep compare tags array
    if (tags.length !== initialTransactionState.tags.length) {
      return true;
    }
    for (let i = 0; i < tags.length; i++) {
      if (tags[i].name !== initialTransactionState.tags[i].name) {
        return true;
      }
    }

    return false;
  }, [
    date,
    type,
    categoryId,
    notes,
    amount,
    isSplit,
    splits,
    tags,
    initialTransactionState,
  ]);

  const isSaveDisabled =
    isLoading ||
    !hasFormChanged() ||
    (isSplit &&
      (splits.some((split) => split.amount > 0 && !split.categoryId) ||
        calculateRemainingAmount() !== 0)) ||
    (!isSplit && !categoryId) ||
    !amount;

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
            Edit Transaction
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
            <>
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
                      isDisabled={type !== "expense"}
                      _selected={{
                        color: `${buttonColorScheme}.500`,
                        borderBottomColor: `${buttonColorScheme}.500`,
                        fontWeight: "semibold",
                      }}
                    >
                      Expense
                    </Tab>
                    <Tab
                      isDisabled={type !== "income"}
                      _selected={{
                        color: `${buttonColorScheme}.500`,
                        borderBottomColor: `${buttonColorScheme}.500`,
                        fontWeight: "semibold",
                      }}
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
                      data-testid="edittransactionmodal-date-picker"
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

                {/* Notes */}
                <FormNotes
                  ledgerId={ledgerId as string}
                  notes={notes}
                  setNotes={setNotes}
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
                    isDisabled={!amount}
                  />
                </HStack>
              </Box>

              {/* Category or Split Transaction Section */}
              {isSplit ? (
                <FormSplits
                  splits={splits}
                  calculateRemainingAmount={calculateRemainingAmount}
                  currencySymbol={currencySymbol as string}
                  amount={parseFloat(amount) || 0}
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
                    onChange={(e) => setCategoryId(e.target.value || "")}
                    borderColor={borderColor}
                    placeholder="Select a category"
                    data-testid="edittransactionmodal-category-dropdown"
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
            </>
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
              isDisabled={isSaveDisabled}
            >
              Save Changes
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
            isDisabled={isSaveDisabled}
          >
            Save Changes
          </Button>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default EditTransactionModal;