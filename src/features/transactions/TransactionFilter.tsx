import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Button,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  FormControl,
  FormLabel,
  Icon,
  IconButton,
  Select,
  Input,
  Stack,
  Flex,
  Radio,
  RadioGroup,
  Text,
  Badge,
  useDisclosure,
  Grid,
  GridItem,
  Box,
  VStack,
} from "@chakra-ui/react";
import { FiFilter, FiX } from "react-icons/fi";
import FormTags from "@/components/shared/FormTags";
import config from "@/config";
import ChakraDatePicker from "@/components/shared/ChakraDatePicker";

interface Tag {
  name: string;
}

interface Account {
  account_id: string;
  name: string;
  type: string;
}

interface Category {
  category_id: string;
  name: string;
  type: string;
}

interface Filters {
  account_id: string;
  category_id: string;
  tags: Tag[];
  tags_match: "any" | "all";
  search_text: string;
  transaction_type: string;
  from_date: Date | null;
  to_date: Date | null;
}

interface TransactionFilterProps {
  ledgerId: string;
  accountId?: string;
  initialFilters?: Partial<Filters>;
  // eslint-disable-next-line no-unused-vars
  onApplyFilters: (filters: Partial<Filters>) => void;
  currentFilters?: Partial<Filters>;
  onResetFilters?: () => void;
}

