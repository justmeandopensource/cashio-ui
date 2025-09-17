 import { FC, useState, useEffect } from "react";
 import {
   Modal,
   ModalOverlay,
   ModalContent,
   ModalBody,
   ModalCloseButton,
   Button,
   VStack,
   FormControl,
   FormLabel,
   Input,
   Select,
   Textarea,
   Alert,
   AlertIcon,
   AlertTitle,
   AlertDescription,
   useColorModeValue,
   FormHelperText,
   FormErrorMessage,
   InputGroup,
   InputLeftAddon,
   HStack,
   Text,
   Badge,
   Box,
   Stack,
 } from "@chakra-ui/react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";

import {
  ArrowRightLeft,
  Calendar,
  FileText,
  TrendingUp,
  Coins,
  DollarSign,
} from "lucide-react";
import ChakraDatePicker from "@components/shared/ChakraDatePicker";
import { switchMutualFundUnits } from "../../api";
import { MutualFund, MfSwitchCreate } from "../../types";
import { formatAmount, formatNav, formatUnits } from "../../utils";
import useLedgerStore from "@/components/shared/store";

interface TransferUnitsModalProps {
  isOpen: boolean;
  onClose: () => void;
  fromFundId: number;
  mutualFunds: MutualFund[];
  onSuccess: () => void;
}

interface FormData {
  from_fund_id: string;
  to_fund_id: string;
  units: string;
  from_nav: string;
  to_nav: string;
  transaction_date: Date;
  notes: string;
}

