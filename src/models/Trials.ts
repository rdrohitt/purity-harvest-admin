export interface ITrial {
    packaging: 'packet' | 'bottle';
    start_date: string;
    end_date: string;
    id: number;
    offer_id: number;
    is_cod: boolean;
    product_id: number;
    customer_id: number;
    status: 'active' | 'ended' ;
  }