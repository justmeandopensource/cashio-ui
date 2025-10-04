import { lazy, Suspense } from "react";
import { Text, Box, useColorModeValue } from "@chakra-ui/react";

const IncomeExpenseTrend = lazy(() => import("./charts/IncomeExpenseTrend"));
const CurrentMonthOverview = lazy(() => import("./charts/CurrentMonthOverview"));
const CategoryTrend = lazy(() => import("./charts/CategoryTrend"));
const TagTrend = lazy(() => import("./charts/TagTrend"));
const MutualFundsAllocation = lazy(() => import("./charts/MutualFundsAllocation"));
const MutualFundsAssetClassAllocation = lazy(() => import("./charts/MutualFundsAssetClassAllocation"));
const MutualFundsYearlyInvestments = lazy(() => import("./charts/MutualFundsYearlyInvestments"));
const MutualFundsCorpus = lazy(() => import("./charts/MutualFundsCorpus"));

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
      case "mutual-funds-allocation":
        return <MutualFundsAllocation ledgerId={ledgerId} />;
      case "mutual-funds-asset-class-allocation":
        return <MutualFundsAssetClassAllocation ledgerId={ledgerId} />;
      case "mutual-funds-yearly-investments":
        return <MutualFundsYearlyInvestments ledgerId={ledgerId} />;
      case "mutual-funds-corpus":
        return <MutualFundsCorpus ledgerId={ledgerId} />;
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

  return (
    <Suspense fallback={<Box textAlign="center" py={8}><Text>Loading chart...</Text></Box>}>
      <Box>{renderVisualization()}</Box>
    </Suspense>
  );
};

export default InsightsMainCharts;
