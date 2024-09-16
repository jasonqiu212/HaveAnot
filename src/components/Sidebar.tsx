import { Stepper } from '@mantine/core';
import '@mantine/core/styles.css';
import { useState } from 'react';

import RecommendedProducts from './RecommendedProducts';
import SolutionRequirements from './SolutionRequirements';

function Sidebar() {
  const [active, setActive] = useState(0);

  const previousStep = () =>
    setActive((current) => (current > 0 ? current - 1 : current));
  const nextStep = () =>
    setActive((current) => (current < steps.length ? current + 1 : current));

  const steps = [
    {
      label: 'Solution requirements',
      element: <SolutionRequirements nextStep={nextStep} />,
    },
    {
      label: 'Recommended products',
      element: (
        <RecommendedProducts previousStep={previousStep} nextStep={nextStep} />
      ),
    },
    // TODO: Add solution architecture step
    // {
    //   label: 'Solution architecture',
    //   element: <SolutionRequirements nextStep={nextStep} />,
    // },
  ];

  return (
    <Stepper
      active={active}
      onStepClick={setActive}
      allowNextStepsSelect={false}
      h="100%"
      w="40%"
      p="40px"
      size="sm"
      color="indigo.6"
      styles={{ content: { paddingTop: '40px' } }}
    >
      {steps.map((step) => (
        <Stepper.Step label={step.label}>{step.element}</Stepper.Step>
      ))}
    </Stepper>
  );
}

export default Sidebar;
