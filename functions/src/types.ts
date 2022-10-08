export interface NamedEntity {
  id: number;
  name: string;
  description: string;
}

export interface Category extends NamedEntity {
  icon: string;
}

export interface County extends NamedEntity{
  icon: string;
}

export type ResourceContact = {
  id: number;
  name: string;
  typeInt: number;
  value: string;
}

export type ResourceLocation = {
  city: string;
  desc: string;
  id: number;
  state: string;
  street1: string;
  street2: string;
  zip: string;
}

export interface Resource extends NamedEntity {
  categories: number[];
  contact: ResourceContact[];
  counties: number[];
  documentation: string;
  hours: string;
  locations: ResourceLocation[];
  services: string;
  tags: string;
}

export type NamedEntityType = 'resources' | 'counties' | 'categories';
