export interface NamedEntity {
  id: number;
  name: string;
  name_lower: string;
  description: string;
}

export interface Category extends NamedEntity {
  icon: string;
  resources: string[] | null;
}

export interface County extends NamedEntity {
  icon: string;
}

export type ResourceContact = {
  name: string;
  typeInt: number;
  value: string;
}

export type ResourceLocation = {
  city: string;
  desc: string;
  state: string;
  street1: string;
  street2: string;
  zip: string;
}

export interface Resource extends NamedEntity {
  categories?: number[];
  categoryKeys?: string[];
  contact?: ResourceContact[];
  counties?: number[];
  countyKeys?: string[];
  documentation?: string;
  hours?: string;
  locations?: ResourceLocation[];
  services?: string;
  tags?: string;
}

export type NamedEntityType = 'resources' | 'counties' | 'categories';

export type Validator<T> = {
  [key in keyof Required<T>]: {
    required: boolean;
    validate: (obj: any, parent: T) => void;
  };
};

export type UserRole = 'user' | 'admin';
