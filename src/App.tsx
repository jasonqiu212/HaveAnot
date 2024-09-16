import { AppShell, MantineProvider } from '@mantine/core';
import '@mantine/core/styles.css';
import { createContext, useState } from 'react';
import { RouterProvider, createBrowserRouter } from 'react-router-dom';

import './App.css';
import logo from './assets/logo.svg';
import Chatbot from './pages/Chatbot';
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
  [string | null, React.Dispatch<React.SetStateAction<string | null>>]
>(['', () => {}]);

function App() {
  const [problemStatement, setProblemStatement] = useState<string | null>(null);

  return (
    <MantineProvider>
      <AppShell header={{ height: 96 }}>
        <AppShell.Header px="40px" py="24px" bg="gray.1">
          <a href=".">
            <img src={logo} className="logo" alt="Logo" />
          </a>
        </AppShell.Header>
        <ProblemStatementContext.Provider
          value={[problemStatement, setProblemStatement]}
        >
          <AppShell.Main h="calc(100vh - 96px)" w="100%">
            <RouterProvider router={router} />
          </AppShell.Main>
        </ProblemStatementContext.Provider>
      </AppShell>
    </MantineProvider>
  );
}

export default App;
