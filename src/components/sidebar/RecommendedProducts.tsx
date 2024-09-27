import { ScrollArea, Stack, Text } from '@mantine/core';
import '@mantine/core/styles.css';

import { Product } from '../../pages/Chatbot';
// import GatherSGLogo from '../../assets/products/gather-sg.png';
// import PostmanLogo from '../../assets/products/postman.png';
import ProductCard from '../card/ProductCard';

// const products: { [key: string]: Product } = {
//   GatherSG: {
//     name: 'GatherSG',
//     description:
//       'Lightweight Whole-of-Government customer relationship management system.',
//     logoPath: GatherSGLogo,
//     websiteLink: 'https://gather.gov.sg/',
//   },
//   Postman: {
//     name: 'Postman',
//     description: 'Secure, multichannel tool to send official communications.',
//     logoPath: PostmanLogo,
//     websiteLink: 'https://postman.gov.sg/',
//   },
// };

interface RecommendedProductsProps {
  productMap: Record<string, Product> | undefined;
  recommendedProducts: string[] | undefined;
}
function RecommendedProducts({
  productMap,
  recommendedProducts,
}: RecommendedProductsProps) {
  return (
    <ScrollArea style={{ flexGrow: 1 }} h="100%">
      <Stack gap="24px" pt="32px">
        <Text c="gray.7">
          Here's a list of suggested products that we think would address your
          problem.
        </Text>

        {recommendedProducts?.map(
          (recommendedProduct: string, index: number) => {
            if (
              productMap &&
              recommendedProduct &&
              recommendedProduct in productMap
            ) {
              const {
                Product: name,
                'Short description': description,
                Website: websiteLink,
              } = productMap[recommendedProduct];
              return (
                <ProductCard
                  key={index}
                  name={name}
                  description={description}
                  // logoPath={logoPath}
                  websiteLink={websiteLink}
                />
              );
            }
          },
        )}
      </Stack>
    </ScrollArea>
  );
}

export default RecommendedProducts;
