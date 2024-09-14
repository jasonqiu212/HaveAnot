import {
  ActionIcon,
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
    <ActionIcon variant="light" color="gray.4">
      <IconArrowNarrowRight />
    </ActionIcon>
  );

  return (
    <Center>
      <Stack maw="720px" align="center" gap="48px">
        <Stack justify="center" ta="center" gap="16px">
          <Title order={1} c="gray.9">
            Your solution building companion
          </Title>
          <Text size="lg" c="gray.7">
            Let's start with the general solution you're looking at.
          </Text>
        </Stack>
        <Stack w="100%">
          <Textarea
            variant="filled"
            placeholder="What do you wish to build?"
            rightSection={rightArrowActionButton}
          />
        </Stack>
      </Stack>
    </Center>
  );
}

export default Landing;
