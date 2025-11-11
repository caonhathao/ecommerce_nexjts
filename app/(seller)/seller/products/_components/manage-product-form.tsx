"use client";

import { FormProvider, useForm } from 'react-hook-form';
import { ManageProductFormInput } from './productSchema';
import { ProductAttachments } from './product-attachments';
import { ProductDescription } from './product-description';
import { ProductGeneralInfo } from './product-general-info';
import { ProductSettings } from './product-setting';

type iAppProps = {
  product?: ManageProductFormInput;
  onSubmit: (productData: ManageProductFormInput) => void;
  isLoading?: boolean;
};

export default function ManageProductForm({ product, onSubmit, isLoading }: iAppProps) {
  const formMethods = useForm<ManageProductFormInput>({
    mode: 'onBlur',
    defaultValues: product || {
      title: '',
      slug: '',
      origin: null,
      description: null,
      status: 'DRAFT',
      visibility: 'PUBLIC',
      attributes: null,
      categoryId: null,
      currency: 'VND',
      shopId: undefined,
      images: [],
      variants: [],
      tags: [],
    },
  });

  const { handleSubmit, reset } = formMethods;

  const handleFormSubmit = (data: ManageProductFormInput) => {
    onSubmit(data);
    reset();
  };

  return (
    <FormProvider {...formMethods}>
      <form onSubmit={handleSubmit(handleFormSubmit)}>
        <ProductGeneralInfo />
        <ProductDescription />
        <ProductSettings />
        <ProductAttachments />
      </form>
    </FormProvider>
  );
};
