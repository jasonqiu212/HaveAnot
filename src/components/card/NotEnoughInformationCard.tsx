import { Paper, Text } from '@mantine/core';
import '@mantine/core/styles.css';

function NotEnoughInformation() {
  return (
    <Paper p="24px" bg="gray.0" radius="md">
      <Text fs="italic" c="gray.7">
        We don't have enough information yet! Try elaborating on your problem to
        get the best results.
      </Text>
    </Paper>
  );
}

export default NotEnoughInformation;
