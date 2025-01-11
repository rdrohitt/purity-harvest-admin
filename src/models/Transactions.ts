export interface ITransaction {
    txn_id: string;
    amount: number;
    status: 'pending' | 'success' | 'failed';
    date: string;
    id: number;
  }