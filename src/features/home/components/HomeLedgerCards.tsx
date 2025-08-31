import { useNavigate } from "react-router-dom";
import {
  Box,
  Heading,
  SimpleGrid,
  Card,
  CardBody,
  Text,
  Button,
  Icon,
  Flex,
} from "@chakra-ui/react";
import { BookText, FileText, Plus } from 'lucide-react';
import useLedgerStore from "@/components/shared/store";

interface HomeLedgerCardsProps {
  ledgers?: Array<{ ledger_id: string; name: string; currency_symbol: string }>;
  onOpen: () => void;
}

const HomeLedgerCards = ({ ledgers = [], onOpen }: HomeLedgerCardsProps) => {
  const navigate = useNavigate();
  const { setLedger } = useLedgerStore();

  const handleLedgerClick = (
    ledgerId: string,
    ledgerName: string,
    currencySymbol: string,
  ) => {
    setLedger(ledgerId, ledgerName, currencySymbol);
    navigate(`/ledger`);
  };

  return (
    <Box mb={8}>
      {ledgers.length === 0 ? (
        <Box textAlign="center" py={10} px={6}>
          <Icon as={FileText} boxSize={12} color="teal.500" mb={4} />
          <Text fontSize="xl" fontWeight="bold" mb={2}>
            No Ledgers Found
          </Text>
          <Text color="secondaryTextColor" mb={6}>
            You do not have any ledgers yet. Create one to get started.
          </Text>
          <Button
            onClick={onOpen}
            leftIcon={<Plus />}
            colorScheme="teal"
            size="lg"
          >
            Create Ledger
          </Button>
        </Box>
      ) : (
        <Box>
          <Flex alignItems="center" gap={2} mb={4}>
            <BookText size={28} color="teal" />
            <Heading as="h2" size="lg" color="teal.500">
              Ledgers
            </Heading>
          </Flex>
          <SimpleGrid columns={{ base: 1, sm: 2, md: 2, lg: 4 }} spacing={6}>
            {ledgers.map((ledger) => (
              <Card
                key={ledger.ledger_id}
                bg="teal.50"
                _hover={{
                  transform: "scale(1.04)",
                  transition: "transform 0.2s",
                }}
                cursor="pointer"
                onClick={() =>
                  handleLedgerClick(
                    ledger.ledger_id,
                    ledger.name,
                    ledger.currency_symbol,
                  )
                }
              >
                <CardBody display="flex" alignItems="center" p={6}>
                  <Box
                    bg="teal.100"
                    p={3}
                    borderRadius="md"
                    mr={4}
                    fontWeight="bold"
                    fontSize="lg"
                  >
                    {ledger.currency_symbol}
                  </Box>
                  <Text fontSize="lg" fontWeight="semibold">
                    {ledger.name}
                  </Text>
                </CardBody>
              </Card>
            ))}
            <Card
              bg="teal.50"
              _hover={{
                transform: "scale(1.05)",
                transition: "transform 0.2s",
              }}
              cursor="pointer"
              onClick={onOpen}
              data-testid="create-ledger-card-with-plus-icon"
            >
              <CardBody
                display="flex"
                alignItems="center"
                justifyContent="center"
                p={6}
              >
                <Icon as={Plus} boxSize={6} color="teal.500" />
              </CardBody>
            </Card>
          </SimpleGrid>
        </Box>
      )}
    </Box>
  );
};

export default HomeLedgerCards;
