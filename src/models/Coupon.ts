export interface ICoupon {
    code: string;
    min_order_value: number;
    discount: number;
    max_discount: number;
    expiry_date: string;
    id?: number;
    creation_date?: string;
  }