import React, { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  isDangerous?: boolean;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  onConfirm,
  onCancel,
  isDangerous = false,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg p-6 max-w-sm w-full mx-4">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{title}</h2>
        <p className="text-gray-600 dark:text-gray-300 mb-6">{message}</p>
        <div className="flex gap-3 justify-end">
          <Button
            variant="outline"
            onClick={onCancel}
          >
            {cancelText}
          </Button>
          <Button
            onClick={onConfirm}
            className={isDangerous ? 'bg-red-600 hover:bg-red-700' : ''}
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </div>
  );
};

interface PromptDialogProps {
  isOpen: boolean;
  title: string;
  placeholder?: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: (value: string) => void;
  onCancel: () => void;
}

export const PromptDialog: React.FC<PromptDialogProps> = ({
  isOpen,
  title,
  placeholder = 'Enter text...',
  confirmText = 'OK',
  cancelText = 'Cancel',
  onConfirm,
  onCancel,
}) => {
  const [inputValue, setInputValue] = useState('');

  if (!isOpen) return null;

  const handleConfirm = () => {
    onConfirm(inputValue);
    setInputValue('');
  };

  const handleCancel = () => {
    setInputValue('');
    onCancel();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg p-6 max-w-sm w-full mx-4">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">{title}</h2>
        <Input
          placeholder={placeholder}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleConfirm();
            if (e.key === 'Escape') handleCancel();
          }}
          autoFocus
        />
        <div className="flex gap-3 justify-end mt-6">
          <Button
            variant="outline"
            onClick={handleCancel}
          >
            {cancelText}
          </Button>
          <Button onClick={handleConfirm}>
            {confirmText}
          </Button>
        </div>
      </div>
    </div>
  );
};

/**
 * Custom hook for managing confirm dialogs
 * Usage: const { showConfirm } = useConfirm();
 *        showConfirm('Delete?', 'This cannot be undone', () => { // do something 
 */
export const useConfirm = () => {
  const [dialog, setDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    onCancel: () => void;
    isDangerous?: boolean;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => { },
    onCancel: () => { },
  });

  const showConfirm = (
    title: string,
    message: string,
    onConfirm: () => void,
    isDangerous = false
  ) => {
    setDialog({
      isOpen: true,
      title,
      message,
      onConfirm: () => {
        onConfirm();
        setDialog((prev) => ({ ...prev, isOpen: false }));
      },
      onCancel: () => setDialog((prev) => ({ ...prev, isOpen: false })),
      isDangerous,
    });
  };

  return {
    dialog,
    showConfirm,
    ConfirmDialog: (
      <ConfirmDialog
        isOpen={dialog.isOpen}
        title={dialog.title}
        message={dialog.message}
        onConfirm={dialog.onConfirm}
        onCancel={dialog.onCancel}
        isDangerous={dialog.isDangerous}
      />
    ),
  };
};

/**
 * Custom hook for managing prompt dialogs
 * Usage: const { showPrompt } = usePrompt();
 *        showPrompt('Enter your name:', (value) => { console.log(value) })
 */
export const usePrompt = () => {
  const [dialog, setDialog] = useState<{
    isOpen: boolean;
    title: string;
    placeholder?: string;
    onConfirm: (value: string) => void;
    onCancel: () => void;
  }>({
    isOpen: false,
    title: '',
    placeholder: 'Enter text...',
    onConfirm: () => { },
    onCancel: () => { },
  });

  const showPrompt = (
    title: string,
    onConfirm: (value: string) => void,
    placeholder = 'Enter text...'
  ) => {
    setDialog({
      isOpen: true,
      title,
      placeholder,
      onConfirm: (value) => {
        onConfirm(value);
        setDialog((prev) => ({ ...prev, isOpen: false }));
      },
      onCancel: () => setDialog((prev) => ({ ...prev, isOpen: false })),
    });
  };

  return {
    dialog,
    showPrompt,
    PromptDialog: (
      <PromptDialog
        isOpen={dialog.isOpen}
        title={dialog.title}
        placeholder={dialog.placeholder}
        onConfirm={dialog.onConfirm}
        onCancel={dialog.onCancel}
      />
    ),
  };
};
