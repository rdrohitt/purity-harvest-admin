export interface IPickupItem {
    quantity: number;
    picked_up: number;
    type?: "subscription" | "order";
    is_modified?: boolean;
    id: number;
    product_id: number;
    pickup_id: number;
  }
  
 export interface IPickup {
    id: number;
    items: IPickupItem[];
    pickup_date: string;
    delivery_boy_id: number | null;
  }