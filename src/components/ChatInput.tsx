import { ActionIcon, Group, Textarea } from '@mantine/core';
import '@mantine/core/styles.css';
import { IconArrowNarrowRight } from '@tabler/icons-react';

interface ChatInputProps {
  placeholder: string;
  backgroundColor: string;
  handleSubmit: () => void;
  inputValue: string;
  setInputValue: (value: string) => void;
  isLoading: boolean;
}

function ChatInput({
  placeholder,
  backgroundColor,
  handleSubmit,
  inputValue,
  setInputValue,
  isLoading,
}: ChatInputProps) {
  const handleInputChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputValue(event.target.value);
  };

  const canSubmit = !isLoading && inputValue !== '';

  return (
    <>
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
          value={inputValue}
          onChange={handleInputChange}
          style={{ flexGrow: 1 }}
          variant="unstyled"
          autosize
          maxRows={9}
          placeholder={placeholder}
          onKeyDown={(event) => {
            if (!canSubmit) {
              return;
            }
            if (event.key === 'Enter' && !event.shiftKey) {
              event.preventDefault();
              handleSubmit();
            }
          }}
        />
        <ActionIcon
          disabled={!canSubmit}
          onClick={() => {
            handleSubmit();
          }}
          variant="filled"
          size="sm"
          c="gray.4"
          bg={canSubmit ? 'indigo.6' : 'gray.1'}
        >
          <IconArrowNarrowRight />
        </ActionIcon>
      </Group>
    </>
  );
}

export default ChatInput;
