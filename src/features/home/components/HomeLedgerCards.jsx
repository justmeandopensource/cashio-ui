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
} from "@chakra-ui/react";
import { FiFileText, FiPlus } from "react-icons/fi";

const HomeLedgerCards = ({ ledgers = [], onOpen }) => {
  const navigate = useNavigate();

  const handleLedgerClick = (ledgerId) => {
    navigate(`/ledger/${ledgerId}`);
  };

  return (
    <Box mb={8}>
      {ledgers.length === 0 ? (
        <Box textAlign="center" py={10} px={6}>
          <Icon as={FiFileText} boxSize={12} color="teal.500" mb={4} />
          <Text fontSize="xl" fontWeight="bold" mb={2}>
            No Ledgers Found
          </Text>
          <Text color="gray.600" mb={6}>
            You do not have any ledgers yet. Create one to get started.
          </Text>
          <Button
            onClick={onOpen}
            leftIcon={<FiPlus />}
            colorScheme="teal"
            size="lg"
          >
            Create Ledger
          </Button>
        </Box>
      ) : (
        <Box>
          <Heading as="h2" size="lg" mb={4} color="teal.500">
            Ledgers
          </Heading>
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
                onClick={() => handleLedgerClick(ledger.ledger_id)}
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
            >
              <CardBody
                display="flex"
                alignItems="center"
                justifyContent="center"
                p={6}
              >
                <Icon as={FiPlus} boxSize={6} color="teal.500" />
              </CardBody>
            </Card>
          </SimpleGrid>
        </Box>
      )}
    </Box>
  );
};

export default HomeLedgerCards;
