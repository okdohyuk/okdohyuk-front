import { BaseException } from '@api/BlogReply';

// This helper takes 't' function from useTranslation hook
export const getErrorMessage = (error: any, t: any): string => {
  if (error?.response?.data) {
    const data = error.response.data as BaseException;
    if (data.code) {
      // Try mapping by code
      const key = `error.${data.code}`;
      // Verify key existance is tricky with simple t function, but i18next usually returns key if not found.
      // We can just try to translate. If returns key, maybe fallback?
      // Standard i18next returns key.
      const msg = t(key);
      if (msg !== key) return msg;
    }
    // Fallback to backend message or generic
    return data.errorMessage || t('error.unknown');
  }
  return t('error.unknown');
};
