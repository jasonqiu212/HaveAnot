import {
  Avatar,
  Group,
  ScrollArea,
  Stack,
  TypographyStylesProvider,
} from '@mantine/core';
import { useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';

import logo from '../assets/ai_logo.svg';
import { Message } from '../pages/Chatbot';

interface ChatHistoryProps {
  messages: Message[];
}
function ChatHistory({ messages }: ChatHistoryProps) {
  const viewport = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (viewport.current) {
      viewport.current!.scrollTo({
        top: viewport.current!.scrollHeight,
        behavior: 'instant',
      });
    }
  }, [messages]);

  return (
    <ScrollArea
      type="hover"
      style={{ flexGrow: 1 }}
      w="100%"
      viewportRef={viewport}
    >
      <Stack w="100%" gap="24px">
        {messages.map((message, index) => {
          const isHumanMessage = message.role === 'Human';
          const isAIMessage = message.role === 'AI';
          return (
            <Group
              key={index}
              maw="70%"
              bg={isHumanMessage ? 'gray.1' : 'transparent'}
              style={{
                alignSelf: isHumanMessage ? 'flex-end' : 'flex-start',
                borderRadius: '8px',
              }}
              p={isHumanMessage ? '24px' : '0px'}
              wrap="nowrap"
              align="flex-start"
            >
              {isAIMessage && (
                <Avatar
                  src={logo}
                  radius="xl"
                  size="40px"
                  px="8px"
                  py="10px"
                  bd="1px solid #4C6EF5"
                />
              )}
              <TypographyStylesProvider>
                <ReactMarkdown>{message.text}</ReactMarkdown>
              </TypographyStylesProvider>
            </Group>
          );
        })}
      </Stack>
    </ScrollArea>
  );
}

export default ChatHistory;
