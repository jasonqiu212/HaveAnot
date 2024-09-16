import {
  ActionIcon,
  Alert,
  Group,
  LoadingOverlay,
  Modal,
  Text,
  Textarea,
} from '@mantine/core';
import '@mantine/core/styles.css';
import { useDisclosure } from '@mantine/hooks';
import { IconArrowNarrowRight } from '@tabler/icons-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { AccessControlAgent } from '../agents/AccessControlAgent';

interface ChatInputProps {
  placeholder?: string;
  backgroundColor?: string;
}

function ChatInput({ placeholder, backgroundColor }: ChatInputProps) {
  const [inputValue, setInputValue] = useState('');
  const [isModalOpened, { open: setModalOpen, close: setModalClose }] =
    useDisclosure(false);
  const [isLoadingOpened, { open: setLoadingOpen, close: setLoadingClose }] =
    useDisclosure(false);
  const [accessControlAgentMessage, setAccessControlAgentMessage] =
    useState('');
  const navigate = useNavigate();

  const handleInputChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputValue(event.target.value);
  };

  const showAccessControlAgentMessage = (message: string) => {
    setAccessControlAgentMessage(message);
    setLoadingClose();
    setModalOpen();
  };

  const accessControlAgent = new AccessControlAgent(
    () => navigate('chatbot'),
    showAccessControlAgentMessage,
  );

  const handleSubmit = () => {
    accessControlAgent.invoke(inputValue);
    setLoadingOpen();
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
      </Group>
      <Modal
        centered
        onClose={() => {
          setInputValue('');
          setModalClose();
        }}
        opened={isModalOpened}
        title={<Text fw="bold">Unauthorised</Text>}
      >
        <Alert color="red">{accessControlAgentMessage}</Alert>
      </Modal>
      <LoadingOverlay visible={isLoadingOpened} />
    </>
  );
}

export default ChatInput;
