import { ActionIcon, Group, Stack, Title } from '@mantine/core';
import '@mantine/core/styles.css';
import { IconX } from '@tabler/icons-react';

import RowButton from './RowButton';

interface ExampleQuestionsProps {
  handleCloseClick: () => void;
}

const exampleQuestions = [
  'Who is affected by this problem?',
  'What are the challenges faced?',
  'When does this problem happen?',
  'Where does it occur? Consider the whole journey and touch points.',
  'Why is the problem worth solving?',
];

function ExampleQuestions({ handleCloseClick }: ExampleQuestionsProps) {
  return (
    <Stack gap="20px" w="100%" py="40px">
      <Group>
        <Title order={3} c="indigo.6" style={{ flexGrow: 1 }}>
          Try answering these questions
        </Title>
        <ActionIcon variant="transparent" c="gray.8" onClick={handleCloseClick}>
          <IconX width="16px" />
        </ActionIcon>
      </Group>
      <Stack gap="0px">
        {exampleQuestions.map((exampleQuestion: string, index: number) => (
          <RowButton
            key={index}
            label={exampleQuestion}
            handleButtonClick={() => {}}
          />
        ))}
      </Stack>
    </Stack>
  );
}

export default ExampleQuestions;
