'use client';

import { useState, useEffect, useMemo } from 'react';
import { BigNumber, ethers } from 'ethers';
import CountdownTimer from './CountdownTimer'; 
import {
  useAccount,
  useConnect,
  useContractRead,
  useContractWrite,
  useNetwork,
  usePrepareContractWrite,
  useWaitForTransaction,
} from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { motion, useAnimation } from 'framer-motion';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import Image from 'next/image';
import { I18nextProvider, useTranslation } from 'react-i18next';
import i18nfile from '../i18n';
import { FaWallet } from 'react-icons/fa';
import { addTokenToMetaMask } from './AddTokenButton';
import presaleABI from '../contracts/Presale.json';
import ERC20ABI from '../contracts/ERC20.json';
import IERC20ABI from '../contracts/IERC20.json';
import Head from 'next/head'



// Icons and images
import { BsPlus, BsSearch, BsEyeFill, BsBookmarkFill, BsFillArrowLeftSquareFill, BsPeopleFill, BsTerminalFill, BsFillArrowRightSquareFill, BsWallet, BsDiscord } from 'react-icons/bs';
import { US, ES, CN, RU, SA } from 'country-flag-icons/react/3x2';
import { AiFillFire, AiFillMessage, AiFillDollarCircle } from 'react-icons/ai';
import imgReferido from './assets/referido.png';

const CONTRACT_ADDRESS = '0x8e7E139F332256bFbC33F3B05EE0052163D2fd7b'; // Presale contract address

const data = [
  {
    name: 'Pre venta',
    items: [
      {
        title: 'Comprar USDT',
        icon: AiFillDollarCircle,
        link: 'https://onramp.gatefi.com/?merchantId=3e1a127a-0da9-45aa-8cb8-06cf343b8ca0&cryptoCurrency=USDT-BEP20&cryptoCurrencyLock=true&wallet=0xbf646CD04B14eb9159d2000e73C4C339A3C980d9'
      },
    ],
  },
];

