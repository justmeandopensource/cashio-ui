import { useQueryClient } from "@tanstack/react-query";
import { FC, useState, useRef, RefObject, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Alert,
  AlertDescription,
  AlertIcon,
  AlertTitle,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  Badge,
  Box,
  Button,
  Flex,
  HStack,
  Icon,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Spinner,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Text,
  useDisclosure,
  useToast,
  VStack,
  IconButton,
} from "@chakra-ui/react";
import { Plus, Coins, Package, Trash2, AlertTriangle } from "lucide-react";
import useLedgerStore from "@/components/shared/store";
import { usePhysicalAssets, useAssetTypes, useDeletePhysicalAsset, useDeleteAssetType } from "./api";
import { toastDefaults } from "@/components/shared/utils";
import AssetSummaryCard, { AssetSummaryCardSkeleton } from "./components/AssetSummaryCard";
import BuySellAssetModal from "./components/BuySellAssetModal";
import CreateAssetTypeModal from "./components/CreateAssetTypeModal";
import CreatePhysicalAssetModal from "./components/CreatePhysicalAssetModal";
import UpdatePriceModal from "./components/UpdatePriceModal";
import EmptyStateAssets from "./components/EmptyStateAssets";
import EmptyStateTransactions from "./components/EmptyStateTransactions";
import AssetTransactionHistory from "./components/AssetTransactionHistory";
import {
  calculateTotalPortfolioValue,
  calculateTotalUnrealizedPnL,
  calculateTotalUnrealizedPnLPercentage,
  splitCurrencyForDisplay,
  splitPercentageForDisplay,
  getPnLColor,
} from "./utils";
import { PhysicalAsset, AssetType } from "./types";

// Map subtab names to indices for physical assets
const subTabMap = {
  assets: 0,
  transactions: 1,
};

