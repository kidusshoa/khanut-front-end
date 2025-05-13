import { Toast } from 'react-hot-toast';

declare global {
  interface Window {
    toast?: typeof Toast;
  }
}

export {};