const dataFooter = [
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

const tokens = [
  { label: 'USDT', address: '0x1495fa06722Af1D4E78984AAdC1B9143f44A3cfB', id: 0, decimals: 18 },
  { label: 'BUSD', address: '0x6a288dc5978419dD131eDBbdD93D3bf0b2014F44', id: 1, decimals: 18 },
];

export default function Home() {
  const { t, i18n } = useTranslation();
  const [active, setActive] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedToken, setSelectedToken] = useState(tokens[0]);
  const [amountUSD, setAmountUSD] = useState(0);
  const [AmountTokens, setAmountTokens] = useState(0);
  const [tokenPrice, setTokenPrice] = useState(0); // Token price in USD

  const { address, isConnected } = useAccount();

  const controls = useAnimation();
  const controlText = useAnimation();
  const controlTitleText = useAnimation();


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

  const handleAmountUSDChange = (event) => {
    const amount = Number(event.target.value);
    if (!isNaN(amount) && amount >= 0) {
      setAmountUSD(amount);
      setAmountTokens(amount / 0.75); // Assuming token price is 0.75 USD
    } else {
      setAmountUSD(0);
      setAmountTokens(0);
      console.error('Invalid amount entered');
    }
  };
  
  const handleAmountTokensChange = (event) => {
    const amount = Number(event.target.value);
    if (!isNaN(amount) && amount >= 0) {
      setAmountTokens(amount);
      // Here, we multiply by price to convert tokens back to USD
      setAmountUSD(amount * 0.75);
    } else {
      setAmountTokens(0);
      setAmountUSD(0);
    }
  };

  // Use wagmi for reading contract data
  const {
    data: totalSold,
    isLoading: isTotalSoldLoading,
  } = useContractRead({
    address: CONTRACT_ADDRESS,
    abi: presaleABI,
    functionName: 'totalTokensSold',
    watch: true,
  });

  const {
    data: allowance,
    isLoading: isAllowanceLoading,
  } = useContractRead({
    address: selectedToken.address,
    abi: IERC20ABI,
    functionName: 'allowance',
    args: [address, CONTRACT_ADDRESS],
    watch: true,
  });

  const {
    data: balance,
    isLoading: isBalanceLoading,
  } = useContractRead({
    address: selectedToken.address,
    abi: IERC20ABI,
    functionName: 'balanceOf',
    args: [address],
    watch: true,
  });

  // Check if presale is paused or ended
  const {
    data: presaleStatus,
    isLoading: isPresaleStatusLoading,
  } = useContractRead({
    address: CONTRACT_ADDRESS,
    abi: presaleABI,
    functionName: 'getPresaleStatus',
    watch: true,
  });

  
  
 

  

  // Assuming there's a fixed supply for the presale
  const totalSupply = BigNumber.from("1000000000000000000000000"); // Example: 1,000,000 tokens with 18 decimals

  const remainingTokens = useMemo(() => {
    if (totalSold && totalSupply) {
      return totalSupply.sub(BigNumber.from(totalSold));
    }
    return BigNumber.from(0);
  }, [totalSold, totalSupply]);

  // Use wagmi for contract write operations
  const { config: approveConfig } = usePrepareContractWrite({
    address: selectedToken.address,
    abi: IERC20ABI,
    functionName: 'approve',
    args: [CONTRACT_ADDRESS, ethers.utils.parseUnits(amountUSD.toString(), selectedToken.decimals)],
    enabled: Boolean(isConnected && amountUSD > 0),
  });


  const handleTokenSelection = (token) => {
    setSelectedToken(token);
    console.log(`Selected token address: ${token.address}, label: ${token.label}, id: ${token.id}`);
  };


  const {
    write: approveHandler,
    isLoading: isApproveLoading,
    isSuccess: isApproveStarted,
    error: approveError,
  } = useContractWrite(approveConfig);

  const { config: buyConfig } = usePrepareContractWrite({
    address: CONTRACT_ADDRESS,
    abi: presaleABI,
    functionName: 'buyTokens',
    args: [selectedToken.id, ethers.utils.parseUnits(amountUSD.toString(), selectedToken.decimals)],
    enabled: Boolean(selectedToken && amountUSD > 0)
  });
  // desactivamos 
   

  const {
    write: buyHandler,
    isLoading: isBuyLoading,
    isSuccess: isBuyStarted,
    error: buyError,
    data: buyData
  } = useContractWrite(buyConfig);
  
  const handleBuy = () => {
    console.log('Buying with token:', selectedToken.label, 'ID:', selectedToken.id);
    buyHandler?.();
  };

  useEffect(() => {
    showMore();
  }, []);


  const {
    isLoading: isTransactionPending,
    isSuccess: isTransactionCompleted,
    isError: isTransactionError,
    error: transactionError
  } = useWaitForTransaction({
    hash: buyData?.hash,
  });
  
  

  useEffect(() => {
    if (isTransactionCompleted) {
      console.log('Transaction completed!');
      // Add UI feedback here, like showing a success message or updating UI state
    }
    if (isTransactionError) {
      console.error('Transaction failed:', transactionError);
      // Display error to user, perhaps in a toast notification or error modal
    }
  }, [isTransactionCompleted, isTransactionError, transactionError]);

  const actionHandler = useMemo(() => {
    if (!isConnected) {
      return (
        <button className="w-40 h-30 bg-gradient-to-r from-purple-500 to-gray-500 hover:from-purple-600 hover:to-indigo-600 text-white font-semibold py-2 px-4 rounded-md shadow">
          Connect
        </button>
      );
    } else if (presaleStatus && (presaleStatus.isEnded || presaleStatus.paused)) {
      // Check if presale has ended or is paused
      return (
        <button className="w-40 h-30 bg-red-500 text-white font-semibold py-2 px-4 rounded-md shadow cursor-not-allowed">
          {presaleStatus.isEnded ? 'Presale Ended' : 'Presale Paused'}
        </button>
      );
    } else if (allowance && BigNumber.from(allowance).gte(ethers.utils.parseEther(amountUSD.toString()))) {
      return (
        <button
          onClick={handleBuy}
          className="w-40 h-30 bg-gradient-to-r from-purple-500 to-gray-500 hover:from-purple-600 hover:to-indigo-600 text-white font-semibold py-2 px-4 rounded-md shadow"
          disabled={isTransactionPending || !isConnected}
        >
          {isTransactionPending || isBuyLoading ? 'Buying...' : 'Buy USVP NOW'}
        </button>
      );
    } else {
      return (
        <button
          onClick={approveHandler}
          className="w-40 h-30 bg-gradient-to-r from-purple-500 to-gray-500 hover:from-purple-600 hover:to-indigo-600 text-white font-semibold py-2 px-4 rounded-md shadow"
          disabled={isApproveLoading}
        >
          {isApproveLoading ? 'Approving...' : 'Approve'}
        </button>
      );
    }
  }, [isConnected, allowance, amountUSD, approveHandler, buyHandler, isBuyLoading, isApproveLoading, presaleStatus, selectedToken]);

const changeLanguage = (lng) => {
  i18n.changeLanguage(lng);
  setIsOpen(false);
};

console.log('Buying with:', selectedToken.label, 'Amount:', amountUSD, 'Token ID:', selectedToken.id);

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
       {t("remaining")}  {ethers.utils.formatUnits(remainingTokens.toString(), 18)}
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
                    
                    {t("balance")}:<p className="bold">{ethers.utils.formatEther(balance?.toString() || "0")} {selectedToken?.label?.toUpperCase()}</p>
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
                          onClick={() => handleTokenSelection(item)}
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
                       */ value={AmountTokens}
                      onChange={handleAmountTokensChange}
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
