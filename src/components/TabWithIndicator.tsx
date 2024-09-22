import { Indicator, Tabs } from '@mantine/core';
import '@mantine/core/styles.css';

interface TabWithIndicatorProps {
  value: string;
  label: string;
  isIndicatorVisible: boolean;
}

function TabWithIndicator({
  value,
  label,
  isIndicatorVisible,
}: TabWithIndicatorProps) {
  return (
    <Indicator color="indigo.6" disabled={!isIndicatorVisible}>
      <Tabs.Tab value={value} c="gray.7">
        {label}
      </Tabs.Tab>
    </Indicator>
  );
}

export default TabWithIndicator;
