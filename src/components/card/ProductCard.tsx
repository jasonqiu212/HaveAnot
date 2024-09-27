import { Group, Paper, Stack, Text, Title } from '@mantine/core';
import '@mantine/core/styles.css';
import { IconArrowUpRight } from '@tabler/icons-react';

interface ProductCardProps {
  name: string;
  description: string;
  logoPath?: string;
  websiteLink: string;
}

function ProductCard({
  name,
  description,
  logoPath,
  websiteLink,
}: ProductCardProps) {
  return (
    <Paper p="24px" bg="indigo.0" radius="md">
      <Stack gap="16px">
        <a href={websiteLink} target="_blank">
          <Group>
            {logoPath && <img src={logoPath} alt={name} height="24px" />}
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
