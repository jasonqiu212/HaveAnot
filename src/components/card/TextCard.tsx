import { Paper, Text } from '@mantine/core';
import '@mantine/core/styles.css';
import ReactMarkdown from 'react-markdown';

interface ProductCardProps {
  text: string;
}

function TextCard({ text }: ProductCardProps) {
  return (
    <Paper p="24px" bg="indigo.0" radius="md">
      <Text c="gray.9">
        <ReactMarkdown>{text}</ReactMarkdown>
      </Text>
    </Paper>
  );
}

export default TextCard;
