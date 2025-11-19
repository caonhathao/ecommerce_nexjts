import React, { SetStateAction } from 'react';

/**
 * A type for the query parameters object.
 * Allows string, number, or boolean values.
 */
type QueryParams = Record<string, string | number | boolean | null | undefined>;

/**
 * A generic, reusable data-fetching function.
 *
 * @param baseUrl - The base API endpoint (e.g., '/api/categories')
 * @param params - An object of query parameters (e.g., { page: 1, search: 'laptops' })
 * @param setData - The React state setter for the successfully fetched data
 */
export const fetchData = async (
  baseUrl: string,
  params: QueryParams,
  setData: React.Dispatch<SetStateAction<any>> | undefined,
  cacheType: RequestCache = 'default',
  isExport: boolean = false
) => {
  try {
    // 1. Build the URL with query parameters
    const searchParams = new URLSearchParams();

    // Iterate over the params object and append them to the URL
    Object.entries(params).forEach(([key, value]) => {
      // Only append if the value is not null or undefined
      if (value !== null && value !== undefined) {
        searchParams.append(key, String(value));
      }
    });

    // Only add '?' if there are actually parameters
    const queryString = searchParams.toString();
    const url = queryString ? `${baseUrl}?${queryString}` : baseUrl;

    // 2. Fetch the data
    const response = await fetch(url, { cache: cacheType });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `HTTP error! status: ${response.status}, message: ${errorText}`
      );
    }

    if (isExport) return response;

    const data = await response.json();

    // 3. Update state with the fetched data
    if (setData) setData(data);
  } catch (e) {
    // 4. Handle any errors
    const error = e instanceof Error ? e.message : 'An unknown error occurred';
    console.error('Failed to fetch data:', error);
  }
};

export const fetchProducts = async (
  page: number,
  limit: number,
  setData: React.Dispatch<SetStateAction<any>>
) => {
  try {
    const response = await fetch(`/api/product?page=${page}&limit=${limit}`);
    const data = await response.json();
    setData(data.data);
    console.log(data.data);
  } catch (error) {
    console.error('Error fetching products:', error);
  }
};

export const fetchReviews = async (
  setData: React.Dispatch<SetStateAction<any>>,
  id: string,
  page?: number,
  limit?: number
) => {
  try {
    const response = await fetch(
      `/api/reviews/${id}?page=${page}&limit=${limit}`
    );
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
  } catch (error) {
    console.error('Error fetching product by ID:', error);
  }
};
