import { useTranslations } from 'next-intl';
import { useCallback } from 'react';
import { FaCheck } from 'react-icons/fa';
import { IoMdCloseCircle } from 'react-icons/io';
import { toast } from 'sonner';

export const useCopyToClipboard = ({
  t,
}: {
  t: ReturnType<typeof useTranslations>;
}) => {
  const copy = useCallback(
    async (value: string) => {
      if (!value) {
        toast(t('t_action_failed_noti'), {
          description: t('t_copy_failed_desc_noti'),
          duration: 3000,
          icon: <IoMdCloseCircle />,
          cancel: {
            label: 'OK',
            onClick: () => {},
          },
        });
        return false;
      }

      try {
        await navigator.clipboard.writeText(value);

        toast(t('t_action_noti'), {
          description: t('t_copy_desc_noti'),
          duration: 3000,
          icon: <FaCheck />,
          cancel: { label: 'OK', onClick: () => {} },
        });
        return true;
      } catch (err) {
        toast(t('t_action_failed_noti'), {
          description: t('t_copy_failed_desc_noti'),
          duration: 3000,
          icon: <IoMdCloseCircle />,
          cancel: { label: 'OK', onClick: () => {} },
        });
        console.error('Failed to copy: ', err);
        return false;
      }
    },
    [t]
  );

  return copy;
};
