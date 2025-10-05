import { FC } from "react";
import {
  Box,
  Text,
  Button,
  VStack,
  HStack,
  SimpleGrid,
  Flex,
  Icon,
  useColorModeValue,
} from "@chakra-ui/react";
import {
  Coins,
  Plus,
  Package,
} from "lucide-react";
import { PhysicalAsset, AssetType } from "../types";
import {
  splitCurrencyForDisplay,
  splitPercentageForDisplay,
  getPnLColor,
  calculateTotalPortfolioValue,
  calculateTotalUnrealizedPnL,
  calculateTotalUnrealizedPnLPercentage,
} from "../utils";
import useLedgerStore from "../../../components/shared/store";
import PhysicalAssetsTable from "./PhysicalAssetsTable";

/* eslint-disable no-unused-vars */
interface PhysicalAssetsOverviewProps {
  assetTypes: AssetType[];
  physicalAssets: PhysicalAsset[];
  onCreateAssetType: () => void;
  onCreateAsset: () => void;
  onBuySell: (assetId: number) => void;
  onUpdatePrice: (asset: PhysicalAsset) => void;
  onViewTransactions: (asset: PhysicalAsset) => void;
    filters: {
      selectedAssetType: string;
      showZeroBalance: boolean;
      searchTerm?: string;
    };
    onFiltersChange: (filters: {
      selectedAssetType: string;
      showZeroBalance: boolean;
      searchTerm?: string;
    }) => void;
}
/* eslint-enable no-unused-vars */

