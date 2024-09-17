import { ActionIcon, Group, Loader, Textarea } from '@mantine/core';
import '@mantine/core/styles.css';
import { IconArrowNarrowRight } from '@tabler/icons-react';

interface ChatInputProps {
  placeholder: string;
  backgroundColor: string;
  handleSubmit: () => void;
  inputValue: string;
  setInputValue: (value: string) => void;
  isLoadingOpened: boolean;
}

function ChatInput({
  placeholder,
  backgroundColor,
  handleSubmit,
  inputValue,
  setInputValue,
  isLoadingOpened,
}: ChatInputProps) {
  const handleInputChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputValue(event.target.value);
  };

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
            if (event.key === 'Enter' && !event.shiftKey) {
              event.preventDefault();
              handleSubmit();
            }
          }}
        />
        {isLoadingOpened ? (
          <Loader />
        ) : (
          <ActionIcon
            disabled={inputValue ? false : true}
            onClick={() => {
              handleSubmit();
            }}
            variant="filled"
            size="sm"
            c="gray.4"
            bg={inputValue ? 'indigo.6' : 'gray.1'}
          >
            <IconArrowNarrowRight />
          </ActionIcon>
        )}
      </Group>
    </>
  );
}

export default ChatInput;
