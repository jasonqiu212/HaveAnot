import { AppShell, MantineProvider } from '@mantine/core';
import '@mantine/core/styles.css';
import { createContext, useEffect, useState } from 'react';
import { RouterProvider, createBrowserRouter } from 'react-router-dom';

import './App.css';
import Logo from './assets/logo.svg';
import Chatbot, { Product } from './pages/Chatbot';
import Landing from './pages/Landing';

const router = createBrowserRouter([
  {
    path: '/',
    element: <Landing />,
  },
  {
    path: '/chatbot',
    element: <Chatbot />,
  },
]);

export const ProblemStatementContext = createContext<
  [string | undefined, React.Dispatch<React.SetStateAction<string | undefined>>]
>([undefined, () => {}]);

export const ProductMapContext = createContext<
  Record<string, Product> | undefined
>(undefined);

function App() {
  const [productMap, setProductMap] = useState<Record<string, Product>>();
  const [problemStatement, setProblemStatement] = useState<string>();

  const fetchProductData = async () => {
    const response = await fetch(
      'https://script.google.com/macros/s/AKfycbx2Ig7c8HJX-FFG9kFb_NNA046JeytcnX4f3hWxoWzvaNw6UgS0V4j8e7fJlOtRtXHedg/exec',
    );
    return response.json().then((data) => {
      console.log('Products from Google Sheet:', data);
      const productMap: Record<string, Product> = {};
      for (const product of data) {
        productMap[product['Product']] = product;
      }
      setProductMap(productMap);
    });
  };

  useEffect(() => {
    fetchProductData();
  }, []);

  return (
    <MantineProvider>
      <AppShell header={{ height: 96 }}>
        <AppShell.Header px="40px" py="24px" bg="gray.1">
          <a href=".">
            <img src={Logo} className="logo" alt="Logo" />
          </a>
        </AppShell.Header>
        <ProductMapContext.Provider value={productMap}>
          <ProblemStatementContext.Provider
            value={[problemStatement, setProblemStatement]}
          >
            <AppShell.Main h="calc(100vh - 96px)" w="100%">
              <RouterProvider router={router} />
            </AppShell.Main>
          </ProblemStatementContext.Provider>
        </ProductMapContext.Provider>
      </AppShell>
    </MantineProvider>
  );
}

export default App;
