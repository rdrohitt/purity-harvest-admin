import { ICustomer } from "./Customer";
import { IDeliveryPartner } from "./DeliveryPartner";

export interface DeliveryItem {
    qty_ordered: number;
    qty_delivered: number;
    price: number;
    is_modified: boolean;
    status: string;
    type: 'subscription' | 'order';
    subscription_id?: number | null;
    product_id: number;
    id?: number | null;
    modified_item_id?: number | null;
    order_id?: number | null;
    delivery_id?: number | null;
  }
  
  export interface IDelivery {
    status: string;
    customer_id: number;
    delivery_boy_id: number;
    date: string;
    bottles_collected: number;
    amount_collected: number;
    discount: number;
    id?: number | null;
    items: DeliveryItem[];
  }
  
  export interface IDeliverySheet {
    delivery_boy: IDeliveryPartner;
    deliveries: {
      customer: ICustomer;
      delivery: IDelivery;
    }[];
  }