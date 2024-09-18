import { Button, List, Paper, Stack, Text, Title } from '@mantine/core';
import '@mantine/core/styles.css';

interface SolutionRequirementsProps {
  nextStep: () => void;
  solutionRequirementsList: string[] | undefined;
  solutionExplanation: string | undefined;
}

function SolutionRequirements({
  nextStep,
  solutionRequirementsList,
  solutionExplanation,
}: SolutionRequirementsProps) {
  const solutionRequirements =
    solutionRequirementsList !== undefined &&
    solutionExplanation !== undefined ? (
      <Stack p="24px" bg="gray.0" c="gray.7" gap="32px">
        <Text>{solutionExplanation}</Text>
        <List type="ordered">
          {solutionRequirementsList.map(
            (requirement: string, index: number) => (
              <List.Item key={index}>{requirement}</List.Item>
            ),
          )}
        </List>
      </Stack>
    ) : undefined;

  const notEnoughInformation = (
    <Paper p="24px" bg="gray.0" c="gray.7">
      <Text fs="italic" c="gray.7">
        We don't have enough information yet! Try elaborating on your problem to
        get the best results.
      </Text>
    </Paper>
  );

  return (
    <Stack justify="flex-start" gap="16px" c="gray.9">
      <Title order={3}>Here's what we think your solution requires.</Title>
      <Text c="gray.7">
        This will inform the products we will suggest next.
      </Text>
      {solutionRequirements}
      {solutionExplanation === undefined &&
        solutionRequirementsList === undefined &&
        notEnoughInformation}
      {solutionExplanation !== undefined &&
        solutionRequirementsList !== undefined && (
          <Button fw="400" c="white" bg="indigo.6" onClick={nextStep}>
            See products
          </Button>
        )}
    </Stack>
  );
}

export default SolutionRequirements;
