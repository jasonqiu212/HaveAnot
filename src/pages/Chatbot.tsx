import {
  Alert,
  Box,
  Group,
  Modal,
  Stack,
  Text,
  Transition,
} from '@mantine/core';
import '@mantine/core/styles.css';
import { useDisclosure, useThrottledState } from '@mantine/hooks';
import { useContext, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { ProblemStatementContext } from '../App';
import { ProblemStatementAgent } from '../agents/ProblemStatementAgent';
import ChatHistory from '../components/ChatHistory';
import ChatInput from '../components/ChatInput';
import ExampleQuestions from '../components/ExampleQuestions';
import Sidebar from '../components/Sidebar';

export interface Message {
  role: 'Human' | 'AI';
  text: string;
}

function Chatbot() {
  const [problemStatement, _] = useContext(ProblemStatementContext);
  const [solutionExplanation, setSolutionExplanation] = useState<
    string | undefined
  >();
  const [solutionRequirements, setSolutionRequirements] = useState<
    string[] | undefined
  >();
  const navigate = useNavigate();

  const [messages, setMessages] = useState<Message[]>([]);
  const [streamedMessage, setStreamedMessage] = useThrottledState<
    Message | undefined
  >(undefined, 20);
  const [inputValue, setInputValue] = useState('');
  const [isLoadingAgentResponse, setIsLoadingAgentResponse] = useState(false);
  const [
    areExampleQuestionsShowed,
    { open: showExampleQuestions, close: closeExampleQuestions },
  ] = useDisclosure(false);

  const addMessage = (message: Message) => {
    setStreamedMessage(message);
  };

  const problemStatementAgent = useMemo(
    () =>
      new ProblemStatementAgent((explanation, requirements) => {
        setSolutionExplanation(explanation);
        setSolutionRequirements(requirements);
      }, addMessage),
    [],
  );

  const handleSubmit = (message: string = inputValue) => {
    if (!isLoadingAgentResponse) {
      setInputValue('');
      setIsLoadingAgentResponse(true);
      setMessages((prevMessages) => [
        ...prevMessages,
        { role: 'Human', text: message },
      ]);
      (async () => {
        // so somehow awaiting the stream is necessary, else nothing happens
        for await (const _ of await problemStatementAgent.stream(message)) {
          // console.log(chunk);
        }
      })();
    }
  };

  useEffect(() => {
    if (problemStatement !== null) {
      handleSubmit(problemStatement);
    }
  }, []);

  // gives the effect that the messages are being streamed in
  useEffect(() => {
    if (streamedMessage === undefined) {
      return;
    }

    let i = 0;
    setMessages((prevMessages) => [
      ...prevMessages,
      { role: streamedMessage.role, text: '' },
    ]);
    const interval = setInterval(() => {
      if (i < streamedMessage.text.length) {
        setMessages((prevMessages) => {
          const messages = [...prevMessages];
          messages[messages.length - 1] = {
            role: streamedMessage.role,
            text: streamedMessage.text.slice(0, i + 1),
          };
          return messages;
        });
        i++;
      } else {
        clearInterval(interval);
        setStreamedMessage(undefined);
        setIsLoadingAgentResponse(false);
      }
    });
  }, [streamedMessage]);

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
      <Group h="100%" wrap="nowrap">
        <Stack w="59%" h="100%" p="40px" bg="gray.0" px="sm" align="center">
          <ChatHistory messages={messages} />
          <Box w="87%">
            <Transition
              mounted={areExampleQuestionsShowed}
              transition="fade-up"
              duration={600}
              timingFunction="ease"
            >
              {(styles) => (
                <div style={styles}>
                  <ExampleQuestions handleCloseClick={closeExampleQuestions} />
                </div>
              )}
            </Transition>
            <ChatInput
              placeholder="Share more details about the problem you wish to solve"
              backgroundColor="white"
              handleSubmit={handleSubmit}
              inputValue={inputValue}
              setInputValue={setInputValue}
              isLoadingOpened={isLoadingAgentResponse}
            />
          </Box>
        </Stack>
        <Sidebar
          areExampleQuestionsShowed={areExampleQuestionsShowed}
          showExampleQuestions={showExampleQuestions}
          solutionRequirements={solutionRequirements}
          solutionExplanation={solutionExplanation}
        />
      </Group>
    );
  }
}

export default Chatbot;
