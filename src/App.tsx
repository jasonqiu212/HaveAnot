import { AppShell, MantineProvider } from '@mantine/core';
import '@mantine/core/styles.css';

import './App.css';
import logo from './assets/logo.svg';
import Landing from './pages/Landing';

function App() {
  return (
    <MantineProvider>
      <AppShell header={{ height: 96 }}>
        <AppShell.Header px="40px" py="24px" bg="gray.1">
          <a href=".">
            <img src={logo} className="logo" alt="Logo" />
          </a>
        </AppShell.Header>
        <AppShell.Main h="calc(100vh - 96px)" w="100%">
          <Landing />
        </AppShell.Main>
      </AppShell>
    </MantineProvider>
  );
}

export default App;
