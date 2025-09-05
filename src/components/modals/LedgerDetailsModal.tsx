import React from "react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalBody,
  ModalCloseButton,
  VStack,
  HStack,
  Box,
  Text,
  Flex,
  Badge,
  Divider,
  useColorModeValue,
  Icon,
} from "@chakra-ui/react";
import { BookText, FileText } from "lucide-react";

interface LedgerDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  ledgerName: string;
  currencySymbol: string;
  description: string | undefined;
  notes: string | undefined;
  createdAt: string | undefined;
  updatedAt: string | undefined;
}

const LedgerDetailsModal: React.FC<LedgerDetailsModalProps> = ({
  isOpen,
  onClose,
  ledgerName,
  currencySymbol,
  description,
  notes,
  createdAt,
  updatedAt,
}) => {
  const bgColor = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.100", "gray.700");
  const cardBg = useColorModeValue("gray.50", "gray.700");
  const textSecondary = useColorModeValue("gray.600", "gray.400");
  const textMuted = useColorModeValue("gray.500", "gray.500");
  const iconColor = useColorModeValue("teal.500", "teal.300");

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return "Not available";
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return dateString;
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size={{ base: "full", sm: "xl" }}
      motionPreset="slideInBottom"
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
        maxHeight={{ base: "100%", md: "90vh" }}
        display="flex"
        flexDirection="column"
      >
        {/* Header with gradient background */}
        <Box
          bgGradient="linear(135deg, teal.400, teal.600)"
          color="white"
          px={{ base: 4, sm: 8 }}
          py={{ base: 6, sm: 6 }}
          pt={{ base: 12, sm: 6 }}
          position="relative"
        >
          <ModalCloseButton
            color="white"
            _hover={{ bg: "whiteAlpha.200" }}
            size="lg"
            borderRadius="full"
            top={{ base: 4, sm: 6 }}
            right={{ base: 4, sm: 6 }}
          />

          <HStack spacing={{ base: 3, sm: 4 }} align="start">
            <Box
              p={{ base: 2, sm: 3 }}
              bg="whiteAlpha.200"
              borderRadius="md"
              backdropFilter="blur(10px)"
            >
              <Icon as={BookText} boxSize={{ base: 5, sm: 6 }} />
            </Box>

            <VStack align="start" spacing={2} flex={1}>
              <HStack
                spacing={3}
                align="center"
                flexWrap={{ base: "wrap", sm: "nowrap" }}
              >
                <Text
                  fontSize={{ base: "xl", sm: "2xl" }}
                  fontWeight="bold"
                  lineHeight="1.2"
                >
                  {ledgerName}
                </Text>
                <Badge
                  colorScheme="whiteAlpha"
                  variant="solid"
                  fontSize={{ base: "xs", sm: "sm" }}
                  px={3}
                  py={1}
                  borderRadius="full"
                  bg="whiteAlpha.200"
                  color="white"
                  flexShrink={0}
                >
                  {currencySymbol}
                </Badge>
              </HStack>

              <Text
                fontSize={{ base: "sm", sm: "md" }}
                color="whiteAlpha.900"
                fontWeight="medium"
                lineHeight="1.4"
                fontStyle={!description ? "italic" : "normal"}
              >
                {description || "No description"}
              </Text>
            </VStack>
          </HStack>
        </Box>

        <ModalBody p={{ base: 4, sm: 8 }} flex="1" overflow="auto">
          <VStack spacing={{ base: 4, sm: 6 }} align="stretch">
            {/* Notes Section - Always shown */}
            <Box
              bg={cardBg}
              p={{ base: 4, sm: 6 }}
              borderRadius="md"
              border="1px solid"
              borderColor={borderColor}
            >
              <HStack spacing={3} mb={4}>
                <Icon as={FileText} color={iconColor} boxSize={5} />
                <Text fontSize={{ base: "md", sm: "lg" }} fontWeight="semibold">
                  Notes
                </Text>
              </HStack>

              <Text
                color={notes ? textSecondary : textMuted}
                lineHeight="1.7"
                whiteSpace="pre-wrap"
                fontSize={{ base: "sm", sm: "md" }}
                fontStyle={!notes ? "italic" : "normal"}
              >
                {notes || "No notes available for this ledger."}
              </Text>
            </Box>

            {/* Metadata Section - Always at bottom */}
            <Box
              bg={cardBg}
              p={{ base: 4, sm: 6 }}
              borderRadius="md"
              border="1px solid"
              borderColor={borderColor}
            >
              <VStack spacing={4}>
                <Flex justify="space-between" align="center" w="full">
                  <HStack spacing={2}>
                    <Box w={2} h={2} bg="green.400" borderRadius="full" />
                    <Text
                      fontSize={{ base: "xs", sm: "sm" }}
                      color={textSecondary}
                      fontWeight="medium"
                    >
                      Created
                    </Text>
                  </HStack>
                  <Text
                    fontSize={{ base: "xs", sm: "sm" }}
                    color={textMuted}
                    fontFamily="mono"
                  >
                    {formatDate(createdAt)}
                  </Text>
                </Flex>

                <Divider />

                <Flex justify="space-between" align="center" w="full">
                  <HStack spacing={2}>
                    <Box w={2} h={2} bg="blue.400" borderRadius="full" />
                    <Text
                      fontSize={{ base: "xs", sm: "sm" }}
                      color={textSecondary}
                      fontWeight="medium"
                    >
                      Last Updated
                    </Text>
                  </HStack>
                  <Text
                    fontSize={{ base: "xs", sm: "sm" }}
                    color={textMuted}
                    fontFamily="mono"
                  >
                    {formatDate(updatedAt)}
                  </Text>
                </Flex>
              </VStack>
            </Box>
          </VStack>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default LedgerDetailsModal;
