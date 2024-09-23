import { Stack, Text } from '@mantine/core';
import '@mantine/core/styles.css';

import NotEnoughInformation from '../card/NotEnoughInformationCard';
import TextCard from '../card/TextCard';

interface ProblemStatementProps {
  problem: string | undefined;
}

function ProblemStatement({ problem }: ProblemStatementProps) {
  return (
    <Stack gap="24px" pt="32px">
      <Text c="gray.7">
        Here's the problem statement based on what you've described.
      </Text>
      {problem ? <TextCard text={problem} /> : <NotEnoughInformation />}
    </Stack>
  );
}

export default ProblemStatement;
