import { Group, Skeleton, Stack } from '@mantine/core';
import '@mantine/core/styles.css';

import ChatInput from '../components/ChatInput';
import Sidebar from '../components/Sidebar';

function Problem() {
  return (
    <Group h="100%">
      <Stack h="100%" p="40px" bg="gray.0" style={{ flexGrow: 1 }}>
        <Skeleton style={{ flexGrow: 1 }} />
        <ChatInput
          placeholder="Share more details about the problem you wish to solve"
          backgroundColor="white"
        />
      </Stack>
      <Sidebar />
    </Group>
  );
}

export default Problem;
