import { Box, Card, CardHeader, Heading, Text } from "@chakra-ui/react";
import { useColorModeValue } from "@chakra-ui/react";

const CategoryVisualization = () => {
  const cardBg = useColorModeValue("white", "gray.700");

  return (
    <Card bg={cardBg} boxShadow="md">
      <CardHeader>
        <Heading size="md">Category Visualization</Heading>
      </CardHeader>
      <Box p={6} textAlign="center">
        <Text fontSize="lg" color="gray.500">
          Category visualization is under implementation
        </Text>
      </Box>
    </Card>
  );
};

export default CategoryVisualization;
