import { useState } from "react";
import { Box } from "@chakra-ui/react";
import InsightsMainHeader from "./InsightsMainHeader";
import InsightsMainCharts from "./InsightsMainCharts";
import useLedgerStore from "@/components/shared/store";

const InsightsMain = () => {
  const { ledgerId } = useLedgerStore();
  const [selectedLedgerId, setSelectedLedgerId] = useState<string | undefined>(
    ledgerId,
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
