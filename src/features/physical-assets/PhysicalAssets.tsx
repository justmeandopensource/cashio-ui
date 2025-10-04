import { useQueryClient } from "@tanstack/react-query";
import { FC, useState, useRef, RefObject } from "react";

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
  Card,
  CardBody,
  Flex,
  HStack,
  Icon,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
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
  useBreakpointValue,
  SimpleGrid,
} from "@chakra-ui/react";
import { Plus, Coins, Package, AlertTriangle } from "lucide-react";
import useLedgerStore from "@/components/shared/store";
import { usePhysicalAssets, useAssetTypes, useDeletePhysicalAsset, useDeleteAssetType } from "./api";
import { toastDefaults } from "@/components/shared/utils";
import { AssetSummaryCardSkeleton } from "./components/AssetSummaryCard";
import AssetTypeCard from "./components/AssetTypeCard";
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



const PhysicalAssets: FC = () => {
  const queryClient = useQueryClient();
  const toast = useToast();
  const { ledgerId, currencySymbol } = useLedgerStore();
  const [selectedAsset, setSelectedAsset] = useState<PhysicalAsset | undefined>();
  const [tabIndex, setTabIndex] = useState(0);

  // Responsive modal settings
  const modalSize = useBreakpointValue({ base: "full", md: "md" });
  const isMobile = useBreakpointValue({ base: true, md: false });

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
  const totalInvested = assets.reduce((total, asset) => total + (asset.total_quantity * asset.average_cost_per_unit), 0);
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



  return (
    <Box>
      <Tabs variant="soft-rounded" colorScheme="teal" size={{ base: "md", md: "md" }} index={tabIndex} onChange={handleTabChange}>
        <Box p={{ base: 2, md: 4 }}>
          <TabList borderBottom="none">
            <Tab
              px={{ base: 4, md: 6 }}
              py={4}
              fontWeight="medium"
              borderRadius="md"
              whiteSpace="nowrap"
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
                <Text>Overview</Text>
                {assets.length > 0 && (
                  <Badge ml={2} colorScheme="teal" borderRadius="full" px={2}>
                    {assets.length}
                  </Badge>
                )}
              </Flex>
            </Tab>
            <Tab
              px={{ base: 4, md: 6 }}
              py={4}
              fontWeight="medium"
              borderRadius="md"
              whiteSpace="nowrap"
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
        </Box>

         <TabPanels>
            <TabPanel p={{ base: 2, md: 4 }}>
              {tabIndex === 0 && (
                <>
                 {/* Portfolio Summary Header - Only show if there are asset types */}
                 {assetTypes.length > 0 && (
                 <Box mb={6} p={{ base: 4, md: 6 }} bg="white" borderRadius="lg" boxShadow="sm">
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
                 <>
                   {/* Mobile: Full grid with all metrics */}
                   <Box display={{ base: "block", md: "none" }}>
                     <SimpleGrid
                       columns={{ base: 2, sm: 3 }}
                       spacing={{ base: 4, md: 8 }}
                     >
                       <Box>
                         <Text fontSize="sm" color="gray.600" mb={1}>
                           Total Invested
                         </Text>
                         <HStack spacing={0} align="baseline">
                           <Text
                             fontSize={{ base: "xl", md: "2xl" }}
                             fontWeight="semibold"
                             color="gray.600"
                           >
                             {splitCurrencyForDisplay(totalInvested, currencySymbol || "$").main}
                           </Text>
                           <Text
                             fontSize={{ base: "md", md: "lg" }}
                             fontWeight="semibold"
                             color="gray.600"
                             opacity={0.7}
                           >
                             {splitCurrencyForDisplay(totalInvested, currencySymbol || "$").decimals}
                           </Text>
                         </HStack>
                       </Box>

                       <Box>
                         <Text fontSize="sm" color="gray.600" mb={1}>
                           Total Value
                         </Text>
                         <HStack spacing={0} align="baseline">
                           <Text
                             fontSize={{ base: "xl", md: "2xl" }}
                             fontWeight="semibold"
                             color="teal.600"
                           >
                             {splitCurrencyForDisplay(totalCurrentValue, currencySymbol || "$").main}
                           </Text>
                           <Text
                             fontSize={{ base: "md", md: "lg" }}
                             fontWeight="semibold"
                             color="teal.600"
                             opacity={0.7}
                           >
                             {splitCurrencyForDisplay(totalCurrentValue, currencySymbol || "$").decimals}
                           </Text>
                         </HStack>
                       </Box>

                       <Box>
                         <Text fontSize="sm" color="gray.600" mb={1}>
                           Total Unrealized P&L
                         </Text>
                         <VStack align="start" spacing={0}>
                           <HStack spacing={0} align="baseline">
                             <Text
                               fontSize={{ base: "xl", md: "2xl" }}
                               fontWeight="semibold"
                               color={getPnLColor(totalPnL)}
                             >
                               {splitCurrencyForDisplay(Math.abs(totalPnL), currencySymbol || "$").main}
                             </Text>
                             <Text
                               fontSize={{ base: "md", md: "lg" }}
                               fontWeight="semibold"
                               color={getPnLColor(totalPnL)}
                               opacity={0.7}
                             >
                               {splitCurrencyForDisplay(Math.abs(totalPnL), currencySymbol || "$").decimals}
                             </Text>
                           </HStack>
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
                                {splitPercentageForDisplay(totalPnLPercentage).decimals}
                             </Text>
                           </HStack>
                         </VStack>
                       </Box>

                       <Box>
                         <Text fontSize="sm" color="gray.600" mb={1}>
                           Total Assets
                         </Text>
                         <VStack align="start" spacing={0}>
                           <Text
                             fontSize={{ base: "xl", md: "2xl" }}
                             fontWeight="bold"
                             color="blue.600"
                           >
                             {assets.length}
                           </Text>
                           <Text fontSize="xs" color="gray.500">
                             Across {assetTypes.length} Asset Type{assetTypes.length !== 1 ? "s" : ""}
                           </Text>
                         </VStack>
                       </Box>
                     </SimpleGrid>
                   </Box>

                   {/* Desktop: All metrics in Flex layout */}
                   <Box display={{ base: "none", md: "block" }}>
                     <Flex
                       direction={{ base: "column", md: "row" }}
                       gap={{ base: 4, md: 6 }}
                       wrap="wrap"
                     >
                       <Box>
                         <Text fontSize="sm" color="gray.600" mb={1}>
                           Total Invested
                         </Text>
                         <HStack spacing={0} align="baseline">
                           <Text
                             fontSize={{ base: "xl", md: "2xl" }}
                             fontWeight="semibold"
                             color="gray.600"
                           >
                             {splitCurrencyForDisplay(totalInvested, currencySymbol || "$").main}
                           </Text>
                           <Text
                             fontSize={{ base: "md", md: "lg" }}
                             fontWeight="semibold"
                             color="gray.600"
                             opacity={0.7}
                           >
                             {splitCurrencyForDisplay(totalInvested, currencySymbol || "$").decimals}
                           </Text>
                         </HStack>
                       </Box>

                       <Box>
                         <Text fontSize="sm" color="gray.600" mb={1}>
                           Total Value
                         </Text>
                         <HStack spacing={0} align="baseline">
                           <Text
                             fontSize={{ base: "xl", md: "2xl" }}
                             fontWeight="semibold"
                             color="teal.600"
                           >
                             {splitCurrencyForDisplay(totalCurrentValue, currencySymbol || "$").main}
                           </Text>
                           <Text
                             fontSize={{ base: "md", md: "lg" }}
                             fontWeight="semibold"
                             color="teal.600"
                             opacity={0.7}
                           >
                             {splitCurrencyForDisplay(totalCurrentValue, currencySymbol || "$").decimals}
                           </Text>
                         </HStack>
                       </Box>

                       <Box>
                         <Text fontSize="sm" color="gray.600" mb={1}>
                           Total Unrealized P&L
                         </Text>
                         <VStack align="start" spacing={0}>
                           <HStack spacing={0} align="baseline">
                             <Text
                               fontSize={{ base: "xl", md: "2xl" }}
                               fontWeight="semibold"
                               color={getPnLColor(totalPnL)}
                             >
                               {splitCurrencyForDisplay(Math.abs(totalPnL), currencySymbol || "$").main}
                             </Text>
                             <Text
                               fontSize={{ base: "md", md: "lg" }}
                               fontWeight="semibold"
                               color={getPnLColor(totalPnL)}
                               opacity={0.7}
                             >
                               {splitCurrencyForDisplay(Math.abs(totalPnL), currencySymbol || "$").decimals}
                             </Text>
                           </HStack>
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
                                {splitPercentageForDisplay(totalPnLPercentage).decimals}
                             </Text>
                           </HStack>
                         </VStack>
                       </Box>

                       <Box>
                         <Text fontSize="sm" color="gray.600" mb={1}>
                           Total Assets
                         </Text>
                         <VStack align="start" spacing={0}>
                           <Text
                             fontSize={{ base: "xl", md: "2xl" }}
                             fontWeight="bold"
                             color="blue.600"
                           >
                             {assets.length}
                           </Text>
                           <Text fontSize="xs" color="gray.500">
                             Across {assetTypes.length} Asset Type{assetTypes.length !== 1 ? "s" : ""}
                           </Text>
                         </VStack>
                       </Box>
                     </Flex>
                   </Box>
                 </>
                 </Box>
                 )}

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
                 ) : assetTypes.length === 0 ? (
                   <EmptyStateAssets onCreateAssetType={handleCreateAssetType} />
                ) : (
                   <Box>
                     {/* Asset Types and Assets Layout */}
                     <VStack spacing={6} align="stretch">
                       {assetTypes.length === 0 ? (
                         <Card
                           bg="white"
                           borderColor="gray.200"
                           borderWidth={1}
                           shadow="sm"
                         >
                           <CardBody textAlign="center" py={12}>
                             <VStack spacing={4}>
                               <Icon as={Package} boxSize={12} color="gray.400" />
                               <Text fontSize="lg" color="gray.500">
                                 No asset types created yet
                               </Text>
                               <Text color="gray.400">
                                 Create your first asset type to start tracking physical assets.
                               </Text>
                               <Button colorScheme="teal" onClick={handleCreateAssetType} size="lg">
                                 Create Your First Asset Type
                               </Button>
                             </VStack>
                           </CardBody>
                         </Card>
                       ) : (
                         assetTypes
                           .map((assetType) => {
                             const typeAssets = assets.filter(asset => asset.asset_type_id === assetType.asset_type_id);
                             return {
                               ...assetType,
                               typeAssets,
                             };
                           })
                           .sort((a, b) => b.typeAssets.length - a.typeAssets.length)
                           .map((assetType) => (
                             <AssetTypeCard
                               key={assetType.asset_type_id}
                               assetType={assetType}
                               assets={assetType.typeAssets}
                               currencySymbol={currencySymbol || "$"}
                               onCreateAsset={() => {
                                 // Create asset for this type
                                 setSelectedAssetType(assetType);
                                 onCreateAssetModalOpen();
                               }}
                               onDeleteAssetType={handleDeleteAssetType}
                               onBuySell={handleBuySell}
                               onUpdatePrice={handleUpdatePrice}
                               onDeleteAsset={handleDeleteAsset}
                             />
                           ))
                       )}

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
                     </VStack>
                   </Box>
                )}
                </>
              )}
              </TabPanel>

             {/* Transactions Tab */}
             <TabPanel p={{ base: 2, md: 4 }}>
               {tabIndex === 1 && (
                 assetsLoading ? (
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
                 ) : assets.length === 0 ? (
                   <EmptyStateTransactions />
                 ) : (
                   <AssetTransactionHistory />
                 )
               )}
             </TabPanel>
           </TabPanels>
         </Tabs>

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

        {/* Delete Asset Type Confirmation Modal */}
        <Modal
          isOpen={isDeleteAssetTypeDialogOpen}
          onClose={() => {
            setIsDeleteAssetTypeDialogOpen(false);
            setSelectedAssetType(null);
          }}
          size={modalSize}
          motionPreset="slideInBottom"
        >
          <ModalOverlay />
          <ModalContent
            margin={isMobile ? 0 : "auto"}
            borderRadius={isMobile ? 0 : "md"}
          >
            <ModalHeader>Delete Asset Type</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              Are you sure you want to delete the asset type &ldquo;{selectedAssetType?.name}&rdquo;?
              This action cannot be undone.
            </ModalBody>
            <ModalFooter>
              <Button
                variant="ghost"
                mr={3}
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
                isLoading={deleteAssetTypeMutation.isPending}
                loadingText="Deleting..."
              >
                Delete
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>

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
            setSelectedAssetType(null);
            // Refresh assets data
            queryClient.invalidateQueries({
              queryKey: ["physical-assets", Number(ledgerId)],
            });
          }}
          assetTypeId={selectedAssetType?.asset_type_id}
        />

        <UpdatePriceModal
          isOpen={isUpdatePriceModalOpen}
          onClose={onUpdatePriceModalClose}
          asset={selectedAsset}
        />

      </Box>
    );
  };

export default PhysicalAssets;