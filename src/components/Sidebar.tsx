import { Stack, Text, Title } from '@mantine/core';
import '@mantine/core/styles.css';

function Sidebar() {
  return (
    <Stack h="100%" w="30%" p="40px" justify="flex-start" gap="16px" c="gray.9">
      <Title order={3}>Here's what we think your solution requires.</Title>
      <Text size="md" c="gray.7">
        This will inform the products we will suggest next.
      </Text>
    </Stack>
  );
}

export default Sidebar;
