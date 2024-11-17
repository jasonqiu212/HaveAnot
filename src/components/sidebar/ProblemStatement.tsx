import { Accordion, Progress, ScrollArea, Stack, Text } from '@mantine/core';
import '@mantine/core/styles.css';

import ChecklistItem from '../ChecklistItem';
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
  // TODO: Pass in as props
  const hasWho = true;
  const hasWhat = true;
  const hasWhen = false;
  const hasWhere = true;
  const hasWhy = false;

  const progress = [hasWho, hasWhat, hasWhen, hasWhere, hasWhy].filter(
    Boolean,
  ).length;

  const getProblemStatementStatus = (percentage: number): string => {
    if (percentage <= 0.25) {
      return 'Getting started... 🚀';
    } else if (percentage <= 0.5) {
      return 'Making progress 🛠️';
    } else if (percentage <= 0.75) {
      return 'Almost there ⏳';
    } else if (percentage < 1) {
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
                  {getProblemStatementStatus(progress / 5)}
                </Text>
                <Progress color="indigo.6" value={(progress / 5) * 100} />
              </Stack>
            </Accordion.Control>
            <Accordion.Panel>
              <Stack gap="sm">
                <ChecklistItem isChecked={hasWho} label="Who" />
                <ChecklistItem isChecked={hasWhat} label="What" />
                <ChecklistItem isChecked={hasWhen} label="When" />
                <ChecklistItem isChecked={hasWhere} label="Where" />
                <ChecklistItem isChecked={hasWhy} label="Why" />
              </Stack>
            </Accordion.Panel>
          </Accordion.Item>
        </Accordion>
        {problem ? (
          <TextCard text={problem} isWaitingForUpdate={isWaitingForUpdate} />
        ) : (
          <NotEnoughInformation />
        )}
        {/* {problem ? (
          <TextCard text={problem} isWaitingForUpdate={isWaitingForUpdate} />
        ) : (
          <NotEnoughInformation />
        )} */}
      </Stack>
    </ScrollArea>
  );
}

export default ProblemStatement;
