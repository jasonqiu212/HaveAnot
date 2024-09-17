import { Button, Stack, Text, Title } from '@mantine/core';
import '@mantine/core/styles.css';

import GatherSGLogo from '../assets/products/gather-sg.png';
import PostmanLogo from '../assets/products/postman.png';
import ProductCard from './Product';

interface RecommendedProductsProps {
  nextStep: () => void;
  previousStep: () => void;
}

interface Product {
  name: string;
  description: string;
  logoPath: string;
  websiteLink: string;
}

const products: { [key: string]: Product } = {
  GatherSG: {
    name: 'GatherSG',
    description:
      'Lightweight Whole-of-Government customer relationship management system.',
    logoPath: GatherSGLogo,
    websiteLink: 'https://gather.gov.sg/',
  },
  Postman: {
    name: 'Postman',
    description: 'Secure, multichannel tool to send official communications.',
    logoPath: PostmanLogo,
    websiteLink: 'https://postman.gov.sg/',
  },
};

function RecommendedProducts({
  //   nextStep,
  previousStep,
}: RecommendedProductsProps) {
  const recommendedProducts = ['GatherSG', 'Postman'];

  return (
    <Stack gap="40px">
      <Stack gap="16px">
        <Title order={3} c="gray.9">
          Suggested products (2)
        </Title>
        <Text c="gray.7">
          Here's what we think would help address your problem.
        </Text>
      </Stack>

      <Stack gap="24px">
        {recommendedProducts.map(
          (recommendedProduct: string, index: number) => {
            const { name, description, logoPath, websiteLink } =
              products[recommendedProduct];
            return (
              <ProductCard
                key={index}
                name={name}
                description={description}
                logoPath={logoPath}
                websiteLink={websiteLink}
              />
            );
          },
        )}
      </Stack>

      {/* <Button
        variant="light"
        fw="400"
        c="white"
        bg="indigo.6"
        onClick={nextStep}
      >
        What's next?
      </Button> */}
      <Button variant="outline" fw="400" c="indigo.6" onClick={previousStep}>
        Back
      </Button>
    </Stack>
  );
}

export default RecommendedProducts;
