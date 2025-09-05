import React from "react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  VStack,
  Box,
  Text,
  Flex,
  Badge,
  Divider,
  useColorModeValue,
} from "@chakra-ui/react";
import { Calendar, BookText } from "lucide-react";

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

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return "Not available";
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return dateString;
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg" isCentered>
      <ModalOverlay />
      <ModalContent bg={bgColor}>
         <ModalHeader>
           <Flex align="start" gap={3}>
             <BookText size={20} color="teal" style={{ verticalAlign: 'top' }} />
             <VStack align="start" spacing={1}>
               <Text fontSize="xl" fontWeight="bold" lineHeight="1">{ledgerName}</Text>
               <Text fontSize="sm" color="gray.600" fontWeight="normal" lineHeight="1">
                 {description || "No description"}
               </Text>
             </VStack>
           </Flex>
         </ModalHeader>
        <ModalCloseButton />

         <ModalBody pb={6}>
           <VStack spacing={4} align="stretch">
             <Divider />
             {/* Currency Badge */}
             <Box>
              <Badge colorScheme="blue" fontSize="sm">
                Currency: {currencySymbol}
              </Badge>
            </Box>

            {/* Notes */}
            <Box>
              <Text color="gray.700" lineHeight="1.6" whiteSpace="pre-wrap">
                {notes || "No notes"}
              </Text>
            </Box>

            <Divider />

             {/* Dates */}
             <Box>
               <Flex justify="space-between" align="center" mb={1}>
                 <Text fontSize="xs" color="gray.500">
                   Created
                 </Text>
                 <Text fontSize="xs" color="gray.500">
                   {formatDate(createdAt)}
                 </Text>
               </Flex>

               <Flex justify="space-between" align="center">
                 <Text fontSize="xs" color="gray.500">
                   Updated
                 </Text>
                 <Text fontSize="xs" color="gray.500">
                   {formatDate(updatedAt)}
                 </Text>
               </Flex>
             </Box>
          </VStack>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default LedgerDetailsModal;