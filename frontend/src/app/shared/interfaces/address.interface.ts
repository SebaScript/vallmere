export interface Address {
  addressId: number;
  title: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  type: 'shipping' | 'billing' | 'both';
  isDefault: boolean;
  userId: number;
}

export interface CreateAddressRequest {
  title: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  type?: 'shipping' | 'billing' | 'both';
  isDefault?: boolean;
}

export interface UpdateAddressRequest extends Partial<CreateAddressRequest> {}
