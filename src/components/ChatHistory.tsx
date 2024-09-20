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
        {messages.map((message, index) => (
          <Group
            key={index}
            maw="70%"
            style={{
              alignSelf: message.role === 'Human' ? 'flex-end' : 'flex-start',
              backgroundColor:
                message.role === 'Human'
                  ? 'var(--mantine-color-gray-1)'
                  : 'transparent',
            }}
            p={message.role === 'Human' ? '24px' : '0px'}
            wrap="nowrap"
            align="flex-start"
          >
            {message.role === 'AI' && (
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
        ))}
      </Stack>
    </ScrollArea>
  );
}

export default ChatHistory;
