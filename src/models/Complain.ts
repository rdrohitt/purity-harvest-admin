export interface IComplain {
    complain_date: string;
    category: string;
    sub_category: string;
    comments?: string | null;
    remarks?: string | null;
    status: 'open' | 'in_process' | 'resolved';
    id?: number;
    customer_id: number; 
    resolution_date?: string;
  }