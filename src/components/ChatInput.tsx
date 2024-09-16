import { ActionIcon, Group, Textarea } from '@mantine/core';
import '@mantine/core/styles.css';
import { IconArrowNarrowRight } from '@tabler/icons-react';

interface ChatInputProps {
  placeholder?: string;
  backgroundColor?: string;
}

function ChatInput({ placeholder, backgroundColor }: ChatInputProps) {
  return (
    <Group
      w="100%"
      gap="xs"
      px="24px"
      py="16px"
      bg={backgroundColor}
      bd="1.5px solid gray.4"
      style={{ borderRadius: '4px' }}
    >
      <Textarea
        style={{ flexGrow: 1 }}
        variant="unstyled"
        autosize
        maxRows={9}
        placeholder={placeholder}
      />
      <ActionIcon variant="filled" size="sm" c="gray.4" bg="gray.1">
        <IconArrowNarrowRight />
      </ActionIcon>
    </Group>
  );
}

export default ChatInput;
