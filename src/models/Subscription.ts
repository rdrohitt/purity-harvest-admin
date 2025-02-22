export interface ISubscription {
    price: number;
    quantity: number;
    type: 'prepaid' | 'postpaid';
    packaging: 'packet' | 'bottle';
    frequency: 'daily' | 'weekly' | 'monthly' | 'alternate_days' | 'custom';
    week: string;
    discount: number;
    start_date: string;
    end_date: string | null;
    id?: number;
    is_active: boolean;
    product_id: number;
    variant_id: number;
    customer_id: number;
    cancelation_reason: string;
    is_modified?: false;
    modified_by?: 'customer' | 'delivery_boy' | 'admin'
}