export type Borrower = {
  id: string
  name: string
  phone: string | null
  note: string | null
  created_at: string
}

export type Transaction = {
  id: string
  borrower_id: string
  type: 'borrow' | 'repay'
  amount: number
  date: string
  slip_url: string | null
  note: string | null
  created_at: string
}

export type BorrowerSummary = Borrower & {
  total_borrowed: number
  total_repaid: number
  balance: number
}