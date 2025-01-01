'use client';

import React, { useState, useEffect } from 'react';
import { createAppKit } from '@reown/appkit/react';
import { WagmiProvider } from 'wagmi';
import { bsc } from 'wagmi/chains';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi';
import { RainbowKitProvider, darkTheme } from '@rainbow-me/rainbowkit';
import '@rainbow-me/rainbowkit/styles.css';

// Configurar QueryClient
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
    },
  },
});

// ID del proyecto de WalletConnect Cloud
const projectId = '147f1ced0fc70fd33bc82189d73ebb43';

// Metadata de la aplicación
const metadata = {
  name: 'USVP',
  description: 'USVP Web3 Application',
  url: typeof window !== 'undefined' ? window.location.origin : '',
  icons: ['https://your-icon-url.com/icon.png']
};

// Configurar solo BSC como red
const networks = [bsc];

// Crear el adaptador Wagmi
const wagmiAdapter = new WagmiAdapter({
  networks,
  projectId,
  ssr: true,
});

// Crear el kit de la aplicación
createAppKit({
  adapters: [wagmiAdapter],
  networks,
  projectId,
  metadata,
  features: {
    analytics: true
  }
});

export function Providers({ children }) {
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <WagmiProvider config={wagmiAdapter.wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider
          theme={darkTheme({
            accentColor: '#7b3fe4',
            accentColorForeground: 'white',
          })}
          chains={networks}
        >
          {mounted && children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}