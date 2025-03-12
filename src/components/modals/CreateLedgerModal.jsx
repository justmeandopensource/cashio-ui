import { useState, useRef } from "react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
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
} from "@chakra-ui/react";

const currencies = [
  { symbol: "$", code: "USD", name: "US Dollar" },
  { symbol: "€", code: "EUR", name: "Euro" },
  { symbol: "£", code: "GBP", name: "British Pound" },
  { symbol: "₹", code: "INR", name: "Indian Rupee" },
  // Add more common currencies as needed
];

const CreateLedgerModal = ({ isOpen, onClose, handleCreateLedger }) => {
  const [newLedgerName, setNewLedgerName] = useState("");
  const [selectedCurrency, setSelectedCurrency] = useState("");
  const ledgerNameInputRef = useRef(null);
  const toast = useToast();

  // Color variables for consistent theming
  const buttonColorScheme = "teal";
  const bgColor = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.600");

  const handleSubmit = () => {
    if (!newLedgerName || !selectedCurrency) {
      toast({
        title: "Required Fields",
        description: "Please enter both ledger name and select a currency.",
        status: "warning",
        duration: 3000,
        position: "top",
        isClosable: true,
      });
      if (!newLedgerName) ledgerNameInputRef.current?.focus();
      return;
    }

    // Get currency symbol from selection
    const currencySymbol =
      currencies.find((c) => c.code === selectedCurrency)?.symbol ||
      selectedCurrency;

    // Call the handleCreateLedger function passed from the parent
    handleCreateLedger(newLedgerName, currencySymbol);

    // Reset the form fields
    setNewLedgerName("");
    setSelectedCurrency("");

    // Close the modal
    onClose();
  };

  // Handle Enter key press
  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSubmit();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      initialFocusRef={ledgerNameInputRef}
      size={{ base: "full", sm: "md" }}
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
            Create New Ledger
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
            <FormControl isRequired>
              <FormLabel fontWeight="medium">Ledger Name</FormLabel>
              <Input
                placeholder="e.g., Personal Finance, Family Budget"
                value={newLedgerName}
                onChange={(e) => setNewLedgerName(e.target.value)}
                autoFocus
                ref={ledgerNameInputRef}
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
                Choose a descriptive name for your financial records
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
                  <option key={currency.code} value={currency.code}>
                    {currency.symbol} - {currency.code} ({currency.name})
                  </option>
                ))}
              </Select>
              <FormHelperText>
                Select the primary currency for this ledger
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
            >
              Create Ledger
            </Button>
            <Button variant="outline" onClick={onClose} width="100%" size="lg">
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
          >
            Create
          </Button>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default CreateLedgerModal;
