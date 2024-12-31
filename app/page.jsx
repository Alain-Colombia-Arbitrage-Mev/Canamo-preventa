'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import TransactionSuccessModal from './components/TransactionSuccessModal';
import { formatUnits, parseUnits } from 'viem';
import {
  useAccount,
  useReadContract,
  useWriteContract,
  useSimulateContract,
  useWaitForTransaction,
  useWatchContractEvent,
  useWaitForTransactionReceipt ,
  useConfig,
} from 'wagmi';
import { ConnectButton, useConnectModal } from '@rainbow-me/rainbowkit';
import { motion, useAnimation } from 'framer-motion';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import Image from 'next/image';
import { I18nextProvider, useTranslation } from 'react-i18next';
import i18nfile from '../i18n';
import { FaWallet } from 'react-icons/fa';
import { addTokenToMetaMask } from './AddTokenButton';
import presaleABI from '../contracts/Presale.json';
import ERC20ABI from '../contracts/ERC20.json';
import USDTABI from '../contracts/USDTABI.json';
import IERC20ABI from '../contracts/IERC20.json';
import Head from 'next/head';

const usdticon = require('../app/assets/usdt.png');
const usdcicon = require('../app/assets/usdc.png');

// Icons and images
import { BsPlus, BsSearch, BsEyeFill, BsBookmarkFill, BsFillArrowLeftSquareFill, BsPeopleFill, BsTerminalFill, BsFillArrowRightSquareFill, BsWallet, BsDiscord } from 'react-icons/bs';
import { US, ES, CN, RU, SA } from 'country-flag-icons/react/3x2';
import { AiFillFire, AiFillMessage, AiFillDollarCircle } from 'react-icons/ai';
import imgReferido from './assets/referido.png';

// Contract address for mainnet
const CONTRACT_ADDRESS = '0xD28373ea844f28A4be3f362e2146b372193fa927';

// Contract address for testnet
//const CONTRACT_ADDRESS = '0x83bf7C98c2f5A144C8EEE9a9Da77a06FCd674b78';

const data = [
  {
    name: 'Pre venta',
    items: [
      {
        title: 'Comprar BNB',
        icon: AiFillDollarCircle,
        link: 'https://onramp.gatefi.com/?merchantId=3e1a127a-0da9-45aa-8cb8-06cf343b8ca0&cryptoCurrency=BNB&cryptoCurrencyLock=true'
      },
    ],
  },
];

const datafooter = [
  {
    name: '',
    items: [
      {
        title: 'Discord',
        icon: BsDiscord,
      },
    ],
  },
];

// Token configurations for mainnet
const tokens = [
  { 
    label: 'USDT', 
    address: '0x55d398326f99059fF775485246999027B3197955', 
    id: 0, 
    decimals: 18, 
    icon: usdticon, 
    iconWidth: 24, 
    iconHeight: 24 
  },
  { 
    label: 'usdc', 
    address: '0x8965349fb649A33a30cbFDa057D8eC2C48AbE2A2', 
    id: 1, 
    decimals: 18, 
    icon: usdcicon, 
    iconWidth: 24, 
    iconHeight: 24 
  },
];


