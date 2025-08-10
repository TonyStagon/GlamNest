/// <reference types="vite/client" />

/**
 * @typedef YocoSDK
 * @property {(options: {publicKey: string}) => ({
 *   showPopup: (options: {
 *     amountInCents: number;
 *     currency: string;
 *     name: string;
 *     description: string;
 *     callback: (result: {error?: {message: string}, id?: string}) => void
 *   }) => void
 * })} new
 */

/* Make these types available globally via JSDoc */
/**
 * @typedef {{
 *   YocoSDK: typeof YocoSDK
 * }} WindowWithYoco
 */

/**
 * @typedef {Window & WindowWithYoco} Window
 */

interface YocoSDKType {
  new(options: { publicKey: string }): {
    showPopup(options: {
      amountInCents: number;
      currency: string;
      name: string;
      description: string;
      callback: (result: { error?: { message: string }; id?: string }) => void;
    }): void;
  };
}

declare global {
  interface Window {
    YocoSDK: YocoSDKType;
  }
}

interface ImportMetaEnv {
  readonly VITE_STRIPE_PUBLISHABLE_KEY: string
  readonly VITE_STRIPE_SECRET_KEY: string
  readonly VITE_FIREBASE_API_KEY: string
  readonly VITE_FIREBASE_AUTH_DOMAIN: string
  readonly VITE_FIREBASE_PROJECT_ID: string
  readonly VITE_FIREBASE_STORAGE_BUCKET: string
  readonly VITE_FIREBASE_MESSAGING_SENDER_ID: string
  readonly VITE_FIREBASE_APP_ID: string
  readonly VITE_ADMIN_EMAIL: string
  readonly VITE_ADMIN_PASSWORD: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}