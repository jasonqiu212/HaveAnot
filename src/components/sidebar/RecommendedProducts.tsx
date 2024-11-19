import { Box, LoadingOverlay, ScrollArea, Stack, Text } from '@mantine/core';
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
  productMap: Map<number, Product> | undefined;
  recommendedProductIds: number[] | undefined;
  isWaitingForUpdate: boolean;
}
function RecommendedProducts({
  productMap,
  recommendedProductIds,
  isWaitingForUpdate,
}: RecommendedProductsProps) {
  return (
    <ScrollArea h="100%">
      <Box pt="32px">
        <Text c="gray.7">
          Here's a list of suggested products that we think would address your
          problem.
        </Text>
        <Stack gap="24px" mt="24px" w="100%" mih="30vh" pos="relative">
          <LoadingOverlay
            visible={isWaitingForUpdate}
            loaderProps={{ size: 'sm', color: 'indigo.5' }}
            opacity="60%"
          />
          {recommendedProductIds?.map(
            (recommendedProductId: number, index: number) => {
              if (productMap && productMap.has(recommendedProductId)) {
                const {
                  Product: name,
                  'Short description': description,
                  Website: websiteLink,
                } = productMap.get(recommendedProductId)!;
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
          <Box style={{ flexGrow: 1 }} />
        </Stack>
      </Box>
    </ScrollArea>
  );
}

export default RecommendedProducts;
