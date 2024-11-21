import { AppShell, MantineProvider } from '@mantine/core';
import '@mantine/core/styles.css';
import { createContext, useEffect, useState } from 'react';
import { RouterProvider, createBrowserRouter } from 'react-router-dom';

import './App.css';
import Logo from './assets/logo.svg';
import Chatbot, { Product } from './pages/Chatbot';
import Landing from './pages/Landing';

// to allow globalThis.mazeUniversalSnippetApiKey in typescript
declare global {
  var mazeUniversalSnippetApiKey: string;
}

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
  Map<number, Product> | undefined
>(undefined);

function App() {
  const [productMap, setProductMap] = useState<Map<number, Product>>();
  const [problemStatement, setProblemStatement] = useState<string>();

  const fetchProductData = async () => {
    const response = await fetch(
      'https://script.google.com/macros/s/AKfycbx2Ig7c8HJX-FFG9kFb_NNA046JeytcnX4f3hWxoWzvaNw6UgS0V4j8e7fJlOtRtXHedg/exec',
    );
    return response.json().then((data) => {
      console.log('Products from Google Sheet:', data);
      const productMap: Map<number, Product> = new Map();
      for (let i = 0; i < data.length; i++) {
        productMap.set(i, data[i]);
      }
      setProductMap(productMap);
    });
  };

  useEffect(() => {
    fetchProductData();

    if (!window.sessionStorage.getItem('maze-us')) {
      window.sessionStorage.setItem('maze-us', new Date().getTime().toString());
    }
    const mazeScript = document.createElement('script');
    mazeScript.src = `https://snippet.maze.co/maze-universal-loader.js?apiKey=${import.meta.env.VITE_MAZE_API_KEY}`;
    mazeScript.async = true;
    document.head.appendChild(mazeScript);
    window.mazeUniversalSnippetApiKey = import.meta.env.VITE_MAZE_API_KEY;

    return () => {
      document.head.removeChild(mazeScript);
      return;
    };
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
