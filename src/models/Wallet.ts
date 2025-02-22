export interface IWallet {
    balance: number;
    autopay: boolean;
    autopay_amount: number;
    id: number;
    customer_id: number;
}