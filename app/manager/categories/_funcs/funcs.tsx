import { deleteData } from '@/funcs/delete';
import { useTranslations } from 'next-intl';
import { Dispatch, SetStateAction } from 'react';
import { toast } from 'sonner';

export const handleDelete = async ({
  id,
  setIsReset,
}: {
  id: string;
  setIsReset: Dispatch<SetStateAction<boolean>>;
}) => {
  const t=useTranslations('admin_category_page');
  try {
    const response = await deleteData('/api/manager/category', { id });
    if (response.ok) {
      toast(t('t_action_noti'), {
        description: t('t_del_des_noti'),
      });
      setTimeout(() => {
        setIsReset((prev) => !prev);
      }, 2000);
    }
  } catch (error) {
    console.error('Failed to delete category:', error);
    toast(t('t_action_noti'), {
      description: t('t_del_des_noti'),
    });
  }
};
