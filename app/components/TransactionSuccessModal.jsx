// components/TransactionSuccessModal.jsx
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';

const TransactionSuccessModal = ({ isOpen, onClose, transactionHash, amountPurchased }) => {
  const { t } = useTranslation();

  if (!isOpen) return null;

  return (
    <motion.div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div 
        className="bg-white p-6 rounded-lg shadow-xl max-w-sm w-full"
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: -50, opacity: 0 }}
      >
        <h2 className="text-lg font-bold mb-4">{t('transaction-success-title')}</h2>
        <p className="mb-4">{t('transaction-success-message')}</p>
        <p>{t('transaction-hash')}</p>
        <a 
          href={`https://bscscan.com/tx/${transactionHash}`} 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-blue-600 hover:underline"
        >
          {transactionHash ? `${transactionHash.slice(0, 6)}...${transactionHash.slice(-4)}` : 'Fetching...'}
        </a>
        <p className="mt-4">{t('tokens-to-receive')} {amountPurchased || 'calculating...'} Tokens </p>
        <button 
          onClick={onClose} 
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Close
        </button>
      </motion.div>
    </motion.div>
  );
};

export default TransactionSuccessModal;