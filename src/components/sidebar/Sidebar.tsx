import { Tabs } from '@mantine/core';
import '@mantine/core/styles.css';

import ProblemStatement from './ProblemStatement';
import RecommendedProducts from './RecommendedProducts';
import SolutionRequirements from './SolutionRequirements';

interface SidebarProps {
  solutionRequirements: string[] | undefined;
  solutionExplanation: string | undefined;
}
function Sidebar({ solutionRequirements, solutionExplanation }: SidebarProps) {
  const tabs = [
    {
      label: 'Problem',
      value: 'problem',
      element: <ProblemStatement />,
    },
    {
      label: 'Requirements',
      value: 'requirements',
      element: (
        <SolutionRequirements
          solutionRequirementsList={solutionRequirements}
          solutionExplanation={solutionExplanation}
        />
      ),
    },
    {
      label: 'Products',
      value: 'products',
      element: <RecommendedProducts />,
    },
  ];

  return (
    <Tabs defaultValue="problem" h="100%" w="40%" p="32px" color="indigo.6">
      <Tabs.List grow>
        {tabs.map((tab, index: number) => (
          <Tabs.Tab key={index} value={tab.value} c="gray.7">
            {tab.label}
          </Tabs.Tab>
        ))}
      </Tabs.List>

      {tabs.map((tab, index: number) => (
        <Tabs.Panel key={index} value={tab.value}>
          {tab.element}
        </Tabs.Panel>
      ))}
    </Tabs>
  );
}

export default Sidebar;
