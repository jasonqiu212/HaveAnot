import { Tabs } from '@mantine/core';
import '@mantine/core/styles.css';
import { useEffect, useState } from 'react';

import { Product } from '../../pages/Chatbot';
import TabWithIndicator from '../TabWithIndicator';
import ProblemStatement from './ProblemStatement';
import RecommendedProducts from './RecommendedProducts';
import SolutionRequirements from './SolutionRequirements';

interface SidebarProps {
  problem: string | undefined;
  problemScores: {
    who: number;
    what: number;
    where: number;
    when: number;
    why: number;
  };
  features: string | undefined;
  productIds: number[] | undefined;
  productMap: Map<number, Product> | undefined;
  isStreamingProblem: boolean;
  isStreamingFeatures: boolean;
  isProblemAgentLoading: boolean;
  isFeaturesAgentLoading: boolean;
  isProductsAgentLoading: boolean;
}

function Sidebar({
  problem,
  problemScores,
  features,
  productIds,
  productMap,
  isStreamingProblem,
  isStreamingFeatures,
  isProblemAgentLoading,
  isFeaturesAgentLoading,
  isProductsAgentLoading,
}: SidebarProps) {
  const [activeTab, setActiveTab] = useState<string | null>('problem');

  const [isProblemViewed, setIsProblemViewed] = useState(true);
  const [areRequirementsViewed, setAreRequirementsViewed] = useState(true);
  const [areProductsViewed, setAreProductsViewed] = useState(true);

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
    if (problem && activeTab !== 'problem') {
      setIsProblemViewed(false);
    }
  }, [problem]);

  useEffect(() => {
    if (features && activeTab !== 'requirements') {
      setAreRequirementsViewed(false);
    }
  }, [features]);

  useEffect(() => {
    if (productIds && activeTab !== 'products') {
      setAreProductsViewed(false);
    }
  }, [productIds]);

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
          isProcessing={isStreamingProblem}
        />
        <TabWithIndicator
          value="requirements"
          label="Requirements"
          isViewed={areRequirementsViewed}
          isProcessing={isStreamingFeatures}
        />
        {/* set isViewed and isProcessinng using truth table to hack the logic; basically disable indicator if viewed or waiting for response */}
        <TabWithIndicator
          value="products"
          label="Products"
          isViewed={isProductsAgentLoading || areProductsViewed}
          isProcessing={!(isProductsAgentLoading || areProductsViewed)}
        />
      </Tabs.List>

      <Tabs.Panel value="problem" h="100%">
        <ProblemStatement
          problem={problem}
          problemScores={problemScores}
          isWaitingForUpdate={isProblemAgentLoading && !isStreamingProblem}
        />
      </Tabs.Panel>
      <Tabs.Panel value="requirements" h="100%">
        <SolutionRequirements
          features={features}
          isWaitingForUpdate={isFeaturesAgentLoading && !isStreamingFeatures}
        />
      </Tabs.Panel>
      <Tabs.Panel value="products" h="100%">
        <RecommendedProducts
          productMap={productMap}
          recommendedProductIds={productIds}
          isWaitingForUpdate={isProductsAgentLoading}
        />
      </Tabs.Panel>
    </Tabs>
  );
}

export default Sidebar;
