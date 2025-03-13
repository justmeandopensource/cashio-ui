import { useState, useEffect, useCallback } from "react";
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
  Tag,
  TagLabel,
  TagCloseButton,
  Flex,
  Wrap,
  WrapItem,
  Tabs,
  TabList,
  Tab,
  useColorModeValue,
  IconButton,
  Divider,
  useBreakpointValue,
  InputGroup,
  InputLeftAddon,
  Stack,
} from "@chakra-ui/react";
import { AddIcon, MinusIcon } from "@chakra-ui/icons";
import axios from "axios";
import config from "@/config";
import ChakraDatePicker from "@components/shared/ChakraDatePicker";

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
  const [isSplit, setIsSplit] = useState(false);
  const [splits, setSplits] = useState([]);
  const [categories, setCategories] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState("");
  const [tagSuggestions, setTagSuggestions] = useState([]);
  const [noteSuggestions, setNoteSuggestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const toast = useToast();

  // Responsive design helpers
  const modalSize = useBreakpointValue({ base: "full", md: "md" });
  const stackDirection = useBreakpointValue({ base: "column", md: "row" });
  const buttonSize = useBreakpointValue({ base: "md", md: "md" });
  const splitLayoutDirection = useBreakpointValue({
    base: "column",
    md: "row",
  });

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

  // Fetch tag suggestions as the user types
  useEffect(() => {
    if (tagInput.length > 0) {
      fetchTagSuggestions(tagInput);
    } else {
      setTagSuggestions([]);
    }
  }, [tagInput]);

  // Fetch tag suggestions from the backend
  const fetchTagSuggestions = async (query) => {
    try {
      const token = localStorage.getItem("access_token");
      const response = await axios.get(
        `${config.apiBaseUrl}/tags/search?query=${query}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      setTagSuggestions(response.data);
    } catch (error) {
      console.error("Error fetching tag suggestions:", error);
      toast({
        title: "Error",
        description:
          error.response?.data?.detail || "Failed to fetch tag suggestions.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  // Add a tag to the selected tags list
  const addTag = (tag) => {
    if (!tags.some((t) => t.tag_id === tag.tag_id)) {
      setTags([...tags, tag]);
      setTagInput("");
      setTagSuggestions([]);
    }
  };

  // Remove a tag from the selected tags list
  const removeTag = (tagName) => {
    setTags((prevTags) => prevTags.filter((tag) => tag.name !== tagName));
  };

  // Handle Enter key press in the tags input field
  const handleTagInputKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const newTagName = tagInput.trim();

      if (newTagName) {
        // Check if the tag already exists in the selected tags
        const isTagAlreadyAdded = tags.some(
          (tag) => tag.name.toLowerCase() === newTagName.toLowerCase(),
        );

        if (!isTagAlreadyAdded) {
          // Add the new tag to the selected tags
          const newTag = { name: newTagName };
          setTags((prevTags) => [...prevTags, newTag]);
          setTagInput("");
          setTagSuggestions([]);
        }
      }
    }
  };

  const debounce = (func, delay) => {
    let timeoutId;
    return function (...args) {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      timeoutId = setTimeout(() => {
        func.apply(this, args);
      }, delay);
    };
  };

  // Fetch note suggestions with debouncing
  const fetchNoteSuggestions = useCallback(
    debounce(async (search_text) => {
      if (search_text.length >= 3) {
        try {
          const token = localStorage.getItem("access_token");
          const response = await axios.get(
            `${config.apiBaseUrl}/ledger/${ledgerId}/transaction/notes/suggestions`,
            {
              params: { search_text: search_text },
              headers: {
                Authorization: `Bearer ${token}`,
              },
            },
          );
          setNoteSuggestions(response.data);
        } catch (error) {
          console.error("Error fetching note suggestions:", error);
          toast({
            title: "Error",
            description:
              error.response?.data?.detail ||
              "Failed to fetch note suggestions.",
            status: "error",
            duration: 3000,
            isClosable: true,
          });
        }
      } else {
        setNoteSuggestions([]);
      }
    }, 500),
    [ledgerId, toast],
  );

  useEffect(() => {
    if (!isOpen) {
      setNoteSuggestions([]);
    }
  }, [isOpen]);

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

  // Recalculate splits when amount changes
  useEffect(() => {
    if (isSplit && amount > 0) {
      updateSplitsBasedOnAmount();
    }
  }, [amount, isSplit]);

  // Update splits based on the current amount
  const updateSplitsBasedOnAmount = () => {
    const currentAmount = parseFloat(amount) || 0;

    if (splits.length === 0) {
      // Initialize with first split
      setSplits([{ amount: currentAmount, categoryId: "" }]);
      return;
    }
  };

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

  // Handle split amount change
  const handleSplitAmountChange = (index, inputValue) => {
    // Make a copy of the current splits
    const newSplits = [...splits];

    // Convert input to number or use 0 if empty
    const value = inputValue === "" ? 0 : parseFloat(inputValue);

    // Update the split amount
    newSplits[index] = {
      ...newSplits[index],
      amount: value,
    };

    // Calculate total of all splits excluding the last one if it's empty/new
    const totalAllocated = newSplits.reduce((sum, split, i) => {
      // Only count this split if it's not the one we're currently analyzing as the "last"
      return (
        sum +
        (i !== newSplits.length - 1 || i === index
          ? parseFloat(split.amount) || 0
          : 0)
      );
    }, 0);

    const totalAmount = parseFloat(amount) || 0;
    const remaining = totalAmount - totalAllocated;

    // If we're editing the last split, don't adjust it
    if (index < newSplits.length - 1) {
      // We're editing a split that's not the last one, so adjust the last one
      if (newSplits.length > 1) {
        newSplits[newSplits.length - 1].amount = remaining > 0 ? remaining : 0;
      }
    } else if (remaining > 0) {
      // We're editing the last split and there's still remaining amount
      // Add a new split with the remaining amount
      newSplits.push({ amount: remaining, categoryId: "" });
    }

    // Clean up: remove any zero-amount splits at the end, except keep at least one split
    let i = newSplits.length - 1;
    while (
      i > 0 &&
      (parseFloat(newSplits[i].amount) || 0) === 0 &&
      i !== index
    ) {
      newSplits.pop();
      i--;
    }

    setSplits(newSplits);
  };

  // Add a new split
  const addSplit = () => {
    const remaining = calculateRemainingAmount();
    if (remaining <= 0) {
      // If no remaining amount, add a zero split
      setSplits([...splits, { amount: 0, categoryId: "" }]);
    } else {
      // Otherwise, add a split with the remaining amount
      setSplits([...splits, { amount: remaining, categoryId: "" }]);
    }
  };

  // Remove a split
  const removeSplit = (index) => {
    if (splits.length <= 1) {
      return; // Keep at least one split
    }

    const newSplits = [...splits];
    const removedAmount = parseFloat(newSplits[index].amount) || 0;
    newSplits.splice(index, 1);

    // Distribute the removed amount to the last split
    if (newSplits.length > 0 && removedAmount > 0) {
      const lastIndex = newSplits.length - 1;
      newSplits[lastIndex].amount =
        (parseFloat(newSplits[lastIndex].amount) || 0) + removedAmount;
    }

    setSplits(newSplits);
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
        account_id: parseInt(
          accountId || (accounts.length > 0 ? accounts[0].account_id : ""),
          10,
        ),
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
            Add Transaction
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
          overflowY="auto"
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
              <FormControl mb={4}>
                <FormLabel fontSize="sm" fontWeight="medium">
                  Notes
                </FormLabel>
                <Input
                  value={notes}
                  onChange={(e) => {
                    setNotes(e.target.value);
                    fetchNoteSuggestions(e.target.value);
                  }}
                  onBlur={() => setNoteSuggestions([])}
                  placeholder="Description (optional)"
                  borderColor={borderColor}
                />
                {/* Display note suggestions */}
                {noteSuggestions.length > 0 && (
                  <Box
                    mt={2}
                    borderWidth="1px"
                    borderRadius="md"
                    borderColor={borderColor}
                    p={2}
                    bg={useColorModeValue("gray.50", "gray.700")}
                    maxH="150px"
                    overflowY="auto"
                    position="relative"
                    zIndex={10}
                    pointerEvents="auto"
                    tabIndex="-1"
                  >
                    {noteSuggestions.map((note, index) => (
                      <Box
                        key={index}
                        p={2}
                        cursor="pointer"
                        borderRadius="md"
                        _hover={{
                          bg: useColorModeValue("gray.100", "gray.600"),
                        }}
                        tabIndex="-1"
                        onMouseDown={(e) => {
                          e.preventDefault();
                          setNotes(note);
                          setNoteSuggestions([]);
                        }}
                      >
                        {note}
                      </Box>
                    ))}
                  </Box>
                )}
              </FormControl>
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
              <Box
                borderWidth="1px"
                borderRadius="md"
                borderColor={borderColor}
                p={4}
                bg={highlightColor}
              >
                <VStack spacing={4} align="stretch">
                  <Flex justifyContent="space-between" alignItems="center">
                    <Text fontWeight="medium">Split Details</Text>
                  </Flex>

                  <Divider />

                  {splits.map((split, index) => (
                    <Box
                      key={index}
                      p={3}
                      borderWidth="1px"
                      borderRadius="md"
                      borderColor={borderColor}
                      bg={bgColor}
                    >
                      <Stack direction={splitLayoutDirection} spacing={3}>
                        <FormControl flex="1">
                          <FormLabel fontSize="sm">Amount</FormLabel>
                          <InputGroup size="sm">
                            <InputLeftAddon>{currencySymbol}</InputLeftAddon>
                            <Input
                              type="number"
                              value={split.amount || ""}
                              onChange={(e) => {
                                handleSplitAmountChange(index, e.target.value);
                              }}
                              placeholder="0.00"
                              borderColor={borderColor}
                            />
                          </InputGroup>
                        </FormControl>
                        <FormControl flex="1">
                          <FormLabel fontSize="sm">Category</FormLabel>
                          <HStack spacing={1}>
                            <Select
                              size="sm"
                              value={split.categoryId}
                              onChange={(e) => {
                                const newSplits = [...splits];
                                newSplits[index].categoryId = e.target.value;
                                setSplits(newSplits);
                              }}
                              borderColor={borderColor}
                            >
                              <option value="">Select category</option>
                              {/* Filter categories based on transaction type */}
                              <optgroup
                                label={
                                  type === "income"
                                    ? "Income Categories"
                                    : "Expense Categories"
                                }
                              >
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
                              </optgroup>
                            </Select>

                            <IconButton
                              aria-label="Remove split"
                              icon={<MinusIcon />}
                              size="sm"
                              variant="ghost"
                              colorScheme="red"
                              isDisabled={splits.length <= 1}
                              onClick={() => removeSplit(index)}
                            />
                          </HStack>
                        </FormControl>
                      </Stack>
                    </Box>
                  ))}

                  {/* Add Split Button */}
                  <Button
                    leftIcon={<AddIcon />}
                    variant="outline"
                    size="sm"
                    onClick={addSplit}
                    alignSelf="flex-start"
                    colorScheme={buttonColorScheme}
                    isDisabled={
                      calculateRemainingAmount() <= 0 &&
                      splits.some((split) => parseFloat(split.amount) === 0)
                    }
                  >
                    Add Split
                  </Button>

                  {/* Display total allocated and remaining amount */}
                  <HStack justifyContent="space-between" pt={2}>
                    <Text fontSize="sm">
                      Total: {currencySymbol}
                      {parseFloat(amount) || 0}
                    </Text>
                    {calculateRemainingAmount() !== 0 && (
                      <Text
                        fontSize="sm"
                        color={
                          calculateRemainingAmount() < 0
                            ? "red.500"
                            : "orange.500"
                        }
                        fontWeight="medium"
                      >
                        {calculateRemainingAmount() < 0
                          ? `Over-allocated by ${currencySymbol}${Math.abs(calculateRemainingAmount()).toFixed(2)}`
                          : `${currencySymbol}${calculateRemainingAmount().toFixed(2)} unallocated`}
                      </Text>
                    )}
                  </HStack>
                </VStack>
              </Box>
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
            <FormControl>
              <FormLabel fontSize="sm" fontWeight="medium">
                Tags
              </FormLabel>
              <Box>
                {/* Display selected tags as chips */}
                <Wrap spacing={2} mb={2}>
                  {tags.map((tag) => (
                    <WrapItem key={tag.name}>
                      <Tag
                        size="sm"
                        borderRadius="full"
                        variant="solid"
                        colorScheme={buttonColorScheme}
                      >
                        <TagLabel>{tag.name}</TagLabel>
                        <TagCloseButton onClick={() => removeTag(tag.name)} />
                      </Tag>
                    </WrapItem>
                  ))}
                </Wrap>

                {/* Tag input with suggestions */}
                <Input
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={handleTagInputKeyDown}
                  placeholder="Add tags (press Enter)"
                  borderColor={borderColor}
                  size="md"
                />

                {/* Display tag suggestions */}
                {tagSuggestions.length > 0 && (
                  <Box
                    mt={2}
                    borderWidth="1px"
                    borderRadius="md"
                    borderColor={borderColor}
                    p={2}
                    bg={useColorModeValue("gray.50", "gray.700")}
                    maxH="150px"
                    overflowY="auto"
                    position="relative"
                    zIndex={10}
                  >
                    {tagSuggestions.map((tag) => (
                      <Box
                        key={tag.tag_id}
                        p={2}
                        cursor="pointer"
                        borderRadius="md"
                        _hover={{
                          bg: useColorModeValue("gray.100", "gray.600"),
                        }}
                        onClick={() => {
                          addTag(tag);
                          setTagInput("");
                          setTagSuggestions([]);
                        }}
                      >
                        {tag.name}
                      </Box>
                    ))}
                  </Box>
                )}
              </Box>
            </FormControl>
          </VStack>
        </ModalBody>

        <ModalFooter
          flexDirection={{ base: "column", sm: "row" }}
          p={4}
          gap={2}
          borderTopWidth="1px"
          borderColor={borderColor}
          bg={useColorModeValue("gray.50", "gray.700")}
        >
          <Button
            colorScheme={buttonColorScheme}
            size={buttonSize}
            w={{ base: "full", sm: "auto" }}
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
          <Button
            variant="outline"
            size={buttonSize}
            w={{ base: "full", sm: "auto" }}
            onClick={onClose}
          >
            Cancel
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default CreateTransactionModal;
