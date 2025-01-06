export interface IDeliveriesItem {
    qty_ordered: number;
    qty_delivered: number;
    price: number;
    is_modified: boolean;
    status: string;
    type: string;
    id?: number;
    product_id: number;
    order_id: number;
    subscription_id: number;
}

export interface IDeliveries {
    date: string;
    bottles_collected: number;
    amount_collected: number;
    discount: number;
    status: string;
    id?: number;
    customer_id: number;
    delivery_boy_id: number;
    items: IDeliveriesItem[];
}