import { LoadingOverlay, Paper, Text } from '@mantine/core';
import '@mantine/core/styles.css';
import ReactMarkdown from 'react-markdown';

interface ProductCardProps {
  text: string;
  isWaitingForUpdate: boolean;
}

function TextCard({ text, isWaitingForUpdate }: ProductCardProps) {
  return (
    <Paper
      p="24px"
      bg="indigo.0"
      radius="md"
      w="100%"
      mih="200px"
      pos="relative"
    >
      <LoadingOverlay
        visible={isWaitingForUpdate}
        loaderProps={{ size: 'sm', color: 'indigo.5' }}
        opacity="60%"
      />
      <Text c="gray.9">
        <ReactMarkdown>{text}</ReactMarkdown>
      </Text>
    </Paper>
  );
}

export default TextCard;
