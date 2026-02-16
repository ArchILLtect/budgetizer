import "./amplifyConfig";
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { BrowserRouter } from 'react-router-dom';
import { ChakraProvider } from "@chakra-ui/react";
import { initColorMode } from "./services/colorMode";
import { system } from "./config/theme";

initColorMode();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ChakraProvider value={system}>
      <BrowserRouter>
      <App />
      </BrowserRouter>
    </ChakraProvider>
  </StrictMode>,
);
