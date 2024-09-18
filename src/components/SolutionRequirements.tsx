import { Button, List, Paper, Stack, Text, Title } from '@mantine/core';
import '@mantine/core/styles.css';

interface SolutionRequirementsProps {
  nextStep: () => void;
  isHowButtonClicked: boolean;
  setIsHowButtonClicked: (value: boolean) => void;
  solutionRequirementsList: string[] | undefined;
  solutionExplanation: string | undefined;
}

function SolutionRequirements({
  nextStep,
  isHowButtonClicked,
  setIsHowButtonClicked,
  solutionRequirementsList,
  solutionExplanation,
}: SolutionRequirementsProps) {
  const solutionRequirements =
    solutionRequirementsList !== undefined &&
    solutionExplanation !== undefined ? (
      <Stack p="24px" bg="gray.0" c="gray.7" gap="32px">
        <Text>
          {solutionExplanation}
          {/* It sounds like you need a case management system that is able to do
          the following: */}
        </Text>
        <List type="ordered">
          {solutionRequirementsList.map(
            (requirement: string, index: number) => (
              <List.Item key={index}>{requirement}</List.Item>
            ),
          )}
          {/* <List.Item>Allow partner organizations to input data.</List.Item>
        <List.Item>Update data entries in real time.</List.Item>
        <List.Item>Consolidate and organize data.</List.Item>
        <List.Item>View live updates.</List.Item>
        <List.Item>Send notifications to users.</List.Item>
        <List.Item>Grant admin control rights.</List.Item>
        <List.Item>Ensure data security.</List.Item> */}
        </List>
      </Stack>
    ) : undefined;

  const notEnoughInformation = !isHowButtonClicked ? (
    <Paper p="24px" bg="blue.0" c="gray.7">
      <Stack gap="16px">
        <Text fs="italic" c="gray.7">
          We don't have enough information yet! Try elaborating on your problem
          to get the best results.
        </Text>
        <Button
          fw="400"
          c="white"
          bg="indigo.6"
          onClick={() => setIsHowButtonClicked(true)}
        >
          How?
        </Button>
      </Stack>
    </Paper>
  ) : (
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