const TransactionFilter: React.FC<TransactionFilterProps> = ({
  ledgerId,
  accountId,
  initialFilters = {},
  onApplyFilters,
  currentFilters = {},
  onResetFilters,
}) => {
  const { isOpen, onOpen, onClose } = useDisclosure();

  // State for filter form values
  const [filters, setFilters] = useState<Filters>({
    account_id: "",
    category_id: "",
    tags: [],
    tags_match: "any",
    search_text: "",
    transaction_type: "",
    from_date: null,
    to_date: null,
    ...initialFilters,
  });

  // Track if filters have changed from current applied filters
  const [hasChanged, setHasChanged] = useState(false);

  // Initialize filters when modal opens with current filters
  useEffect(() => {
    if (isOpen) {
      // Normalize tags structure
      let normalizedTags: Tag[] = [];
      if (currentFilters.tags) {
        normalizedTags = Array.isArray(currentFilters.tags)
          ? (currentFilters.tags
              .map((tag) => {
                // Handle both string tags and object tags
                if (typeof tag === "string") {
                  return { name: tag };
                } else if (tag && typeof tag === "object" && tag.name) {
                  return { ...tag };
                }
                return null;
              })
              .filter(Boolean) as Tag[])
          : [];
      }

      // Properly normalize dates and tags from currentFilters
      const normalizedFilters: Filters = {
        account_id: currentFilters.account_id || "",
        category_id: currentFilters.category_id || "",
        tags: normalizedTags,
        tags_match: currentFilters.tags_match || "any",
        search_text: currentFilters.search_text || "",
        transaction_type: currentFilters.transaction_type || "",
        from_date: currentFilters.from_date
          ? new Date(currentFilters.from_date)
          : null,
        to_date: currentFilters.to_date
          ? new Date(currentFilters.to_date)
          : null,
      };

      setFilters(normalizedFilters);
    }
  }, [isOpen, currentFilters]);

  // Fetch accounts for the current ledger
  const { data: accounts = [] } = useQuery<Account[]>({
    queryKey: ["accounts", ledgerId],
    queryFn: async () => {
      const token = localStorage.getItem("access_token");
      const response = await fetch(
        `${config.apiBaseUrl}/ledger/${ledgerId}/accounts?ignore_group=true`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (!response.ok) {
        throw new Error("Failed to fetch accounts");
      }

      const data = await response.json();
      return data;
    },
    enabled: !!ledgerId,
  });

  // Fetch categories
  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ["categories"],
    queryFn: async () => {
      const token = localStorage.getItem("access_token");
      const response = await fetch(
        `${config.apiBaseUrl}/category/list?ignore_group=true`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (!response.ok) {
        throw new Error("Failed to fetch categories");
      }

      const data = await response.json();
      return data;
    },
  });

  // Check if filters have changed when the form is opened or filters change
  useEffect(() => {
    const checkIfChanged = () => {
      // Check account_id
      if (filters.account_id !== (currentFilters.account_id || "")) return true;

      // Check category_id
      if (filters.category_id !== (currentFilters.category_id || ""))
        return true;

      // Check search_text
      if (filters.search_text !== (currentFilters.search_text || ""))
        return true;

      // Check transaction_type
      if (filters.transaction_type !== (currentFilters.transaction_type || ""))
        return true;

      // Check tags_match
      if (filters.tags_match !== (currentFilters.tags_match || "any"))
        return true;

      // Check tags (simple length check first)
      const currentTags = currentFilters.tags || [];
      if (filters.tags.length !== currentTags.length) return true;

      // Check tags (deep comparison)
      // Sort both arrays to ensure consistent comparison
      const tagNames = [...filters.tags].map((t) => t.name).sort();
      const currentTagNames = [...currentTags].map((t) => t.name).sort();
      for (let i = 0; i < tagNames.length; i++) {
        if (tagNames[i] !== currentTagNames[i]) return true;
      }

      // Handle dates with more robust comparison
      // From date
      if (
        (filters.from_date && !currentFilters.from_date) ||
        (!filters.from_date && currentFilters.from_date)
      ) {
        return true;
      }

      // To date
      if (
        (filters.to_date && !currentFilters.to_date) ||
        (!filters.to_date && currentFilters.to_date)
      ) {
        return true;
      }

      // Compare dates if both exist
      if (filters.from_date && currentFilters.from_date) {
        const filterDate = new Date(filters.from_date);
        const currentDate = new Date(currentFilters.from_date);
        if (filterDate.toDateString() !== currentDate.toDateString())
          return true;
      }

      if (filters.to_date && currentFilters.to_date) {
        const filterDate = new Date(filters.to_date);
        const currentDate = new Date(currentFilters.to_date);
        if (filterDate.toDateString() !== currentDate.toDateString())
          return true;
      }

      return false;
    };

    setHasChanged(checkIfChanged());
  }, [filters, currentFilters]);

  // Reset filters to initial state
  const handleResetFilters = () => {
    setFilters({
      account_id: "",
      category_id: "",
      tags: [],
      tags_match: "any",
      search_text: "",
      transaction_type: "",
      from_date: null,
      to_date: null,
    });

    if (onResetFilters) {
      onResetFilters();
    }
  };

  // Apply filters when form is submitted
  const handleApplyFilters = () => {
    // Create a copy of filters, removing empty values
    const cleanedFilters: Partial<Filters> = {};

    Object.entries(filters).forEach(([key, value]) => {
      // Skip empty strings, null, empty arrays
      if (value === "" || value === null) return;
      if (Array.isArray(value) && value.length === 0) return;

      // Handle dates
      if (key === "from_date" || key === "to_date") {
        if (value) {
          // Ensure value is a Date object before formatting
          const dateValue = value instanceof Date ? value : new Date(value);
          // Format date to YYYY-MM-DD format for API
          (cleanedFilters as any)[key] = dateValue.toISOString().split("T")[0];
        }
        return;
      }

      // Handle tags - extract just the tag names for the API
      if (key === "tags" && value.length > 0) {
        // Create a deep copy to avoid modifying the filters state
        cleanedFilters[key] = [...value].map((tag) => tag.name);
        return;
      }

      cleanedFilters[key as keyof Filters] = value;
    });

    onApplyFilters(cleanedFilters);
    onClose();
  };

  // Handle input changes
  const handleInputChange = <K extends keyof Filters>(
    field: K,
    value: Filters[K],
  ) => {
    setFilters((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Calculate active filter count
  const getActiveFilterCount = () => {
    let count = 0;

    if (currentFilters.account_id) count++;
    if (currentFilters.category_id) count++;
    if (currentFilters.tags && currentFilters.tags.length > 0) count++;
    if (currentFilters.search_text) count++;
    if (currentFilters.transaction_type) count++;
    if (currentFilters.from_date) count++;
    if (currentFilters.to_date) count++;

    return count;
  };

  const activeFilterCount = getActiveFilterCount();

  // Responsive design helpers
  const buttonColorScheme = "teal";

  return (
    <>
      <IconButton
        aria-label="Filter transactions"
        icon={
          <>
            <Icon as={FiFilter} />
            {activeFilterCount > 0 && (
              <Badge
                colorScheme="teal"
                borderRadius="full"
                position="absolute"
                top="-1"
                right="-1"
                fontSize="xs"
              >
                {activeFilterCount}
              </Badge>
            )}
          </>
        }
        onClick={onOpen}
        variant="outline"
        size="sm"
        position="relative"
        colorScheme="teal"
      />

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
              <Flex justify="space-between" align="center">
                <Text>Filter Transactions</Text>
                <Button
                  size="xs"
                  onClick={handleResetFilters}
                  leftIcon={<FiX />}
                  variant="ghost"
                  color={{ base: "white", sm: "inherit" }}
                  _hover={{ sm: { bg: "gray.100" } }}
                >
                  Reset All
                </Button>
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
              {/* Account Selection */}
              {!accountId && (
                <FormControl>
                  <FormLabel fontSize="sm" fontWeight="medium">
                    Account
                  </FormLabel>
                  <Select
                    placeholder="All Accounts"
                    value={filters.account_id}
                    onChange={(e) =>
                      handleInputChange("account_id", e.target.value)
                    }
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

              {/* Category Selection */}
              <FormControl>
                <FormLabel fontSize="sm" fontWeight="medium">
                  Category
                </FormLabel>
                <Select
                  placeholder="All Categories"
                  value={filters.category_id}
                  onChange={(e) =>
                    handleInputChange("category_id", e.target.value)
                  }
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

              {/* Tags Selection */}
              <FormTags
                tags={filters.tags}
                setTags={(tags) => handleInputChange("tags", tags)}
                borderColor="gray.300"
                buttonColorScheme={buttonColorScheme}
              />

              {/* Tags Match Type */}
              <FormControl>
                <FormLabel fontSize="sm" fontWeight="medium">
                  Tags Match
                </FormLabel>
                <RadioGroup
                  value={filters.tags_match}
                  onChange={(value) =>
                    handleInputChange("tags_match", value as "any" | "all")
                  }
                >
                  <Stack direction="row">
                    <Radio value="any" colorScheme="teal">
                      Match Any Tag
                    </Radio>
                    <Radio value="all" colorScheme="teal">
                      Match All Tags
                    </Radio>
                  </Stack>
                </RadioGroup>
              </FormControl>

              {/* Search Text */}
              <FormControl>
                <FormLabel fontSize="sm" fontWeight="medium">
                  Search Notes
                </FormLabel>
                <Input
                  placeholder="Search in transaction notes"
                  value={filters.search_text}
                  onChange={(e) =>
                    handleInputChange("search_text", e.target.value)
                  }
                />
              </FormControl>

              {/* Transaction Type */}
              <FormControl>
                <FormLabel fontSize="sm" fontWeight="medium">
                  Transaction Type
                </FormLabel>
                <RadioGroup
                  value={filters.transaction_type}
                  onChange={(value) =>
                    handleInputChange("transaction_type", value)
                  }
                >
                  <Stack direction="row">
                    <Radio value="" colorScheme="teal">
                      All
                    </Radio>
                    <Radio value="income" colorScheme="teal">
                      Income
                    </Radio>
                    <Radio value="expense" colorScheme="teal">
                      Expense
                    </Radio>
                  </Stack>
                </RadioGroup>
              </FormControl>

              {/* Date Range */}
              <Grid templateColumns="repeat(2, 1fr)" gap={4}>
                <GridItem>
                  <FormControl>
                    <FormLabel fontSize="sm" fontWeight="medium">
                      From Date
                    </FormLabel>
                    <ChakraDatePicker
                      selected={filters.from_date}
                      onChange={(date) => handleInputChange("from_date", date)}
                      shouldCloseOnSelect={true}
                      placeholderText="From"
                    />
                  </FormControl>
                </GridItem>
                <GridItem>
                  <FormControl>
                    <FormLabel fontSize="sm" fontWeight="medium">
                      To Date
                    </FormLabel>
                    <ChakraDatePicker
                      selected={filters.to_date}
                      onChange={(date) => handleInputChange("to_date", date)}
                      shouldCloseOnSelect={true}
                      placeholderText="To"
                      minDate={filters.from_date}
                    />
                  </FormControl>
                </GridItem>
              </Grid>
            </VStack>

            {/* Mobile-only action buttons that stay at bottom */}
            <Box display={{ base: "block", sm: "none" }} mt={6}>
              <Button
                onClick={handleApplyFilters}
                colorScheme={buttonColorScheme}
                size="lg"
                width="100%"
                mb={3}
                isDisabled={!hasChanged}
              >
                Apply Filters
              </Button>
              <Button
                variant="outline"
                onClick={onClose}
                size="lg"
                width="100%"
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
              onClick={handleApplyFilters}
              isDisabled={!hasChanged}
            >
              Apply Filters
            </Button>
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default TransactionFilter;
