import { FC } from "react";
import {
  Box,
  Text,
  VStack,
  useColorModeValue,
} from "@chakra-ui/react";

const EmptyStateTransactions: FC = () => {
  const bgColor = useColorModeValue("gray.50", "gray.800");
  const textColor = useColorModeValue("gray.600", "gray.400");

  return (
    <Box
      p={8}
      textAlign="center"
      bg={bgColor}
      borderRadius="lg"
      border="2px dashed"
      borderColor="gray.300"
    >
      <VStack spacing={4}>
        <VStack spacing={2}>
          <Text fontSize="lg" fontWeight="semibold" color="gray.700">
            No Transactions Yet
          </Text>
          <Text fontSize="sm" color={textColor} maxW="300px">
            Transaction history will appear here once you start buying and selling physical assets.
          </Text>
        </VStack>
      </VStack>
    </Box>
  );
};

export default EmptyStateTransactions;