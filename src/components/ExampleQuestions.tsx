import { Stack, Title } from '@mantine/core';
import '@mantine/core/styles.css';

import RowButton from './RowButton';

const exampleQuestions = [
  'Who is affected by this problem?',
  'What are the challenges faced?',
  'When does this problem happen?',
  'Where does it occur? Consider the whole journey and touch points.',
  'Why is the problem worth solving?',
];

function ExampleQuestions() {
  return (
    <Stack gap="20px" w="100%" py="40px">
      <Title order={3} c="indigo.6">
        Try answering these questions
      </Title>
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
