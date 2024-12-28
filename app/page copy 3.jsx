'use client';

import Head from 'next/head';
import { ethers } from 'ethers';
import { parseUnits, formatUnits } from 'ethers/lib/utils';
import CountdownTimer from './CountdownTimer'; 
import { useState, useEffect, useMemo } from 'react';
import Web3 from 'web3';
import {
  BsPlus,
  BsSearch,
  BsEyeFill,
  BsBookmarkFill,
  BsFillArrowLeftSquareFill,
  BsPeopleFill,
  BsTerminalFill,
  BsFillArrowRightSquareFill,
  BsWallet,
  BsDiscord,
} from 'react-icons/bs';



import { US } from 'country-flag-icons/react/3x2';
import { ES } from 'country-flag-icons/react/3x2';
import { CN, RU, SA } from 'country-flag-icons/react/3x2';
import { AiFillFire, AiFillMessage,AiFillDollarCircle } from 'react-icons/ai';
import { FaWallet } from 'react-icons/fa';
import imgreferido from './assets/referido.png';

import { motion, useAnimation } from 'framer-motion';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import Image from 'next/image';
import {
  useAccount,
  useConnect,
  useContractRead,
  useContractWrite,
  useNetwork,
  usePrepareContractWrite,
  useWaitForTransaction,
} from 'wagmi';

import contractABI from '../contracts/Presale.json';
import IERC20ABI from '../contracts/IERC20.json';
import ERC20ABI from '../contracts/ERC20.json';
import { I18nextProvider, useTranslation } from 'react-i18next';
import i18nfile from '../i18n';
import { parseEther, formatEther } from 'viem';
import { addTokenToMetaMask } from './AddTokenButton';


// DEFINIMOS LAS WALLETS DE LOS TOKENS Y LOS CONTRATOS 

const CONTRACT_ADDRESS = '0x6563967CDD129814671628556217C88500732Bff'; //presale contact fuji address 
const TOKEN_PRICE_USD = 0.75;
const USDT_ADDRESS = '0x1495fa06722Af1D4E78984AAdC1B9143f44A3cfBs';
const BUSD_ADDRESS = '0x6a288dc5978419dD131eDBbdD93D3bf0b2014F44';
const USVP_TOKEN_ADDRESS = '0xEb258Ac69daF8374dA2295fB251d3C3b065A2Be7';

// Purchase limits
const MIN_PURCHASE = parseUnits('50', 18);
const MAX_PURCHASE = parseUnits('5000', 18);



const tokens = [
  {
    label: "usdt",
    address: "0x1495fa06722Af1D4E78984AAdC1B9143f44A3cfB",
    id: 0,
    decimals: 6
  },
  {
    label: "usdta",
    address: "0x6a288dc5978419dD131eDBbdD93D3bf0b2014F44",
    id: 1,
    decimals: 6
  }
];

const data = [
  
  {
    name: 'Pre venta',
    items: [
      {
        title: 'Comprar USDT ',
        icon: AiFillDollarCircle,
        link: 'https://onramp.gatefi.com/?merchantId=3e1a127a-0da9-45aa-8cb8-06cf343b8ca0&cryptoCurrency=USDT-BEP20&cryptoCurrencyLock=true&wallet=0xbf646CD04B14eb9159d2000e73C4C339A3C980d9'
      },

      {
        title: 'Agregar USVP a MetaMask',
        icon: FaWallet,
        onClick: addTokenToMetaMask  // Aquí usamos la función directamente
      },
      /*    {
        title: 'Most Upvoted',
        icon: IoMdArrowRoundUp,
      },
      {
        title: 'Best Discussions',
        icon: AiFillMessage,
      },
      {
        title: 'Search',
        icon: BsSearch,
      }, */
    ],
  },
  /* {
    name: 'Información Actual',
    items: [
      {
        title: 'Reading history',
        icon: BsEyeFill,
      },
      {
        title: 'Focus Mode',
        icon: MdNightlightRound,
      },
      {
        title: 'Customize',
        icon: FaCog,
      },
    ]
  }, */
];


const datafooter = [
  {
    name: '',
    items: [
      /*    {
        title: 'Información',
        icon: BsBookmarkFill,
      }, */
      /*    {
        title: 'Changelog',
        icon: BsTerminalFill,
      }, */
      {
        title: 'Discord',
        icon: BsDiscord,
      },
      /*  {
        title: 'Invitar',
        icon: BsPeopleFill,
      }, */
    ],
  },
];



