import { Box, Flex, Skeleton } from "@chakra-ui/react";

// Skeleton component for split transactions
export const SplitTransactionSkeleton = () => (
  <Box borderWidth="1px" borderRadius="md" p={2} bg="purple.50">
    {[1, 2, 3].map((item) => (
      <Flex
        key={item}
        justify="space-between"
        p={2}
        borderBottomWidth={item !== 3 ? "1px" : "0"}
      >
        <Skeleton height="18px" width="120px" />
        <Skeleton height="18px" width="80px" />
      </Flex>
    ))}
  </Box>
);

// Skeleton component for transfer details
export const TransferDetailsSkeleton = () => (
  <Box borderWidth="1px" borderRadius="md" p={3} bg="blue.50">
    <Skeleton height="16px" width="100px" mb={1} />
    <Skeleton height="20px" width="140px" mb={1} />
    <Skeleton height="14px" width="120px" />
  </Box>
);