const PhysicalAssets: FC = () => {
  const queryClient = useQueryClient();
  const toast = useToast();
  const { ledgerId, currencySymbol } = useLedgerStore();
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedAsset, setSelectedAsset] = useState<PhysicalAsset | undefined>();

  // Get initial subtab from URL params, default to assets (0)
  const getInitialSubTab = () => {
    const subTabParam = searchParams.get('subtab');
    return subTabParam && subTabMap[subTabParam as keyof typeof subTabMap] !== undefined
      ? subTabMap[subTabParam as keyof typeof subTabMap]
      : 0;
  };

  const [tabIndex, setTabIndex] = useState(getInitialSubTab);

  // Update tabIndex when URL changes
  useEffect(() => {
    const subTabParam = searchParams.get('subtab');
    const newTabIndex = subTabParam && subTabMap[subTabParam as keyof typeof subTabMap] !== undefined
      ? subTabMap[subTabParam as keyof typeof subTabMap]
      : 0;
    setTabIndex(newTabIndex);
  }, [searchParams]);

  // Modal states
  const {
    isOpen: isBuySellModalOpen,
    onOpen: onBuySellModalOpen,
    onClose: onBuySellModalClose,
  } = useDisclosure();

  const {
    isOpen: isCreateAssetTypeModalOpen,
    onOpen: onCreateAssetTypeModalOpen,
    onClose: onCreateAssetTypeModalClose,
  } = useDisclosure();

  const {
    isOpen: isCreateAssetModalOpen,
    onOpen: onCreateAssetModalOpen,
    onClose: onCreateAssetModalClose,
  } = useDisclosure();

  const {
    isOpen: isUpdatePriceModalOpen,
    onOpen: onUpdatePriceModalOpen,
    onClose: onUpdatePriceModalClose,
  } = useDisclosure();

  // Dialog states
  const [isAssetTypeWarningOpen, setIsAssetTypeWarningOpen] = useState(false);
  const [isDeleteAssetTypeDialogOpen, setIsDeleteAssetTypeDialogOpen] = useState(false);
  const [isDeleteAssetTypeErrorOpen, setIsDeleteAssetTypeErrorOpen] = useState(false);
  const [selectedAssetType, setSelectedAssetType] = useState<AssetType | null>(null);
  const cancelRef: RefObject<any> = useRef(null);

  // API queries
  const { data: assets = [], isLoading: assetsLoading, error: assetsError } = usePhysicalAssets(Number(ledgerId) || 0);
  const { data: assetTypes = [] } = useAssetTypes(Number(ledgerId) || 0);

  // Delete mutations
  const deleteAssetMutation = useDeletePhysicalAsset();
  const deleteAssetTypeMutation = useDeleteAssetType();

  // Calculate portfolio summary
  const totalCurrentValue = calculateTotalPortfolioValue(assets);
  const totalPnL = calculateTotalUnrealizedPnL(assets);
  const totalPnLPercentage = calculateTotalUnrealizedPnLPercentage(assets);

  const handleBuySell = (asset: PhysicalAsset) => {
    setSelectedAsset(asset);
    onBuySellModalOpen();
  };

  const handleUpdatePrice = (asset: PhysicalAsset) => {
    setSelectedAsset(asset);
    onUpdatePriceModalOpen();
  };

  const handleDeleteAsset = async (asset: PhysicalAsset) => {
    try {
      await deleteAssetMutation.mutateAsync({
        ledgerId: Number(ledgerId),
        assetId: asset.physical_asset_id,
      });
      toast({
        ...toastDefaults,
        title: "Asset Deleted",
        description: `"${asset.name}" has been successfully deleted from your portfolio.`,
        status: "success",
      });
    } catch {
      toast({
        ...toastDefaults,
        title: "Delete Failed",
        description: `Failed to delete "${asset.name}". Please try again.`,
        status: "error",
      });
    }
  };

  const handleDeleteAssetType = (assetType: AssetType) => {
    setSelectedAssetType(assetType);
    setIsDeleteAssetTypeDialogOpen(true);
  };

  const confirmDeleteAssetType = async () => {
    if (!selectedAssetType) return;

    // Check if there are any assets using this type
    const assetsUsingType = assets.filter(asset => asset.asset_type_id === selectedAssetType.asset_type_id);

    if (assetsUsingType.length > 0) {
      setIsDeleteAssetTypeDialogOpen(false);
      setIsDeleteAssetTypeErrorOpen(true);
      return;
    }

    try {
      await deleteAssetTypeMutation.mutateAsync({
        ledgerId: Number(ledgerId),
        typeId: selectedAssetType.asset_type_id,
      });
      toast({
        ...toastDefaults,
        title: "Asset Type Deleted",
        description: `"${selectedAssetType.name}" has been successfully deleted.`,
        status: "success",
      });
      setIsDeleteAssetTypeDialogOpen(false);
      setSelectedAssetType(null);
    } catch {
      toast({
        ...toastDefaults,
        title: "Delete Failed",
        description: `Failed to delete "${selectedAssetType.name}". Please try again.`,
        status: "error",
      });
      setIsDeleteAssetTypeDialogOpen(false);
      setSelectedAssetType(null);
    }
  };

  const handleCreateAsset = () => {
    if (assetTypes.length === 0) {
      setIsAssetTypeWarningOpen(true);
    } else {
      onCreateAssetModalOpen();
    }
  };

  const handleCreateAssetType = () => {
    onCreateAssetTypeModalOpen();
  };

  const handleTabChange = (index: number) => {
    setTabIndex(index);
    // Update URL with the selected subtab
    const subTabNames = ['assets', 'transactions'];
    const newSearchParams = new URLSearchParams(searchParams);
    newSearchParams.set('subtab', subTabNames[index]);
    setSearchParams(newSearchParams);
  };

  if (assetsError) {
    return (
      <Box p={6}>
        <Alert status="error" borderRadius="md">
          <AlertIcon />
          <AlertTitle>Failed to Load Physical Assets!</AlertTitle>
          <AlertDescription>
            Unable to load your physical assets. This might be due to a network issue or server problem.
            Please check your connection and try refreshing the page. If the problem persists, contact support.
          </AlertDescription>
        </Alert>
      </Box>
    );
  }

  const assetsWithHoldings = assets.filter(asset => asset.total_quantity > 0);
  const assetsWithoutHoldings = assets.filter(asset => asset.total_quantity === 0);

  return (
    <Box>
      {/* Portfolio Summary Header */}
      <Box mb={6} p={{ base: 3, md: 4 }} bg="white" borderRadius="lg" boxShadow="sm">
        <Flex
          direction={{ base: "column", md: "row" }}
          justify="space-between"
          align={{ base: "start", md: "center" }}
          mb={4}
          gap={{ base: 3, md: 0 }}
        >
          <Flex align="center" mb={{ base: 2, md: 0 }}>
            <Icon as={Coins} mr={2} color="teal.500" />
            <Text fontSize={{ base: "lg", md: "xl" }} fontWeight="bold">
              Physical Assets Portfolio
            </Text>
          </Flex>
          <Flex gap={2} width={{ base: "full", md: "auto" }}>
            <Button
              leftIcon={<Plus />}
              colorScheme="teal"
              variant="outline"
              size={{ base: "md", md: "sm" }}
              onClick={handleCreateAssetType}
              flex={{ base: 1, md: "none" }}
            >
              Asset Type
            </Button>
            <Button
              leftIcon={<Plus />}
              colorScheme="teal"
              variant={assetTypes.length === 0 ? "outline" : "solid"}
              size={{ base: "md", md: "sm" }}
              onClick={handleCreateAsset}
              title={assetTypes.length === 0 ? "Create an asset type first" : "Create a new physical asset"}
              flex={{ base: 1, md: "none" }}
            >
              Physical Asset
            </Button>
          </Flex>
        </Flex>

        {/* Portfolio Stats */}
        <Flex
          direction={{ base: "column", md: "row" }}
          gap={{ base: 4, md: 6 }}
          wrap="wrap"
        >
            <Box>
              <Text fontSize="sm" color="gray.600">Current Value</Text>
              <HStack spacing={0} align="baseline">
                <Text fontSize={{ base: "xl", md: "2xl" }} fontWeight="bold" color="teal.600">
                  {splitCurrencyForDisplay(totalCurrentValue, currencySymbol || "$").main}
                </Text>
                <Text fontSize={{ base: "md", md: "lg" }} fontWeight="bold" color="teal.600" opacity={0.7}>
                  {splitCurrencyForDisplay(totalCurrentValue, currencySymbol || "$").decimals}
                </Text>
              </HStack>
            </Box>
            <Box>
              <Text fontSize="sm" color="gray.600">Unrealized P&L</Text>
              <HStack spacing={0} align="baseline">
                 <Text
                 fontSize={{ base: "xl", md: "2xl" }}
                 fontWeight="bold"
                 color={getPnLColor(totalPnL)}
                 >
                 {splitCurrencyForDisplay(Math.abs(totalPnL), currencySymbol || "$").main}
                 </Text>
                 <Text
                 fontSize={{ base: "md", md: "lg" }}
                 fontWeight="bold"
                 color={getPnLColor(totalPnL)}
                 opacity={0.7}
                 >
                 {splitCurrencyForDisplay(Math.abs(totalPnL), currencySymbol || "$").decimals}
                 </Text>
              </HStack>
               <HStack>
                 <HStack spacing={0} align="baseline">
                   <Text
                       fontSize="sm"
                       color={getPnLColor(totalPnL)}
                   >
                       {splitPercentageForDisplay(totalPnLPercentage).main}
                   </Text>
                   <Text
                       fontSize="xs"
                       color={getPnLColor(totalPnL)}
                       opacity={0.7}
                   >
                       {splitPercentageForDisplay(totalPnLPercentage).decimals}%
                   </Text>
                 </HStack>
               </HStack>
            </Box>
          </Flex>
       </Box>

        {/* Main Content */}
       <Box bg="white" overflow="hidden">
        <Tabs variant="soft-rounded" colorScheme="teal" index={tabIndex} onChange={handleTabChange}>
           <Flex
            justifyContent="space-between"
            alignItems="center"
            p={{ base: 2, md: 4 }}
          >
            <TabList>
              <Tab
                px={{ base: 3, md: 6 }}
                py={3}
                fontWeight="medium"
                borderRadius="md"
                _selected={{
                  color: "teal.700",
                  bg: "teal.50",
                  fontWeight: "semibold",
                  border: "1px solid",
                  borderColor: "teal.400",
                }}
                _hover={{
                  bg: "teal.25",
                }}
              >
                <Flex align="center">
                  <Text>Assets</Text>
                  {assetsWithHoldings.length > 0 && (
                    <Badge ml={2} colorScheme="teal" borderRadius="full" px={2}>
                      {assetsWithHoldings.length}
                    </Badge>
                  )}
                </Flex>
              </Tab>
              <Tab
                px={{ base: 3, md: 6 }}
                py={3}
                fontWeight="medium"
                borderRadius="md"
                _selected={{
                  color: "teal.700",
                  bg: "teal.50",
                  fontWeight: "semibold",
                  border: "1px solid",
                  borderColor: "teal.400",
                }}
                _hover={{
                  bg: "teal.25",
                }}
              >
                <Flex align="center">
                  <Text>Transactions</Text>
                </Flex>
              </Tab>
            </TabList>
          </Flex>

          <TabPanels>
            {/* Assets Tab */}
            <TabPanel p={{ base: 2, md: 4 }}>
              {assetsLoading ? (
                <Box p={8} textAlign="center">
                  <VStack spacing={4}>
                    <Spinner size="lg" color="teal.500" />
                    <Text color="gray.600" fontSize="lg">
                      Loading your physical assets...
                    </Text>
                    <Text color="gray.500" fontSize="sm">
                      This may take a moment for large portfolios
                    </Text>
                  </VStack>
                </Box>
              ) : assets.length === 0 ? (
                <EmptyStateAssets onCreateAsset={handleCreateAsset} />
              ) : (
                 <Box>
                    {/* Assets Layout - Dynamic based on content */}
                    <VStack spacing={8} align="stretch">
                      {/* Assets with holdings */}
                      {assetsWithHoldings.length > 0 && (
                        <Box>
                          <Text fontSize="lg" fontWeight="semibold" mb={4}>
                            Current Holdings
                          </Text>
                            <Flex
                              gap={{ base: 3, md: 4 }}
                              wrap="wrap"
                              direction={{ base: "column", md: "row" }}
                            >
                                {assetsWithHoldings.map((asset) => (
                                  <AssetSummaryCard
                                    key={asset.physical_asset_id}
                                    asset={asset}
                                    currencySymbol={currencySymbol || "$"}
                                    ledgerId={Number(ledgerId)}
                                    onBuySell={handleBuySell}
                                    onUpdatePrice={handleUpdatePrice}
                                  />
                                ))}
                            </Flex>
                        </Box>
                      )}

                      {/* Assets without holdings */}
                      {assetsWithoutHoldings.length > 0 && (
                        <Box>
                          <Text fontSize="lg" fontWeight="semibold" mb={4}>
                            Available Assets
                          </Text>
                             <Flex
                               gap={{ base: 3, md: 4 }}
                               wrap="wrap"
                               direction={{ base: "column", md: "row" }}
                             >
                                 {assetsWithoutHoldings.map((asset) => (
                                   <AssetSummaryCard
                                     key={asset.physical_asset_id}
                                     asset={asset}
                                     currencySymbol={currencySymbol || "$"}
                                     ledgerId={Number(ledgerId)}
                                     onBuySell={handleBuySell}
                                     onUpdatePrice={handleUpdatePrice}
                                     onDelete={handleDeleteAsset}
                                   />
                                 ))}
                             </Flex>
                        </Box>
                      )}
                    </VStack>

                    {/* Loading skeletons when data is being fetched */}
                    {assetsLoading && assets.length === 0 && (
                      <Box>
                        <Text fontSize="lg" fontWeight="semibold" mb={4}>
                          Loading Assets...
                        </Text>
                         <Flex
                           gap={{ base: 3, md: 4 }}
                           wrap="wrap"
                           direction={{ base: "column", md: "row" }}
                         >
                           {Array.from({ length: 3 }).map((_, index) => (
                             <AssetSummaryCardSkeleton key={`skeleton-${index}`} />
                           ))}
                         </Flex>
                      </Box>
                    )}
                  </Box>
               )}

                {/* Asset Types Section */}
                {assetTypes.length > 0 && (
                  <Box mt={6} p={{ base: 3, md: 4 }} bg="white" borderRadius="lg" boxShadow="sm">
                    <Flex justify="space-between" align="center" mb={4}>
                      <Flex align="center">
                        <Icon as={Package} mr={2} color="teal.500" />
                        <Text fontSize={{ base: "md", md: "lg" }} fontWeight="bold">
                          Asset Types
                        </Text>
                      </Flex>
                    </Flex>

                    <Flex
                      gap={{ base: 3, md: 4 }}
                      wrap="wrap"
                      direction={{ base: "column", md: "row" }}
                    >
                      {assetTypes.map((assetType) => {
                        const assetsUsingType = assets.filter(asset => asset.asset_type_id === assetType.asset_type_id);
                        const assetCount = assetsUsingType.length;

                        return (
                          <Box
                            key={assetType.asset_type_id}
                            bg="gray.50"
                            border="1px solid"
                            borderColor="gray.200"
                            borderRadius="lg"
                            p={{ base: 3, md: 4 }}
                            minW={{ base: "full", md: "250px" }}
                            width={{ base: "full", md: "auto" }}
                            position="relative"
                            _hover={{
                              borderColor: "teal.300",
                              boxShadow: "md",
                            }}
                            transition="all 0.2s"
                          >
                           <Flex justify="space-between" align="start" mb={3}>
                             <VStack align="start" spacing={1} flex={1}>
                               <Text fontSize="lg" fontWeight="semibold" color="gray.800">
                                 {assetType.name}
                               </Text>
                               <Text fontSize="sm" color="gray.600">
                                 Unit: {assetType.unit_name} ({assetType.unit_symbol})
                               </Text>
                             </VStack>
                             <IconButton
                               aria-label="Delete asset type"
                               icon={<Trash2 />}
                               size="sm"
                               colorScheme="red"
                               variant="ghost"
                               color="gray.500"
                               _hover={{
                                 color: "red.500",
                                 bg: "red.50",
                               }}
                               onClick={() => handleDeleteAssetType(assetType)}
                               isDisabled={assetCount > 0}
                               title={assetCount > 0 ? "Cannot delete: assets exist" : "Delete asset type"}
                              />
                            </Flex>

                           <HStack justify="space-between" align="center">
                             <Text fontSize="sm" color="gray.600">
                               Assets using this type:
                             </Text>
                             <Badge
                               colorScheme={assetCount > 0 ? "teal" : "gray"}
                               variant="subtle"
                               borderRadius="full"
                               px={3}
                               py={1}
                             >
                               {assetCount}
                             </Badge>
                           </HStack>

                           {assetType.description && (
                             <Text fontSize="xs" color="gray.500" mt={2} noOfLines={2}>
                               {assetType.description}
                             </Text>
                           )}
                         </Box>
                       );
                     })}
                   </Flex>
                 </Box>
               )}
             </TabPanel>

            {/* Transactions Tab */}
            <TabPanel p={{ base: 2, md: 4 }}>
              {assetsLoading ? (
                <Box p={8} textAlign="center">
                  <VStack spacing={4}>
                    <Spinner size="lg" color="teal.500" />
                    <Text color="gray.600" fontSize="lg">
                      Loading transaction history...
                    </Text>
                    <Text color="gray.500" fontSize="sm">
                      This may take a moment for large portfolios
                    </Text>
                  </VStack>
                </Box>
              ) : assetsWithHoldings.length === 0 ? (
                <EmptyStateTransactions />
              ) : (
                 <AssetTransactionHistory />
              )}
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Box>

      {/* Modals */}
      <BuySellAssetModal
        isOpen={isBuySellModalOpen}
        onClose={onBuySellModalClose}
        asset={selectedAsset}
        onTransactionCompleted={() => {
          onBuySellModalClose();
          setSelectedAsset(undefined);
        }}
      />

       <CreateAssetTypeModal
         isOpen={isCreateAssetTypeModalOpen}
         onClose={onCreateAssetTypeModalClose}
         onAssetTypeCreated={() => {
           onCreateAssetTypeModalClose();
            // Refresh asset types data
            queryClient.invalidateQueries({
              queryKey: ["asset-types", Number(ledgerId)],
            });
         }}
       />

       <CreatePhysicalAssetModal
         isOpen={isCreateAssetModalOpen}
         onClose={onCreateAssetModalClose}
         onAssetCreated={() => {
           onCreateAssetModalClose();
            // Refresh assets data
            queryClient.invalidateQueries({
              queryKey: ["physical-assets", Number(ledgerId)],
            });
          }}
        />

      <UpdatePriceModal
        isOpen={isUpdatePriceModalOpen}
        onClose={onUpdatePriceModalClose}
        asset={selectedAsset}
      />

         {/* Asset Type Warning Dialog */}
         <Modal
           isOpen={isAssetTypeWarningOpen}
           onClose={() => setIsAssetTypeWarningOpen(false)}
           size={{ base: "full", md: "lg" }}
         >
           <ModalOverlay />
           <ModalContent>
             <ModalHeader fontSize="lg" fontWeight="bold">
               Create Asset Type First
             </ModalHeader>

             <ModalBody>
               You need to create at least one asset type before you can create a physical asset.
               Asset types define the kind of physical assets you want to track (e.g., Gold, Silver, etc.).
             </ModalBody>

             <ModalFooter>
               <Button
                 ref={cancelRef}
                 variant="outline"
                 onClick={() => setIsAssetTypeWarningOpen(false)}
                 _hover={{
                   bg: "gray.50",
                   borderColor: "gray.300",
                 }}
               >
                 Cancel
               </Button>
               <Button
                 colorScheme="teal"
                 onClick={() => {
                   setIsAssetTypeWarningOpen(false);
                   onCreateAssetTypeModalOpen();
                 }}
                 ml={3}
               >
                 Create Asset Type
               </Button>
             </ModalFooter>
           </ModalContent>
         </Modal>

        {/* Delete Asset Type Confirmation Dialog */}
        <AlertDialog
          isOpen={isDeleteAssetTypeDialogOpen}
          leastDestructiveRef={cancelRef}
          onClose={() => {
            setIsDeleteAssetTypeDialogOpen(false);
            setSelectedAssetType(null);
          }}
        >
          <AlertDialogOverlay>
            <AlertDialogContent>
              <AlertDialogHeader fontSize="lg" fontWeight="bold">
                Delete Asset Type
              </AlertDialogHeader>

              <AlertDialogBody>
                Are you sure you want to delete the asset type &ldquo;{selectedAssetType?.name}&rdquo;?
                This action cannot be undone.
              </AlertDialogBody>

              <AlertDialogFooter>
                <Button
                  ref={cancelRef}
                  onClick={() => {
                    setIsDeleteAssetTypeDialogOpen(false);
                    setSelectedAssetType(null);
                  }}
                >
                  Cancel
                </Button>
                <Button
                  colorScheme="red"
                  onClick={confirmDeleteAssetType}
                  ml={3}
                  isLoading={deleteAssetTypeMutation.isPending}
                >
                  Delete
                </Button>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialogOverlay>
        </AlertDialog>

        {/* Delete Asset Type Error Dialog */}
        <AlertDialog
          isOpen={isDeleteAssetTypeErrorOpen}
          leastDestructiveRef={cancelRef}
          onClose={() => {
            setIsDeleteAssetTypeErrorOpen(false);
            setSelectedAssetType(null);
          }}
        >
          <AlertDialogOverlay>
            <AlertDialogContent>
              <AlertDialogHeader fontSize="lg" fontWeight="bold">
                <AlertIcon as={AlertTriangle} color="red.500" mr={2} />
                Cannot Delete Asset Type
              </AlertDialogHeader>

              <AlertDialogBody>
                The asset type &ldquo;{selectedAssetType?.name}&rdquo; cannot be deleted because
                {assets.filter(asset => asset.asset_type_id === selectedAssetType?.asset_type_id).length} physical asset(s) are currently using it.
                Please delete or reassign all associated assets first.
              </AlertDialogBody>

              <AlertDialogFooter>
                <Button
                  onClick={() => {
                    setIsDeleteAssetTypeErrorOpen(false);
                    setSelectedAssetType(null);
                  }}
                >
                  OK
                </Button>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialogOverlay>
         </AlertDialog>


      </Box>
    );
  };

export default PhysicalAssets;