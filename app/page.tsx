'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { BorrowerSummary } from '@/lib/types'
import Link from 'next/link'

export default function DashboardPage() {
  const [summaries, setSummaries] = useState<BorrowerSummary[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const { data: borrowers } = await supabase.from('borrowers').select('*').order('created_at')
      const { data: transactions } = await supabase.from('transactions').select('*')
      if (!borrowers || !transactions) return
      const result = borrowers.map(b => {
        const txs = transactions.filter(t => t.borrower_id === b.id)
        const total_borrowed = txs.filter(t => t.type === 'borrow').reduce((s, t) => s + Number(t.amount), 0)
        const total_repaid = txs.filter(t => t.type === 'repay').reduce((s, t) => s + Number(t.amount), 0)
        return { ...b, total_borrowed, total_repaid, balance: total_borrowed - total_repaid }
      })
      setSummaries(result)
      setLoading(false)
    }
    load()
  }, [])

  const totalBalance = summaries.reduce((s, b) => s + b.balance, 0)
  const activeCount = summaries.filter(b => b.balance > 0).length

  return (
    <main className="max-w-2xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Yumejung</h1>
        <Link href="/borrowers/new"
          className="bg-black text-white text-sm px-4 py-2 rounded-lg hover:bg-gray-800">
          + เพิ่มคน
        </Link>
      </div>

      {loading ? (
        <p className="text-center text-gray-400 py-16">กำลังโหลด...</p>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3 mb-8">
            <div className="bg-gray-50 rounded-xl p-4">
              <p className="text-sm text-gray-500">ยอดค้างรวม</p>
              <p className="text-2xl font-semibold text-red-500">฿{totalBalance.toLocaleString()}</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-4">
              <p className="text-sm text-gray-500">ค้างอยู่กี่คน</p>
              <p className="text-2xl font-semibold">{activeCount} คน</p>
            </div>
          </div>

          {summaries.length === 0 ? (
            <p className="text-center text-gray-400 py-16">ยังไม่มีรายชื่อ กด + เพิ่มคนได้เลย</p>
          ) : (
            <div className="space-y-3">
              {summaries.map(b => (
                <Link key={b.id} href={`/borrowers/${b.id}`}
                  className="flex items-center justify-between bg-white border border-gray-100 rounded-xl px-4 py-3 hover:border-gray-300 transition-colors">
                  <div>
                    <p className="font-medium">{b.name}</p>
                    <p className="text-sm text-gray-400">
                      ยืม ฿{b.total_borrowed.toLocaleString()} · คืน ฿{b.total_repaid.toLocaleString()}
                    </p>
                  </div>
                  <p className={`font-semibold ${b.balance > 0 ? 'text-red-500' : 'text-green-600'}`}>
                    {b.balance > 0 ? `ค้าง ฿${b.balance.toLocaleString()}` : '✓ คืนหมดแล้ว'}
                  </p>
                </Link>
              ))}
            </div>
          )}
        </>
      )}
    </main>
  )
}