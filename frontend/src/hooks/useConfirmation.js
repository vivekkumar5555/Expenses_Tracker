import { useState, useCallback } from 'react';

export const useConfirmation = () => {
  const [confirmation, setConfirmation] = useState(null);

  const confirm = useCallback((options) => {
    return new Promise((resolve) => {
      setConfirmation({
        ...options,
        onConfirm: () => {
          resolve(true);
          setConfirmation(null);
        },
        onCancel: () => {
          resolve(false);
          setConfirmation(null);
        },
      });
    });
  }, []);

  const closeConfirmation = useCallback(() => {
    setConfirmation(null);
  }, []);

  return { confirmation, confirm, closeConfirmation };
};

