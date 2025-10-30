import { SetStateAction } from 'react';

export const fetchProducts = async (
  page: number,
  limit: number,
  setData: React.Dispatch<SetStateAction<any>>
) => {
  try {
    const response = await fetch(`/api/product?page=${page}&limit=${limit}`);
    const data = await response.json();
    setData(data.data);
  } catch (error) {
    console.error('Error fetching products:', error);
  }
};

export const fetchProductById = async (
  id: string,
  setData: React.Dispatch<SetStateAction<any>>
) => {
  try {
    const response = await fetch(`/api/product/${id}`);
    const data = await response.json();
    setData(data.data);
  }
  catch (error) {
    console.error('Error fetching product by ID:', error);
  }
};
