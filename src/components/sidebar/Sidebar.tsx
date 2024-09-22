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
  solutionRequirements: string[] | undefined;
  solutionExplanation: string | undefined;
}

function Sidebar({
  problem,
  solutionRequirements,
  solutionExplanation,
}: SidebarProps) {
  const [activeTab, setActiveTab] = useState<string | null>('problem');

  const [
    isProblemIndicatorVisible,
    { open: showProblemIndicator, close: closeProblemIndicator },
  ] = useDisclosure(true);
  const [
    isRequirementsIndicatorVisible,
    { open: showRequirementsIndicator, close: closeRequirementsIndicator },
  ] = useDisclosure(true);
  const [
    isProductsIndicatorVisible,
    { open: showProductsIndicator, close: closeProductsIndicator },
  ] = useDisclosure(true);

  useEffect(() => {
    switch (activeTab) {
      case 'problem':
        closeProblemIndicator();
        break;
      case 'requirements':
        closeRequirementsIndicator();
        break;
      case 'products':
        closeProductsIndicator();
        break;
      default:
        break;
    }
  }, [activeTab]);

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
          isIndicatorVisible={isProblemIndicatorVisible}
        />
        <TabWithIndicator
          value="requirements"
          label="Requirements"
          isIndicatorVisible={isRequirementsIndicatorVisible}
        />
        <TabWithIndicator
          value="products"
          label="Products"
          isIndicatorVisible={isProductsIndicatorVisible}
        />
      </Tabs.List>

      <Tabs.Panel value="problem">
        <ProblemStatement problem={problem} />
      </Tabs.Panel>
      <Tabs.Panel value="requirements">
        <SolutionRequirements
          solutionRequirementsList={solutionRequirements}
          solutionExplanation={solutionExplanation}
        />
      </Tabs.Panel>
      <Tabs.Panel value="products">
        <RecommendedProducts />
      </Tabs.Panel>
    </Tabs>
  );
}

export default Sidebar;