export default function Home() {
  const { t, i18n } = useTranslation();
  

  const changeLanguage = lng => {
    i18n.changeLanguage(lng);
    setIsOpen(false);
  };

  const [active, setActive] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const controls = useAnimation();
  const controlText = useAnimation();
  const controlTitleText = useAnimation();

  const [selectedToken, setSelectedToken] = useState(tokens[0]);
  const [copied, setCopied] = useState(false);
  const [amountUSD, setAmountUSD] = useState('0');
  const [amountUSVP, setAmountUSVP] = useState(0);
  const [txHash, setTxHash] = useState('');
  const [txStatus, setTxStatus] = useState('');

  const { address, isConnected,isConnecting} = useAccount();
  const { chain } = useNetwork();

  const { data: allowance } = useContractRead({
    address: selectedToken?.address,
    abi: ERC20ABI,
    functionName: "allowance",
    args: [address, CONTRACT_ADDRESS],
    watch: true,
    enabled: Boolean(address && selectedToken?.address),
});

  const {
    isLoading: isBalanceLoading,
    data: balance,
    error: balanceError,
    refetch: refetchBalance
} = useContractRead({
    abi: ERC20ABI,
    address: selectedToken.address,
    functionName: "balanceOf",
    args: [address],
    watch: true,
    onError: (error) => {
        console.error('Error fetching balance:', error);
    }
})

  const {
    isLoading: isTotalSoldLoading,
    data: totalSold,
  } = useContractRead({
    abi: contractABI,
    address: CONTRACT_ADDRESS,
    functionName: "totalTokensSold",
    watch: true
  })


  useEffect(() => {
    showMore();
  }, []);

  // Preparación de la aprobación
  const { config: approveConfig } = usePrepareContractWrite({
    address: selectedToken.address,
    abi: IERC20ABI,  // Use IERC20ABI for standard token interactions
    functionName: "approve",
    args: [
        CONTRACT_ADDRESS,
        parseUnits(amountUSD || '0', selectedToken.decimals)
    ],
    enabled: Boolean(
        selectedToken &&
        amountUSD &&
        Number(amountUSD) > 0 &&
        address
    ),
});

const { write: approve, isLoading: isApproving } = useContractWrite({
  ...approveConfig,
  onSuccess: (data) => {
      console.log('Approval transaction submitted:', data);
      setTxHash(data.hash);
  },
});


  // Hook de aprobación
  const {
    write: approveHandler,
    isLoading: isApproveLoading,
    isSuccess: isApproveStarted,
    data: approveData,
  } = useContractWrite({
    ...approveConfig,
    onSuccess: (data) => {
      console.log('Aprobación iniciada:', data);
      setTxHash(data.hash);
      setTxStatus('approving');
    },
    onError: (error) => {
      console.error('Error en aprobación:', error);
      setTxStatus('error');
    }
  });

  // Preparación de la compra
  const { config: buyConfig } = usePrepareContractWrite({
    address: CONTRACT_ADDRESS,
    abi: contractABI,
    functionName: "buyTokens",
    args: [
        selectedToken.id,
        parseUnits(amountUSD || '0', selectedToken.decimals)
    ],
    enabled: Boolean(
        selectedToken?.address && 
        amountUSD && 
        Number(amountUSD) > 0 && 
        address &&
        allowance && 
        allowance >= parseUnits(amountUSD || '0', selectedToken.decimals)
    ),
});

const handlePurchase = async () => {
  if (!address) {
      console.log('No wallet connected');
      return;
  }

  if (!amountUSD || Number(amountUSD) <= 0) {
      console.log('Invalid amount');
      return;
  }

  const purchaseAmount = parseUnits(amountUSD, selectedToken.decimals);
  
  try {
      // Check if approval is needed
      if (!allowance || allowance < purchaseAmount) {
          console.log('Approval needed');
          const approveTx = await approve?.();
          if (!approveTx) {
              throw new Error('Approval failed');
          }
          // Wait for approval confirmation
          await approveTx.wait();
      }

      // Proceed with purchase
      const buyTx = await buyTokens?.();
      if (!buyTx) {
          throw new Error('Purchase failed');
      }
      
      // Wait for purchase confirmation
      await buyTx.wait();
      
      // Reset form and refresh data
      setAmountUSD('0');
      setAmountUSVP(0);
      refetchAllowance?.();
      refetchBalance?.();
  } catch (error) {
      console.error('Transaction failed:', error);
      setTxStatus('error');
  }
};

// Hook de compra con manejo mejorado
const { 
  write: buyTokens,
  isLoading: isBuyLoading,
  data: buyData,
  error: buyError
} = useContractWrite({
  ...buyConfig,
  onSuccess: (data) => {
      console.log('Purchase initiated:', data);
      setTxHash(data.hash);
      setTxStatus('buying');
  },
  onError: (error) => {
      console.error('Purchase error:', error);
      setTxStatus('error');
      alert(`Purchase error: ${error.message}`);
  }
});

// Transaction monitoring
const { 
  isLoading: isBuyPending,
  isSuccess: isBuyComplete 
} = useWaitForTransaction({
  hash: buyData?.hash,
  onSuccess: () => {
      console.log('Purchase confirmed');
      setTxStatus('completed');
      refetchBalance?.();
      setAmountUSD('0');
      setAmountUSVP(0);
  },
  onError: (error) => {
      console.error('Purchase failed:', error);
      setTxStatus('error');
  }
});

// Now we can use isBuyPending instead of isPurchasePending
console.log('Button State:', {
  address,
  isApproving,
  isBuyPending,
  presaleStatus,
  hasApproval: allowance && Number(formatUnits(allowance.toString(), selectedToken?.decimals || 6)) >= Number(amountUSD),
  amountValue: amountUSD,
  minPurchase: MIN_PURCHASE,
  maxPurchase: MAX_PURCHASE
});


// Add a transaction status tracker
const { isLoading: isTransactionPending } = useWaitForTransaction({
  hash: buyData?.hash,
  onSuccess: () => {
      setTxStatus('completed');
      // Reset form
      setAmountUSD('0');
      setAmountUSVP(0);
  },
  onError: (error) => {
      console.error('Transaction failed:', error);
      setTxStatus('error');
  }
});

// Add proper validation before allowing the transaction
const isValidPurchase = useMemo(() => {
  if (!amountUSD || !selectedToken || !address) return false;
  
  const amount = Number(amountUSD);
  const hasValidAmount = amount >= 50 && amount <= 5000;
  const hasApproval = allowance && allowance >= parseUnits(amountUSD || '0', selectedToken.decimals);
  
  return hasValidAmount && hasApproval;
}, [amountUSD, selectedToken, address, allowance]);


useEffect(() => {
  console.log('Buy Configuration:', {
      isEnabled: Boolean(
          selectedToken?.address && 
          amountUSD && 
          Number(amountUSD) > 0 && 
          address &&
          allowance &&
          Number(formatUnits(allowance.toString(), selectedToken?.decimals || 6)) >= Number(amountUSD)
      ),
      selectedToken: selectedToken?.address,
      amount: amountUSD,
      address,
      allowance: allowance ? formatUnits(allowance.toString(), selectedToken?.decimals || 6) : '0',
      buyTokensAvailable: Boolean(buyTokens),
      buyError: buyError ? buyError.message : null // Agregamos el manejo seguro del error
  });
}, [selectedToken, amountUSD, address, allowance, buyTokens, buyError]);



    


  const showMore = () => {
    controls.start({
      width: '250px',
      transition: { duration: 0.001 },
    });
    controlText.start({
      opacity: 1,
      display: 'block',
      transition: { delay: 0.3 },
    });
    controlTitleText.start({
      opacity: 1,
      transition: { delay: 0.3 },
    });

    setActive(true);
  };

  const showLess = () => {
    controls.start({
      width: '55px',
      transition: { duration: 0.001 },
    });

    controlText.start({
      opacity: 0,
      display: 'none',
    });

    controlTitleText.start({
      opacity: 0,
    });

    setActive(false);
  };

    // Manejadores de eventos para los inputs
    const handleAmountUSDChange = (event) => {
      const value = event.target.value;
      setAmountUSD(value);
      // Calculamos el valor equivalente en USVP manteniendo la precisión
      const usvpAmount = value ? (Number(value) / TOKEN_PRICE_USD).toString() : '0';
      setAmountUSVP(usvpAmount);
    };

    const handleamountUSVPChange = (event) => {
      const value = event.target.value;
      setAmountUSVP(value);
      // Calculamos el valor equivalente en USD manteniendo la precisión
      const usdAmount = value ? (Number(value) * TOKEN_PRICE_USD).toString() : '0';
      setAmountUSD(usdAmount);
    };


    const { data: presaleStatus, isLoading: isPresaleStatusLoading } = useContractRead({
      address: CONTRACT_ADDRESS,
      abi: contractABI,
      functionName: "getPresaleStatus",
      watch: true,
  });
  
  // Now update the button state logging
  console.log('Button State:', {
      address,
      isApproving,
      isBuyPending,
      presaleStatus: presaleStatus ? {
          isEnded: Boolean(presaleStatus.isEnded),
          paused: Boolean(presaleStatus.paused),
          tokensSold: presaleStatus.tokensSold?.toString(),
          tokensAvailable: presaleStatus.tokensAvailable?.toString()
      } : null,
      hasApproval: allowance && Number(formatUnits(allowance.toString(), selectedToken?.decimals || 6)) >= Number(amountUSD),
      amountValue: amountUSD,
      minPurchase: MIN_PURCHASE,
      maxPurchase: MAX_PURCHASE
  });

// Make sure none of these are unexpectedly true
const isPresaleInactive = presaleStatus?.isEnded || presaleStatus?.paused;

// Función segura para formatear los números
const safeFormatUnits = (value, decimals = 18) => {
  try {
      if (!value) return "0";
      return formatUnits(value.toString(), decimals);
  } catch (error) {
      console.error('Error formatting units:', error);
      return "0";
  }
};

// Hook personalizado para el estado de la preventa
const usePresaleInfo = () => {
  const { data: presaleStatus, isLoading } = useContractRead({
      address: CONTRACT_ADDRESS,
      abi: contractABI,
      functionName: "getPresaleStatus",
      watch: true
  });

  const formattedData = useMemo(() => {
      if (!presaleStatus) return {
          remainingTokens: "0",
          soldTokens: "0",
          percentageSold: 0,
          isEnded: false,
          timeRemaining: 0,
          isClaimingPaused: false
      };

      try {
          // Los datos vienen como un array, accedemos a ellos por índice
          const [
              tokensSold,
              tokensAvailable,
              timeRemaining,
              isEnded,
              isClaimingPaused,
              currentTime
          ] = presaleStatus;

          // Calculamos el porcentaje de manera segura
          const soldBN = BigInt(tokensSold?.toString() || '0');
          const availableBN = BigInt(tokensAvailable?.toString() || '0');
          const totalBN = soldBN + availableBN;
          const percentageSold = totalBN === BigInt(0) ? 0 : 
              Number((soldBN * BigInt(100)) / totalBN);

          return {
              remainingTokens: safeFormatUnits(tokensAvailable),
              soldTokens: safeFormatUnits(tokensSold),
              percentageSold,
              isEnded: Boolean(isEnded),
              timeRemaining: Number(timeRemaining?.toString() || '0'),
              isClaimingPaused: Boolean(isClaimingPaused)
          };
      } catch (error) {
          console.error('Error processing presale data:', error);
          return {
              remainingTokens: "0",
              soldTokens: "0",
              percentageSold: 0,
              isEnded: false,
              timeRemaining: 0,
              isClaimingPaused: false
          };
      }
  }, [presaleStatus]);

  return {
      presaleInfo: formattedData,
      isLoading,
      rawData: presaleStatus
  };
};





// Manejador de selección de token
const handleTokenSelect = (token) => {
  console.log("Token seleccionado:", token);
  setSelectedToken(token);
};
const { presaleInfo, isLoading } = usePresaleInfo();

{tokens.map((token, idx) => (
  <div
      key={idx}
      className="flex items-center"
      style={{ cursor: "pointer" }}
      onClick={() => handleTokenSelect(token)}
  >
      <span
          className={`inline-block py-1 px-2 ${
              selectedToken?.id === token.id
              ? 'bg-gray-700 text-white'
              : 'bg-gray-200 text-gray-800'
          } rounded-full text-xs flex justify-center items-center`}
      >
          <Image
              alt={token.label}
              src={require(`./assets/WBNB.png`)}
          />
          {token.label.toUpperCase()}
      </span>
  </div>
))}

  console.log('Buy Handler:', buyTokens ? 'Available' : 'Not available');
  console.log('Buy Loading:', isBuyLoading);
  console.log('Buy Success:', isBuyStarted);

  const {
    write: setPriceHandler,
    isLoading: isSetPriceLoading,
    isSuccess: isSetPriceStarted,
    error: setPriceError,
  } = useContractWrite({
    address: CONTRACT_ADDRESS,
    abi: contractABI,
    functionName: "setTokenPrice",
    args: [parseEther(amountUSD.toString(), "wei")],
    
  });


  // ActionHandler principal que maneja la lógica de aprobación y compra
  const actionHandler = useMemo(() => {
    // Logs for debugging state
    console.log('Action Handler State:', {
        isConnected,
        selectedToken,
        amountUSD,
        allowance: allowance?.toString(),
        balance: balance?.toString(),
        buyTokensAvailable: Boolean(buyTokens),
        txStatus
    });

    // Case 1: Wallet not connected
    if (!isConnected) {
        return (
            <button className="w-40 h-30 bg-gray-400 text-white font-semibold py-2 px-4 rounded-md shadow cursor-not-allowed">
                Conectar Wallet
            </button>
        );
    }

    // Case 2: Handle approval or purchase loading states
    if (isApproveLoading || isApproveWaiting) {
        return (
            <button disabled className="w-40 h-30 bg-gray-400 text-white font-semibold py-2 px-4 rounded-md shadow cursor-not-allowed">
                {isApproveWaiting ? 'Confirmando...' : 'Aprobando...'}
            </button>
        );
    }

    // Case 3: Check amount validation
    const isValidAmount = Number(amountUSD) >= 50 && Number(amountUSD) <= 5000;
    if (!isValidAmount && amountUSD !== '') {
        return (
            <button disabled className="w-40 h-30 bg-gray-400 text-white font-semibold py-2 px-4 rounded-md shadow cursor-not-allowed">
                Monto Inválido
            </button>
        );
    }

    // Case 4: Check balance
    const userBalance = balance ? formatUnits(balance.toString(), selectedToken?.decimals || 6) : '0';
    const hasEnoughBalance = Number(userBalance) >= Number(amountUSD);
    if (!hasEnoughBalance && isValidAmount) {
        return (
            <button disabled className="w-40 h-30 bg-gray-400 text-white font-semibold py-2 px-4 rounded-md shadow cursor-not-allowed">
                Balance Insuficiente
            </button>
        );
    }

    // Case 5: Handle approval flow
    const currentAllowance = allowance ? formatUnits(allowance.toString(), selectedToken?.decimals || 6) : '0';
    const needsApproval = Number(currentAllowance) < Number(amountUSD);
    
    if (needsApproval && isValidAmount) {
        return (
            <button
                onClick={() => {
                    try {
                        console.log('Starting approval:', {
                            amount: amountUSD,
                            token: selectedToken?.label,
                            decimals: selectedToken?.decimals
                        });
                        approveHandler?.();
                    } catch (error) {
                        console.error('Approval error:', error);
                        alert('Error: ' + error.message);
                    }
                }}
                disabled={!approveHandler || Number(amountUSD) <= 0}
                className="w-40 h-30 bg-gradient-to-r from-purple-500 to-gray-500 hover:from-purple-600 hover:to-indigo-600 text-white font-semibold py-2 px-4 rounded-md shadow"
            >
                Aprobar {selectedToken?.label?.toUpperCase()}
            </button>
        );
    }

    // Case 6: Handle buy flow
    return (
        <button
            onClick={() => {
                try {
                    console.log('Starting purchase:', {
                        tokenId: selectedToken?.id,
                        amount: amountUSD,
                        decimals: selectedToken?.decimals,
                        allowance: currentAllowance
                    });
                    buyTokens?.();
                } catch (error) {
                    console.error('Purchase error:', error);
                    alert('Error: ' + error.message);
                }
            }}
            disabled={!buyTokens || isBuyLoading || Number(amountUSD) <= 0 || txStatus === 'buying'}
            className={`w-40 h-30 ${
                !buyTokens || isBuyLoading || Number(amountUSD) <= 0 || txStatus === 'buying'
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-purple-500 to-gray-500 hover:from-purple-600 hover:to-indigo-600'
            } text-white font-semibold py-2 px-4 rounded-md shadow`}
        >
            {isBuyLoading || txStatus === 'buying' ? 'Comprando...' : 'Comprar USVP'}
        </button>
    );
}, [
    isConnected,
    allowance,
    balance,
    amountUSD,
    selectedToken,
    isApproveLoading,
    isApproveWaiting,
    isBuyLoading,
    approveHandler,
    buyTokens,
    txStatus
]);


// Efecto para monitorear cambios en el estado de la transacción
useEffect(() => {
  console.log('Buy Configuration:', {
      isEnabled: Boolean(
          selectedToken?.address && 
          amountUSD && 
          Number(amountUSD) > 0 && 
          address &&
          allowance &&
          Number(formatUnits(allowance.toString(), selectedToken?.decimals || 6)) >= Number(amountUSD)
      ),
      selectedToken: selectedToken?.address,
      amount: amountUSD,
      address,
      allowance: allowance ? formatUnits(allowance.toString(), selectedToken?.decimals || 6) : '0',
      buyTokensAvailable: Boolean(buyTokens),
      buyError
  });
}, [selectedToken, amountUSD, address, allowance, buyTokens, buyError]);

// Efecto para resetear el estado después de una aprobación exitosa
useEffect(() => {
  if (txStatus === 'approved') {
      setTimeout(async () => {
          setTxStatus('');
          // Actualizar allowance y balance
          await Promise.all([
              refetchAllowance?.(),
              refetchBalance?.()
          ]);
      }, 1000);
  }
}, [txStatus, refetchAllowance, refetchBalance]);

  useEffect(() => {
    // Reset and re-set the selected token to trigger updates in components that depend on token changes
    const _selectedToken = { ...selectedToken };
    setSelectedToken({});
    setSelectedToken(_selectedToken);
  }, [isBuyStarted, isApproveStarted, selectedToken]);
  return (
    <I18nextProvider i18n={i18nfile}>
      <div className="min-h-screen bg-gray-200 flex">
        <Head>
          <title>Sitio de Preventa | USVP </title>
          <meta
            name="description"
            content="Participa en la comunidad más disruptiva del Real State y el Web3.0, el futuro de los servicios financieros e innmobiliarios"
          />
          <link rel="icon" href="/favicon.ico" />
        </Head>

        <motion.div
          animate={controls}
          className="max-w-[250px]  animate duration-300 border-r border-gray-700 relative flex flex-col py-10 min-h-screen group"
        >
          {active && (
            <BsFillArrowLeftSquareFill
              onClick={showLess}
              className="absolute  text-2xl text-black cursor-pointer -right-4 top-10 group-hover:block "
            />
          )}
          {!active && (
            <BsFillArrowRightSquareFill
              onClick={showMore}
              className="absolute text-2xl text-black cursor-pointer -right-4 top-10"
            />
          )}
          {active && (
            <div
              className="flex items-center justify-center"
              style={{ flexDirection: 'column' }}
            >
              <Image
                alt="logo"
                src={require('./assets/logopreventa.png')}
                className=" w-20"
              />
              <motion.p className="text-black pb-4 pt-2">USVP  </motion.p>
            </div>
          )}
          {!active && (
            <div
              className="flex items-center justify-center"
              style={{ flexDirection: 'column' }}
            >
              <Image
                alt="logo"
                src={require('./assets/logo.png')}
                className=" w-10"
              />
              <motion.p className="text-black pb-4 pt-2">USVP</motion.p>
            </div>
          )}
          <div
            className={`${active &&
              'border-green-400 border shadow-green-400/60 shadow-lg rounded-lg px-4'
              } max-w-[220px]  flex justify-center mx-2  flex-col mb-4`}
          >
            <motion.p
              animate={controlText}
              className="font-thin py-2  text-md pt-3"
            >
               {t('revoluciona')}
             
            </motion.p>
            {!active && (
              <button
                onClick={showMore}
                type="button"
                className="flex items-center justify-center w-full py-2 my-2 font-bold text-black bg-green-400 rounded-lg"
              >
                <BsWallet className="text-2xl mr-2" />
              </button>
            )}
            {active && (
              <ConnectButton.Custom>
                {({
                  account,
                  chain,
                  openAccountModal,
                  openChainModal,
                  openConnectModal,
                  authenticationStatus,
                  mounted,
                }) => {

                  // Note: If your app doesn't use authentication, you
                  // can remove all 'authenticationStatus' checks
                  const ready = mounted && authenticationStatus !== 'loading';
                  const connected =
                    ready &&
                    account &&
                    chain &&
                    (!authenticationStatus ||
                      authenticationStatus === 'authenticated');

                  return (
                    <div
                      {...(!ready && {
                        'aria-hidden': true,
                        'style': {
                          opacity: 0,
                          pointerEvents: 'none',
                          userSelect: 'none',
                        },
                      })}
                    >
                      {(() => {
                        if (!connected) {
                          return (
                            <button
                              onClick={openConnectModal}
                              type="button"
                              className="flex items-center justify-center w-full py-2 my-2 font-bold text-black bg-green-400 rounded-lg"
                            >
                              <BsWallet className="text-2xl mr-2 ml-2" />

                              <motion.p animate={controlText}>
                              {t('Billetera')}
                              </motion.p>
                            </button>
                          );
                        }

                        if (chain.unsupported) {
                          return (
                            <button
                              onClick={openChainModal}
                              type="button"
                              className="flex items-center justify-center w-full py-2 my-2 font-bold text-black bg-green-400 rounded-lg"
                            >
                              Red Erronea. Click para cambiar
                            </button>
                          );
                        }

                        return (
                          <div style={{ display: 'flex', gap: 12 }}>
                            <button
                              onClick={openChainModal}
                              style={{ display: 'flex', alignItems: 'center' }}
                              type="button"
                            ></button>

                            <button
                              onClick={openAccountModal}
                              type="button"
                              className="flex items-center justify-center w-full py-2 my-2 font-bold text-black bg-green-400 rounded-lg"
                            >
                              <BsWallet className="text-2xl ml-2" />
                              {account.displayName}
                              {account.displayBalance
                                ? ` (${account.displayBalance})`
                                : ''}
                            </button>
                          </div>
                        );
                      })()}
                    </div>
                  );
                }}
              </ConnectButton.Custom>
            )}
          </div>

          <div className="grow">
            {data.map((group, index) => (
              <div key={index} className="my-2 w-full">
                <motion.p
                  animate={controlTitleText}
                  className="mb-2 ml-4 text-sm font-bold text-gray-500 text-left w-full"
                >
                  {group.name}
                </motion.p>

                {group.items.map((item, index2) => (
  <div 
    key={index2} 
    className="flex w-full px-4 py-1 cursor-pointer items-center justify-start hover:bg-gray-100"
    onClick={() => {
      if (item.onClick) {
        item.onClick();
      } else if (item.link) {
        window.open(item.link, '_blank');
      }
    }}
  >
    <item.icon className="text-lg text-gray-500  min-w-[20px]" />
    <motion.p
      animate={controlText}
      className="ml-4 text-sm font-bold text-gray-400 text-left"
    >
      {' '}
      {item.title}
    </motion.p>
  </div>
))}
              </div>
            ))}
          </div>

          {active && (
            <div
              style={{
                width: '100%',
                display: 'flex',
                justifyContent: 'center',
                position: 'relative'
              }}
            >
              <button
                className="flex items-center text-white bg-black border border-black focus:outline-none p-2 rounded"
                onClick={() => setIsOpen(!isOpen)}
              >
                 {i18n.language === 'en' && (
        <>
          <US title="United States" className="w-6 h-6 mr-2" />
          EN
        </>
      )}
      {i18n.language === 'sp' && (
        <>
          <ES title="Spanish" className="w-6 h-6 mr-2" />
          ES
        </>
      )}
      {i18n.language === 'zh' && (
        <>
          <CN title="Chinese" className="w-6 h-6 mr-2" />
          中文
        </>
      )}
      {i18n.language === 'ru' && (
        <>
          <RU title="Russian" className="w-6 h-6 mr-2" />
          РУ
        </>
      )}
      {i18n.language === 'ar' && (
        <>
          <SA title="Arabic" className="w-6 h-6 mr-2" />
          ع
        </>
      )}
              </button>
              {isOpen && (
      <div className="absolute bottom-full mb-2 py-2 w-40 bg-white rounded shadow-lg z-50">
        <button
          className="flex items-center w-full text-black px-4 py-2 hover:bg-gray-200"
          onClick={() => changeLanguage('en')}
        >
          <US title="United States" className="w-6 h-6 mr-2" />
          English
        </button>
        <button
          className="flex items-center w-full text-black px-4 py-2 hover:bg-gray-200"
          onClick={() => changeLanguage('sp')}
        >
          <ES title="Spanish" className="w-6 h-6 mr-2" />
          Español
        </button>
        <button
          className="flex items-center w-full text-black px-4 py-2 hover:bg-gray-200"
          onClick={() => changeLanguage('zh')}
        >
          <CN title="Chinese" className="w-6 h-6 mr-2" />
          中文
        </button>
        <button
          className="flex items-center w-full text-black px-4 py-2 hover:bg-gray-200"
          onClick={() => changeLanguage('ru')}
        >
          <RU title="Russian" className="w-6 h-6 mr-2" />
          Русский
        </button>
        <button
          className="flex items-center w-full text-black px-4 py-2 hover:bg-gray-200"
          onClick={() => changeLanguage('ar')}
        >
          <SA title="Arabic" className="w-6 h-6 mr-2" />
          العربية
        </button>
      </div>
    )}
  </div>
)}
          <div>
            {datafooter.map((group, index) => (
              <div key={index} className="my-2 w-full">
                <motion.p
                  animate={controlTitleText}
                  className="mb-2 ml-4 text-sm font-bold text-gray-500 text-left w-full"
                >
                  {group.name}
                </motion.p>

                {group.items.map((item, index2) => (
                  <div
                    key={index2}
                    className="flex px-4 py-1 cursor-pointer"
                    onClick={() => {
                      if (item.title == 'Discord') {
                        window.open('https://discord.gg/sXwTGXNB');
                      }
                    }}
                  >
                    <item.icon className="text-lg text-gray-500" />
                    <motion.p
                      animate={controlText}
                      className="ml-4 text-sm font-bold text-gray-400"
                    >
                      {' '}
                      {item.title}
                    </motion.p>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </motion.div>

        <div className="inicial ">
          <div className="overflow-x-hidden overflow-y-auto h-screen mt-40">
          <motion.h1
  className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-center font-extrabold tracking-tight leading-[1.1] text-white mb-6"
  initial={{ opacity: 0, y: -50 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 1, delay: 0.2 }}
>
  {t('presale-title')}
</motion.h1>
  
  {/* Centrar horizontalmente Progress bar */}
  <div className="flex flex-col md:flex-row  justify-center items-center h-full">
  <div className="max-w-screen-md md:w-3/4  mt-14 space-y-20">
    <div className="max-w-screen md:w-3/4 mx-auto items-center flex ">
      <div className="inline-flex flex-col space-y-2 items-center justify-end flex-1 h-full p-4 bg-blue-900 bg-opacity-75  rounded-xl">
        <p className="w-full text-2xl font-semibold text-white">
          {t("progress-date")}
        </p>
        <p className="w-full pb-8 text-sm tracking-wide leading-tight text-white">
          {t("sale-ends-in")} <CountdownTimer />
        </p>
        <div className="relative w-full h-5 bg-white rounded-lg">
          <div
            className="absolute top-0 left-0 h-5 bg-gray-700 rounded-lg"
            style={{ width: '10%' }}
          ></div>
        </div>
        <p className="w-full text-sm tracking-wide leading-tight text-white">
          {t("sold")} {totalSold}
        </p>
        <p className="w-full text-sm tracking-wide leading-tight text-white">
         {t("remaining")}  {presaleInfo.remainingTokens} USVP
        </p>

        <p className="w-full pb-8 text-sm tracking-wide leading-tight text-white">
          {t( "target")} 1,000,000 USVP 
        </p>
        <div className="miboton">
          <div className="opacity-95 border rounded-lg border-white px-4">
          <p className="m-auto inset-0 text-sm font-medium leading-normal text-center text-white py-2" style={{ cursor: "pointer" }}>
            <a href="https://www.usvptoken.com/">{t("visit-website")}</a>
          </p>
          </div>
        </div>
      </div>
    </div>
  </div>
{/* Centrar horizontalmente */}

  

              {/* Boton connect Presale Formulario */}
              <div className="rounded-2xl bg-gradient-to-r from-gray-500 via-orange-500 mt-20 to-yellow-500 p-1 shadow-xl">
                <div className="block rounded-xl bg-white opacity-90 p-4 sm:p-6 lg:p-8">
                  <div className="mt-10">
                    <h3 className="text-lg font-bold text-gray-900 sm:text-xl">
                      {t("informacion")}
                    </h3>

                    <p className="mt-2 text-sm text-gray-500">
                     {t("tokensventa")}<p className="bold">1,000,000 USVP</p>
                    </p>
                    <p className="mt-2 text-sm text-gray-500">
                     {t("precio")}<p className="bold">0,75 USD</p>
                    </p>
                  </div>
                  <div className="mt-10">
                    <h3 className="text-lg font-bold text-gray-900 sm:text-xl">
                      {t("comprarahora")}
                    </h3>

                    <p className="mt-2 text-sm text-gray-500">
                      
                      {t("balance")}:<p className="bold">{formatEther(balance?.toString() || "0")} {selectedToken?.label?.toUpperCase()}</p>
                    </p>
                    <p className="my-2 text-sm text-gray-500">
                    {t("select-payment")}
                    </p>
                    <div className="flex space-x-2">
                      {
                        tokens.map((item, idx) => (
                          <div
                            key={idx}
                            className="flex items-center"
                            style={{ cursor: "pointer" }}
                            onClick={() => setSelectedToken(item)}
                          >
                            <span
                              className={`inline-block py-1 px-2 ${selectedToken?.label === item.label
                                ? 'bg-gray-700 text-white'
                                : 'bg-gray-200 text-gray-800'
                                }  rounded-full text-xs flex justify-center items-center`}
                            >
                              <Image
                                alt={item.label}
                                src={require(`./assets/WBNB.png`)}
                              />
                              {item.label.toUpperCase()}
                            </span>
                          </div>
                        ))
                      }
                    </div>
                    <p className="mt-2 text-sm text-gray-500">
                      {t("enter-amount")} {selectedToken?.label?.toUpperCase()}:
                      <input
                        type="number"
                        id="amount_usd"
                        className="bg-white mt-2 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-white-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-black dark:focus:ring-blue-500 dark:focus:border-blue-500"
                        placeholder={'Monto en ' + selectedToken?.label?.toUpperCase()}
                        required
                        /*                   min={0}
                         */ value={amountUSD}
                        onChange={handleAmountUSDChange}
                      />
                    </p>
                    <p className="mt-2 text-sm text-gray-500">
                      {t("total-raix")}
                      <input
                        type="number"
                        id="amount_wbcd"
                        className="bg-white mt-2 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-white-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-black dark:focus:ring-blue-500 dark:focus:border-blue-500"
                        placeholder="Monto"
                        required
                        /*                   min={0}
                         */ value={amountUSVP}
                        onChange={handleamountUSVPChange}
                      />
                    </p>
                  </div>
                </div>
                <p className="text-center mt-1 text-white max-w-30">
                 {t("transaction-notice")}
                </p>
                {/* <div className="flex items-center justify-center mt-3">
                  <button
                    disabled={!write}
                    onClick={() => write?.()}
                    className="w-40 h-30 bg-gradient-to-r from-purple-500 to-gray-500 hover:from-purple-600 hover:to-indigo-600 text-white font-semibold py-2 px-4 rounded-md shadow"
                  >
                    Comprar 
                  </button>
                </div> */}
                <div className="flex items-center justify-center mt-3">
                  {actionHandler}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </I18nextProvider>
  );
}


export default Home;