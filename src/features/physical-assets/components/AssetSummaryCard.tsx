import { FC, useState } from "react";
import {
  Box,
  Button,
  Text,
  VStack,
  HStack,
  useColorModeValue,
  Skeleton,
  SkeletonText,
  Stack,
  Divider,
  useDisclosure,
  Card,
  CardBody,
  Collapse,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  Badge,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  useBreakpointValue,
} from "@chakra-ui/react";

import { AssetSummaryCardProps } from "../types";
import { useAssetTransactions } from "../api";
import {
  calculateUnrealizedPnL,
  calculateUnrealizedPnLPercentage,
  splitCurrencyForDisplay,
  splitQuantityForDisplay,
  splitPercentageForDisplay,
  calculateHighestPurchasePrice,
  calculateLowestPurchasePrice,
} from "../utils";


interface AssetSummaryCardSkeletonProps {
  // No props needed for skeleton
}

export const AssetSummaryCardSkeleton: FC<
  AssetSummaryCardSkeletonProps
> = () => {
  const bgColor = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.600");
  const cardBg = useColorModeValue("gray.50", "gray.700");

  return (
    <Box
      bg={bgColor}
      border="2px solid"
      borderColor={borderColor}
      borderRadius="xl"
      overflow="hidden"
      minW="320px"
      maxW="400px"
      boxShadow="lg"
       _hover={{
         boxShadow: "lg",
         borderColor: "teal.300",
       }}
       transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
     >
       {/* Header Skeleton */}
      <Box bgGradient="linear(135deg, teal.400, teal.600)" p={6} color="white">
        <HStack spacing={3} mb={3}>
          <Skeleton boxSize={8} borderRadius="md" />
          <VStack align="start" spacing={1} flex={1}>
            <Skeleton height="24px" width="150px" />
            <Skeleton height="20px" width="80px" />
          </VStack>
          <Skeleton height="28px" width="70px" borderRadius="full" />
        </HStack>
      </Box>

      {/* Content Skeleton */}
      <Box p={6}>
        <VStack spacing={4} align="stretch">
          {/* Current Value */}
          <Box bg={cardBg} p={4} borderRadius="lg">
            <HStack justify="space-between">
              <Skeleton height="16px" width="100px" />
              <Skeleton height="24px" width="120px" />
            </HStack>
          </Box>

          {/* Stats Grid */}
          <Stack direction={{ base: "column", md: "row" }} spacing={4}>
            <Box bg={cardBg} p={4} borderRadius="lg" flex={1}>
              <Skeleton height="14px" width="60px" mb={2} />
              <Skeleton height="18px" width="80px" />
            </Box>
            <Box bg={cardBg} p={4} borderRadius="lg" flex={1}>
              <Skeleton height="14px" width="80px" mb={2} />
              <Skeleton height="18px" width="90px" />
            </Box>
          </Stack>

          {/* Price Range */}
          <Stack direction="row" spacing={4}>
            <Box bg={cardBg} p={3} borderRadius="lg" flex={1}>
              <Skeleton height="12px" width="50px" mb={1} />
              <Skeleton height="16px" width="70px" />
            </Box>
            <Box bg={cardBg} p={3} borderRadius="lg" flex={1}>
              <Skeleton height="12px" width="50px" mb={1} />
              <Skeleton height="16px" width="70px" />
            </Box>
          </Stack>

          {/* P&L Section */}
          <Box bg={cardBg} p={4} borderRadius="lg">
            <SkeletonText noOfLines={2} spacing={2} />
          </Box>

          {/* Action Buttons */}
          <Stack direction="row" spacing={3}>
            <Skeleton height="40px" flex={1} borderRadius="lg" />
            <Skeleton height="40px" flex={1} borderRadius="lg" />
          </Stack>
        </VStack>
      </Box>
    </Box>
  );
};

