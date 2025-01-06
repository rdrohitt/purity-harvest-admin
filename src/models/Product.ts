export interface IProduct {
    id?: number;
    size: string;
    description: string;
    category_id: number;
    name: string;
    thumbnail: string;
    front_image: string;
    back_image: string;
    mrp: number;
    price: number;
    discount: number;
    is_visible: boolean;
    creation_date?: string;
  }