import { ScrollArea, Stack, Text } from '@mantine/core';
import '@mantine/core/styles.css';

import NotEnoughInformation from '../card/NotEnoughInformationCard';
import TextCard from '../card/TextCard';

interface ProblemStatementProps {
  problem: string | undefined;
  isWaitingForUpdate: boolean;
}

function ProblemStatement({
  problem,
  isWaitingForUpdate,
}: ProblemStatementProps) {
  return (
    <ScrollArea style={{ flexGrow: 1 }} h="100%">
      <Stack gap="24px" pt="32px">
        <Text c="gray.7">
          Here's the problem statement based on what you've described.
        </Text>
        {problem ? (
          <TextCard text={problem} isWaitingForUpdate={isWaitingForUpdate} />
        ) : (
          <NotEnoughInformation />
        )}
      </Stack>
    </ScrollArea>
  );
}

export default ProblemStatement;
