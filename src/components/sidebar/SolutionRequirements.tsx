import { Stack, Text } from '@mantine/core';
import '@mantine/core/styles.css';

import NotEnoughInformation from '../card/NotEnoughInformationCard';
import TextCard from '../card/TextCard';

interface SolutionRequirementsProps {
  features: string | undefined;
}

function SolutionRequirements({ features }: SolutionRequirementsProps) {
  return (
    <Stack gap="24px" pt="32px">
      <Text c="gray.7">Here's a list of suggested solution requirements.</Text>
      {features ? <TextCard text={features} /> : <NotEnoughInformation />}
    </Stack>
  );
}

export default SolutionRequirements;
