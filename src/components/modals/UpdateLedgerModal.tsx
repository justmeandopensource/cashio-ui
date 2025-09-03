import React, { useState } from "react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  VStack,
  Input,
  Button,
  useToast,
  FormControl,
  FormLabel,
  FormHelperText,
  Select,
  useColorModeValue,
  Box,
  Flex,
} from "@chakra-ui/react";
import { Edit, Check, X } from "lucide-react";
import { AxiosError } from "axios";
import api from "@/lib/api";
import useLedgerStore from "@/components/shared/store";
import { toastDefaults } from "../shared/utils";

interface Currency {
  symbol: string;
  name: string;
}

const currencies: Currency[] = [
  { symbol: "£", name: "British Pound" },
  { symbol: "₹", name: "Indian Rupee" },
  { symbol: "$", name: "US Dollar" },
  // Add more common currencies as needed
];

interface UpdateLedgerModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentLedgerName: string;
  currentCurrencySymbol: string;
  onUpdateCompleted: (updatedName: string, updatedCurrencySymbol: string) => void;
}

interface UpdateLedgerPayload {
  name?: string;
  currency_symbol?: string;
}

const UpdateLedgerModal: React.FC<UpdateLedgerModalProps> = ({
  isOpen,
  onClose,
  currentLedgerName,
  currentCurrencySymbol,
  onUpdateCompleted,
}) => {
  const [ledgerName, setLedgerName] = useState<string>(currentLedgerName);
  const [selectedCurrency, setSelectedCurrency] = useState<string>(
    currentCurrencySymbol
  );
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const toast = useToast();

  const { ledgerId } = useLedgerStore();

  // Color variables for consistent theming
  const buttonColorScheme = "teal";
  const bgColor = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.600");

  const handleSubmit = async (): Promise<void> => {
    if (!ledgerName || !selectedCurrency) {
      toast({
        description: "Please enter both ledger name and select a currency.",
        status: "warning",
        ...toastDefaults,
      });
      return;
    }

    const payload: UpdateLedgerPayload = {};

    if (ledgerName !== currentLedgerName) {
      payload.name = ledgerName;
    }
    if (selectedCurrency !== currentCurrencySymbol) {
      payload.currency_symbol = selectedCurrency;
    }

    if (Object.keys(payload).length === 0) {
      toast({
        description: "No changes detected.",
        status: "info",
        ...toastDefaults,
      });
      return;
    }

    try {
      setIsLoading(true);
      const response = await api.put(
        `/ledger/${ledgerId}/update`,
        payload
      );
      toast({
        description: "Ledger updated successfully",
        status: "success",
        ...toastDefaults,
      });
      onClose();
      onUpdateCompleted(response.data.name, response.data.currency_symbol);
    } catch (error) {
      const axiosError = error as AxiosError<{ detail: string }>;
      if (axiosError.response?.status !== 401) {
        toast({
          description:
            axiosError.response?.data?.detail || "Failed to update ledger",
          status: "error",
          ...toastDefaults,
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Enter key press
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>): void => {
    if (e.key === "Enter") {
      handleSubmit();
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
            <Flex alignItems="center">
              <Edit size={24} style={{ marginRight: "8px" }} />
              Update Ledger
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
            <FormControl isRequired>
              <FormLabel fontWeight="medium">Ledger Name</FormLabel>
              <Input
                placeholder="e.g., Personal Finance, Family Budget"
                value={ledgerName}
                onChange={(e) => setLedgerName(e.target.value)}
                autoFocus
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
                Update the descriptive name for your financial records
              </FormHelperText>
            </FormControl>

            <FormControl isRequired>
              <FormLabel fontWeight="medium">Currency</FormLabel>
              <Select
                placeholder="Select currency"
                value={selectedCurrency}
                onChange={(e) => setSelectedCurrency(e.target.value)}
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
                {currencies.map((currency) => (
                  <option key={currency.symbol} value={currency.symbol}>
                    {currency.symbol} ({currency.name})
                  </option>
                ))}
              </Select>
              <FormHelperText>
                Update the primary currency for this ledger
              </FormHelperText>
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
              loadingText="Updating..."
              isDisabled={
                !ledgerName ||
                !selectedCurrency ||
                (ledgerName === currentLedgerName &&
                  selectedCurrency === currentCurrencySymbol)
              }
              leftIcon={<Check />}
            >
              Update Ledger
            </Button>
            <Button
              variant="outline"
              onClick={onClose}
              width="100%"
              size="lg"
              isDisabled={isLoading}
              leftIcon={<X />}
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
            isDisabled={
              !ledgerName ||
              !selectedCurrency ||
              (ledgerName === currentLedgerName &&
                selectedCurrency === currentCurrencySymbol)
            }
            leftIcon={<Check />}
          >
            Update
          </Button>
          <Button
            variant="outline"
            onClick={onClose}
            isDisabled={isLoading}
            leftIcon={<X />}
          >
            Cancel
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default UpdateLedgerModal;
