import { Badge, Group, HoverCard, Stack, Text, Title } from '@mantine/core';
import '@mantine/core/styles.css';
import { useDisclosure } from '@mantine/hooks';
import { useContext } from 'react';

import { ProductMapContext } from '../App';

interface ProductHoverCardProps {
  productId: string;
  label: string;
}

function ProductHoverCard({ productId, label }: ProductHoverCardProps) {
  const [isHovering, { open: onMouseEnter, close: onMouseLeave }] =
    useDisclosure(false);
  const productMap = useContext(ProductMapContext);

  if (!productMap || !productMap.has(parseInt(productId))) {
    return null;
  }

  const product = productMap.get(parseInt(productId))!;
  return (
    <HoverCard width={320} shadow="md">
      <HoverCard.Target>
        <Badge
          variant={isHovering ? 'filled' : 'light'}
          color="indigo.6"
          circle
          onMouseEnter={onMouseEnter}
          onMouseLeave={onMouseLeave}
          style={{ display: 'inline-flex' }}
        >
          {label}
        </Badge>
      </HoverCard.Target>
      <HoverCard.Dropdown>
        <Stack gap="xs">
          <Group>
            <img src={`/products/${product.Product}.png`} height="24px" />
            <Title order={5} c="gray.9">
              {product.Product}
            </Title>
          </Group>
          <Text c="gray.9" lineClamp={4}>
            {product['Short description']}
          </Text>
        </Stack>
      </HoverCard.Dropdown>
    </HoverCard>
  );
}

export default ProductHoverCard;
