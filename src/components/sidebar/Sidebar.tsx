import { Tabs } from '@mantine/core';
import '@mantine/core/styles.css';
import { useDisclosure } from '@mantine/hooks';
import { useEffect, useState } from 'react';

import TabWithIndicator from '../TabWithIndicator';
import ProblemStatement from './ProblemStatement';
import RecommendedProducts from './RecommendedProducts';
import SolutionRequirements from './SolutionRequirements';

interface SidebarProps {
  problem: string | undefined;
  features: string | undefined;
  isProblemAgentLoading: boolean;
  isFeaturesAgentLoading: boolean;
  isProductsAgentLoading: boolean;
}

function Sidebar({
  problem,
  features,
  isProblemAgentLoading,
  isFeaturesAgentLoading,
  isProductsAgentLoading,
}: SidebarProps) {
  const [activeTab, setActiveTab] = useState<string | null>('problem');

  const [isProblemViewed, setIsProblemViewed] = useState(true);
  const [areRequirementsViewed, setAreRequirementsViewed] = useState(false);
  const [areProductsViewed, setAreProductsViewed] = useState(false);

  useEffect(() => {
    switch (activeTab) {
      case 'problem':
        setIsProblemViewed(true);
        break;
      case 'requirements':
        setAreRequirementsViewed(true);
        break;
      case 'products':
        setAreProductsViewed(true);
        break;
      default:
        break;
    }
  }, [activeTab]);

  useEffect(() => {
    if (activeTab !== 'problem') {
      setIsProblemViewed(false);
    }
  }, [problem]);

  useEffect(() => {
    if (activeTab !== 'requirements') {
      setAreRequirementsViewed(false);
    }
  }, [features]);

  return (
    <Tabs
      value={activeTab}
      onChange={setActiveTab}
      h="100%"
      w="40%"
      p="32px"
      color="indigo.6"
    >
      <Tabs.List>
        <TabWithIndicator
          value="problem"
          label="Problem"
          isViewed={isProblemViewed}
          isProcessing={isProblemAgentLoading}
        />
        <TabWithIndicator
          value="requirements"
          label="Requirements"
          isViewed={areRequirementsViewed}
          isProcessing={isFeaturesAgentLoading}
        />
        <TabWithIndicator
          value="products"
          label="Products"
          isViewed={areProductsViewed}
          isProcessing={isProductsAgentLoading}
        />
      </Tabs.List>

      <Tabs.Panel value="problem" h="100%">
        <ProblemStatement problem={problem} />
      </Tabs.Panel>
      <Tabs.Panel value="requirements" h="100%">
        <SolutionRequirements features={features} />
      </Tabs.Panel>
      <Tabs.Panel value="products" h="100%">
        <RecommendedProducts />
      </Tabs.Panel>
    </Tabs>
  );
}

export default Sidebar;