const TransferUnitsModal: FC<TransferUnitsModalProps> = ({
  isOpen,
  onClose,
  fromFundId,
  mutualFunds,
  onSuccess,
}) => {
  const { ledgerId, currencySymbol } = useLedgerStore();
  const queryClient = useQueryClient();

   const [formData, setFormData] = useState<FormData>({
     from_fund_id: "",
     to_fund_id: "",
     units: "",
     from_nav: "",
     to_nav: "",
     transaction_date: new Date(),
     notes: "",
   });
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Theme colors
  const bgColor = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.100", "gray.700");
  const cardBg = useColorModeValue("gray.50", "gray.700");
  const inputBg = useColorModeValue("white", "gray.700");
  const inputBorderColor = useColorModeValue("gray.200", "gray.600");
  const focusBorderColor = useColorModeValue("teal.500", "teal.300");

  const sourceFund = mutualFunds.find(fund => fund.mutual_fund_id === fromFundId);
  const fromFund = mutualFunds.find(fund => fund.mutual_fund_id.toString() === formData.from_fund_id);
  const toFund = mutualFunds.find(fund => fund.mutual_fund_id.toString() === formData.to_fund_id);

  const transferMutation = useMutation({
    mutationFn: (switchData: MfSwitchCreate) =>
      switchMutualFundUnits(Number(ledgerId), switchData),
    onSuccess: () => {
      onSuccess();
      handleClose();
    },
    onError: (error: any) => {
      if (error.response?.data?.detail) {
        setErrors({ general: error.response.data.detail });
      } else {
        setErrors({ general: "Failed to switch units. Please try again." });
      }
    },
  });

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      const initialFromFund = mutualFunds.find(f => f.mutual_fund_id === fromFundId);
      setFormData({
        from_fund_id: fromFundId.toString(),
        to_fund_id: "",
        units: "",
        from_nav: initialFromFund?.average_cost_per_unit.toString() || "",
        to_nav: "",
        transaction_date: new Date(),
        notes: "",
      });
      setErrors({});
    }
  }, [isOpen, fromFundId, mutualFunds]);

  useEffect(() => {
    if (fromFund) {
      setFormData(prev => ({ ...prev, from_nav: fromFund.average_cost_per_unit.toString() }));
    }
  }, [fromFund]);

  useEffect(() => {
    if (toFund) {
      setFormData(prev => ({ ...prev, to_nav: toFund.latest_nav.toString() }));
    }
  }, [toFund]);

  const handleClose = () => {
    setFormData({
      from_fund_id: "",
      to_fund_id: "",
      units: "",
      from_nav: "",
      to_nav: "",
      transaction_date: new Date(),
      notes: "",
    });
    setErrors({});
    onClose();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const newErrors: Record<string, string> = {};
    if (!formData.to_fund_id) newErrors.to_fund_id = "Please select target fund";
    if (formData.from_fund_id === formData.to_fund_id) newErrors.to_fund_id = "Source and target funds cannot be the same";
    if (!formData.units || parseFloat(formData.units) <= 0) newErrors.units = "Units must be greater than 0";
    if (!formData.from_nav || parseFloat(formData.from_nav) <= 0) newErrors.from_nav = "From NAV must be greater than 0";
    if (!formData.to_nav || parseFloat(formData.to_nav) <= 0) newErrors.to_nav = "To NAV must be greater than 0";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const switchData: MfSwitchCreate = {
      source_mutual_fund_id: fromFundId!,
      target_mutual_fund_id: parseInt(formData.to_fund_id),
      units_to_switch: parseFloat(formData.units),
      source_nav_at_switch: parseFloat(formData.from_nav),
      target_nav_at_switch: parseFloat(formData.to_nav),
      transaction_date: formData.transaction_date, // Date object is fine, backend will format
      notes: formData.notes.trim() || undefined,
    };

    transferMutation.mutate(switchData);
  };

  const handleInputChange = (field: keyof FormData, value: string | Date) => {
    let processedValue: string | Date = value;

    // For transaction_date field, value is Date
    if (field === "transaction_date") {
      processedValue = value as Date;
    } else {
      // For from_nav and to_nav fields, limit to 2 decimal places
      if (field === "from_nav" || field === "to_nav") {
        const stringValue = value as string;
        // Allow empty string, numbers, and decimal point
        if (stringValue === "" || /^\d*\.?\d*$/.test(stringValue)) {
          // Check if there are more than 2 decimal places
          const decimalPart = stringValue.split(".")[1];
          if (decimalPart && decimalPart.length > 2) {
            // Truncate to 2 decimal places
            const integerPart = stringValue.split(".")[0];
            processedValue = `${integerPart}.${decimalPart.substring(0, 2)}`;
          }
        } else {
          // If invalid characters, don't update
          return;
        }
      }

      // For units field, limit to 3 decimal places
      if (field === "units") {
        const stringValue = value as string;
        // Allow empty string, numbers, and decimal point
        if (stringValue === "" || /^\d*\.?\d*$/.test(stringValue)) {
          // Check if there are more than 3 decimal places
          const decimalPart = stringValue.split(".")[1];
          if (decimalPart && decimalPart.length > 3) {
            // Truncate to 3 decimal places
            const integerPart = stringValue.split(".")[0];
            processedValue = `${integerPart}.${decimalPart.substring(0, 3)}`;
          }
        } else {
          // If invalid characters, don't update
          return;
        }
      }
    }

    setFormData((prev) => ({ ...prev, [field]: processedValue }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const availableUnits = sourceFund?.total_units || 0;
  const fromUnits = parseFloat(formData.units) || 0;
  const fromNav = parseFloat(formData.from_nav) || 0;
  const toNav = parseFloat(formData.to_nav) || 0;
  const totalValue = fromUnits * fromNav;
  const toUnits = toNav > 0 ? totalValue / toNav : 0;

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      size={{ base: "full", sm: "xl" }}
      motionPreset="slideInBottom"
      isCentered
    >
      <ModalOverlay backdropFilter="blur(4px)" bg="blackAlpha.300" />
      <ModalContent
        bg={bgColor}
        borderRadius={{ base: 0, sm: "md" }}
        boxShadow="2xl"
        border="1px solid"
        borderColor={borderColor}
        overflow="hidden"
        mx={{ base: 0, sm: 4 }}
        my={{ base: 0, sm: "auto" }}
        maxHeight={{ base: "100%", md: "95vh" }}
        display="flex"
        flexDirection="column"
      >
        {/* Modern gradient header */}
        <Box
          bgGradient="linear(135deg, teal.400, teal.600)"
          color="white"
          px={{ base: 4, sm: 8 }}
          py={{ base: 6, sm: 6 }}
          pt={{ base: 12, sm: 6 }}
          position="relative"
        >
          <HStack spacing={{ base: 3, sm: 4 }} align="center">
            <Box
              p={{ base: 2, sm: 3 }}
              bg="whiteAlpha.200"
              borderRadius="md"
              backdropFilter="blur(10px)"
            >
              <ArrowRightLeft size={24} style={{ margin: 0 }} />
            </Box>

            <Box>
              <Text
                fontSize={{ base: "xl", sm: "2xl" }}
                fontWeight="bold"
                lineHeight="1.2"
                mb={1}
              >
                Transfer Mutual Fund Units
              </Text>
              <Text
                fontSize={{ base: "sm", sm: "md" }}
                color="whiteAlpha.900"
                fontWeight="medium"
              >
                 {sourceFund ? `From ${sourceFund.name}` : 'Switch units between funds'}
              </Text>
            </Box>
          </HStack>
        </Box>

        <ModalBody
          px={{ base: 4, sm: 8 }}
          py={{ base: 4, sm: 6 }}
          flex="1"
          overflow="auto"
        >
          <form onSubmit={handleSubmit}>
            <VStack spacing={{ base: 5, sm: 6 }} align="stretch">

              {/* Error Display */}
              {errors.general && (
                <Alert
                  status="error"
                  borderRadius="md"
                  border="1px solid"
                  borderColor="red.200"
                >
                  <AlertIcon />
                  <Box>
                    <AlertTitle fontWeight="bold">Transfer Failed!</AlertTitle>
                    <AlertDescription>
                      {errors.general}
                    </AlertDescription>
                  </Box>
                </Alert>
              )}

              {/* Fund Selection Card */}
              <Box
                bg={cardBg}
                p={{ base: 4, sm: 6 }}
                borderRadius="md"
                border="1px solid"
                borderColor={borderColor}
              >
                <VStack spacing={5} align="stretch">

                  <FormControl isInvalid={!!errors.to_fund_id}>
                      <FormLabel fontWeight="semibold" mb={2}>
                        <HStack spacing={2}>
                          <TrendingUp size={16} />
                          <Text>
                            To Fund{" "}
                            <Text as="span" color="red.500">
                              *
                            </Text>
                          </Text>
                        </HStack>
                      </FormLabel>
                      <Select
                        value={formData.to_fund_id}
                        onChange={(e) => handleInputChange("to_fund_id", e.target.value)}
                        placeholder="Select target fund"
                        size="lg"
                        bg={inputBg}
                        borderColor={inputBorderColor}
                        borderWidth="2px"
                        borderRadius="md"
                        _hover={{ borderColor: "teal.300" }}
                        _focus={{
                          borderColor: focusBorderColor,
                          boxShadow: `0 0 0 1px ${focusBorderColor}`,
                        }}
                      >
                    {mutualFunds
                      .filter(fund => fund.mutual_fund_id !== fromFundId)
                      .map((fund) => (
                            <option key={fund.mutual_fund_id} value={fund.mutual_fund_id.toString()}>
                              {fund.name} ({fund.amc?.name})
                            </option>
                          ))}
                      </Select>
                       <FormErrorMessage>{errors.to_fund_id}</FormErrorMessage>
                     </FormControl>

                 </VStack>
              </Box>

              {/* Transfer Details Card */}
              <Box
                bg={cardBg}
                p={{ base: 4, sm: 6 }}
                borderRadius="md"
                border="1px solid"
                borderColor={borderColor}
              >
                <VStack spacing={5} align="stretch">
                  {/* Row 1: Units to Transfer and Cost Basis */}
                  <Stack direction={{ base: "column", md: "row" }} spacing={4}>
                    <FormControl flex={1} isInvalid={!!errors.units}>
                      <FormLabel fontWeight="semibold" mb={2}>
                        <HStack spacing={2}>
                          <Coins size={16} />
                          <Text>
                            Units to Transfer{" "}
                            <Text as="span" color="red.500">
                              *
                            </Text>
                          </Text>
                        </HStack>
                      </FormLabel>
                      <Input
                        type="number"
                        step="0.001"
                        value={formData.units}
                        onChange={(e) => handleInputChange("units", e.target.value)}
                        placeholder="0.000"
                        min={0}
                        max={availableUnits}
                        size="lg"
                        bg={inputBg}
                        borderColor={inputBorderColor}
                        borderWidth="2px"
                        borderRadius="md"
                        _hover={{ borderColor: "teal.300" }}
                        _focus={{
                          borderColor: focusBorderColor,
                          boxShadow: `0 0 0 1px ${focusBorderColor}`,
                        }}
                      />
                       <FormHelperText>Available units: {formatUnits(availableUnits)}</FormHelperText>
                      <FormErrorMessage>{errors.units}</FormErrorMessage>
                    </FormControl>

                    <FormControl flex={1} isInvalid={!!errors.from_nav}>
                      <FormLabel fontWeight="semibold" mb={2}>
                        <HStack spacing={2}>
                          <DollarSign size={16} />
                          <Text>
                            Cost Basis{" "}
                            <Text as="span" color="red.500">
                              *
                            </Text>
                          </Text>
                        </HStack>
                      </FormLabel>
                      <InputGroup size="lg">
                        <InputLeftAddon
                          bg={inputBorderColor}
                          borderWidth="2px"
                          borderColor={inputBorderColor}
                          color="gray.600"
                          fontWeight="semibold"
                        >
                          {currencySymbol}
                        </InputLeftAddon>
                         <Input
                           type="number"
                           step="0.01"
                           value={formData.from_nav}
                           onChange={(e) => handleInputChange("from_nav", e.target.value)}
                           placeholder="0.00"
                           min={0}
                           bg={inputBg}
                           borderColor={inputBorderColor}
                           borderWidth="2px"
                           borderRadius="md"
                           _hover={{ borderColor: "teal.300" }}
                           _focus={{
                             borderColor: focusBorderColor,
                             boxShadow: `0 0 0 1px ${focusBorderColor}`,
                           }}
                         />
                      </InputGroup>
                       <FormHelperText>NAV of the source fund</FormHelperText>
                      <FormErrorMessage>{errors.from_nav}</FormErrorMessage>
                    </FormControl>
                  </Stack>

                  {/* Row 2: To NAV and Date */}
                  <Stack direction={{ base: "column", md: "row" }} spacing={4}>
                    <FormControl flex={1} isInvalid={!!errors.to_nav}>
                      <FormLabel fontWeight="semibold" mb={2}>
                        <HStack spacing={2}>
                          <DollarSign size={16} />
                          <Text>
                            To NAV{" "}
                            <Text as="span" color="red.500">
                              *
                            </Text>
                          </Text>
                        </HStack>
                      </FormLabel>
                      <InputGroup size="lg">
                        <InputLeftAddon
                          bg={inputBorderColor}
                          borderWidth="2px"
                          borderColor={inputBorderColor}
                          color="gray.600"
                          fontWeight="semibold"
                        >
                          {currencySymbol}
                        </InputLeftAddon>
                         <Input
                           type="number"
                           step="0.01"
                           value={formData.to_nav}
                           onChange={(e) => handleInputChange("to_nav", e.target.value)}
                           placeholder="0.00"
                           min={0}
                           bg={inputBg}
                           borderColor={inputBorderColor}
                           borderWidth="2px"
                           borderRadius="md"
                           _hover={{ borderColor: "teal.300" }}
                           _focus={{
                             borderColor: focusBorderColor,
                             boxShadow: `0 0 0 1px ${focusBorderColor}`,
                           }}
                         />
                      </InputGroup>
                       <FormHelperText>NAV of the target fund</FormHelperText>
                       <FormErrorMessage>{errors.to_nav}</FormErrorMessage>
                     </FormControl>

                    <FormControl flex={1}>
                      <FormLabel fontWeight="semibold" mb={2}>
                        <HStack spacing={2}>
                          <Calendar size={16} />
                          <Text>Transfer Date</Text>
                        </HStack>
                      </FormLabel>
                      <Box
                        sx={{
                          ".react-datepicker-wrapper": {
                            width: "100%",
                          },
                          ".react-datepicker__input-container input": {
                            width: "100%",
                            height: "48px",
                            borderWidth: "2px",
                            borderColor: inputBorderColor,
                            borderRadius: "md",
                            bg: inputBg,
                            fontSize: "lg",
                            _hover: { borderColor: "teal.300" },
                            _focus: {
                              borderColor: focusBorderColor,
                              boxShadow: `0 0 0 1px ${focusBorderColor}`,
                            },
                          },
                        }}
                      >
                        <ChakraDatePicker
                          selected={formData.transaction_date}
                          onChange={(date: Date | null) => {
                            if (date) {
                              handleInputChange("transaction_date", date);
                            }
                          }}
                          maxDate={new Date()}
                        />
                      </Box>
                      <FormHelperText>Transaction date</FormHelperText>
                    </FormControl>
                  </Stack>

                  {/* Row 3: Notes (full width) */}
                  <FormControl isInvalid={!!errors.notes}>
                    <FormLabel fontWeight="semibold" mb={2}>
                      <HStack spacing={2}>
                        <FileText size={16} />
                        <Text>Notes (Optional)</Text>
                      </HStack>
                    </FormLabel>
                    <Textarea
                      value={formData.notes}
                      onChange={(e) => handleInputChange("notes", e.target.value)}
                      placeholder="Add any notes about this transfer..."
                      rows={3}
                      size="lg"
                      bg={inputBg}
                      borderColor={inputBorderColor}
                      borderWidth="2px"
                      borderRadius="md"
                      _hover={{ borderColor: "teal.300" }}
                      _focus={{
                        borderColor: focusBorderColor,
                        boxShadow: `0 0 0 1px ${focusBorderColor}`,
                      }}
                      resize="vertical"
                    />
                    <FormHelperText>Additional details about this transfer</FormHelperText>
                    <FormErrorMessage>{errors.notes}</FormErrorMessage>
                  </FormControl>

                   {fromUnits > 0 && availableUnits > 0 && formData.to_fund_id && formData.from_nav && formData.to_nav && totalValue > 0 && toUnits > 0 && (
                     <Alert
                       status={fromUnits > availableUnits ? "error" : "success"}
                       borderRadius="md"
                       border="1px solid"
                       borderColor={fromUnits > availableUnits ? "red.200" : "green.200"}
                     >
                       <AlertIcon />
                       <AlertDescription>
                         {fromUnits > availableUnits ? (
                           <Text color="red.500" fontWeight="bold">
                             Insufficient units! Available: {formatUnits(availableUnits)}
                           </Text>
                         ) : (
                           <VStack align="start" spacing={1}>
                             <Text fontWeight="bold" fontSize="md">
                               Total Transfer Value: {currencySymbol}{formatAmount(totalValue)}
                             </Text>
                             <Text fontSize="sm">
                               You will get {formatUnits(toUnits)} units in {toFund?.name}
                             </Text>
                           </VStack>
                         )}
                       </AlertDescription>
                     </Alert>
                   )}



                </VStack>
              </Box>

              {/* Action Buttons */}
              <Stack direction="row" spacing={3} width="full">
                <Button
                  bg="teal.500"
                  color="white"
                  _hover={{
                    bg: "teal.600",
                    transform: transferMutation.isPending ? "none" : "translateY(-2px)",
                    boxShadow: transferMutation.isPending ? "none" : "lg",
                  }}
                  onClick={handleSubmit}
                  size="lg"
                  flex={1}
                  borderRadius="md"
                  isLoading={transferMutation.isPending}
                  loadingText="Processing Transfer..."
                  isDisabled={
                    !formData.to_fund_id ||
                    !formData.units ||
                    fromUnits > availableUnits ||
                    !formData.from_nav ||
                    !formData.to_nav ||
                    Object.keys(errors).length > 0
                  }
                  leftIcon={<ArrowRightLeft size={16} />}
                  transition="all 0.2s"
                >
                  Transfer Units
                </Button>

                <Button
                  variant="outline"
                  onClick={handleClose}
                  size="lg"
                  flex={1}
                  borderRadius="md"
                  borderWidth="2px"
                  borderColor="gray.300"
                  color="gray.600"
                  _hover={{
                    bg: "gray.50",
                    borderColor: "gray.400",
                    transform: "translateY(-2px)",
                  }}
                  isDisabled={transferMutation.isPending}
                  transition="all 0.2s"
                >
                  Cancel
                </Button>
              </Stack>
            </VStack>
          </form>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default TransferUnitsModal;