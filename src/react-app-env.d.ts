/// <reference types="react-scripts" />
interface Window {
  Telegram: {
    WebApp: {
      initDataUnsafe: {
        user?: {
          username?: string;
        };
      };
    };
  };
}