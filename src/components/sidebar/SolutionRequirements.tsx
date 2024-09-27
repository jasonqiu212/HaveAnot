import { ScrollArea, Stack, Text } from '@mantine/core';
import '@mantine/core/styles.css';

import NotEnoughInformation from '../card/NotEnoughInformationCard';
import TextCard from '../card/TextCard';

interface SolutionRequirementsProps {
  features: string | undefined;
  isWaitingForUpdate: boolean;
}

function SolutionRequirements({
  features,
  isWaitingForUpdate,
}: SolutionRequirementsProps) {
  return (
    <ScrollArea style={{ flexGrow: 1 }} h="100%">
      <Stack gap="24px" py="32px">
        <Text c="gray.7">
          Here's a list of suggested solution requirements.
        </Text>
        {features ? (
          <TextCard text={features} isWaitingForUpdate={isWaitingForUpdate} />
        ) : (
          <NotEnoughInformation />
        )}
      </Stack>
    </ScrollArea>
  );
}

export default SolutionRequirements;