const PhysicalAssetsOverview: FC<PhysicalAssetsOverviewProps> = ({
  assetTypes,
  physicalAssets,
  onCreateAssetType,
  onCreateAsset,
  onBuySell,
  onUpdatePrice,
  onViewTransactions,
  filters,
  onFiltersChange,
}) => {
  const { currencySymbol } = useLedgerStore();
  const emptyStateBg = useColorModeValue("gray.50", "gray.800");
  const emptyStateTextColor = useColorModeValue("gray.600", "gray.400");

  // Helper function to convert string|number to number
  const toNumber = (value: number | string): number =>
    typeof value === "string" ? parseFloat(value) : value;

  const filteredAssets = physicalAssets.filter((asset) => {
    if (filters.selectedAssetType !== "all") {
      const assetType = assetTypes.find((type) => type.asset_type_id === asset.asset_type_id);
      if (assetType?.name !== filters.selectedAssetType) return false;
    }
    if (!filters.showZeroBalance && toNumber(asset.total_quantity) <= 0) return false;
    if (filters.searchTerm && filters.searchTerm.trim() !== "") {
      const searchLower = filters.searchTerm.toLowerCase();
      const assetType = assetTypes.find((type) => type.asset_type_id === asset.asset_type_id);
      if (!asset.name.toLowerCase().includes(searchLower) &&
          !assetType?.name.toLowerCase().includes(searchLower)) return false;
    }
    return true;
  });

  const totalInvested = filteredAssets.reduce(
    (sum, asset) => sum + toNumber(asset.total_quantity) * toNumber(asset.average_cost_per_unit),
    0
  );
  const totalCurrentValue = calculateTotalPortfolioValue(filteredAssets);
  const totalUnrealizedPnL = calculateTotalUnrealizedPnL(filteredAssets);
  const totalPnLPercentage = calculateTotalUnrealizedPnLPercentage(filteredAssets);

  return (
    <Box>
      <VStack spacing={6} align="stretch">
        {assetTypes.length > 0 && (
          <Box p={{ base: 4, md: 6 }} bg="white" borderRadius="lg" boxShadow="sm">
            <Flex
              direction={{ base: "column", md: "row" }}
              justify="space-between"
              align={{ base: "start", md: "center" }}
              mb={4}
              gap={{ base: 4, md: 0 }}
            >
              <Flex align="center" mb={{ base: 2, md: 0 }}>
                <Icon as={Coins} mr={2} color="teal.500" />
                <Text
                  fontSize={{ base: "lg", md: "xl" }}
                  fontWeight="semibold"
                  color="gray.700"
                >
                  Physical Assets Portfolio
                </Text>
              </Flex>
              <Flex gap={2} width={{ base: "full", md: "auto" }} direction={{ base: "column", md: "row" }}>
                <Button
                  leftIcon={<Package size={16} />}
                  colorScheme="teal"
                  variant="outline"
                  size={{ base: "md", md: "sm" }}
                  onClick={onCreateAssetType}
                >
                  Asset Type
                </Button>
                <Button
                  leftIcon={<Plus size={16} />}
                  colorScheme="teal"
                  variant="solid"
                  size={{ base: "md", md: "sm" }}
                  onClick={onCreateAsset}
                >
                  Physical Asset
                </Button>
              </Flex>
            </Flex>

            <SimpleGrid
              columns={{ base: 1, sm: 2, lg: 4 }}
              spacing={{ base: 4, md: 6 }}
            >
              <Box p={4} borderRadius="lg" boxShadow="md" bg={emptyStateBg}>
                <Text fontSize="sm" color="gray.600" mb={1}>
                  Total Invested
                </Text>
                <HStack spacing={0} align="baseline">
                  <Text
                    fontSize={{ base: "xl", md: "2xl" }}
                    fontWeight="semibold"
                    color="gray.600"
                  >
                    {splitCurrencyForDisplay(totalInvested, currencySymbol || "₹").main}
                  </Text>
                  <Text
                    fontSize={{ base: "md", md: "lg" }}
                    fontWeight="semibold"
                    color="gray.600"
                    opacity={0.7}
                  >
                    {splitCurrencyForDisplay(totalInvested, currencySymbol || "₹").decimals}
                  </Text>
                </HStack>
              </Box>

              <Box p={4} borderRadius="lg" boxShadow="md" bg={emptyStateBg}>
                <Text fontSize="sm" color="gray.600" mb={1}>
                  Total Value
                </Text>
                <HStack spacing={0} align="baseline">
                  <Text
                    fontSize={{ base: "xl", md: "2xl" }}
                    fontWeight="semibold"
                    color="teal.600"
                  >
                    {splitCurrencyForDisplay(totalCurrentValue, currencySymbol || "₹").main}
                  </Text>
                  <Text
                    fontSize={{ base: "md", md: "lg" }}
                    fontWeight="semibold"
                    color="teal.600"
                    opacity={0.7}
                  >
                    {splitCurrencyForDisplay(totalCurrentValue, currencySymbol || "₹").decimals}
                  </Text>
                </HStack>
              </Box>

              <Box p={4} borderRadius="lg" boxShadow="md" bg={emptyStateBg}>
                <Text fontSize="sm" color="gray.600" mb={1}>
                  Total Unrealized P&L
                </Text>
                <VStack align="start" spacing={0}>
                  <HStack spacing={0} align="baseline">
                    <Text
                      fontSize={{ base: "xl", md: "2xl" }}
                      fontWeight="semibold"
                      color={getPnLColor(totalUnrealizedPnL)}
                    >
                      {
                        splitCurrencyForDisplay(
                          Math.abs(totalUnrealizedPnL),
                          currencySymbol || "₹",
                        ).main
                      }
                    </Text>
                    <Text
                      fontSize={{ base: "md", md: "lg" }}
                      fontWeight="semibold"
                      color={getPnLColor(totalUnrealizedPnL)}
                      opacity={0.7}
                    >
                      {
                        splitCurrencyForDisplay(
                          Math.abs(totalUnrealizedPnL),
                          currencySymbol || "₹",
                        ).decimals
                      }
                    </Text>
                  </HStack>
                   <HStack spacing={0} align="baseline">
                     <Text
                       fontSize="sm"
                       color={getPnLColor(totalPnLPercentage)}
                     >
                       {splitPercentageForDisplay(totalPnLPercentage).main}
                     </Text>
                     <Text
                       fontSize="xs"
                       color={getPnLColor(totalPnLPercentage)}
                       opacity={0.7}
                     >
                       {splitPercentageForDisplay(totalPnLPercentage).decimals}
                     </Text>
                   </HStack>
                </VStack>
              </Box>

              <Box p={4} borderRadius="lg" boxShadow="md" bg={emptyStateBg}>
                <Text fontSize="sm" color="gray.600" mb={1}>
                  Total Assets
                </Text>
                <VStack align="start" spacing={0}>
                  <Text
                    fontSize={{ base: "xl", md: "2xl" }}
                    fontWeight="bold"
                    color="blue.600"
                  >
                    {filteredAssets.filter(asset => toNumber(asset.total_quantity) > 0).length}
                  </Text>
                  <Text fontSize="xs" color="gray.500">
                    Across {assetTypes.length} Asset Type{assetTypes.length !== 1 ? "s" : ""}
                  </Text>
                </VStack>
              </Box>
            </SimpleGrid>
          </Box>
        )}

          {assetTypes.length === 0 ? (
            <Box
              p={12}
              textAlign="center"
              bg={emptyStateBg}
              borderRadius="lg"
              border="2px dashed"
              borderColor="gray.300"
            >
              <VStack spacing={4}>
                <Icon as={Coins} boxSize={16} color="gray.400" />
                <VStack spacing={2}>
                  <Text fontSize="xl" fontWeight="semibold" color="gray.700">
                    No Asset Types Created Yet
                  </Text>
                  <Text fontSize="md" color={emptyStateTextColor} maxW="400px">
                    Create your first Asset Type to start tracking physical assets
                  </Text>
                </VStack>
                <Button colorScheme="teal" onClick={onCreateAssetType} size="lg">
                  Create Your First Asset Type
                </Button>
              </VStack>
            </Box>
          ) : physicalAssets.length === 0 ? (
            <Box
              p={12}
              textAlign="center"
              bg={emptyStateBg}
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
                  <Text fontSize="md" color={emptyStateTextColor} maxW="400px">
                    Create your first physical asset to start tracking your portfolio
                  </Text>
                </VStack>
                <Button colorScheme="teal" onClick={onCreateAsset} size="lg">
                  Create Your First Asset
                </Button>
              </VStack>
            </Box>
         ) : (
             <PhysicalAssetsTable
               assetTypes={assetTypes}
               physicalAssets={physicalAssets}
               onBuySell={onBuySell}
               onUpdatePrice={onUpdatePrice}
               onViewTransactions={onViewTransactions}
               filters={filters}
               onFiltersChange={onFiltersChange}
             />
         )}
      </VStack>
    </Box>
  );
};

export default PhysicalAssetsOverview;