export default function Home() {
  // States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [active, setActive] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedToken, setSelectedToken] = useState(tokens[0] || null); // Safeguard with null
  const [amountUSD, setAmountUSD] = useState('');
  const [AmountTokens, setAmountTokens] = useState('');
  const [transactionHash, setTransactionHash] = useState('');
  const [isPendingConfirmation, setIsPendingConfirmation] = useState(false);

  

  // Hooks
  const { t, i18n } = useTranslation();
  const { address, isConnected } = useAccount();
  const wagmiConfig = useConfig();
  const controls = useAnimation();
  const controlText = useAnimation();
  const controlTitleText = useAnimation();
  // Hook para esperar la confirmación de la transacción
  const { isLoading: isConfirming } = useWaitForTransactionReceipt({
    hash: transactionHash,
    onSuccess(data) {
      console.log("Transacción confirmada:", data);
      setIsModalOpen(true);
      setIsPendingConfirmation(false);
    },
    onError(error) {
      console.error("Error en la confirmación:", error);
      setIsPendingConfirmation(false);
    }
  });

  // Contract Read Operations
  const { data: totalSold = 0n, isError: totalSoldError } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: presaleABI,
    functionName: 'totalTokensSold',
    onError: (error) => {
      console.error('Error reading total sold:', error);
    }
  });


  const { data: presaleStatus } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: presaleABI,
    functionName: 'getPresaleStatus',
  });

  const selectedTokenAddress = selectedToken?.address;
  const selectedTokenDecimals = selectedToken?.decimals ?? 18;
  // Contract Reads with null checks
  const { 
    data: allowance = 0n, 
    isLoading: allowanceLoading,
    isError: allowanceError 
  } = useReadContract({
    address: selectedToken?.address,
    abi: USDTABI,
    functionName: 'allowance',
    args: address && CONTRACT_ADDRESS ? [address, CONTRACT_ADDRESS] : undefined,
    enabled: Boolean(selectedToken?.address && address && CONTRACT_ADDRESS),
    onError: (error) => {
      console.error('Error checking allowance:', error);
    }
  });
  
  // Then update the effect to use the proper variables
  useEffect(() => {
    if (!allowanceLoading && !allowanceError && isConnected && selectedToken && amountUSD) {
      console.log('Allowance actual:', allowance);
    }
  }, [allowanceLoading, allowanceError, isConnected, selectedToken, amountUSD, allowance]);

  const { data: balance = 0n, isLoading: balanceLoading } = useReadContract({
    address: selectedToken?.address,
    abi: USDTABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    enabled: Boolean(selectedToken?.address && address),
    onError: (error) => {
      console.error('Error checking balance:', error);
    }
  });

  // Contract Write Operations
  const { data: simulateApprove } = useSimulateContract({
    address: selectedTokenAddress,
    abi: USDTABI,
    functionName: 'approve',
    args: [
      CONTRACT_ADDRESS,
      BigInt("115792089237316195423570985008687907853269984665640564039457584007913129639935")
    ],
    enabled: Boolean(
      isConnected && 
      selectedTokenAddress && 
      CONTRACT_ADDRESS && 
      amountUSD && 
      parseFloat(amountUSD) >= 1
    ),
  });

  const { data: simulateBuy, isError: isSimulateError, isLoading: isBuySimulating } = useSimulateContract({
    address: CONTRACT_ADDRESS,
    abi: presaleABI,
    functionName: 'buyTokens',
    args: [
      selectedToken?.id ?? 0,
      amountUSD && parseFloat(amountUSD) >= 1
        ? parseUnits(amountUSD, selectedToken?.decimals || 18)
        : BigInt(0)
    ],
    enabled: Boolean(
      isConnected &&
      selectedToken &&
      amountUSD &&
      parseFloat(amountUSD) >= 1
    ),
  });


  // Write contract hooks
  const { writeContract: approve, isPending: isApprovePending } = useWriteContract();
  const { writeContract: buyTokens, isPending: isBuyPending } = useWriteContract();

  const [isProcessing, setIsProcessing] = useState(false);
  // Transaction Watcher
  
  useWatchContractEvent({
    address: CONTRACT_ADDRESS,
    abi: presaleABI,
    eventName: 'TokensPurchased',
    onLogs(logs) {
      console.log('Evento de compra detectado:', logs);
    },
  });

  // Handlers
  const handleTokenSelection = useCallback((token) => {
    if (!token) {
      console.warn("Attempted to select invalid token");
      return;
    }
    setSelectedToken(token);
  }, []);


  const handleAmountUSDChange = (event) => {
    const value = event.target.value;
    
    if (value === '') {
        setAmountUSD('');
        setAmountTokens('');
        return;
    }

    const amount = Number.parseFloat(value);
    if (!isNaN(amount)) {
        setAmountUSD(value);
        const tokenAmount = (amount * (1 + (1 - 0.70))).toFixed(2);
        setAmountTokens(tokenAmount);
    }
  };

 // Handlers
 const handleBuy = useCallback(async () => {
  if (!amountUSD || parseFloat(amountUSD) < 1) return;

  try {
    setIsProcessing(true);
    setIsPendingConfirmation(true);
    const hash = await buyTokens({
      address: CONTRACT_ADDRESS,
      abi: presaleABI,
      functionName: 'buyTokens',
      args: [
        selectedToken?.id ?? 0,
        parseUnits(amountUSD, selectedToken?.decimals || 18)
      ]
    });
    console.log("Transacción enviada:", hash);
    setTransactionHash(hash);
  } catch (error) {
    console.error("Error en compra:", error);
    setIsPendingConfirmation(false);
  } finally {
    setIsProcessing(false);
  }
}, [buyTokens, amountUSD, selectedToken]);

