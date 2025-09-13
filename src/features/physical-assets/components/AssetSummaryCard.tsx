import { FC, useRef } from "react";
import {
  Box,
  Button,
  Text,
  Icon,
  Badge,
  VStack,
  HStack,
  useColorModeValue,
  Skeleton,
  SkeletonText,
  Stack,
  Divider,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  useDisclosure,
  IconButton,
} from "@chakra-ui/react";
import {
  Package,
  TrendingUp,
  TrendingDown,
  BarChart3,
  Calendar,
  Coins,
  Trash2,
} from "lucide-react";
import { AssetSummaryCardProps } from "../types";
import {
  calculateUnrealizedPnL,
  calculateUnrealizedPnLPercentage,
  calculateHighestPurchasePrice,
  calculateLowestPurchasePrice,
  splitCurrencyForDisplay,
  splitQuantityForDisplay,
  splitPercentageForDisplay,
  getPnLColor,
  getAssetTypeDisplayName,
} from "../utils";
import { useAssetTransactions } from "../api";

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
  ledgerId,
  onBuySell,
  onUpdatePrice,
  onDelete,
}) => {
  const bgColor = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.600");
  const cardBg = useColorModeValue("gray.50", "gray.700");
  const textSecondary = useColorModeValue("gray.600", "gray.400");
  const textTertiary = useColorModeValue("gray.500", "gray.500");

  const unrealizedPnL = calculateUnrealizedPnL(asset);
  const unrealizedPnLPercentage = calculateUnrealizedPnLPercentage(asset);
  const hasHoldings = asset.total_quantity > 0;

  // Delete confirmation dialog
   const {
     isOpen: isDeleteDialogOpen,
     onOpen: onDeleteDialogOpen,
     onClose: onDeleteDialogClose,
   } = useDisclosure();
   const cancelRef = useRef<any>(null);

  // Fetch transaction data for purchase price calculations
  const { data: transactions = [] } = useAssetTransactions(
    ledgerId,
    asset.physical_asset_id,
  );

  // Calculate highest and lowest purchase prices from buy transactions only
  const highestPurchasePrice = calculateHighestPurchasePrice(transactions);
  const lowestPurchasePrice = calculateLowestPurchasePrice(transactions);

  const pnlColor = getPnLColor(unrealizedPnL);
  const isPositive = unrealizedPnL >= 0;

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
       {/* Modern Gradient Header */}
      <Box
        bgGradient={hasHoldings ? "linear(135deg, teal.400, teal.600)" : "linear(135deg, gray.400, gray.600)"}
        p={4}
        color="white"
        position="relative"
        _before={{
          content: '""',
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          bgGradient: "linear(45deg, transparent, whiteAlpha.100)",
          pointerEvents: "none",
        }}
      >
         <HStack spacing={3} mb={3} position="relative">
           <Box
             p={2}
             bg="whiteAlpha.200"
             borderRadius="lg"
             backdropFilter="blur(10px)"
           >
             <Icon as={Package} boxSize={6} />
           </Box>

           <VStack align="start" spacing={1} flex={1}>
             <Text fontSize="xl" fontWeight="bold" lineHeight="1.2">
               {asset.name}
             </Text>
             {asset.asset_type && (
               <Badge
                 bg="whiteAlpha.200"
                 color="white"
                 fontSize="xs"
                 borderRadius="full"
                 px={3}
                 py={1}
                 fontWeight="semibold"
               >
                 {getAssetTypeDisplayName(asset.asset_type)}
               </Badge>
             )}
           </VStack>

           <HStack spacing={2}>
              <Badge
                bg="whiteAlpha.200"
                color="white"
                variant="solid"
                borderRadius="full"
                px={3}
                py={2}
                fontSize="sm"
                fontWeight="bold"
              >
               {hasHoldings ? "Holding" : "Available"}
             </Badge>
             {!hasHoldings && onDelete && (
               <IconButton
                 aria-label="Delete asset"
                 icon={<Trash2 />}
                 size="sm"
                 colorScheme="red"
                 variant="ghost"
                 color="whiteAlpha.700"
                 _hover={{
                   color: "red.300",
                   bg: "whiteAlpha.100",
                 }}
                 onClick={onDeleteDialogOpen}
               />
             )}
           </HStack>
         </HStack>
      </Box>

      {/* Content */}
      <Box p={4}>
        <VStack spacing={4} align="stretch">
          {/* Current Value - Only show for assets with holdings */}
          {hasHoldings && (
            <Box
              bg={cardBg}
              p={4}
              borderRadius="lg"
              border="1px solid"
              borderColor={borderColor}
            >
             <VStack align="center" spacing={1}>
               <Text fontSize="sm" color={textSecondary} fontWeight="medium">
                 Current Value
               </Text>
               <HStack spacing={0} align="baseline">
                 <Text fontSize="2xl" fontWeight="bold" color="teal.600">
                   {splitCurrencyForDisplay(asset.current_value, currencySymbol).main}
                 </Text>
                 <Text fontSize="lg" fontWeight="bold" color="teal.600" opacity={0.7}>
                   {splitCurrencyForDisplay(asset.current_value, currencySymbol).decimals}
                 </Text>
               </HStack>
             </VStack>
            </Box>
          )}

           {/* Price Information */}
           <Box
             bg={cardBg}
             p={4}
             borderRadius="lg"
             border="1px solid"
             borderColor={borderColor}
           >
             <HStack justify="space-between" align="center">
               <VStack align="start" spacing={1}>
                 <HStack>
                   <Icon as={BarChart3} boxSize={3} color={textSecondary} />
                   <Text fontSize="xs" color={textTertiary}>
                     Latest Price
                   </Text>
                 </HStack>
                 <HStack spacing={0} align="baseline">
                   <Text fontSize="sm" fontWeight="medium">
                     {splitCurrencyForDisplay(asset.latest_price_per_unit, currencySymbol).main}
                   </Text>
                   <Text fontSize="xs" fontWeight="medium" opacity={0.7}>
                     {splitCurrencyForDisplay(asset.latest_price_per_unit, currencySymbol).decimals}
                   </Text>
                   <Text as="span" fontSize="xs" color={textSecondary}>
                     /{asset.asset_type?.unit_symbol || ""}
                   </Text>
                 </HStack>
               </VStack>

               {hasHoldings && (
                 <VStack align="end" spacing={1}>
                   <HStack justify="end">
                     <Icon as={Coins} boxSize={3} color={textSecondary} />
                     <Text fontSize="xs" color={textTertiary}>
                       Holdings
                     </Text>
                   </HStack>
                   <HStack spacing={0} align="baseline">
                     <Text fontSize="sm" fontWeight="medium">
                       {splitQuantityForDisplay(asset.total_quantity).main}
                     </Text>
                     <Text fontSize="xs" fontWeight="medium" opacity={0.6}>
                       {splitQuantityForDisplay(asset.total_quantity).decimals}
                     </Text>
                     <Text as="span" fontSize="xs" color={textSecondary} ml={1}>
                       {asset.asset_type?.unit_symbol || ""}
                     </Text>
                   </HStack>
                 </VStack>
               )}
             </HStack>
           </Box>

          {/* Price Range - Only show if we have transaction data */}
          {(highestPurchasePrice !== null || lowestPurchasePrice !== null) && (
            <Box
              bg={cardBg}
              p={4}
              borderRadius="lg"
              border="1px solid"
              borderColor={borderColor}
            >
              <HStack justify="space-between" align="center">
                {lowestPurchasePrice !== null && (
                  <VStack align="start" spacing={1}>
                    <Text fontSize="xs" color={textTertiary}>
                      Lowest Price
                    </Text>
                    <HStack spacing={0} align="baseline">
                      <Text fontSize="sm" fontWeight="medium">
                        {splitCurrencyForDisplay(lowestPurchasePrice, currencySymbol).main}
                      </Text>
                      <Text fontSize="xs" fontWeight="medium" opacity={0.7}>
                        {splitCurrencyForDisplay(lowestPurchasePrice, currencySymbol).decimals}
                      </Text>
                      <Text as="span" fontSize="xs" color={textSecondary}>
                        /{asset.asset_type?.unit_symbol || ""}
                      </Text>
                    </HStack>
                  </VStack>
                )}

                {highestPurchasePrice !== null && (
                  <VStack align="end" spacing={1}>
                    <Text fontSize="xs" color={textTertiary}>
                      Highest Price
                    </Text>
                    <HStack spacing={0} align="baseline">
                      <Text fontSize="sm" fontWeight="medium">
                        {splitCurrencyForDisplay(highestPurchasePrice, currencySymbol).main}
                      </Text>
                      <Text fontSize="xs" fontWeight="medium" opacity={0.7}>
                        {splitCurrencyForDisplay(highestPurchasePrice, currencySymbol).decimals}
                      </Text>
                      <Text as="span" fontSize="xs" color={textSecondary}>
                        /{asset.asset_type?.unit_symbol || ""}
                      </Text>
                    </HStack>
                  </VStack>
                )}
              </HStack>
             </Box>
           )}

           {/* P&L Section - Enhanced */}
           {hasHoldings && (
             <Box
               bg={isPositive ? "green.50" : "red.50"}
               border="1px solid"
               borderColor={isPositive ? "green.200" : "red.200"}
               p={3}
               borderRadius="lg"
             >
               <HStack justify="space-between" align="center">
                 <VStack align="start" spacing={1}>
                   <HStack>
                     <Icon
                       as={isPositive ? TrendingUp : TrendingDown}
                       boxSize={4}
                       color={pnlColor}
                     />
                     <Text
                       fontSize="sm"
                       color={textSecondary}
                       fontWeight="medium"
                     >
                       Unrealized P&L
                     </Text>
                   </HStack>
                    <HStack spacing={0} align="baseline">
                      <Text fontWeight="bold" fontSize="lg" color={pnlColor}>
                        {splitCurrencyForDisplay(Math.abs(unrealizedPnL), currencySymbol).main}
                      </Text>
                      <Text fontWeight="bold" fontSize="md" color={pnlColor} opacity={0.7}>
                        {splitCurrencyForDisplay(Math.abs(unrealizedPnL), currencySymbol).decimals}
                      </Text>
                    </HStack>
                 </VStack>

                 <Box
                   bg={isPositive ? "green.500" : "red.500"}
                   color="white"
                   px={3}
                   py={2}
                   borderRadius="full"
                 >
                    <HStack spacing={0} align="baseline">
                      <Text fontSize="sm" fontWeight="bold">
                        {splitPercentageForDisplay(unrealizedPnLPercentage).main}
                      </Text>
                      <Text fontSize="xs" fontWeight="bold" opacity={0.7}>
                        {splitPercentageForDisplay(unrealizedPnLPercentage).decimals}%
                      </Text>
                    </HStack>
                 </Box>
               </HStack>
             </Box>
           )}

           {/* Modern Action Buttons */}
           <Stack direction="row" spacing={3}>
              <Button
                colorScheme="teal"
                size="md"
                flex={1}
                borderRadius="lg"
                onClick={() => onBuySell(asset)}
                leftIcon={hasHoldings ? <Coins /> : <TrendingUp />}
                _hover={{
                  bg: "teal.600",
                }}
                transition="all 0.2s"
                fontWeight="semibold"
              >
               {hasHoldings ? "Buy/Sell" : "Buy"}
             </Button>

               <Button
                 variant="outline"
                 size="md"
                 flex={1}
                 borderRadius="lg"
                 borderWidth="1px"
                 borderColor="gray.200"
                 color={textSecondary}
                 onClick={() => onUpdatePrice(asset)}
                 _hover={{
                   bg: "gray.50",
                   borderColor: "gray.300",
                 }}
                 transition="all 0.2s"
                 fontWeight="medium"
               >
               Update Price
             </Button>
           </Stack>

          {/* Additional Info */}
          {(asset.notes || asset.last_price_update) && (
            <>
              <Divider />
              <VStack align="start" spacing={2}>
                {asset.notes && (
                  <Box>
                    <Text fontSize="xs" color={textTertiary} mb={1}>
                      Notes
                    </Text>
                    <Text fontSize="sm" color={textSecondary} noOfLines={2}>
                      {asset.notes}
                    </Text>
                  </Box>
                )}

                {asset.last_price_update && (
                  <HStack>
                    <Icon as={Calendar} boxSize={3} color={textTertiary} />
                     <Text fontSize="xs" color={textTertiary}>
                       Last updated:{" "}
                       {new Date(asset.last_price_update).toISOString().split('T')[0].replace(/-/g, '/')}
                     </Text>
                  </HStack>
                )}
              </VStack>
            </>
           )}
         </VStack>
       </Box>

       {/* Delete Confirmation Dialog */}
       {!hasHoldings && onDelete && (
         <AlertDialog
           isOpen={isDeleteDialogOpen}
           onClose={onDeleteDialogClose}
            leastDestructiveRef={cancelRef}
         >
           <AlertDialogOverlay>
             <AlertDialogContent>
               <AlertDialogHeader fontSize="lg" fontWeight="bold">
                 Delete Physical Asset
               </AlertDialogHeader>

              <AlertDialogBody>
                Are you sure you want to delete &ldquo;{asset.name}&rdquo;? This action cannot be undone.
                This will permanently remove the asset from your portfolio.
              </AlertDialogBody>

                <AlertDialogFooter>
                  <Button ref={cancelRef} onClick={onDeleteDialogClose}>
                    Cancel
                  </Button>
                 <Button
                   colorScheme="red"
                   onClick={() => {
                     onDelete(asset);
                     onDeleteDialogClose();
                   }}
                   ml={3}
                 >
                   Delete
                 </Button>
               </AlertDialogFooter>
             </AlertDialogContent>
           </AlertDialogOverlay>
         </AlertDialog>
       )}
     </Box>
   );
 };

export default AssetSummaryCard;
