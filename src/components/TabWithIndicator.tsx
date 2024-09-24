import { Indicator, Tabs } from '@mantine/core';
import '@mantine/core/styles.css';

interface TabWithIndicatorProps {
  value: string;
  label: string;
  isViewed: boolean;
  isProcessing: boolean;
}

function TabWithIndicator({
  value,
  label,
  isViewed,
  isProcessing,
}: TabWithIndicatorProps) {
  const isDisabled = !isProcessing && isViewed;
  return (
    <Indicator
      color="indigo.6"
      offset={7}
      disabled={isDisabled}
      processing={isProcessing}
    >
      <Tabs.Tab value={value} c="gray.7">
        {label}
      </Tabs.Tab>
    </Indicator>
  );
}

export default TabWithIndicator;
