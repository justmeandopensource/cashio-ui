import { Text, Box, useColorModeValue } from "@chakra-ui/react";
import IncomeExpenseTrend from "./charts/IncomeExpenseTrend";
import CurrentMonthOverview from "./charts/CurrentMonthOverview";
import CategoryTrend from "./charts/CategoryTrend";
import TagTrend from "./charts/TagTrend";

interface InsightsMainChartsProps {
  ledgerId?: string;
  visualization: string;
}

const InsightsMainCharts = ({
  ledgerId,
  visualization,
}: InsightsMainChartsProps) => {
  const cardBg = useColorModeValue("white", "gray.700");

  if (!ledgerId) {
    return (
      <Box
        bg={cardBg}
        p={6}
        borderRadius="lg"
        boxShadow="md"
        textAlign="center"
      >
        <Text fontSize="lg" color="tertiaryTextColor">
          Select a ledger to view insights
        </Text>
      </Box>
    );
  }

  const renderVisualization = () => {
    switch (visualization) {
      case "income-expense-trend":
        return <IncomeExpenseTrend ledgerId={ledgerId} />;
      case "current-month-overview":
        return <CurrentMonthOverview />;
      case "category-trend":
        return <CategoryTrend />;
      case "tag-trend":
        return <TagTrend />;
      default:
        return (
          <Box
            bg={cardBg}
            p={6}
            borderRadius="lg"
            boxShadow="md"
            textAlign="center"
          >
            <Text fontSize="lg" color="tertiaryTextColor">
              Visualization not found
            </Text>
          </Box>
        );
    }
  };

  return <Box>{renderVisualization()}</Box>;
};

export default InsightsMainCharts;