const handleApprove = useCallback(async () => {
  if (!selectedToken?.address) return;
  
  try {
    setIsProcessing(true);
    setIsPendingConfirmation(true);
    const hash = await approve({
      address: selectedToken.address,
      abi: USDTABI,
      functionName: 'approve',
      args: [
        CONTRACT_ADDRESS,
        BigInt("115792089237316195423570985008687907853269984665640564039457584007913129639935")
      ]
    });
    console.log("Aprobación enviada:", hash);
    setTransactionHash(hash);
  } catch (error) {
    console.error("Error en aprobación:", error);
    setIsPendingConfirmation(false);
  } finally {
    setIsProcessing(false);
  }
}, [approve, selectedToken]);

  // Animation Controls
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

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
    setIsOpen(false);
  };

  // Calculations and Memos
  const humanReadableSold = useMemo(() => {
    if (totalSold) {
      try {
        return formatUnits(totalSold, 18);
      } catch (error) {
        console.error('Error formatting totalSold:', error);
        return '0';
      }
    }
    return '0';
  }, [totalSold]);

  const progress = useMemo(() => {
    if (totalSold) {
      try {
        const soldAmount = Number(humanReadableSold);
        const totalSupply = 1000000;
        const progressPercentage = (soldAmount / totalSupply) * 100;
        return Number(progressPercentage.toFixed(2));
      } catch (error) {
        console.error('Error calculating progress:', error);
        return 0;
      }
    }
    return 0;
  }, [totalSold, humanReadableSold]);

  // Effects
  useEffect(() => {
    showMore();
  }, []);

  useEffect(() => {
    if (amountUSD && !isNaN(amountUSD)) {
      const amount = parseFloat(amountUSD);
      const tokenAmount = (amount * (1 + (1 - 0.70))).toFixed(2);
      setAmountTokens(tokenAmount);
    }
  }, [amountUSD]);

  useEffect(() => {
    if (isConnected && selectedToken && amountUSD) {
      if (allowance === undefined || allowance === null) {
        console.error('Allowance is undefined or null');
      } else {
        console.log('Allowance actual:', allowance);
      }
    }
  }, [isConnected, selectedToken, amountUSD, allowance]);
  
  const { openConnectModal } = useConnectModal();


  useEffect(() => {
    console.log('Contract States:', {
      isConnected,
      selectedTokenId: selectedToken?.id,
      amountUSD,
      hasSimulation: !!simulateBuy?.request,
      isBuySimulating,
      isBuyPending,
      isProcessing,
      allowance: allowance?.toString(),
      requiredAmount: amountUSD ? 
        parseUnits(amountUSD, selectedToken?.decimals || 18).toString() : 
        '0'
    });
  }, [
    isConnected,
    selectedToken?.id,
    amountUSD,
    simulateBuy?.request,
    isBuySimulating,
    isBuyPending,
    isProcessing,
    allowance
  ]);


  // Action Handler
  const actionHandler = useMemo(() => {
    // Estado de conexión de wallet
    if (!isConnected) {
        return (
            <button 
                onClick={openConnectModal}
                className="w-40 h-30 bg-gradient-to-r from-purple-500 to-gray-500 hover:from-purple-600 hover:to-indigo-600 text-white font-semibold py-2 px-4 rounded-md shadow"
            >
                Connect Wallet
            </button>
        );
    }

    // Verificación de monto mínimo
    if (!amountUSD || parseFloat(amountUSD) < 1) {
        return (
            <button 
                className="w-40 h-30 bg-gray-500 text-white font-semibold py-2 px-4 rounded-md shadow cursor-not-allowed"
                disabled
            >
                {t("Monto mínimo 1")}
            </button>
        );
    }

    // Estados de carga
    if (allowanceLoading || balanceLoading) {
        return (
            <button 
                className="w-40 h-30 bg-gray-500 text-white font-semibold py-2 px-4 rounded-md shadow cursor-not-allowed"
                disabled
            >
                Cargando...
            </button>
        );
    }

    // Cálculo de montos
    const currentAllowance = allowance ? BigInt(allowance.toString()) : BigInt(0);
    const requiredAmount = amountUSD ? parseUnits(amountUSD, selectedToken?.decimals || 18) : BigInt(0);

    // Si ya hay suficiente allowance, mostrar botón de compra
    if (currentAllowance >= requiredAmount) {
        const isButtonDisabled = isProcessing || isPendingConfirmation || isConfirming;
        
        return (
            <button
                onClick={handleBuy}
                className={`w-40 h-30 bg-gradient-to-r from-purple-500 to-gray-500 
                    ${!isButtonDisabled ? 'hover:from-purple-600 hover:to-indigo-600' : 'opacity-70'} 
                    text-white font-semibold py-2 px-4 rounded-md shadow`}
                disabled={isButtonDisabled}
            >
                {isProcessing ? 'Procesando...' :
                 isPendingConfirmation ? 'Pendiente...' :
                 isConfirming ? 'Confirmando...' :
                 t("Comprar Ahora")}
            </button>
        );
    }

    // Si no hay suficiente allowance, mostrar botón de aprobación
    const isApproveDisabled = isProcessing || isPendingConfirmation || isConfirming;
    
    return (
        <button
            onClick={handleApprove}
            className={`w-40 h-30 bg-gradient-to-r from-purple-500 to-gray-500 
                ${!isApproveDisabled ? 'hover:from-purple-600 hover:to-indigo-600' : 'opacity-70'} 
                text-white font-semibold py-2 px-4 rounded-md shadow`}
            disabled={isApproveDisabled}
        >
            {isProcessing ? 'Procesando...' :
             isPendingConfirmation ? 'Pendiente...' :
             isConfirming ? 'Confirmando...' :
             'Aprobar'}
        </button>
    );
}, [
    isConnected,
    selectedToken,
    allowance,
    amountUSD,
    handleApprove,
    handleBuy,
    openConnectModal,
    allowanceLoading,
    balanceLoading,
    isProcessing,
    isPendingConfirmation,
    isConfirming,
    t
]);

  // Inicio del JSX
  return (
    <I18nextProvider i18n={i18nfile}>
       {/* Layout principal con flexbox responsive */}
       <div className="min-h-screen bg-gray-200 flex flex-col md:flex-row">
      {/* Sidebar */}
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
          className="w-full md:max-w-[250px] border-b md:border-r border-gray-700 md:min-h-screen py-4 md:py-10 flex flex-col items-center justify-center mx-auto"
>
          {active && (
            <BsFillArrowLeftSquareFill
              onClick={showLess}
              className="absolute text-2xl text-black cursor-pointer -right-4 top-10 group-hover:block"
            />
          )}
          {!active && (
            <BsFillArrowRightSquareFill
              onClick={showMore}
              className="absolute text-2xl text-black cursor-pointer -right-4 top-10"
            />
          )}
         
         <div className="w-full flex justify-center mb-4">
{active && (
           <div className="flex flex-col items-center">
              <Image
                alt="logo"
                src={require('./assets/logopreventa.png')}
                className="w-20"
              />
              <motion.p className="text-black pb-4 pt-2">USVP</motion.p>
              </div>
          )}
          {!active && (
            <div className="flex flex-col items-center">
              <Image
                alt="logo"
                src={require('./assets/logo.png')}
                className="w-10"
              />
               <motion.p className="text-black pb-4 pt-2">USVP</motion.p>
            </div>
          )}
             </div>
          <div
            className={`${active &&
              'border-green-400 border shadow-green-400/60 shadow-lg rounded-lg px-4'
              }  w-full flex flex-col items-center justify-center mb-4`}
          >
            
            <motion.p
              animate={controlText}
              className="font-thin py-2 text-md pt-3"
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
            <div className="flex flex-col items-center justify-center px-4 py-3 w-full"></div>
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
                            />
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

          <div className="grow w-full flex flex-col space-y-4">  
            {data.map((group, index) => (
                  <div key={index} className="w-full flex flex-col items-center">
                <motion.p
                  animate={controlTitleText}
                   className="text-sm font-bold text-gray-500 text-center w-full mb-2"
                >
                  {group.name}
                </motion.p>

                {(group.items || []).map((item, index2) => (
                  <div
                    key={index2}
                    className="w-full flex items-center justify-center py-2 px-4 cursor-pointer hover:bg-gray-100 rounded-lg"
                    onClick={() => {
                      if (item.onClick) {
                        item.onClick();
                      } else if (item.link) {
                        window.open(item.link, '_blank');
                      }
                    }}
                  >
                    {item.icon && <item.icon className="text-lg text-gray-500" />}
                    <motion.p
                      animate={controlText}
                      className="ml-4 text-sm font-bold text-gray-400"
                    >
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

<div className="w-full mt-auto">
            {datafooter.map((group, index) => (
              <div key={index} className="my-2">
                <motion.p
                  animate={controlTitleText}
                   className="mb-2 ml-4 text-sm font-bold text-gray-500"
                >
                  {group.name}
                </motion.p>

                {group.items.map((item, index2) => (
                  <div
                    key={index2}
                    className="flex px-4 py-1 cursor-pointer"
                    onClick={() => {
                      if (item.title === 'Discord') {
                        window.open('https://discord.gg/sXwTGXNB');
                      }
                    }}
                  >
                    <item.icon className="text-lg text-gray-500" />
                    <motion.p
                      animate={controlText}
                      className="ml-4 text-sm font-bold text-gray-400"
                    >
                      {item.title}
                    </motion.p>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </motion.div>

        {/* Aqui acaba el sidebar/*}

        {/* Main Content Area */}
    <div className="inicial  w-full ">
    <div className="overflow-y-auto min-h-screen px-4 md:px-8 pt-8">
           <motion.h1
  className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-center font-extrabold tracking-tight leading-[1.1] text-white mb-6"
  initial={{ opacity: 0, y: -50 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 1, delay: 0.2 }}
>
  {t('presale-title')}
</motion.h1>

            {/* Progress Bar Section */}
            <div className="flex flex-col lg:flex-row justify-center items-center gap-8 mt-8">
            <div className="w-full lg:w-3/5 space-y-8">
                <div className="max-w-screen md:w-3/4 mx-auto items-center flex">
                  <div className="inline-flex flex-col space-y-2 items-center justify-end flex-1 h-full p-4 bg-blue-900 bg-opacity-75 rounded-xl">
                  <h2 className="text-2xl font-semibold text-white">
                {t("progress-date")}
              </h2>

                    {/* Progress Bar */}
                    <div className="w-full h-3 sm:h-4 bg-white rounded-full mb-3 sm:mb-4">
                      {presaleStatus && (
                        <>
                          <div 
                            className="absolute top-0 left-0 h-5 bg-blue-600 rounded-lg transition-all duration-300 ease-in-out"
                            style={{ width: `${progress}%` }}
                            aria-valuenow={progress}
                            aria-valuemin="0"
                            aria-valuemax="100"
                            role="progressbar"
                          ></div>
                           <div className="flex justify-center items-center h-full text-xs font-bold">
                            {`${progress}%`}
                          </div>
                        </>
                      )}
                    </div>

                    {/* Token Stats */}
                    <p className="w-full text-sm tracking-wide leading-tight text-white">
                      {t("sold")} {humanReadableSold || '0'}
                    </p>
                    <p className="w-full text-sm tracking-wide leading-tight text-white">
                      {t("remaining")} {formatUnits(totalSold || BigInt(0), 18)}
                    </p>
                    <p className="w-full pb-8 text-sm tracking-wide leading-tight text-white">
                      {t("target")} 1,000,000 USVP
                    </p>

                    {/* Technical Details */}
                    <h1 className="text-white font-bold text-[20px]">
                      {t("Detalles Técnicos")}
                    </h1>
                    <p className="w-full text-sm tracking-wide leading-tight text-white text-bold">
                      {t("Nombre del token")}: USVP
                    </p>
                    <p className="w-full text-sm tracking-wide leading-tight text-white text-bold">
                      {t("Symbol")}: USVP
                    </p>
                    <p className="w-full text-sm tracking-wide leading-tight text-white text-bold">
                      {t("Smart-contract")}: {CONTRACT_ADDRESS}
                    </p>
                    <p className="w-full pb-8 text-sm tracking-wide leading-tight text-white">
                      <span className="font-bold">{t("Network")}</span>: Binance Smart Chain
                    </p>

                    <div className="miboton">
  <div className="opacity-95 border rounded-lg border-white px-4">
    <p className="m-auto inset-0 text-sm font-medium leading-normal text-center text-white py-2" style={{ cursor: "pointer" }}>
      <a href="https://www.usvprwa.com/">{t("visit-website")}</a>
    </p>
  </div>
</div>
<div className="miboton2 mt-4"> {/* Añadido mt-4 para dar espacio entre botones */}
  <div className="opacity-95 border rounded-lg border-white px-4">
    <p className="m-auto inset-0 text-sm font-medium leading-normal text-center text-white py-2" style={{ cursor: "pointer" }}>
      <a href="https://www.usvprwa.com/whitepaper">Whitepaper</a>
    </p>
  </div>
</div>
</div>
</div>
</div>

                {/* Boton connect Presale Formulario */}
              <div className="rounded-2xl bg-gradient-to-r from-gray-500 via-orange-500 mt-20 to-yellow-500 p-1 shadow-xl mb-20">
                <div className="block rounded-xl bg-white opacity-90 p-4 sm:p-6 lg:p-8">
                  <div className="mt-10">
                    <h3 className="text-lg font-bold text-gray-900 sm:text-xl">
                      {t("informacion")}
                    </h3>

                    <p className="mt-2 text-sm text-gray-500">
                      {t("tokensventa")}<span>1,000,000 USVP</span>
                    </p>
                    <p className="mt-2 text-sm text-gray-500">
                      {t("precio")}<span>0,75 USD</span>
                    </p>
                  </div>

                  <div className="mt-10">
                    <h3 className="text-lg font-bold text-gray-900 sm:text-xl">
                      {t("comprarahora")}
                    </h3>

                    <p className="mt-2 text-sm text-gray-500">
                      {t("balance")}: <span>
                        {balance 
                          ? formatUnits(balance, selectedToken?.decimals || 18)
                          : "0.00"
                        } {selectedToken?.label?.toUpperCase()}
                      </span>
                    </p>

                    <p className="my-2 text-sm text-gray-500">
                      {t("select-payment")}
                    </p>

                    {/* Token Selection */}
                    <div className="flex space-x-2">
                      {tokens.map((item, idx) => (
                        <div
                          key={idx}
                          className="flex items-center"
                          style={{ cursor: "pointer" }}
                          onClick={() => handleTokenSelection(item)}
                        >
                          <span
                            className={`inline-block py-1 px-2 ${
                              selectedToken?.label === item.label
                                ? 'bg-gray-700 text-white'
                                : 'bg-gray-200 text-gray-800'
                            } rounded-full text-xs flex justify-center items-center`}
                          >
                            <Image
                              alt={item.label}
                              src={item.icon}
                              width={item.iconWidth}
                              height={item.iconHeight}
                            />
                            {item.label.toUpperCase()}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Amount Input */}
                    <p className="mt-2 text-sm text-gray-500">
                      {t("enter-amount")} {selectedToken?.label?.toUpperCase()}:
                      <input
                        type="number"
                        id="amount_usd"
                        className="bg-white mt-2 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-white-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-black dark:focus:ring-blue-500 dark:focus:border-blue-500"
                        placeholder={'Mínimo 1 ' + selectedToken?.label?.toUpperCase()}
                        required
                        min="1"
                        step="1"
                        value={amountUSD}
                        onChange={handleAmountUSDChange}
                        onBlur={() => {
                          const amount = Number.parseFloat(amountUSD);
                          if (!amountUSD || isNaN(amount) || amount < 1) {
                            setAmountUSD('100');
                            setAmountTokens('130');
                          }
                        }}
                      />
                    </p>

                    {/* Token Amount */}
                    <p className="mt-2 text-sm text-gray-500">
                      {t("total-raix")}
                      <input
                        type="number"
                        id="amount_wbcd"
                        className="bg-white mt-2 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-white-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-black dark:focus:ring-blue-500 dark:focus:border-blue-500"
                        placeholder="Monto"
                        required
                        value={AmountTokens}
                        readOnly
                      />
                    </p>
                  </div>
                </div>

                <p className="text-center mt-1 text-white max-w-30 px-3">
                  {t("transaction-notice")}
                </p>

                {/* Action Button */}
                <div className="flex items-center justify-center mt-3 pb-3">
                  {actionHandler}
                </div>
              </div>

              {/* Transaction Success Modal */}
              <TransactionSuccessModal 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)} 
                transactionHash={transactionHash}
                amountPurchased={AmountTokens}
              />
            </div>
          </div>
        </div>
      </div>
    </I18nextProvider>
  );
}