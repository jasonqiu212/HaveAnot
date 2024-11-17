import { Group, Text, ThemeIcon } from '@mantine/core';
import '@mantine/core/styles.css';
import {
  IconCircle,
  IconCircleCheckFilled,
  IconCircleMinus,
} from '@tabler/icons-react';

interface ChecklistItemProps {
  isChecked: boolean;
  isHalfChecked: boolean;
  label: string;
}

function ChecklistItem({
  isChecked,
  isHalfChecked,
  label,
}: ChecklistItemProps) {
  return (
    <Group gap="sm">
      <ThemeIcon variant="white" color="indigo.6">
        {isChecked ? (
          <IconCircleCheckFilled />
        ) : isHalfChecked ? (
          <IconCircleMinus />
        ) : (
          <IconCircle />
        )}
      </ThemeIcon>
      <Text c="gray.7" td={isChecked ? 'line-through' : ''}>
        {label}
      </Text>
    </Group>
  );
}

export default ChecklistItem;
