import { deleteData } from '@/funcs/delete';
import { paths } from '@/lib/path';
import { Dispatch, SetStateAction } from 'react';
import { toast } from 'sonner';

export const handleDelete = async ({
  id,
  setIsReset,
  t,
}: {
  id: string;
  setIsReset: Dispatch<SetStateAction<boolean>>;
  t: (key: string) => string;
}) => {
  try {
    const response = await deleteData({ url: paths.cateogry.del_one(id) });
    if (response.ok) {
      toast(t('t_action_noti'), {
        description: t('t_del_desc_noti'),
      });
      setTimeout(() => {
        setIsReset((prev) => !prev);
      }, 2000);
    }
  } catch (error) {
    console.error('Failed to delete category:', error);
    toast(t('t_action_noti'), {
      description: t('t_del_failed_desc_noti'),
    });
  }
};
