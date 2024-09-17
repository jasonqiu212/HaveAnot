import { Group, Text, UnstyledButton } from '@mantine/core';
import '@mantine/core/styles.css';
import { IconChevronRight } from '@tabler/icons-react';

interface RowButtonProps {
  label: string;
  handleButtonClick: () => void;
}

function RowButton({ label, handleButtonClick }: RowButtonProps) {
  return (
    <UnstyledButton onClick={handleButtonClick}>
      <Group
        p="16px"
        style={{ borderBottom: '1px solid var(--mantine-color-gray-3)' }}
      >
        <Text c="gray.8" style={{ flexGrow: 1 }}>
          {label}
        </Text>
        <IconChevronRight width="16px" color="var(--mantine-color-gray-8)" />
      </Group>
    </UnstyledButton>
  );
}

export default RowButton;
