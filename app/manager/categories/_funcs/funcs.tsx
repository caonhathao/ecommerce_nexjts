import { deleteData } from '@/funcs/delete';
import { Dispatch, SetStateAction } from 'react';
import { toast } from 'sonner';

export const handleDelete = async ({
  id,
  setIsReset,
}: {
  id: string;
  setIsReset: Dispatch<SetStateAction<boolean>>;
}) => {
  try {
    const response = await deleteData('/api/manager/category', { id });
    if (response.ok) {
      toast('Xóa thành công', {
        description: 'Đã xóa danh mục sản phẩm.',
      });
      setTimeout(() => {
        setIsReset((prev) => !prev);
      }, 2000);
    }
  } catch (error) {
    console.error('Failed to delete category:', error);
    toast('Xóa thất bại', {
      description: 'Không thể xóa danh mục.',
    });
  }
};
