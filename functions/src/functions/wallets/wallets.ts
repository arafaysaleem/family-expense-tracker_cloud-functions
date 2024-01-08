export interface Wallet {
    name: string
    id: string,
    icon_key: string,
    transactions_count: number,
    balance: number,
    color: string,
    description: string | undefined,
    is_enabled: boolean
}
