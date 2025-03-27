import { useState } from "react";
import { Box } from "@chakra-ui/react";
import InsightsMainHeader from "./InsightsMainHeader";
import InsightsMainCharts from "./InsightsMainCharts";

interface InsightsMainProps {
  initialLedgerId?: string;
}

const InsightsMain = ({ initialLedgerId }: InsightsMainProps) => {
  const [selectedLedgerId, setSelectedLedgerId] = useState<string | undefined>(
    initialLedgerId,
  );
  const [selectedVisualization, setSelectedVisualization] = useState<string>(
    "income-expense-trend",
  );

  return (
    <Box>
      <InsightsMainHeader
        selectedLedgerId={selectedLedgerId}
        selectedVisualization={selectedVisualization}
        onLedgerChange={setSelectedLedgerId}
        onVisualizationChange={setSelectedVisualization}
      />
      <Box mt={8}>
        <InsightsMainCharts
          ledgerId={selectedLedgerId}
          visualization={selectedVisualization}
        />
      </Box>
    </Box>
  );
};

export default InsightsMain;
