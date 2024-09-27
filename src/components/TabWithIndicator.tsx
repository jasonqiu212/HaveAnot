import { Indicator, Tabs } from '@mantine/core';
import '@mantine/core/styles.css';
import { useEffect, useState } from 'react';

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
  // limit the number of pulses to 5; assume 1 pulse per second (found by inspecting element in mantine docs)
  const [numPulses, setNumPulses] = useState(0);
  const maxNumPulses = 5;
  let interval: NodeJS.Timeout;
  useEffect(() => {
    if (isProcessing) {
      setNumPulses(0);
      interval ? clearInterval(interval) : undefined;

      interval = setInterval(() => {
        setNumPulses((num) => {
          if (num < maxNumPulses) {
            return num + 1;
          } else {
            interval ? clearInterval(interval) : undefined;
            return num;
          }
        });
      }, 1000);
    }
  }, [isProcessing]);

  const isDisabled = !isProcessing && isViewed;
  return (
    <Indicator
      color="indigo.6"
      offset={7}
      disabled={isDisabled}
      processing={isProcessing && numPulses < maxNumPulses}
    >
      <Tabs.Tab value={value} c="gray.7">
        {label}
      </Tabs.Tab>
    </Indicator>
  );
}

export default TabWithIndicator;
