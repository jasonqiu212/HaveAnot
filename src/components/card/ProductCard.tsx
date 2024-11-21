import { Badge, Group, Paper, Stack, Text, Title } from '@mantine/core';
import '@mantine/core/styles.css';
import { IconArrowUpRight } from '@tabler/icons-react';

interface ProductCardProps {
  productIndex: number;
  name: string;
  description: string;
  logoPath?: string;
  websiteLink: string;
}

function ProductCard({
  productIndex,
  name,
  description,
  websiteLink,
}: ProductCardProps) {
  return (
    <Paper p="24px" bg="indigo.0" radius="md">
      <Stack gap="16px">
        <a href={websiteLink} target="_blank">
          <Group>
            <Badge variant="light" color="indigo.6" circle>
              {productIndex + 1}
            </Badge>
            <img src={`/products/${name}.png`} alt={name} height="24px" />
            <Title order={4} c="gray.9" style={{ flexGrow: 1 }}>
              {name}
            </Title>
            <IconArrowUpRight />
          </Group>
        </a>
        <Text c="gray.9">{description}</Text>
      </Stack>
    </Paper>
  );
}

export default ProductCard;
