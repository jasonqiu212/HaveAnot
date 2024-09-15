import {
  ActionIcon,
  Button,
  Center,
  Stack,
  Text,
  Textarea,
  Title,
} from '@mantine/core';
import '@mantine/core/styles.css';
import { IconArrowNarrowRight } from '@tabler/icons-react';

function Landing() {
  const rightArrowActionButton = (
    <ActionIcon variant="filled" c="gray.4" bg="gray.1">
      <IconArrowNarrowRight />
    </ActionIcon>
  );

  return (
    <Center h="100%">
      <Stack gap="40px">
        <Stack maw="720px" justify="center" ta="center" gap="24px">
          <Title order={1} c="gray.9">
            Your solution building companion
          </Title>
          <Text size="lg" c="gray.7">
            Let's begin by understanding a little more about what you want to
            solve.
          </Text>
        </Stack>
        <Stack align="center" gap="24px">
          <Textarea
            variant="filled"
            w="100%"
            autosize
            maxRows={9}
            placeholder="You can start by providing some context to your problem."
            rightSection={rightArrowActionButton}
          />
          <Button variant="light" c="indigo.6" fw="400" bg="indigo.0">
            I have a solution in mind
          </Button>
        </Stack>
      </Stack>
    </Center>
  );
}

export default Landing;
