export interface ITrial {
    packaging: 'packet' | 'bottle';
    start_date: string;
    end_date: string;
    id: number;
    offer_id: number;
    product_id: number;
    customer_id: number;
    status: 'active' | 'ended' ;
  }