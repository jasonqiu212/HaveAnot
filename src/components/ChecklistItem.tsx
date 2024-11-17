import { Group, Text, ThemeIcon } from '@mantine/core';
import '@mantine/core/styles.css';
import { IconCircle, IconCircleCheckFilled } from '@tabler/icons-react';

interface ChecklistItemProps {
  isChecked: boolean;
  label: string;
}

function ChecklistItem({ isChecked, label }: ChecklistItemProps) {
  return (
    <Group gap="sm">
      <ThemeIcon variant="white" color="indigo.6">
        {isChecked ? <IconCircleCheckFilled /> : <IconCircle />}
      </ThemeIcon>
      <Text c="gray.7" td={isChecked ? 'line-through' : ''}>
        {label}
      </Text>
    </Group>
  );
}

export default ChecklistItem;
