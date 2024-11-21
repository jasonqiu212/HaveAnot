import { Accordion, Progress, ScrollArea, Stack, Text } from '@mantine/core';
import '@mantine/core/styles.css';

import ChecklistItem from '../ChecklistItem';
import NotEnoughInformation from '../card/NotEnoughInformationCard';
import TextCard from '../card/TextCard';

interface ProblemStatementProps {
  problem: string | undefined;
  problemScores: {
    who: number;
    what: number;
    where: number;
    when: number;
    why: number;
  };
  isWaitingForUpdate: boolean;
}

function ProblemStatement({
  problem,
  problemScores,
  isWaitingForUpdate,
}: ProblemStatementProps) {
  const progress =
    Object.values(problemScores).reduce((sum, score) => sum + score, 0) /
    Object.keys(problemScores).length;

  const getProblemStatementStatus = (): string => {
    if (progress <= 0.25) {
      return 'Getting started... 🚀';
    } else if (progress <= 0.5) {
      return 'Making progress 🛠️';
    } else if (progress <= 0.75) {
      return 'Almost there ⏳';
    } else if (progress < 1) {
      return 'Finishing touches ✨';
    }
    return 'Perfect! ️🎉';
  };

  return (
    <ScrollArea style={{ flexGrow: 1 }} h="100%">
      <Stack gap="24px" pt="32px">
        <Accordion>
          <Accordion.Item value="test" style={{ border: 0 }}>
            <Accordion.Control>
              <Stack>
                <Text c="gray.7">Your problem statement</Text>
                <Text c="gray.7" fw="bold">
                  {getProblemStatementStatus()}
                </Text>
                <Progress
                  color="indigo.6"
                  value={progress * 100}
                  transitionDuration={300}
                />
              </Stack>
            </Accordion.Control>
            <Accordion.Panel>
              <Stack gap="sm">
                <ChecklistItem
                  isChecked={problemScores.who == 1}
                  isHalfChecked={problemScores.who != 0}
                  label="Who"
                />
                <ChecklistItem
                  isChecked={problemScores.what == 1}
                  isHalfChecked={problemScores.what != 0}
                  label="What"
                />
                <ChecklistItem
                  isChecked={problemScores.when == 1}
                  isHalfChecked={problemScores.when != 0}
                  label="When"
                />
                <ChecklistItem
                  isChecked={problemScores.where == 1}
                  isHalfChecked={problemScores.where != 0}
                  label="Where"
                />
                <ChecklistItem
                  isChecked={problemScores.why == 1}
                  isHalfChecked={problemScores.why != 0}
                  label="Why"
                />
              </Stack>
            </Accordion.Panel>
          </Accordion.Item>
        </Accordion>
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
