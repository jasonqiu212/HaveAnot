import { Paper, Stack, Text } from '@mantine/core';
import '@mantine/core/styles.css';

import TextCard from '../card/TextCard';

function ProblemStatement({ problem }: { problem: string | undefined }) {
  // TODO: Can we use TextCard component here?

  const notEnoughInformation = (
    <Paper p="24px" bg="gray.0" c="gray.7">
      <Text fs="italic" c="gray.7">
        We don't have enough information yet! Try elaborating on your problem to
        get the best results.
      </Text>
    </Paper>
  );

  return (
    <Stack gap="24px" pt="32px">
      <Text c="gray.7">
        Here's the problem statement based on what you've described.
      </Text>
      {problem ? <TextCard text={problem} /> : notEnoughInformation}
    </Stack>
  );
}

export default ProblemStatement;
