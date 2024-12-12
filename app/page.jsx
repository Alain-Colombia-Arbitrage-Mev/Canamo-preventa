'use client';

import Head from 'next/head';
import { useState, useEffect, useMemo } from 'react';
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

import { AiFillFire, AiFillMessage, AiFillDollarCircle } from 'react-icons/ai';
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
import ERC20ABI from '../contracts/IERC20.json';
import { I18nextProvider, useTranslation } from 'react-i18next';
import i18nfile from '../i18n';
import { parseEther, formatEther } from 'viem';

const CONTRACT_ADDRESS = '0x5A66E16479D0f1dD8878991f22361353D774d5Bc';

const data = [
  {
    name: 'Pre venta',
    items: [
      {
        title: 'Comprar USDT ',
        icon: AiFillDollarCircle,
        link: 'https://onramp.gatefi.com/?merchantId=3e1a127a-0da9-45aa-8cb8-06cf343b8ca0&cryptoCurrency=USDT-BEP20&cryptoCurrencyLock=true&wallet=0xbf646CD04B14eb9159d2000e73C4C339A3C980d9'
      }
    ],
  }
];

const datafooter = [
  {
    name: '',
    items: [
      {
        title: 'Discord',
        icon: BsDiscord,
      }
    ],
  }
];

const tokens = [
  {
    label: "usdt",
    address: "0x55d398326f99059fF775485246999027B3197955",
    id: 0
  },
  {
    label: "busd",
    address: "0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56",
    id: 1
  },
  {
    label: "WBNB",
    address: "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c",
    id: 2
  }
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
  const [amountUSD, setAmountUSD] = useState(0);
  const [amountRaiX, setAmountRaiX] = useState(0);

  const { address } = useAccount();

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

  const handleAmountUSDChange = event => {
    const amount = Math.abs(Number(event.target.value));
    setAmountUSD(Number(amount));
    setAmountRaiX(amount / 0.15);
  };

  const handleAmountRaiXChange = event => {
    const amount = Math.abs(Number(event.target.value));
    setAmountRaiX(amount);
    setAmountUSD(Number(amount * 0.15));
  };

  useEffect(() => {
    showMore();
  }, []);

  // Contract Reads
  const {
    isLoading: isRemainTokenLoading,
    data: remainingToken,
  } = useContractRead({
    abi: contractABI,
    address: CONTRACT_ADDRESS,
    functionName: "remainingToken",
    watch: true
  });

  const {
    isLoading: isAllowanceLoading,
    data: allowance,
  } = useContractRead({
    abi: ERC20ABI,
    address: selectedToken.address,
    functionName: "allowance",
    args: [address, CONTRACT_ADDRESS],
    watch: true
  });

  const {
    isLoading: isBalanceLoading,
    data: balance,
  } = useContractRead({
    abi: ERC20ABI,
    address: selectedToken.address,
    functionName: "balanceOf",
    args: [address],
    watch: true
  });

  const {
    isLoading: isTotalSoldLoading,
    data: totalSold,
  } = useContractRead({
    abi: contractABI,
    address: CONTRACT_ADDRESS,
    functionName: "getTotalSold",
    watch: true
  });

  // Contract Writes
  const {
    write: buyHandler,
    isLoading: isBuyLoading,
    isSuccess: isBuyStarted,
    error: buyError,
  } = useContractWrite({
    address: CONTRACT_ADDRESS,
    abi: contractABI,
    functionName: "buyFromToken",
    args: [selectedToken.id, address, parseEther(amountUSD.toString(), "wei")],
  });

  const {
    write: approveHandler,
    isLoading: isApproveLoading,
    isSuccess: isApproveStarted,
    error: approveError,
  } = useContractWrite({
    address: selectedToken.address,
    abi: ERC20ABI,
    functionName: "approve",
    args: [CONTRACT_ADDRESS, parseEther(amountUSD.toString(), "wei")],
  });

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

  // Action Handler for Buy/Approve buttons
  const actionHandler = useMemo(() => {
    if (!address) {
      return <button
        className="w-40 h-30 bg-gradient-to-r from-purple-500 to-gray-500 hover:from-purple-600 hover:to-indigo-600 text-white font-semibold py-2 px-4 rounded-md shadow"
      >
        Connect
      </button>
    } else if (allowance >= parseEther(amountUSD.toString(), "wei")) {
      return <button
        onClick={buyHandler}
        className="w-40 h-30 bg-gradient-to-r from-purple-500 to-gray-500 hover:from-purple-600 hover:to-indigo-600 text-white font-semibold py-2 px-4 rounded-md shadow"
      >
        Buy USVP NOW
      </button>
    } else if (allowance < parseEther(amountUSD.toString(), "wei") || !isApproveStarted) {
      return <button
        onClick={approveHandler}
        className="w-40 h-30 bg-gradient-to-r from-purple-500 to-gray-500 hover:from-purple-600 hover:to-indigo-600 text-white font-semibold py-2 px-4 rounded-md shadow"
      >
        Approve
      </button>
    }
  }, [address, allowance, isBuyStarted, amountUSD]);

  useEffect(() => {
    let _selectedToken = selectedToken;
    setSelectedToken({});
    setSelectedToken(_selectedToken);
  }, [isBuyStarted, isApproveStarted]);

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

{/* Sidebar */}
<motion.div
          animate={controls}
          className="max-w-[250px] animate duration-300 border-r border-gray-700 relative flex flex-col py-10 min-h-screen group"
        >
          {/* Toggle Buttons */}
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

          {/* Logo Section */}
          {active && (
            <div className="flex items-center justify-center" style={{ flexDirection: 'column' }}>
              <Image
                alt="logo"
                src={require('./assets/logopreventa.png')}
                className="w-20"
              />
              <motion.p className="text-black pb-4 pt-2">USVP</motion.p>
            </div>
          )}
          {!active && (
            <div className="flex items-center justify-center" style={{ flexDirection: 'column' }}>
              <Image
                alt="logo"
                src={require('./assets/logo.png')}
                className="w-10"
              />
              <motion.p className="text-black pb-4 pt-2">USVP</motion.p>
            </div>
          )}

          {/* Wallet Section */}
          <div
            className={`${active &&
              'border-green-400 border shadow-green-400/60 shadow-lg rounded-lg px-4'
              } max-w-[220px] flex justify-center mx-2 flex-col mb-4`}
          >
            <motion.p
              animate={controlText}
              className="font-thin py-2 text-md pt-3"
            >
              {t('revoluciona')}
            </motion.p>

            {/* Wallet Button for Collapsed State */}
            {!active && (
              <button
                onClick={showMore}
                type="button"
                className="flex items-center justify-center w-full py-2 my-2 font-bold text-black bg-green-400 rounded-lg"
              >
                <BsWallet className="text-2xl mr-2" />
              </button>
            )}
        {/* Connect Button Component */}
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

          {/* Navigation Menu */}
          <div className="grow">
            {data.map((group, index) => (
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
                      if (item.link) {
                        window.open(item.link, '_blank');
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

          {/* Language Selector */}
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

              {/* Language Dropdown */}
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