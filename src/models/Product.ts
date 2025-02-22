export interface IProduct {
  id?: number;
  name: string;
  description: string;
  category_id: number;
  thumbnail: string;
  variants: IVariant[];
  creation_date?: string;
}

export interface IVariant {
  id?: number;
  size: string;
  price: number;
  name: string;
  discount: number;
  thumbnail: string;
  creation_date?: string;
  mrp: number;
  packaging: 'packet' | 'bottle';
  is_visible: boolean;
  images: string[];
  product_id: number;
}