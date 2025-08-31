import {
  Box,
  Heading,
  Button,
  Flex,
  useColorModeValue,
  Icon,
} from "@chakra-ui/react";
import { Plus, BookText } from "lucide-react";
import { FC } from "react";

interface HomeMainHeaderProps {
  onCreateLedger: () => void;
}

const HomeMainHeader: FC<HomeMainHeaderProps> = ({ onCreateLedger }) => {

  // Use Chakra's color mode for consistent styling
  const bgColor = useColorModeValue("white", "gray.700");
  const buttonColorScheme = useColorModeValue("teal", "blue");

  return (
    <Box
      bg={bgColor}
      p={{ base: 4, md: 5, lg: 6 }}
      borderRadius="lg"
      boxShadow="lg"
      mb={8}
    >
      <Flex
        justifyContent="space-between"
        alignItems="flex-start"
        flexDirection={{ base: "column", md: "column", lg: "row" }}
        gap={{ base: 4, md: 4, lg: 0 }}
      >
        {/* Left Section: Home Icon and Heading */}
        <Flex alignItems="center" gap={3}>
          <Icon as={BookText} w={8} h={8} color="teal.500" />
          <Heading as="h2" size="lg" color="teal.500">
            My Ledgers
          </Heading>
        </Flex>

        {/* Right Section: Create New Ledger Button */}
        <Flex
          gap={3}
          flexDirection={{ base: "column", md: "column", lg: "row" }}
          w={{ base: "100%", md: "100%", lg: "auto" }}
        >
          <Button
            leftIcon={<Plus />}
            colorScheme={buttonColorScheme}
            variant="solid"
            onClick={onCreateLedger}
            w={{ base: "100%", md: "100%", lg: "auto" }}
          >
            Create New Ledger
          </Button>
        </Flex>
      </Flex>
    </Box>
  );
};

export default HomeMainHeader;
