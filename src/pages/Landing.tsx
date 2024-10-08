import { Alert, Center, Modal, Stack, Text, Title } from '@mantine/core';
import '@mantine/core/styles.css';
import { useDisclosure } from '@mantine/hooks';
import { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { ProblemStatementContext, ProductMapContext } from '../App';
// import { AccessControlAgent } from '../agents/AccessControlAgent';
import ChatInput from '../components/ChatInput';

function Landing() {
  const navigate = useNavigate();

  const [, setProblemStatement] = useContext(ProblemStatementContext);
  const productMap = useContext(ProductMapContext);

  const [isModalOpened, { close: setModalClose }] = useDisclosure(false);
  const [isLoadingAgentResponse, setIsLoadingAgentResponse] = useState(false);

  const [inputValue, setInputValue] = useState('');
  const accessControlAgentMessage = '';
  //   const [accessControlAgentMessage, setAccessControlAgentMessage] =
  //     useState('');

  // const accessControlAgent = new AccessControlAgent(
  //   () => {
  //     setProblemStatement(inputValue);
  //     navigate('chatbot');
  //   },
  //   (message) => {
  //     setLoadingClose();
  //     setAccessControlAgentMessage(message);
  //     setModalOpen();
  //   },
  // );

  const handleSubmit = () => {
    // accessControlAgent.invoke(inputValue);
    setProblemStatement(inputValue);
    setIsLoadingAgentResponse(true);
  };

  useEffect(() => {
    if (isLoadingAgentResponse && productMap) {
      navigate('chatbot');
    }
  }, [isLoadingAgentResponse, productMap]);

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
          <ChatInput
            placeholder="You can start by providing some context to your problem."
            backgroundColor="gray.0"
            handleSubmit={handleSubmit}
            inputValue={inputValue}
            setInputValue={setInputValue}
            isLoading={isLoadingAgentResponse}
          />
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
    </>
  );
}

export default Landing;
