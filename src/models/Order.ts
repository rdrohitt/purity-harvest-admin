export interface IOrderItem {
  id?: number;
  quantity: number;
  packaging: 'packet' | 'bottle';
  discount?: number;
  product_id: number;
  order_id?: number;
}

export interface IOrder {
  id?: number;
  creation_date?: string;
  delivery_date?: string;
  status?: 'confirmed' | 'rejected' | 'cancelled' | 'delivered';
  customer_id: number;
  discount?: number;
  delivery_charges?: number;
  delivery_boy_id?: number | null;
  coupon_id?: number | null;
  items: IOrderItem[];
}