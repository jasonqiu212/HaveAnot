import { Button, Stack, Text, Title } from '@mantine/core';
import '@mantine/core/styles.css';

interface RecommendedProductsProps {
  nextStep: () => void;
  previousStep: () => void;
}

function RecommendedProducts({
  nextStep,
  previousStep,
}: RecommendedProductsProps) {
  return (
    <Stack justify="flex-start" gap="16px" c="gray.9">
      <Title order={3}>Suggested products (2)</Title>
      <Text size="md" c="gray.7">
        Here's what we think would help address your problem.
      </Text>
      <Button
        variant="light"
        fw="400"
        c="white"
        bg="indigo.6"
        onClick={nextStep}
      >
        What's next?
      </Button>
      <Button variant="outline" fw="400" c="indigo.6" onClick={previousStep}>
        Back
      </Button>
    </Stack>
  );
}

export default RecommendedProducts;
