import React, { useCallback, useEffect } from "react";
import { AddIcon } from "@chakra-ui/icons";
import {
  Box,
  Divider,
  Flex,
  VStack,
  Text,
  FormControl,
  FormLabel,
  InputGroup,
  InputLeftAddon,
  Input,
  HStack,
  Select,
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
  notes?: string;
}

interface FormSplitsProps {
  splits: Split[];
  calculateRemainingAmount: () => number;
  currencySymbol: string;
  amount: number | string;
  type: "income" | "expense";
  categories: Category[];
  // eslint-disable-next-line no-unused-vars
  setSplits: (splits: Split[]) => void;
  borderColor: string;
  bgColor: string;
  highlightColor: string;
  buttonColorScheme: string;
}

// Helper function to round to 2 decimal places for financial calculations
const roundToTwoDecimals = (value: number): number => {
  return Math.round((value + Number.EPSILON) * 100) / 100;
};

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

    // Round to ensure we have a clean 2-decimal value
    const roundedAmount = roundToTwoDecimals(currentAmount);

    if (splits.length === 0) {
      setSplits([{ amount: roundedAmount, categoryId: "" }]);
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
    // Round the input value to 2 decimal places
    const roundedValue = roundToTwoDecimals(value);

    newSplits[index] = {
      ...newSplits[index],
      amount: roundedValue,
    };

    const totalAllocated = roundToTwoDecimals(
      newSplits.reduce((sum, split, i) => {
        return roundToTwoDecimals(
          sum +
            (i !== newSplits.length - 1 || i === index
              ? roundToTwoDecimals(parseFloat(split.amount.toString()) || 0)
              : 0),
        );
      }, 0),
    );

    const totalAmount = roundToTwoDecimals(
      typeof amount === "string" ? parseFloat(amount) : amount || 0,
    );

    // Calculate remaining amount with proper rounding
    const remaining = roundToTwoDecimals(totalAmount - totalAllocated);

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
      roundToTwoDecimals(parseFloat(newSplits[i].amount.toString()) || 0) ===
        0 &&
      i !== index
    ) {
      newSplits.pop();
      i--;
    }

    setSplits(newSplits);
  };

  // Add a new split
  const addSplit = (): void => {
    const remaining = roundToTwoDecimals(calculateRemainingAmount());
    if (remaining <= 0) {
      // If no remaining amount, add a zero split
      setSplits([...splits, { amount: 0, categoryId: "", notes: "" }]);
    } else {
      // Otherwise, add a split with the remaining amount
      setSplits([...splits, { amount: remaining, categoryId: "", notes: "" }]);
    }
  };

  // Remove a split
  const removeSplit = (index: number): void => {
    if (splits.length <= 1) {
      return; // Keep at least one split
    }

    const newSplits = [...splits];
    const removedAmount = roundToTwoDecimals(
      parseFloat(newSplits[index].amount.toString()) || 0,
    );
    newSplits.splice(index, 1);

    // Distribute the removed amount to the last split
    if (newSplits.length > 0 && removedAmount > 0) {
      const lastIndex = newSplits.length - 1;
      const currentLastAmount = roundToTwoDecimals(
        parseFloat(newSplits[lastIndex].amount.toString()) || 0,
      );
      newSplits[lastIndex].amount = roundToTwoDecimals(
        currentLastAmount + removedAmount,
      );
    }

    setSplits(newSplits);
  };

  // Function to check if we're within a very small tolerance for display purposes
  const isEffectivelyEqual = (a: number, b: number): boolean => {
    return Math.abs(a - b) < 0.01;
  };

  // Modified calculation function for UI display
  const displayRemainingAmount = (): number => {
    const rawRemaining = calculateRemainingAmount();
    return isEffectivelyEqual(rawRemaining, 0)
      ? 0
      : roundToTwoDecimals(rawRemaining);
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
            <VStack spacing={3} align="stretch">
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
                    step="0.01"
                  />
                </InputGroup>
              </FormControl>
              <FormControl flex="1">
                <FormLabel fontSize="sm">Category</FormLabel>
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
              </FormControl>
              <FormControl flex="1">
                <FormLabel fontSize="sm">Notes</FormLabel>
                <Input
                  type="text"
                  value={split.notes || ""}
                  onChange={(e) => {
                    const newSplits = [...splits];
                    newSplits[index].notes = e.target.value;
                    setSplits(newSplits);
                  }}
                  placeholder="Optional notes"
                  borderColor={borderColor}
                />
              </FormControl>
              {splits.length > 1 && (
                <Text
                  fontSize="sm"
                  color="red.500"
                  cursor="pointer"
                  onClick={() => removeSplit(index)}
                  textDecoration="underline"
                >
                  Remove Split
                </Text>
              )}
            </VStack>
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
            displayRemainingAmount() <= 0 &&
            splits.some(
              (split) =>
                roundToTwoDecimals(parseFloat(split.amount.toString())) === 0,
            )
          }
        >
          Add Split
        </Button>

        {/* Display total allocated and remaining amount */}
        <HStack justifyContent="space-between" pt={2}>
          <Text fontSize="sm">
            Total: {currencySymbol}
            {roundToTwoDecimals(
              typeof amount === "string"
                ? parseFloat(amount) || 0
                : amount || 0,
            ).toFixed(2)}
          </Text>
          {!isEffectivelyEqual(calculateRemainingAmount(), 0) && (
            <Text
              fontSize="sm"
              color={calculateRemainingAmount() < 0 ? "red.500" : "orange.500"}
              fontWeight="medium"
            >
              {calculateRemainingAmount() < 0
                ? `Over-allocated by ${currencySymbol}${Math.abs(roundToTwoDecimals(calculateRemainingAmount())).toFixed(2)}`
                : `${currencySymbol}${roundToTwoDecimals(calculateRemainingAmount()).toFixed(2)} unallocated`}
            </Text>
          )}
        </HStack>
      </VStack>
    </Box>
  );
};

export default FormSplits;
