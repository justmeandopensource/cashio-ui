import { useNavigate } from "react-router-dom";
import {
  Box,
  SimpleGrid,
  Card,
  CardBody,
  Text,
  Button,
  Icon,
} from "@chakra-ui/react";
import { FileText, Plus } from 'lucide-react';
import useLedgerStore from "@/components/shared/store";

interface HomeLedgerCardsProps {
  ledgers?: Array<{ ledger_id: string; name: string; currency_symbol: string; description: string; notes: string }>;
  onOpen: () => void;
}

const HomeLedgerCards = ({ ledgers = [], onOpen }: HomeLedgerCardsProps) => {
  const navigate = useNavigate();
  const { setLedger } = useLedgerStore();

  const handleLedgerClick = (
    ledgerId: string,
    ledgerName: string,
    currencySymbol: string,
    description: string,
    notes: string,
  ) => {
    setLedger(ledgerId, ledgerName, currencySymbol, description, notes);
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
                    ledger.description,
                    ledger.notes,
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
