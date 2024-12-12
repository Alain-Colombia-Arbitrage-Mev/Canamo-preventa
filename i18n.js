import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

const resources = {
  en: {
    translation: {
      "revoluciona": "USVP Token: 🏛️💎 Transform your investments into luxury properties. Premium real estate's future, today. 🏆",
      "Billetera": "First all, Connect your Wallet",
      "presale-title": "USVP Pre-Sale",
      "Escoger Token": "Choose Token",
      "Comprar Ahora": "Buy Now",
      "progress-date": "Progress and Date",
      "sale-ends-in": "Sale ends in:",
      "timer": "07 days, 19 hours y 16 mins",
      "sold": "Sold:",
      "remaining": "Remaining:",
      "target": "Target:",
      "visit-website": "Visit Website",
      "Referral System": "Referral System",
      "share-link": "Share your referral link and instantly earn 5% in your wallet for each referred token purchase. The referral cash will be paid in the same token used for payment, USDT, USDC, or WBNB.",
      "copy-link": "Copy link",
      "informacion": "Token Info",
      "current-balance": "Current Balance:",
      "tokensventa": "Tokens for Sale:",
      "precio": "Price:",
      "comprarahora": "Buy Now",
      "balance": " Balance:",
      "select-payment": "Select payment method:",
      "enter-amount": "Enter Amount in",
      "total-raix": "Total USVP to receive:",
      "transaction-notice": "* Please press the button twice, the first time is to approve the transaction and the second time to complete the purchase."
    }
  },
  sp: {
    translation: {
      "revoluciona": "Token USVP: 🏛️💎 Transforma tus inversiones en propiedades de lujo. El futuro del real estate premium, hoy. 🏆",
      "Billetera": "Primero que todo, conecte su  Billetera",
      "presale-title": "Preventa de USVP",
      "Escoger Token": "Escoger Token",
      "Comprar Ahora": "Comprar Ahora",
      "progress-date": "Progreso y Fecha",
      "sale-ends-in": "La venta termina en:",
      "timer": "07 días, 19 horas y 16 minutos",
      "sold": "Vendido:",
      "remaining": "Restantes:",
      "target": "Meta:",
      "visit-website": "Visitar sitio Web",
      "Referral System": "Sistema de Referidos",
      "share-link": "Comparte tu link y obtén el 5% instantáneamente en tu billetera por cada compra referida de token. El efectivo del referido será pagado en el mismo token que haya sido usado para pagar, USDT, USDC o WBNB.",
      "copy-link": "Copiar link",
      "informacion": "Token Info",
      "precio": "Precio:",
      "comprarahora": "Comprar Ahora",
      "current-balance": "Balance actual:",
      "balance": "Balance:",
      "select-payment": "Seleccionar medio de pago:",
      "enter-amount": "Ingresar Cantidad en",
      "total-raix": "Total USVP a recibir:",
      "tokensventa": "Tokens en Venta:",
      "transaction-notice": "* Por favor presione el botón dos veces, la primera vez es para aprobar la transacción y la segunda para realizar la compra."
    }
  },
  zh: {
    translation: {
      "revoluciona": "USVP Token：🏛️💎 将您的投资转化为豪华房产。今日开启优质房地产的未来。🏆",
      "Billetera": "连接钱包",
      "presale-title": "USVP 预售",
      "Escoger Token": "选择代币",
      "Comprar Ahora": "立即购买",
      "progress-date": "进度和日期",
      "sale-ends-in": "销售结束时间：",
      "timer": "07天，19小时，16分钟",
      "sold": "已售：",
      "remaining": "剩余：",
      "target": "目标：",
      "visit-website": "访问网站",
      "Referral System": "推荐系统",
      "share-link": "分享您的推荐链接，每次推荐购买代币即可立即获得5%的钱包奖励。推荐奖励将以支付时使用的相同代币支付，USDT、USDC或WBNB。",
      "copy-link": "复制链接",
      "informacion": "代币信息",
      "current-balance": "当前余额：",
      "tokensventa": "销售代币：",
      "precio": "价格：",
      "comprarahora": "立即购买",
      "balance": "余额：",
      "select-payment": "选择支付方式：",
      "enter-amount": "输入金额",
      "total-raix": "将获得的USVP总量：",
      "transaction-notice": "* 请按两次按钮，第一次是批准交易，第二次是完成购买。"
    }
  },
  ar: {
    translation: {
      "revoluciona": "رمز USVP: 🏛️💎 حوّل استثماراتك إلى عقارات فاخرة. مستقبل العقارات الفاخرة، اليوم. 🏆",
      "Billetera": "ربط المحفظة",
      "presale-title": "البيع المسبق لـ USVP",
      "Escoger Token": "اختر الرمز",
      "Comprar Ahora": "اشترِ الآن",
      "progress-date": "التقدم والتاريخ",
      "sale-ends-in": "ينتهي البيع في:",
      "timer": "07 أيام، 19 ساعة و 16 دقيقة",
      "sold": "تم البيع:",
      "remaining": "المتبقي:",
      "target": "الهدف:",
      "visit-website": "زيارة الموقع",
      "Referral System": "نظام الإحالة",
      "share-link": "شارك رابط الإحالة الخاص بك واحصل فوراً على 5% في محفظتك عن كل عملية شراء للرمز من خلال الإحالة. سيتم دفع مكافأة الإحالة بنفس الرمز المستخدم للدفع، USDT أو USDC أو WBNB.",
      "copy-link": "نسخ الرابط",
      "informacion": "معلومات الرمز",
      "current-balance": "الرصيد الحالي:",
      "tokensventa": "الرموز المعروضة للبيع:",
      "precio": "السعر:",
      "comprarahora": "اشترِ الآن",
      "balance": "الرصيد:",
      "select-payment": "اختر طريقة الدفع:",
      "enter-amount": "أدخل المبلغ بـ",
      "total-raix": "إجمالي USVP للاستلام:",
      "transaction-notice": "* يرجى الضغط على الزر مرتين، المرة الأولى للموافقة على المعاملة والمرة الثانية لإتمام الشراء."
    }
  },
  ru: {
    translation: {
      "revoluciona": "Токен USVP: 🏛️💎 Преврати свои инвестиции в элитную недвижимость. Будущее премиальной недвижимости уже сегодня. 🏆",
      "Billetera": "Подключить кошелек",
      "presale-title": "Предпродажа USVP",
      "Escoger Token": "Выбрать токен",
      "Comprar Ahora": "Купить сейчас",
      "progress-date": "Прогресс и дата",
      "sale-ends-in": "Продажа заканчивается через:",
      "timer": "07 дней, 19 часов и 16 минут",
      "sold": "Продано:",
      "remaining": "Осталось:",
      "target": "Цель:",
      "visit-website": "Посетить сайт",
      "Referral System": "Реферальная система",
      "share-link": "Поделитесь своей реферальной ссылкой и мгновенно получайте 5% на свой кошелек за каждую покупку токенов по вашей рекомендации. Реферальное вознаграждение будет выплачиваться в том же токене, который использовался для оплаты: USDT, USDC или WBNB.",
      "copy-link": "Копировать ссылку",
      "informacion": "Информация о токене",
      "current-balance": "Текущий баланс:",
      "tokensventa": "Токены на продажу:",
      "precio": "Цена:",
      "comprarahora": "Купить сейчас",
      "balance": "Баланс:",
      "select-payment": "Выберите способ оплаты:",
      "enter-amount": "Введите сумму в",
      "total-raix": "Всего USVP к получению:",
      "transaction-notice": "* Пожалуйста, нажмите кнопку дважды: первый раз для подтверждения транзакции, второй раз для завершения покупки."
    }
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    lng: 'en',
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
  });

const i18nfile = i18n;
export default i18nfile;