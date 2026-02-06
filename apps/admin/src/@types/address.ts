export interface Address {
  id: number;
  zipCode: string;
  streetName?: string;
  number?: string;
  complement?: string;
  neighborhood?: string;
  city: string;
  state: string;
  country: string;
  createdAt: Date;
  updatedAt: Date;
}
