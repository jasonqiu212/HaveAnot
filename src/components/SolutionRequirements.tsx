import { Button, List, Paper, Stack, Text, Title } from '@mantine/core';
import '@mantine/core/styles.css';

interface SolutionRequirementsProps {
  nextStep: () => void;
}

function SolutionRequirements({ nextStep }: SolutionRequirementsProps) {
  const solutionRequirements = (
    <Paper p="24px" bg="gray.0" c="gray.7">
      <Text>
        It sounds like you need a case management system that is able to do the
        following:
      </Text>
      <List type="ordered">
        <List.Item>Allow partner organizations to input data.</List.Item>
        <List.Item>Update data entries in real time.</List.Item>
        <List.Item>Consolidate and organize data.</List.Item>
        <List.Item>View live updates.</List.Item>
        <List.Item>Send notifications to users.</List.Item>
        <List.Item>Grant admin control rights.</List.Item>
        <List.Item>Ensure data security.</List.Item>
      </List>
    </Paper>
  );

  return (
    <Stack justify="flex-start" gap="16px" c="gray.9">
      <Title order={3}>Here's what we think your solution requires.</Title>
      <Text c="gray.7">
        This will inform the products we will suggest next.
      </Text>
      {solutionRequirements}
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
