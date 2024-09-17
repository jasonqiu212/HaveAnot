import {
  Alert,
  Button,
  Center,
  LoadingOverlay,
  Modal,
  Stack,
  Text,
  Title,
} from '@mantine/core';
import '@mantine/core/styles.css';
import { useDisclosure } from '@mantine/hooks';
import { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { ProblemStatementContext } from '../App';
import { AccessControlAgent } from '../agents/AccessControlAgent';
import ChatInput from '../components/ChatInput';

function Landing() {
  const navigate = useNavigate();

  const [_, setProblemStatement] = useContext(ProblemStatementContext);

  const [isModalOpened, { open: setModalOpen, close: setModalClose }] =
    useDisclosure(false);
  const [isLoadingOpened, { open: setLoadingOpen, close: setLoadingClose }] =
    useDisclosure(false);

  const [inputValue, setInputValue] = useState('');
  const [accessControlAgentMessage, setAccessControlAgentMessage] =
    useState('');

  const accessControlAgent = new AccessControlAgent(
    () => {
      setProblemStatement(inputValue);
      navigate('chatbot');
    },
    (message) => {
      setLoadingClose();
      setAccessControlAgentMessage(message);
      setModalOpen();
    },
  );

  const handleSubmit = () => {
    accessControlAgent.invoke(inputValue);
    setLoadingOpen();
  };

  return (
    <>
      <Center h="100%">
        <Stack gap="40px" maw="720px">
          <Stack w="100%" justify="center" ta="center" gap="24px">
            <Title order={1} c="gray.9">
              Your solution building companion
            </Title>
            <Text size="lg" c="gray.7">
              Let's begin by understanding a little more about what you want to
              solve.
            </Text>
          </Stack>
          <Stack align="center" gap="24px">
            <ChatInput
              placeholder="You can start by providing some context to your problem."
              backgroundColor="gray.0"
              handleSubmit={handleSubmit}
              inputValue={inputValue}
              setInputValue={setInputValue}
            />
            <Button variant="light" c="indigo.6" fw="400" bg="indigo.0">
              I have a solution in mind
            </Button>
          </Stack>
        </Stack>
      </Center>
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

export default Landing;
