import { FC } from "react";
import {
  Box,
  Button,
  Text,
  VStack,
  Icon,
  useColorModeValue,
} from "@chakra-ui/react";
import { Coins } from "lucide-react";

interface EmptyStateAssetsProps {
  onCreateAssetType: () => void;
}

const EmptyStateAssets: FC<EmptyStateAssetsProps> = ({ onCreateAssetType }) => {
  const bgColor = useColorModeValue("gray.50", "gray.800");
  const textColor = useColorModeValue("gray.600", "gray.400");

  return (
    <Box
      p={12}
      textAlign="center"
      bg={bgColor}
      borderRadius="lg"
      border="2px dashed"
      borderColor="gray.300"
    >
      <VStack spacing={4}>
        <Icon as={Coins} boxSize={16} color="gray.400" />
        <VStack spacing={2}>
          <Text fontSize="xl" fontWeight="semibold" color="gray.700">
            No Physical Assets Yet
          </Text>
          <Text fontSize="md" color={textColor} maxW="400px">
            Start building your physical assets portfolio by creating your first
            asset type.
          </Text>
        </VStack>
          <Button
            colorScheme="teal"
            size="lg"
            onClick={onCreateAssetType}
            w={{ base: "full", md: "auto" }}
            fontSize={{ base: "md", md: "lg" }}
          >
          Create Your First Asset Type
        </Button>
      </VStack>
    </Box>
  );
};

export default EmptyStateAssets;

