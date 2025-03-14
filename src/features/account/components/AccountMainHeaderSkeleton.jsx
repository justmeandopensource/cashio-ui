import {
  Box,
  Flex,
  Skeleton,
  useColorModeValue,
  IconButton,
  VStack,
} from "@chakra-ui/react";
import { ArrowBackIcon } from "@chakra-ui/icons";

const AccountMainHeaderSkeleton = () => {
  const bgColor = useColorModeValue("white", "gray.700");

  return (
    <Box
      bg={bgColor}
      p={{ base: 4, md: 5, lg: 6 }}
      borderRadius="lg"
      boxShadow="md"
      mb={8}
    >
      <Flex
        justifyContent="space-between"
        alignItems={{ base: "flex-start", lg: "center" }}
        flexDirection={{ base: "column", md: "column", lg: "row" }}
        gap={{ base: 4, md: 4, lg: 0 }}
      >
        {/* Left Section: Back Icon and Account Info */}
        <Flex alignItems="flex-start" gap={3}>
          {/* Back to Ledger Icon with Light Teal Hover Effect */}
          <IconButton
            aria-label="Back to Ledger"
            icon={<ArrowBackIcon boxSize={6} />}
            variant="ghost"
            color="teal.500"
            size="lg"
            isDisabled={true}
            _hover={{ bg: "teal.50" }}
            alignSelf="center"
            opacity={0.7}
          />

          {/* Account name and balance stacked vertically */}
          <VStack
            spacing={1}
            alignItems="flex-start"
            width={{ base: "60%", md: "300px" }}
          >
            <Skeleton height="36px" width="80%" mb={1} />
            <Skeleton height="30px" width="60%" />
          </VStack>
        </Flex>

        {/* Right Section: Add Transaction and Transfer Funds Buttons */}
        <Flex
          gap={3}
          flexDirection={{ base: "column", md: "column", lg: "row" }}
          w={{ base: "100%", md: "100%", lg: "auto" }}
        >
          {/* Button to Add a New Transaction */}
          <Skeleton
            height="40px"
            width={{ base: "100%", lg: "150px" }}
            borderRadius="md"
          />

          {/* Button to Transfer Funds */}
          <Skeleton
            height="40px"
            width={{ base: "100%", lg: "150px" }}
            borderRadius="md"
          />
        </Flex>
      </Flex>
    </Box>
  );
};

export default AccountMainHeaderSkeleton;
