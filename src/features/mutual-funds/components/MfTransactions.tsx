import { FC, useState } from "react";
import { Link } from "react-router-dom";
import {
  Box,
  Text,
  Button,
  VStack,
  Card,
  CardBody,
  HStack,
  Badge,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  useColorModeValue,
  Select,
  Input,
  InputGroup,
  InputLeftElement,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  Flex,
  Link as ChakraLink,
  Icon,
  useBreakpointValue,
  Tooltip,
  Square,
} from "@chakra-ui/react";
import { Receipt, Search, Trash2, Calendar } from "lucide-react";

import { Amc, MutualFund, MfTransaction } from "../types";
import { formatUnits, formatNav, getTransactionTypeText, splitCurrencyForDisplay } from "../utils";
import { formatDate } from "../../physical-assets/utils";
import { deleteMfTransaction } from "../api";
import { getPnLColor } from "../../physical-assets/utils";
import useLedgerStore from "@/components/shared/store";


interface MfTransactionsProps {
  amcs: Amc[];
  mutualFunds: MutualFund[];
  transactions?: MfTransaction[];
  onDataChange: () => void;
  onCreateAmc?: () => void;
  onCreateFund?: () => void;
}

const MfTransactions: FC<MfTransactionsProps> = ({
  amcs,
  mutualFunds,
  transactions = [],
  onDataChange,
  onCreateAmc,
  onCreateFund,
}) => {
  const { ledgerId } = useLedgerStore();
  const cardBg = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const mutedColor = useColorModeValue("gray.600", "gray.400");

  // State for filters
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [fundFilter, setFundFilter] = useState<string>("all");
  const [amcFilter, setAmcFilter] = useState<string>("all");

  // Delete transaction state
  const [transactionToDelete, setTransactionToDelete] = useState<MfTransaction | null>(null);
  const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onClose: onDeleteClose } = useDisclosure();

  // Responsive breakpoint
  const isMobile = useBreakpointValue({ base: true, md: false });
  const [expandedCardId, setExpandedCardId] = useState<number | null>(null);

  // Filter transactions (sorted by date descending by default)
  const filteredTransactions = transactions
    .filter(transaction => {
      const matchesSearch = searchTerm === "" ||
        transaction.mutual_fund?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        transaction.account_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        transaction.target_fund_name?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesType = typeFilter === "all" || transaction.transaction_type === typeFilter;
      const matchesFund = fundFilter === "all" || transaction.mutual_fund_id.toString() === fundFilter;
      const matchesAmc = amcFilter === "all" || transaction.mutual_fund?.amc_id.toString() === amcFilter;

      return matchesSearch && matchesType && matchesFund && matchesAmc;
    })
    .sort((a, b) => {
      const dateComparison = new Date(b.transaction_date).getTime() - new Date(a.transaction_date).getTime();
      if (dateComparison === 0) {
        return b.mf_transaction_id - a.mf_transaction_id;
      }
      return dateComparison;
    });

  const handleDeleteTransaction = async () => {
    if (!transactionToDelete || !ledgerId) return;

    try {
      await deleteMfTransaction(Number(ledgerId), transactionToDelete.mf_transaction_id);
      onDataChange();
      onDeleteClose();
      setTransactionToDelete(null);
    } catch (error) {
      console.error("Failed to delete transaction:", error);
    }
  };

  // Handle card expansion
  const handleCardToggle = (transactionId: number) => {
    setExpandedCardId(expandedCardId === transactionId ? null : transactionId);
  };

  const getTransactionTypeColor = (type: MfTransaction['transaction_type']) => {
    switch (type) {
      case 'buy': return 'green';
      case 'sell': return 'red';
      case 'switch_out': return 'purple';
      case 'switch_in': return 'orange';
      default: return 'gray';
    }
  };

  // Render mobile card view
  const renderMobileCards = () => (
    <VStack spacing={3} align="stretch">
      {filteredTransactions.map((transaction) => {
        const isExpanded = expandedCardId === transaction.mf_transaction_id;

        return (
          <Box
            key={transaction.mf_transaction_id}
            p={4}
            borderWidth="1px"
            borderRadius="lg"
            bg="white"
            boxShadow="sm"
            onClick={() => handleCardToggle(transaction.mf_transaction_id)}
            cursor="pointer"
            transition="all 0.2s"
            _hover={{ bg: "gray.50" }}
          >
            {/* Main row with essential info */}
            <Flex justify="space-between" align="flex-start">
              {/* Left side with date, fund and AMC */}
              <VStack align="flex-start" spacing={1} maxW="70%">
                <HStack spacing={2}>
                  <Icon as={Calendar} color="gray.500" />
                  <Text fontSize="sm" color="gray.600">
                    {formatDate(transaction.transaction_date)}
                  </Text>
                  <Tooltip label={getTransactionTypeText(transaction.transaction_type)}>
                    <Square
                      size="6px"
                      bg={getTransactionTypeColor(transaction.transaction_type) + ".400"}
                      borderRadius="md"
                    />
                  </Tooltip>
                </HStack>

                <Text fontWeight="medium">
                  {transaction.mutual_fund?.name}
                </Text>

                <HStack spacing={2} align="center">
                  <Text fontSize="sm" color="gray.600">
                    {transaction.mutual_fund?.amc?.name}
                  </Text>
                  <Text fontSize="xs" color="gray.500">•</Text>
                  {transaction.transaction_type === 'switch_out' || transaction.transaction_type === 'switch_in' ? (
                    <Text fontSize="sm" color="blue.600" fontWeight="medium">
                      {transaction.target_fund_name}
                    </Text>
                  ) : (
                    <ChakraLink
                      as={Link}
                      to={`/account/${transaction.account_id}`}
                      color="blue.500"
                      fontSize="sm"
                      fontWeight="medium"
                      _hover={{ textDecoration: "underline" }}
                    >
                      {transaction.account_name || `Account ${transaction.account_id}`}
                    </ChakraLink>
                  )}
                </HStack>
              </VStack>

              {/* Right side with amount and units */}
              <VStack align="flex-end" spacing={1}>
                <HStack spacing={0} align="baseline" justify="flex-end">
                  <Text
                    fontSize="sm"
                    fontWeight="semibold"
                    color={getPnLColor(
                      transaction.transaction_type === 'buy'
                        ? -transaction.total_amount
                        : transaction.transaction_type === 'sell' || transaction.transaction_type === 'switch_out'
                        ? transaction.realized_gain || 0
                        : 0 // switch_in = neutral
                    )}
                  >
                    {splitCurrencyForDisplay(transaction.total_amount, "₹").main}
                  </Text>
                  <Text
                    fontSize="xs"
                    fontWeight="semibold"
                    opacity={0.7}
                    color={getPnLColor(
                      transaction.transaction_type === 'buy'
                        ? -transaction.total_amount
                        : transaction.transaction_type === 'sell' || transaction.transaction_type === 'switch_out'
                        ? transaction.realized_gain || 0
                        : 0 // switch_in = neutral
                    )}
                  >
                    {splitCurrencyForDisplay(transaction.total_amount, "₹").decimals}
                  </Text>
                </HStack>
                <Text fontSize="sm" color="gray.600" fontWeight="medium">
                  {formatUnits(transaction.units)} units
                </Text>
                <Box
                  bg="gray.100"
                  color="gray.700"
                  px={2}
                  py={0.5}
                  borderRadius="full"
                  fontSize="xs"
                  fontWeight="medium"
                  display="inline-block"
                >
                  ₹{formatNav(transaction.nav_per_unit)}/unit
                </Box>
              </VStack>
            </Flex>

            {/* Expandable section */}
            {isExpanded && (
              <Box mt={4} pt={3} borderTopWidth="1px">
                {/* Action buttons */}
                <Flex justify="flex-end" gap={2}>
                  <Button
                    size="sm"
                    variant="ghost"
                    colorScheme="red"
                    leftIcon={<Trash2 size={16} />}
                    onClick={(e) => {
                      e.stopPropagation();
                      setTransactionToDelete(transaction);
                      onDeleteOpen();
                    }}
                    aria-label="Delete transaction"
                  />
                </Flex>
              </Box>
            )}
          </Box>
        );
      })}
    </VStack>
  );

  const TransactionRow: FC<{ transaction: MfTransaction }> = ({ transaction }) => (
    <Tr
      _hover={{ bg: "gray.100" }}
      sx={{
        "&:hover .action-icons": {
          opacity: 1,
        },
      }}
    >
      <Td>
        <Text fontSize="sm">
          {formatDate(transaction.transaction_date)}
        </Text>
      </Td>
      <Td>
        <Text fontSize="sm" fontWeight="medium">
          {transaction.mutual_fund?.name}
        </Text>
      </Td>
      <Td>
        <Text fontSize="sm" fontWeight="medium">
          {transaction.mutual_fund?.amc?.name}
        </Text>
      </Td>
      <Td>
        <Badge colorScheme={getTransactionTypeColor(transaction.transaction_type)} size="sm">
          {getTransactionTypeText(transaction.transaction_type)}
        </Badge>
      </Td>
      <Td isNumeric>
        <Text fontSize="sm">{formatUnits(transaction.units)}</Text>
      </Td>
      <Td isNumeric>
        <Text fontSize="sm">₹{formatNav(transaction.nav_per_unit)}</Text>
      </Td>
        <Td isNumeric>
          <HStack spacing={0} align="baseline" justify="flex-end">
            <Text
              fontSize="sm"
              fontWeight="semibold"
              color={getPnLColor(
                transaction.transaction_type === 'buy'
                  ? -transaction.total_amount
                  : transaction.transaction_type === 'sell' || transaction.transaction_type === 'switch_out'
                  ? transaction.realized_gain || 0
                  : 0 // switch_in = neutral
              )}
            >
              {splitCurrencyForDisplay(
                transaction.transaction_type === 'sell' || transaction.transaction_type === 'switch_out'
                  ? transaction.total_amount
                  : transaction.total_amount,
                "₹"
              ).main}
            </Text>
            <Text
              fontSize="xs"
              fontWeight="semibold"
              opacity={0.7}
              color={getPnLColor(
                transaction.transaction_type === 'buy'
                  ? -transaction.total_amount
                  : transaction.transaction_type === 'sell' || transaction.transaction_type === 'switch_out'
                  ? transaction.realized_gain || 0
                  : 0 // switch_in = neutral
              )}
            >
              {splitCurrencyForDisplay(
                transaction.transaction_type === 'sell' || transaction.transaction_type === 'switch_out'
                  ? transaction.total_amount
                  : transaction.total_amount,
                "₹"
              ).decimals}
            </Text>
          </HStack>
        </Td>
        <Td>
          {transaction.transaction_type === 'switch_out' || transaction.transaction_type === 'switch_in' ? (
            <Text fontSize="sm" color={mutedColor}>
              {transaction.target_fund_name}
            </Text>
          ) : (
            <ChakraLink
              as={Link}
              to={`/account/${transaction.account_id}`}
              color="blue.500"
              fontSize="sm"
              fontWeight="medium"
              _hover={{ textDecoration: "underline" }}
            >
              {transaction.account_name || `Account ${transaction.account_id}`}
            </ChakraLink>
          )}
        </Td>
        <Td width="2%">
          <Flex
            gap={2}
            opacity={0}
            transition="opacity 0.2s"
            className="action-icons"
          >
            <ChakraLink
              onClick={() => {
                setTransactionToDelete(transaction);
                onDeleteOpen();
              }}
              _hover={{ textDecoration: "none" }}
            >
              <Icon
                as={Trash2}
                boxSize={4}
                color="red.500"
                _hover={{ color: "red.600" }}
                transition="opacity 0.2s"
              />
            </ChakraLink>
          </Flex>
        </Td>
    </Tr>
  );

  return (
    <Box>
      <VStack spacing={6} align="stretch">
        {/* Header */}
        <Box mb={6} p={{ base: 4, md: 6 }} bg="white" borderRadius="lg" boxShadow="sm">
          <Flex
            direction={{ base: "column", md: "row" }}
            justify="space-between"
            align={{ base: "start", md: "center" }}
            gap={{ base: 4, md: 0 }}
            mb={transactions.length > 0 ? 4 : 0}
          >
            <Flex align="center" mb={{ base: 2, md: 0 }}>
               <Text fontSize={{ base: "lg", md: "xl" }} fontWeight="semibold" color="gray.700">
                 Transactions
               </Text>
            </Flex>
          </Flex>

          {/* Search and Filters */}
          {transactions.length > 0 && (
            <Box>
              <Flex
                direction={{ base: "column", md: "row" }}
                gap={{ base: 3, md: 4 }}
                align={{ base: "stretch", md: "center" }}
                wrap="wrap"
                mb={4}
              >
                <InputGroup maxW={{ base: "full", md: "300px" }}>
                  <InputLeftElement>
                    <Search size={16} />
                  </InputLeftElement>
                  <Input
                    placeholder="Search transactions..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </InputGroup>

                 <Select
                   maxW={{ base: "full", md: "150px" }}
                   value={typeFilter}
                   onChange={(e) => setTypeFilter(e.target.value)}
                 >
                   <option value="all">All Types</option>
                   <option value="buy">Buy</option>
                   <option value="sell">Sell</option>
                   <option value="switch_out">Switch Out</option>
                   <option value="switch_in">Switch In</option>
                 </Select>

                 <Select
                   maxW={{ base: "full", md: "200px" }}
                   value={amcFilter}
                   onChange={(e) => setAmcFilter(e.target.value)}
                 >
                   <option value="all">All AMCs</option>
                   {amcs.map(amc => (
                     <option key={amc.amc_id} value={amc.amc_id.toString()}>
                       {amc.name}
                     </option>
                   ))}
                 </Select>

                 <Select
                   maxW={{ base: "full", md: "200px" }}
                   value={fundFilter}
                   onChange={(e) => setFundFilter(e.target.value)}
                 >
                   <option value="all">All Funds</option>
                   {mutualFunds.map(fund => (
                     <option key={fund.mutual_fund_id} value={fund.mutual_fund_id.toString()}>
                       {fund.name}
                     </option>
                   ))}
                 </Select>


               </Flex>


            </Box>
          )}
        </Box>



        {/* Empty State */}
        {amcs.length === 0 ? (
          <Card bg={cardBg} borderColor={borderColor} borderWidth={1}>
            <CardBody textAlign="center" py={12}>
              <VStack spacing={4}>
                <Receipt size={48} color="gray" />
                <Text fontSize="lg" color="gray.500">
                  No transactions yet
                </Text>
                <Text color="gray.400">
                  Create your first Asset Management Company to start recording transactions
                </Text>
                {onCreateAmc && (
                  <Button colorScheme="teal" onClick={onCreateAmc} size="md">
                    Create Your First AMC
                  </Button>
                )}
              </VStack>
            </CardBody>
          </Card>
        ) : mutualFunds.length === 0 ? (
          <Card bg={cardBg} borderColor={borderColor} borderWidth={1}>
            <CardBody textAlign="center" py={12}>
              <VStack spacing={4}>
                <Receipt size={48} color="gray" />
                <Text fontSize="lg" color="gray.500">
                  No transactions yet
                </Text>
                <Text color="gray.400">
                  Create your first mutual fund to start recording transactions
                </Text>
                {onCreateFund && (
                  <Button colorScheme="blue" onClick={onCreateFund} size="md">
                    Create Your First Fund
                  </Button>
                )}
              </VStack>
            </CardBody>
          </Card>
        ) : transactions.length === 0 ? (
          <Card bg={cardBg} borderColor={borderColor} borderWidth={1}>
            <CardBody textAlign="center" py={12}>
              <VStack spacing={4}>
                <Receipt size={48} color="gray" />
                <Text fontSize="lg" color="gray.500">
                  No transactions recorded yet
                </Text>
                <Text color="gray.400">
                  Start by buying units in one of your mutual funds
                </Text>
              </VStack>
            </CardBody>
          </Card>
         ) : (
           /* Transactions Table/Cards */
           <Card bg={cardBg} borderColor={borderColor} borderWidth={1}>
             <CardBody>
               {isMobile ? (
                 renderMobileCards()
               ) : (
                 <Box overflowX="auto">
                   <Table variant="simple" size="sm">
                      <Thead>
                        <Tr>
                          <Th>Date</Th>
                          <Th>Fund</Th>
                          <Th>AMC</Th>
                          <Th>Type</Th>
                          <Th isNumeric>Units</Th>
                          <Th isNumeric>NAV</Th>
                          <Th isNumeric>Total Amount</Th>
                           <Th>Account</Th>
                          <Th width="2%">Actions</Th>
                        </Tr>
                      </Thead>
                     <Tbody>
                       {filteredTransactions.map(transaction => (
                         <TransactionRow key={transaction.mf_transaction_id} transaction={transaction} />
                       ))}
                     </Tbody>
                   </Table>
                 </Box>
               )}
             </CardBody>
           </Card>
         )}
      </VStack>

       {/* Delete Confirmation Modal */}
       <Modal
         isOpen={isDeleteOpen}
         onClose={onDeleteClose}
         size={isMobile ? "full" : "md"}
         motionPreset="slideInBottom"
       >
         <ModalOverlay />
         <ModalContent
           margin={isMobile ? 0 : "auto"}
           borderRadius={isMobile ? 0 : "md"}
         >
           <ModalHeader>Delete Transaction</ModalHeader>
           <ModalCloseButton />
           <ModalBody>
             <Text mb={4}>
               Are you sure you want to delete this transaction? This action cannot be undone.
             </Text>
             {transactionToDelete && (
               <Box p={3} bg="gray.50" borderRadius="md">
                 <Text fontWeight="bold">
                   {transactionToDelete.mutual_fund?.name}
                 </Text>
                 <Text fontSize="sm" color="gray.600">
                   {formatDate(transactionToDelete.transaction_date)}
                 </Text>
                 <HStack spacing={0} align="baseline">
                   <Text
                     fontSize="sm"
                     fontWeight="semibold"
                     color={getPnLColor(
                       transactionToDelete.transaction_type === 'buy'
                         ? -transactionToDelete.total_amount
                         : transactionToDelete.transaction_type === 'sell' || transactionToDelete.transaction_type === 'switch_out'
                         ? transactionToDelete.realized_gain || 0
                         : 0
                     )}
                   >
                     {splitCurrencyForDisplay(transactionToDelete.total_amount, "₹").main}
                   </Text>
                   <Text
                     fontSize="xs"
                     fontWeight="semibold"
                     opacity={0.7}
                     color={getPnLColor(
                       transactionToDelete.transaction_type === 'buy'
                         ? -transactionToDelete.total_amount
                         : transactionToDelete.transaction_type === 'sell' || transactionToDelete.transaction_type === 'switch_out'
                         ? transactionToDelete.realized_gain || 0
                         : 0
                     )}
                   >
                     {splitCurrencyForDisplay(transactionToDelete.total_amount, "₹").decimals}
                   </Text>
                 </HStack>
               </Box>
             )}
           </ModalBody>
           <ModalFooter>
             <Button
               variant="outline"
               mr={3}
               onClick={onDeleteClose}
               leftIcon={<Icon as={Trash2} size={16} />}
             >
               Cancel
             </Button>
             <Button
               colorScheme="red"
               onClick={handleDeleteTransaction}
               leftIcon={<Trash2 size={16} />}
             >
               Delete
             </Button>
           </ModalFooter>
         </ModalContent>
       </Modal>
    </Box>
  );
};

export default MfTransactions;