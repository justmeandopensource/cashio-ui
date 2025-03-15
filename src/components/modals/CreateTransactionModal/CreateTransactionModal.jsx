import { useState, useEffect } from "react";
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
  useBreakpointValue,
  InputGroup,
  InputLeftAddon,
  Stack,
} from "@chakra-ui/react";
import axios from "axios";
import config from "@/config";
import ChakraDatePicker from "@components/shared/ChakraDatePicker";
import FormSplits from "./FormSplits";
import FormNotes from "./FormNotes";
import FormTags from "./FormTags";

const CreateTransactionModal = ({
  isOpen,
  onClose,
  accountId,
  ledgerId,
  currencySymbol,
  onTransactionAdded,
}) => {
  const [date, setDate] = useState(new Date());
  const [type, setType] = useState("expense");
  const [categoryId, setCategoryId] = useState("");
  const [notes, setNotes] = useState("");
  const [amount, setAmount] = useState("");
  const [selectedAccountId, setSelectedAccountId] = useState("");
  const [isSplit, setIsSplit] = useState(false);
  const [splits, setSplits] = useState([]);
  const [categories, setCategories] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [tags, setTags] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const toast = useToast();

  // Responsive design helpers
  const modalSize = useBreakpointValue({ base: "full", md: "md" });
  const stackDirection = useBreakpointValue({ base: "column", md: "row" });

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
    setAmount("");
    setIsSplit(false);
    setSplits([]);
    setTags([]);
  };

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
  }, [isOpen, accountId]);

  // Fetch categories based on the transaction type
  const fetchCategories = async () => {
    try {
      const token = localStorage.getItem("access_token");
      const response = await axios.get(
        `${config.apiBaseUrl}/category/list?ignore_group=true`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      setCategories(response.data);
    } catch (error) {
      console.error("Error fetching categories:", error);
      toast({
        title: "Error",
        description:
          error.response?.data?.detail || "Failed to fetch categories.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  // Fetch accounts if no accountId is provided (from ledger page)
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
        description:
          error.response?.data?.detail || "Failed to fetch accounts.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  // Handle split transaction toggle
  const handleSplitToggle = (isChecked) => {
    const currentAmount = parseFloat(amount) || 0;

    if (currentAmount <= 0) {
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
      setSplits([{ amount: currentAmount, categoryId: "" }]);
    } else {
      // Clear splits when toggle is turned off
      setSplits([]);
    }
  };

  // Calculate remaining amount
  const calculateRemainingAmount = () => {
    const totalAmount = parseFloat(amount) || 0;
    const allocatedAmount = splits.reduce((sum, split) => {
      return sum + (parseFloat(split.amount) || 0);
    }, 0);

    return totalAmount - allocatedAmount;
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
        (split) => !split.categoryId && parseFloat(split.amount) > 0,
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
        (sum, split) => sum + (parseFloat(split.amount) || 0),
        0,
      );
      const totalAmount = parseFloat(amount) || 0;

      if (Math.abs(totalSplitAmount - totalAmount) > 0.01) {
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
      const parsedAmount = parseFloat(amount) || 0;

      const payload = {
        account_id: parseInt(accountId || selectedAccountId, 10),
        category_id: parseInt(categoryId, 10),
        type: type,
        date: date.toISOString(),
        notes: notes,
        credit: type === "income" ? parsedAmount : 0,
        debit: type === "expense" ? parsedAmount : 0,
        is_transfer: false,
        transfer_id: null,
        transfer_type: null,
        is_split: isSplit,
        splits: isSplit
          ? splits
              .filter((split) => parseFloat(split.amount) > 0)
              .map((split) => ({
                credit: type === "income" ? parseFloat(split.amount) || 0 : 0,
                debit: type === "expense" ? parseFloat(split.amount) || 0 : 0,
                category_id: parseInt(split.categoryId, 10),
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
      console.error("Error adding transaction:", error);
      toast({
        title: "Error",
        description: error.response?.data?.detail || "Transaction failed",
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
            Add Transaction
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
            {/* Basic Info - First Section */}
            <Box>
              <Tabs
                isFitted
                variant="enclosed"
                colorScheme={buttonColorScheme}
                mb={4}
              >
                <TabList>
                  <Tab
                    _selected={{
                      color: `${buttonColorScheme}.500`,
                      borderBottomColor: `${buttonColorScheme}.500`,
                      fontWeight: "semibold",
                    }}
                    onClick={() => setType("expense")}
                    isSelected={type === "expense"}
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
                    isSelected={type === "income"}
                  >
                    Income
                  </Tab>
                </TabList>
              </Tabs>

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
                      onChange={(e) => {
                        const value = e.target.value;
                        setAmount(value);
                      }}
                      placeholder="0.00"
                      borderColor={borderColor}
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
                amount={amount}
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
                >
                  {/* Filter categories based on transaction type */}
                  {categories
                    .filter((category) => category.type === type)
                    .map((category) => (
                      <option
                        key={category.category_id}
                        value={category.category_id}
                      >
                        {category.name}
                      </option>
                    ))}
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
                    (split) =>
                      parseFloat(split.amount) > 0 && !split.categoryId,
                  )) ||
                (!isSplit && !categoryId) ||
                !amount ||
                (isSplit && calculateRemainingAmount() !== 0)
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
                  (split) => parseFloat(split.amount) > 0 && !split.categoryId,
                )) ||
              (!isSplit && !categoryId) ||
              !amount ||
              (isSplit && calculateRemainingAmount() !== 0)
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
