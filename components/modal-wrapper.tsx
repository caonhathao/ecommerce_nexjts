'use client';

import { ReactNode } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { useRouter } from 'next/navigation';

interface ModalWrapperProps {
  children: ReactNode;
  open?: boolean;
  onClose?: () => void;
}

export const ModalWrapper: React.FC<ModalWrapperProps> = ({
  children,
  open = true,
  onClose,
}) => {
  const router = useRouter();

  const handleClose = () => {
    if (onClose) {
      onClose();
    } else {
      router.back();
    }
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && handleClose()}>
      <DialogContent className="sm:max-w-md p-0 border-none">
        <div className="p-0">{children}</div>
      </DialogContent>
    </Dialog>
  );
};