const AssetSummaryCard: FC<AssetSummaryCardProps> = ({
  asset,
  currencySymbol,
  onBuySell,
  onUpdatePrice,
  onDelete,
}) => {
  const cardBg = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const mutedColor = useColorModeValue("gray.600", "gray.400");

  const [isExpanded, setIsExpanded] = useState(false);

  // Responsive modal settings
  const modalSize = useBreakpointValue({ base: "full", md: "md" });
  const isMobile = useBreakpointValue({ base: true, md: false });

  const unrealizedPnL = calculateUnrealizedPnL(asset);
  const unrealizedPnLPercentage = calculateUnrealizedPnLPercentage(asset);
  const hasHoldings = asset.total_quantity > 0;
  const costBasis = asset.total_quantity * asset.average_cost_per_unit;

  // Fetch transactions for cost calculations only when expanded
  const { data: transactions = [], isLoading: isLoadingTransactions } = useAssetTransactions(asset.ledger_id, asset.physical_asset_id, { enabled: isExpanded });
  const highestPurchasePrice = isExpanded ? calculateHighestPurchasePrice(transactions) : null;
  const lowestPurchasePrice = isExpanded ? calculateLowestPurchasePrice(transactions) : null;

  // Delete confirmation dialog
  const {
    isOpen: isDeleteDialogOpen,
    onOpen: onDeleteDialogOpen,
    onClose: onDeleteDialogClose,
  } = useDisclosure();



  const handleCardClick = (e: React.MouseEvent) => {
    // Prevent expansion if clicking on interactive elements
    if ((e.target as HTMLElement).closest("button")) {
      return;
    }
    setIsExpanded(!isExpanded);
  };

  return (
    <Card
      bg={cardBg}
      borderColor={borderColor}
      borderWidth={1}
      size="sm"
      cursor="pointer"
      onClick={handleCardClick}
      shadow="sm"
      _hover={{ shadow: "md", borderColor: "teal.300" }}
      transition="all 0.2s"
    >
      <CardBody>
        <HStack justify="space-between" align="start" mb={3}>
          <VStack align="start" spacing={1} flex={1}>
            <Text
              fontSize="md"
              fontWeight="semibold"
              color="gray.700"
              noOfLines={1}
            >
              {asset.name}
            </Text>
            <HStack spacing={{ base: 4, md: 6 }} color={mutedColor} align="start">
               <VStack align="start" spacing={0}>
                 <Text fontSize="sm" color={mutedColor}>
                   Quantity
                 </Text>
                 <HStack spacing={0} align="baseline">
                   <Text fontSize="md">
                     {splitQuantityForDisplay(asset.total_quantity).main}
                   </Text>
                   <Text fontSize="sm" opacity={0.7}>
                     {splitQuantityForDisplay(asset.total_quantity).decimals}
                   </Text>
                   <Text fontSize="sm" opacity={0.7} ml={1}>
                     {asset.asset_type?.unit_symbol || ""}
                   </Text>
                 </HStack>
               </VStack>
              <VStack align="start" spacing={0}>
                <Text fontSize="sm" color={mutedColor}>
                  Invested
                </Text>
                <HStack spacing={0} align="baseline">
                  <Text fontSize="md">
                    {splitCurrencyForDisplay(costBasis, currencySymbol).main}
                  </Text>
                  <Text fontSize="sm" opacity={0.7}>
                    {splitCurrencyForDisplay(costBasis, currencySymbol).decimals}
                  </Text>
                </HStack>
              </VStack>
              <VStack align="start" spacing={0}>
                <Text fontSize="sm" color={mutedColor}>
                  Value
                </Text>
                <HStack spacing={0} align="baseline">
                  <Text fontSize="md">
                    {splitCurrencyForDisplay(asset.current_value, currencySymbol).main}
                  </Text>
                  <Text fontSize="sm" opacity={0.7}>
                    {
                      splitCurrencyForDisplay(asset.current_value, currencySymbol)
                        .decimals
                    }
                  </Text>
                </HStack>
              </VStack>
            </HStack>
          </VStack>
          <Badge
            colorScheme={unrealizedPnL >= 0 ? "green" : "red"}
            size="sm"
            fontWeight="medium"
            px={2}
            py={0.5}
            borderRadius="md"
          >
            <HStack spacing={0} align="baseline">
              <Text fontSize="sm" fontWeight="semibold">
                {splitPercentageForDisplay(unrealizedPnLPercentage).main}
              </Text>
              <Text fontSize="xs" fontWeight="semibold" opacity={0.7}>
                {splitPercentageForDisplay(unrealizedPnLPercentage).decimals}%
              </Text>
            </HStack>
          </Badge>
        </HStack>

        <Collapse in={isExpanded} animateOpacity>
          <Box pt={2}>
            <Divider mb={3} />
             <SimpleGrid columns={{ base: 2, md: 3 }} spacing={4} mb={3}>
               <Stat size="sm">
                 <StatLabel fontSize="xs" color={mutedColor}>
                   Latest Price
                 </StatLabel>
                 <HStack spacing={0} align="baseline">
                   <StatNumber fontSize="sm" color="gray.600">
                     {splitCurrencyForDisplay(asset.latest_price_per_unit, currencySymbol).main}
                   </StatNumber>
                   <Text fontSize="xs" color="gray.600" opacity={0.7}>
                     {splitCurrencyForDisplay(asset.latest_price_per_unit, currencySymbol).decimals}
                   </Text>
                   <Text fontSize="xs" color="gray.600" opacity={0.7}>
                     /{asset.asset_type?.unit_symbol || ""}
                   </Text>
                 </HStack>
               </Stat>
               <Stat size="sm">
                 <StatLabel fontSize="xs" color={mutedColor}>
                   Unrealized P&L
                 </StatLabel>
                 <HStack spacing={0} align="baseline">
                   <StatNumber
                     fontSize="sm"
                     color={unrealizedPnL >= 0 ? "green.500" : "red.500"}
                   >
                     {splitCurrencyForDisplay(Math.abs(unrealizedPnL), currencySymbol).main}
                   </StatNumber>
                   <Text
                     fontSize="xs"
                     color={unrealizedPnL >= 0 ? "green.500" : "red.500"}
                     opacity={0.7}
                   >
                     {
                       splitCurrencyForDisplay(Math.abs(unrealizedPnL), currencySymbol)
                         .decimals
                     }
                   </Text>
                 </HStack>
               </Stat>
             </SimpleGrid>
             <SimpleGrid columns={{ base: 2, md: 3 }} spacing={4} mb={3}>
               <Stat size="sm">
                 <StatLabel fontSize="xs" color={mutedColor}>
                   Avg. Cost
                 </StatLabel>
                 <HStack spacing={0} align="baseline">
                   <StatNumber fontSize="sm" color="gray.600">
                     {
                       splitCurrencyForDisplay(asset.average_cost_per_unit, currencySymbol)
                         .main
                     }
                   </StatNumber>
                   <Text fontSize="xs" color="gray.600" opacity={0.7}>
                     {
                       splitCurrencyForDisplay(asset.average_cost_per_unit, currencySymbol)
                         .decimals
                     }
                   </Text>
                 </HStack>
               </Stat>
                <Stat size="sm">
                  <StatLabel fontSize="xs" color={mutedColor}>
                    Lowest Cost
                  </StatLabel>
                  <HStack spacing={0} align="baseline">
                    <StatNumber fontSize="sm" color="gray.600">
                      {isLoadingTransactions
                        ? "Loading..."
                        : lowestPurchasePrice !== null
                        ? splitCurrencyForDisplay(lowestPurchasePrice, currencySymbol).main
                        : "--"}
                    </StatNumber>
                    <Text fontSize="xs" color="gray.600" opacity={0.7}>
                      {isLoadingTransactions
                        ? ""
                        : lowestPurchasePrice !== null
                        ? splitCurrencyForDisplay(lowestPurchasePrice, currencySymbol).decimals
                        : ""}
                    </Text>
                  </HStack>
                </Stat>
                <Stat size="sm">
                  <StatLabel fontSize="xs" color={mutedColor}>
                    Highest Cost
                  </StatLabel>
                  <HStack spacing={0} align="baseline">
                    <StatNumber fontSize="sm" color="gray.600">
                      {isLoadingTransactions
                        ? "Loading..."
                        : highestPurchasePrice !== null
                        ? splitCurrencyForDisplay(highestPurchasePrice, currencySymbol).main
                        : "--"}
                    </StatNumber>
                    <Text fontSize="xs" color="gray.600" opacity={0.7}>
                      {isLoadingTransactions
                        ? ""
                        : highestPurchasePrice !== null
                        ? splitCurrencyForDisplay(highestPurchasePrice, currencySymbol).decimals
                        : ""}
                    </Text>
                  </HStack>
                </Stat>
             </SimpleGrid>

            <Divider mb={3} />

            <SimpleGrid columns={{ base: 2, md: 4 }} spacing={2} w="full">
              <Button
                size="sm"
                colorScheme="teal"
                variant="outline"
                onClick={(e) => {
                  e.stopPropagation();
                  onBuySell(asset);
                }}
                sx={{ fontSize: "xs" }}
                w="full"
              >
                Buy/Sell
              </Button>
              <Button
                size="sm"
                colorScheme="purple"
                variant="outline"
                onClick={(e) => {
                  e.stopPropagation();
                  onUpdatePrice(asset);
                }}
                sx={{ fontSize: "xs" }}
                w="full"
              >
                Update Price
              </Button>
              {!hasHoldings && onDelete && (
                <Button
                  size="sm"
                  colorScheme="red"
                  variant="outline"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteDialogOpen();
                  }}
                  sx={{ fontSize: "xs" }}
                  w="full"
                >
                  Delete
                </Button>
              )}
            </SimpleGrid>
          </Box>
        </Collapse>
      </CardBody>

      {/* Delete Confirmation Modal */}
      {!hasHoldings && onDelete && (
        <Modal
          isOpen={isDeleteDialogOpen}
          onClose={onDeleteDialogClose}
          size={modalSize}
          motionPreset="slideInBottom"
        >
          <ModalOverlay />
          <ModalContent
            margin={isMobile ? 0 : "auto"}
            borderRadius={isMobile ? 0 : "md"}
          >
            <ModalHeader>Delete Physical Asset</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              Are you sure you want to delete &ldquo;{asset.name}&rdquo;?
              <br />
              This action cannot be undone.
            </ModalBody>
            <ModalFooter>
              <Button
                variant="ghost"
                mr={3}
                onClick={onDeleteDialogClose}
              >
                Cancel
              </Button>
              <Button
                colorScheme="red"
                onClick={() => {
                  onDelete(asset);
                  onDeleteDialogClose();
                }}
              >
                Delete
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      )}
    </Card>
  );
};

export default AssetSummaryCard;
