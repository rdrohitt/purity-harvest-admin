export interface ISubscription {
    name: string;
    price: number;
    quantity: number;
    packaging: 'packet' | 'bottle';
    frequency: 'daily' | 'weekly' | 'monthly' | 'alternate_days' | 'custom';
    week: string;
    discount: number;
    start_date: string;
    end_date: string | null;
    id?: number;
    image: string;
    is_active: boolean;
    product_id: number;
    customer_id: number;
}