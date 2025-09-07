import {
  Box,
  Heading,
  useColorModeValue,
  HStack,
  Text,
  Flex,
  Icon,
} from "@chakra-ui/react";
import { FC, ReactNode } from "react";

interface PageHeaderProps {
  title: ReactNode;
  subtitle?: string;
  icon?: React.ElementType;
  actions?: ReactNode;
  headerContent?: ReactNode;
}

const PageHeader: FC<PageHeaderProps> = ({ title, subtitle, icon, actions, headerContent }) => {
  const gradientBg = useColorModeValue(
    "linear(135deg, teal.500, teal.600)",
    "linear(135deg, teal.600, teal.700)",
  );

  return (
    <Box
      bgGradient={gradientBg}
      color="white"
      p={6}
      position="sticky"
      top={0}
      zIndex={10}
    >
      <Flex
        justifyContent="space-between"
        align="center"
        flexDirection={{ base: "column", md: "row" }}
        gap={4}
        width="100%"
      >
        <HStack spacing={3} align="center" flex={1}>
          {icon && (
            <Box
              p={3}
              bg="whiteAlpha.200"
              borderRadius="md"
              backdropFilter="blur(20px)"
              border="1px solid whiteAlpha.300"
              boxShadow="xl"
            >
              <Icon as={icon} boxSize={6} />
            </Box>
          )}
          <Box>
            <Heading
              as="h1"
              size="lg"
              fontWeight="bold"
              letterSpacing="-0.02em"
            >
              {title}
            </Heading>
            <Text fontSize="sm" color="whiteAlpha.900" fontWeight="medium">
              {subtitle || <span>&nbsp;</span>}
            </Text>
          </Box>
        </HStack>
        <HStack>
          {headerContent}
          {actions && <Box>{actions}</Box>}
        </HStack>
      </Flex>
    </Box>
  );
};

export default PageHeader;
