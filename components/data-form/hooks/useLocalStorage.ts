import { useState, useCallback } from 'react';

/**
 * Custom hook for persisting and retrieving data from localStorage with type safety
 */
export function useLocalStorage<T>(
  key: string,
  initialValue: T,
  options?: {
    expirationHours?: number; // Expiration in hours
    onSaveSuccess?: () => void;
    onSaveError?: (error: unknown) => void;
    onLoadError?: (error: unknown) => void;
    skipLoading?: boolean;
  }
) {
  // Initialize state with function to avoid unnecessarily parsing on every render
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === 'undefined' || options?.skipLoading) {
      return initialValue;
    }

    try {
      const item = window.localStorage.getItem(key);
      
      if (!item) {
        return initialValue;
      }

      const parsed = JSON.parse(item);
      
      // Check if data has expired
      if (options?.expirationHours && parsed.timestamp) {
        const expirationMs = options.expirationHours * 60 * 60 * 1000;
        if (Date.now() - parsed.timestamp > expirationMs) {
          // Data has expired, return initialValue
          return initialValue;
        }
      }
      
      return parsed.data;
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      if (options?.onLoadError) {
        options.onLoadError(error);
      }
      return initialValue;
    }
  });

  // Update localStorage when the state changes
  const setValue = useCallback((value: T | ((val: T) => T)) => {
    try {
      // Allow value to be a function for same API as useState
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      
      // Save to state
      setStoredValue(valueToStore);
      
      // Save to localStorage with timestamp
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(
          key,
          JSON.stringify({
            data: valueToStore,
            timestamp: Date.now()
          })
        );
        
        if (options?.onSaveSuccess) {
          options.onSaveSuccess();
        }
      }
    } catch (error) {
      console.error(`Error saving to localStorage key "${key}":`, error);
      if (options?.onSaveError) {
        options.onSaveError(error);
      }
    }
  }, [key, storedValue, options]);

  // Clear the stored value
  const removeValue = useCallback(() => {
    try {
      if (typeof window !== 'undefined') {
        window.localStorage.removeItem(key);
        setStoredValue(initialValue);
      }
    } catch (error) {
      console.error(`Error removing localStorage key "${key}":`, error);
    }
  }, [key, initialValue]);

  // Check if there's any data stored
  const hasStoredValue = useCallback(() => {
    if (typeof window === 'undefined') {
      return false;
    }
    return window.localStorage.getItem(key) !== null;
  }, [key]);

  // Expose the methods
  return { 
    value: storedValue, 
    setValue, 
    removeValue, 
    hasStoredValue 
  };
} 