import { Button, Stack, Text, Title } from '@mantine/core';
import '@mantine/core/styles.css';

interface SolutionRequirementsProps {
  nextStep: () => void;
}

function SolutionRequirements({ nextStep }: SolutionRequirementsProps) {
  return (
    <Stack justify="flex-start" gap="16px" c="gray.9">
      <Title order={3}>Here's what we think your solution requires.</Title>
      <Text size="md" c="gray.7">
        This will inform the products we will suggest next.
      </Text>
      <Button
        variant="light"
        fw="400"
        c="white"
        bg="indigo.6"
        onClick={nextStep}
      >
        See products
      </Button>
    </Stack>
  );
}

export default SolutionRequirements;
