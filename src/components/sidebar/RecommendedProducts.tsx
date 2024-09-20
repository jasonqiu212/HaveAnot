import { Stack, Text } from '@mantine/core';
import '@mantine/core/styles.css';

import GatherSGLogo from '../../assets/products/gather-sg.png';
import PostmanLogo from '../../assets/products/postman.png';
import ProductCard from '../card/ProductCard';

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

function RecommendedProducts() {
  const recommendedProducts = ['GatherSG', 'Postman'];

  return (
    <Stack gap="24px" pt="32px">
      <Text c="gray.7">
        Here's what we think would help address your problem.
      </Text>

      {recommendedProducts.map((recommendedProduct: string, index: number) => {
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
      })}
    </Stack>
  );
}

export default RecommendedProducts;
