import { Badge, Group, HoverCard, Stack, Text, Title } from '@mantine/core';
import '@mantine/core/styles.css';
import { useDisclosure } from '@mantine/hooks';

interface ProductHoverCardProps {
  label: string;
}

function ProductHoverCard({ label }: ProductHoverCardProps) {
  const [isHovering, { open: onMouseEnter, close: onMouseLeave }] =
    useDisclosure(false);

  return (
    <HoverCard width={280} shadow="md">
      <HoverCard.Target>
        <Badge
          variant={isHovering ? 'filled' : 'light'}
          color="indigo.6"
          circle
          onMouseEnter={onMouseEnter}
          onMouseLeave={onMouseLeave}
        >
          {label}
        </Badge>
      </HoverCard.Target>
      <HoverCard.Dropdown>
        <Stack gap="xs">
          <Group>
            <img src="/products/FormSG.png" height="24px" />
            <Title order={5} c="gray.9">
              FormSG
            </Title>
          </Group>
          <Text c="gray.9" lineClamp={4}>
            Hover card is revealed when user hovers over target element, it will
            be hidden once mouse is not over both target and dropdown elements
          </Text>
        </Stack>
      </HoverCard.Dropdown>
    </HoverCard>
  );
}

export default ProductHoverCard;
