'use client';

import React from 'react';

interface TokenConfig {
  address: string;
  symbol: string;
  decimals: number;
  image: string;
  chainId: string;
  chainName: string;
}

interface EthereumWindow extends Window {
  ethereum?: {
    request: (args: any) => Promise<any>;
    isMetaMask?: boolean;
    chainId?: string;
  }
}

declare const window: EthereumWindow;

const TOKEN_CONFIG: TokenConfig = {
  address: '0x3C85D4cd4243dF9329d984AC5ADdDdCbE633cef5',
  symbol: 'USVP',
  decimals: 18,
  image: 'https://usvptoken.com/images/logo.png',
  chainId: '0x38', // Chain ID de BSC (56 en hex)
  chainName: 'Binance Smart Chain'
};

const BSC_CHAIN = {
  chainId: '0x38',
  chainName: 'Binance Smart Chain',
  nativeCurrency: {
    name: 'BNB',
    symbol: 'BNB',
    decimals: 18
  },
  rpcUrls: ['https://bsc-dataseed.binance.org/'],
  blockExplorerUrls: ['https://bscscan.com']
};

export const addTokenToMetaMask = async (): Promise<void> => {
  if (typeof window === 'undefined') {
    return;
  }

  if (!window.ethereum) {
    alert('Por favor instala MetaMask para añadir tokens.');
    window.open('https://metamask.io/download/', '_blank');
    return;
  }

  try {
    // Solicitar conexión a la wallet
    await window.ethereum.request({ 
      method: 'eth_requestAccounts' 
    });

    // Verificar la red actual
    const chainId = await window.ethereum.request({ method: 'eth_chainId' });
    
    // Si no estamos en BSC, intentar cambiar la red
    if (chainId !== TOKEN_CONFIG.chainId) {
      try {
        // Intentar cambiar a BSC
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: TOKEN_CONFIG.chainId }],
        });
      } catch (switchError: any) {
        // Si la red no está añadida, intentar añadirla
        if (switchError.code === 4902) {
          try {
            await window.ethereum.request({
              method: 'wallet_addEthereumChain',
              params: [BSC_CHAIN],
            });
          } catch (addError) {
            alert('No se pudo añadir la red BSC. Por favor, añádela manualmente en MetaMask.');
            return;
          }
        } else {
          alert('No se pudo cambiar a la red BSC. Por favor, cámbiala manualmente en MetaMask.');
          return;
        }
      }
    }

    // Intentar añadir el token
    const wasAdded = await window.ethereum.request({
      method: 'wallet_watchAsset',
      params: {
        type: 'ERC20',
        options: {
          address: TOKEN_CONFIG.address,
          symbol: TOKEN_CONFIG.symbol,
          decimals: TOKEN_CONFIG.decimals,
          image: TOKEN_CONFIG.image,
        },
      },
    });

    if (wasAdded) {
      alert(`¡Token ${TOKEN_CONFIG.symbol} añadido exitosamente a MetaMask en la red ${TOKEN_CONFIG.chainName}!`);
    } else {
      alert('No se añadió el token.');
    }
  } catch (error) {
    console.error("Error al añadir el token:", error);
    alert('Ocurrió un error al intentar añadir el token. Por favor, verifica que estés en la red BSC.');
  }
};

interface AddTokenButtonProps {
  className?: string;
  buttonText?: string;
}

const AddTokenButton: React.FC<AddTokenButtonProps> = ({ 
  className = "",
  buttonText = "Añadir USVP a MetaMask"
}) => {
  return (
    <button
      onClick={addTokenToMetaMask}
      className={`
        flex items-center justify-center 
        px-4 py-2 
        rounded-lg 
        font-medium 
        bg-blue-600 
        hover:bg-blue-700 
        text-white 
        transition-colors
        ${className}
      `}
    >
      {buttonText}
    </button>
  );
};

export default AddTokenButton;