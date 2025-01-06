export interface ICustomer {
    name: string;
    mobile: string;
    email: string;
    address: string;
    state: string;
    city: string;
    pin: string;
    added_from: 'admin_panel' | 'android' | 'ios' | 'web';
    app_version: string;
    id?: number;
    area_id: number;
    subarea_id: number;
    delivery_boy_id: number;
    is_active?: boolean;
    fcm?: string;
    creation_date?: string;
  }