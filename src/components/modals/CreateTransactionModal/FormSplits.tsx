import React, { useCallback, useEffect } from "react";
import { AddIcon, MinusIcon } from "@chakra-ui/icons";
import {
  Box,
  Divider,
  Flex,
  VStack,
  Text,
  Stack,
  FormControl,
  FormLabel,
  InputGroup,
  InputLeftAddon,
  Input,
  HStack,
  Select,
  IconButton,
  Button,
} from "@chakra-ui/react";

// Define the interfaces for our props and data structures
interface Category {
  category_id: string;
  name: string;
  type: string;
}

interface Split {
  amount: number;
  categoryId: string;
}

interface FormSplitsProps {
  splits: Split[];
  calculateRemainingAmount: () => number;
  currencySymbol: string;
  amount: number | string;
  type: "income" | "expense";
  categories: Category[];
  // eslint-disable-next-line no-unused-vars
  setSplits: (slits: Split[]) => void;
  borderColor: string;
  bgColor: string;
  highlightColor: string;
  buttonColorScheme: string;
}

const FormSplits: React.FC<FormSplitsProps> = ({
  splits,
  calculateRemainingAmount,
  currencySymbol,
  amount,
  type,
  categories,
  setSplits,
  borderColor,
  bgColor,
  highlightColor,
  buttonColorScheme,
}) => {
  // Update splits based on the current amount
  const updateSplitsBasedOnAmount = useCallback((): void => {
    const currentAmount =
      typeof amount === "string" ? parseFloat(amount) : amount || 0;

    if (splits.length === 0) {
      setSplits([{ amount: currentAmount, categoryId: "" }]);
      return;
    }
  }, [amount, splits, setSplits]);

  // Recalculate splits when amount changes
  useEffect(() => {
    const amountNum = typeof amount === "string" ? parseFloat(amount) : amount;
    if (amountNum > 0) {
      updateSplitsBasedOnAmount();
    }
  }, [amount, updateSplitsBasedOnAmount]);

  // Handle split amount change
  const handleSplitAmountChange = (index: number, inputValue: string): void => {
    const newSplits: Split[] = [...splits];

    const value = inputValue === "" ? 0 : parseFloat(inputValue);

    newSplits[index] = {
      ...newSplits[index],
      amount: value,
    };

    const totalAllocated = newSplits.reduce((sum, split, i) => {
      return (
        sum +
        (i !== newSplits.length - 1 || i === index
          ? parseFloat(split.amount.toString()) || 0
          : 0)
      );
    }, 0);

    const totalAmount =
      typeof amount === "string" ? parseFloat(amount) : amount || 0;
    const remaining = totalAmount - totalAllocated;

    if (index < newSplits.length - 1) {
      if (newSplits.length > 1) {
        newSplits[newSplits.length - 1].amount = remaining > 0 ? remaining : 0;
      }
    } else if (remaining > 0) {
      newSplits.push({ amount: remaining, categoryId: "" });
    }

    let i = newSplits.length - 1;
    while (
      i > 0 &&
      (parseFloat(newSplits[i].amount.toString()) || 0) === 0 &&
      i !== index
    ) {
      newSplits.pop();
      i--;
    }

    setSplits(newSplits);
  };

  // Add a new split
  const addSplit = (): void => {
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
  const removeSplit = (index: number): void => {
    if (splits.length <= 1) {
      return; // Keep at least one split
    }

    const newSplits = [...splits];
    const removedAmount = parseFloat(newSplits[index].amount.toString()) || 0;
    newSplits.splice(index, 1);

    // Distribute the removed amount to the last split
    if (newSplits.length > 0 && removedAmount > 0) {
      const lastIndex = newSplits.length - 1;
      newSplits[lastIndex].amount =
        (parseFloat(newSplits[lastIndex].amount.toString()) || 0) +
        removedAmount;
    }

    setSplits(newSplits);
  };

  return (
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
            <Stack direction={{ base: "column", md: "row" }} spacing={3}>
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
            splits.some((split) => parseFloat(split.amount.toString()) === 0)
          }
        >
          Add Split
        </Button>

        {/* Display total allocated and remaining amount */}
        <HStack justifyContent="space-between" pt={2}>
          <Text fontSize="sm">
            Total: {currencySymbol}
            {typeof amount === "string" ? parseFloat(amount) || 0 : amount || 0}
          </Text>
          {calculateRemainingAmount() !== 0 && (
            <Text
              fontSize="sm"
              color={calculateRemainingAmount() < 0 ? "red.500" : "orange.500"}
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
  );
};

export default FormSplits;
