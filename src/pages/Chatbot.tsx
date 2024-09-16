import { Alert, Group, Modal, Skeleton, Stack, Text } from '@mantine/core';
import '@mantine/core/styles.css';
import { useContext } from 'react';
import { useNavigate } from 'react-router-dom';

import { ProblemStatementContext } from '../App';
import ChatInput from '../components/ChatInput';
import Sidebar from '../components/Sidebar';

function Chatbot() {
  const [problemStatement, _] = useContext(ProblemStatementContext);
  const navigate = useNavigate();

  if (problemStatement === null) {
    return (
      <Modal
        centered
        onClose={() => {
          navigate('/');
        }}
        opened
        title={<Text fw="bold">Unauthorised</Text>}
      >
        <Alert color="red">
          Please come up with a problem statement first.
        </Alert>
      </Modal>
    );
  } else {
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
}

export default Chatbot;
