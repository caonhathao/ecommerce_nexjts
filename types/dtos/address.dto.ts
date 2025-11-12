export type GetAddressResult =
  | { success: true; addresses: AddressDTO[] }
  | { success: false; error: string };

export type AddressDTO = {
  id: string;
  fullName: string;
  phone: string;
  line1: string;
  ward?: string | null;
  district?: string | null;
  city: string;
  country: string;
  isDefault: boolean;
  createAt?: string;
  updateAt?: string;
}

export type CreateAddressResult =
  | { success: true; address: AddressRequestDTO }
  | { success: false; error: string };

export interface AddressRequestDTO {
  fullName: string;
  phone: string;
  line1: string;
  ward?: string | null;
  district?: string | null;
  city: string;
  country: string;
  isDefault: boolean;
  createAt?: string;
  updateAt?: string;
}