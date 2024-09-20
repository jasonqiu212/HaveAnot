import { List, Stack, Text } from '@mantine/core';
import '@mantine/core/styles.css';

interface SolutionRequirementsProps {
  solutionRequirementsList: string[] | undefined;
  solutionExplanation: string | undefined;
}

function SolutionRequirements({
  solutionRequirementsList,
  solutionExplanation,
}: SolutionRequirementsProps) {
  const solutionRequirements =
    solutionRequirementsList !== undefined &&
    solutionExplanation !== undefined ? (
      <Stack p="24px" bg="indigo.0" c="gray.7" gap="32px">
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

  //   const notEnoughInformation = (
  //     <Paper p="24px" bg="gray.0" c="gray.7">
  //       <Text fs="italic" c="gray.7">
  //         We don't have enough information yet! Try elaborating on your problem to
  //         get the best results.
  //       </Text>
  //     </Paper>
  //   );

  return (
    <Stack gap="24px" pt="32px">
      <Text c="gray.7">Here's what we think your solution requires.</Text>
      {solutionRequirements}
    </Stack>
  );
}

export default SolutionRequirements;
