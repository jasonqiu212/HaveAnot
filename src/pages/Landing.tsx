import {
  ActionIcon,
  Center,
  Space,
  Stack,
  Text,
  Textarea,
  Title,
} from '@mantine/core';
import '@mantine/core/styles.css';
import { IconArrowNarrowRight } from '@tabler/icons-react';

function Landing() {
  const rightArrowActionButton = (
    <ActionIcon variant="subtle" c="indigo.6">
      <IconArrowNarrowRight />
    </ActionIcon>
  );

  return (
    <Center h="100%">
      <Stack maw="720px" justify="center" ta="center" gap="16px">
        <Title order={1} c="gray.9">
          Your solution building companion
        </Title>
        <Text size="lg" c="gray.7">
          Let's start with the general solution you're looking at.
        </Text>
        <Space h="16px" />
        <Textarea
          variant="filled"
          autosize
          placeholder="What do you wish to build?"
          rightSection={rightArrowActionButton}
        />
      </Stack>
    </Center>
  );
}

export default Landing;
