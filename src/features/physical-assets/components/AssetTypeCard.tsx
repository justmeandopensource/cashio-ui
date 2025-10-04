import { FC, useState, useEffect } from "react";
import {
  Box,
  Text,
  Button,
  VStack,
  HStack,
  Grid,
  GridItem,
  Card,
  CardBody,
  CardHeader,
  useColorModeValue,
  Collapse,
  IconButton,
   Divider,
   Badge,
 } from "@chakra-ui/react";
import {
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import { AssetType, PhysicalAsset } from "../types";
import AssetSummaryCard from "./AssetSummaryCard";
import {
  calculateTotalPortfolioValue,
  calculateTotalUnrealizedPnL,
  splitCurrencyForDisplay,
  splitPercentageForDisplay,
} from "../utils";

interface AssetTypeCardProps {
  assetType: AssetType;
  assets: PhysicalAsset[];
  currencySymbol: string;
  // eslint-disable-next-line no-unused-vars
  onCreateAsset: (assetTypeId: number) => void;
  // eslint-disable-next-line no-unused-vars
  onDeleteAssetType: (assetType: AssetType) => void;
  // eslint-disable-next-line no-unused-vars
  onBuySell: (asset: PhysicalAsset) => void;
  // eslint-disable-next-line no-unused-vars
  onUpdatePrice: (asset: PhysicalAsset) => void;
  // eslint-disable-next-line no-unused-vars
  onDeleteAsset: (asset: PhysicalAsset) => void;
}

const AssetTypeCard: FC<AssetTypeCardProps> = ({
  assetType,
  assets,
  currencySymbol,
  onCreateAsset,
  onDeleteAssetType,
  onBuySell,
  onUpdatePrice,
  onDeleteAsset,
}) => {
  const cardBg = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const mutedColor = useColorModeValue("gray.600", "gray.400");

  // State for expanded asset type
  const [isExpanded, setIsExpanded] = useState(false);

  // Calculate asset type metrics
  const assetTypeInvested = assets.reduce(
    (sum, asset) => sum + (asset.total_quantity * asset.average_cost_per_unit),
    0,
  );
  const assetTypeCurrentValue = calculateTotalPortfolioValue(assets);
  const assetTypeUnrealizedPnL = calculateTotalUnrealizedPnL(assets);
  const assetTypePnLPercentage =
    assetTypeInvested > 0 ? (assetTypeUnrealizedPnL / assetTypeInvested) * 100 : 0;

  const toggleExpansion = () => {
    if (assets.length > 0) {
      setIsExpanded(!isExpanded);
    }
  };

  // Auto-collapse when no assets
  useEffect(() => {
    if (assets.length === 0 && isExpanded) {
      setIsExpanded(false);
    }
  }, [assets.length, isExpanded]);

  return (
    <Card
      bg={cardBg}
      borderColor={borderColor}
      borderWidth={1}
      shadow="sm"
      _hover={{ shadow: "md", borderColor: "teal.300" }}
      transition="all 0.2s"
    >
      <CardHeader pt={2} pb={2}>
        <HStack justify="space-between" align="center" w="full">
          <HStack spacing={3}>
            <IconButton
              icon={
                isExpanded ? (
                  <ChevronDown size={20} />
                ) : (
                  <ChevronRight size={20} />
                )
              }
              variant="ghost"
              size="sm"
              aria-label="Expand Asset Type"
              onClick={toggleExpansion}
              isDisabled={assets.length === 0}
              opacity={assets.length === 0 ? 0.5 : 1}
            />
            <Box flex={1}>
              <HStack
                justify="space-between"
                align="center"
                spacing={3}
              >
                <VStack align="start" spacing={0}>
                  <Text
                    fontSize="xl"
                    fontWeight="semibold"
                    color="gray.700"
                  >
                    {assetType.name}
                  </Text>
                  {assetType.description && (
                    <Text color="gray.600" fontSize="md">
                      {assetType.description}
                    </Text>
                  )}
                </VStack>
                <HStack spacing={2}>
                  <Button
                    size="xs"
                    colorScheme="teal"
                    variant="ghost"
                    onClick={() => onCreateAsset(assetType.asset_type_id)}
                  >
                    Create Asset
                  </Button>
                  {assets.length === 0 && (
                    <Button
                      size="xs"
                      colorScheme="red"
                      variant="ghost"
                      onClick={() => onDeleteAssetType(assetType)}
                    >
                      Delete Type
                    </Button>
                  )}
                </HStack>
              </HStack>
            </Box>
          </HStack>
          <HStack spacing={6} align="center" display={{ base: "none", lg: "flex" }}>
            <VStack align="end" spacing={1}>
              {assetTypeInvested === 0 ? (
                <>
                  <Text
                    fontSize="lg"
                    color="gray.400"
                    fontWeight="medium"
                  >
                    --
                  </Text>
                  <Text fontSize="xs" color={mutedColor}>
                    Invested
                  </Text>
                </>
              ) : (
                <>
                  <HStack spacing={0} align="baseline">
                    <Text
                      fontSize="lg"
                      color={mutedColor}
                      fontWeight="medium"
                    >
                      {
                        splitCurrencyForDisplay(
                          assetTypeInvested,
                          currencySymbol,
                        ).main
                      }
                    </Text>
                    <Text
                      fontSize="md"
                      color={mutedColor}
                      fontWeight="medium"
                      opacity={0.7}
                    >
                      {
                        splitCurrencyForDisplay(
                          assetTypeInvested,
                          currencySymbol,
                        ).decimals
                      }
                    </Text>
                  </HStack>
                  <Text fontSize="xs" color={mutedColor}>
                    Invested
                  </Text>
                </>
              )}
            </VStack>
            <VStack align="end" spacing={1}>
              {assetTypeCurrentValue === 0 ? (
                <>
                  <Text
                    fontSize="lg"
                    color="gray.400"
                    fontWeight="medium"
                  >
                    --
                  </Text>
                  <Text
                    fontSize="xs"
                    color={mutedColor}
                    fontWeight="medium"
                  >
                    Value
                  </Text>
                </>
              ) : (
                <>
                  <HStack spacing={0} align="baseline">
                    <Text
                      fontSize="lg"
                      fontWeight="semibold"
                      color="teal.600"
                    >
                      {
                        splitCurrencyForDisplay(
                          assetTypeCurrentValue,
                          currencySymbol,
                        ).main
                      }
                    </Text>
                    <Text
                      fontSize="md"
                      fontWeight="semibold"
                      color="teal.600"
                      opacity={0.7}
                    >
                      {
                        splitCurrencyForDisplay(
                          assetTypeCurrentValue,
                          currencySymbol,
                        ).decimals
                      }
                    </Text>
                  </HStack>
                  <Text
                    fontSize="xs"
                    color={mutedColor}
                    fontWeight="medium"
                  >
                    Value
                  </Text>
                </>
              )}
            </VStack>
            <VStack align="end" spacing={1}>
              {assets.length === 0 ||
              assetTypeUnrealizedPnL === 0 ? (
                <>
                  <Text
                    fontSize="lg"
                    color="gray.400"
                    fontWeight="medium"
                  >
                    --
                  </Text>
                  <Text fontSize="xs" color={mutedColor}>
                    Unrealized P&L
                  </Text>
                </>
              ) : (
                <>
                  <HStack spacing={2} align="baseline">
                    <HStack spacing={0} align="baseline">
                      <Text
                        fontSize="lg"
                        fontWeight="semibold"
                        color={
                          assetTypeUnrealizedPnL >= 0
                            ? "green.500"
                            : "red.500"
                        }
                      >
                        {
                          splitCurrencyForDisplay(
                            Math.abs(assetTypeUnrealizedPnL),
                            currencySymbol,
                          ).main
                        }
                      </Text>
                      <Text
                        fontSize="md"
                        fontWeight="semibold"
                        color={
                          assetTypeUnrealizedPnL >= 0
                            ? "green.500"
                            : "red.500"
                        }
                        opacity={0.7}
                      >
                        {
                          splitCurrencyForDisplay(
                            Math.abs(assetTypeUnrealizedPnL),
                            currencySymbol,
                          ).decimals
                        }
                      </Text>
                    </HStack>
                    <Badge
                      colorScheme={
                        assetTypeUnrealizedPnL >= 0
                          ? "green"
                          : "red"
                      }
                      size="sm"
                      fontWeight="medium"
                      px={1.5}
                      py={0.25}
                      borderRadius="md"
                    >
                      <HStack spacing={0} align="baseline">
                        <Text fontSize="xs" fontWeight="semibold">
                          {
                            splitPercentageForDisplay(
                              assetTypePnLPercentage,
                            ).main
                          }
                        </Text>
                         <Text
                           fontSize="xs"
                           fontWeight="semibold"
                           opacity={0.7}
                         >
                           {
                             splitPercentageForDisplay(
                               assetTypePnLPercentage,
                             ).decimals
                           }
                         </Text>
                      </HStack>
                    </Badge>
                  </HStack>
                  <Text fontSize="xs" color={mutedColor}>
                    Unrealized P&L
                  </Text>
                </>
              )}
            </VStack>
            <VStack align="end" spacing={1}>
              {assets.length === 0 ? (
                <>
                  <Text
                    fontSize="md"
                    color="gray.400"
                    fontWeight="medium"
                  >
                    --
                  </Text>
                  <Text fontSize="xs" color={mutedColor}>
                    Assets
                  </Text>
                </>
              ) : (
                <>
                  <Text
                    fontSize="md"
                    fontWeight="semibold"
                    color="blue.600"
                  >
                    {assets.length}
                  </Text>
                  <Text fontSize="xs" color={mutedColor}>
                    Asset{assets.length !== 1 ? "s" : ""}
                  </Text>
                </>
              )}
            </VStack>
          </HStack>
        </HStack>
      </CardHeader>

      <Collapse in={isExpanded} animateOpacity>
        <CardBody pt={0}>
          <Box display={{ base: "block", lg: "none" }} mb={4}>
            <Divider mb={4} />
            <HStack spacing={4} justify="space-around">
              <VStack align="center" spacing={1}>
                <Text fontSize="sm" color={mutedColor}>
                  Invested
                </Text>
                <Text fontSize="md" color={mutedColor}>
                  {assetTypeInvested === 0
                    ? "--"
                    : splitCurrencyForDisplay(assetTypeInvested, currencySymbol)
                        .main}
                </Text>
              </VStack>
              <VStack align="center" spacing={1}>
                <Text fontSize="sm" color={mutedColor}>
                  Value
                </Text>
                <Text fontSize="md" color="teal.600">
                  {assetTypeCurrentValue === 0
                    ? "--"
                    : splitCurrencyForDisplay(
                        assetTypeCurrentValue,
                        currencySymbol,
                      ).main}
                </Text>
              </VStack>
              <VStack align="center" spacing={1}>
                <Text fontSize="sm" color={mutedColor}>
                  Unrealized P&L
                </Text>
                <Text
                  fontSize="md"
                  color={
                    assetTypeUnrealizedPnL >= 0
                      ? "green.500"
                      : "red.500"
                  }
                >
                  {assetTypeUnrealizedPnL === 0
                    ? "--"
                    : splitCurrencyForDisplay(
                        Math.abs(assetTypeUnrealizedPnL),
                        currencySymbol,
                      ).main}
                </Text>
              </VStack>
              <VStack align="center" spacing={1}>
                <Text fontSize="sm" color={mutedColor}>
                  Assets
                </Text>
                <Text fontSize="md" color="blue.600">
                  {assets.length}
                </Text>
              </VStack>
            </HStack>
            <Divider mt={4} />
          </Box>
           <Grid
             templateColumns={{
               base: "1fr",
               md: "repeat(2, 1fr)",
               lg: "repeat(3, 1fr)",
               xl: "repeat(3, 1fr)",
             }}
             gap={4}
             w="full"
           >
             {assets.map((asset) => (
               <GridItem key={asset.physical_asset_id}>
                 <AssetSummaryCard
                   asset={asset}
                   currencySymbol={currencySymbol}
                   onBuySell={onBuySell}
                   onUpdatePrice={onUpdatePrice}
                   onDelete={onDeleteAsset}
                 />
               </GridItem>
             ))}
           </Grid>
         </CardBody>
      </Collapse>
    </Card>
  );
};

export default AssetTypeCard;