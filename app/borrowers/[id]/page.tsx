import { supabase } from '@/lib/supabase'
import { Transaction } from '@/lib/types'
import Link from 'next/link'
import { notFound } from 'next/navigation'

export default async function BorrowerPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const { data: borrower } = await supabase
    .from('borrowers').select('*').eq('id', id).single()
  if (!borrower) notFound()

  const { data: transactions } = await supabase
    .from('transactions').select('*')
    .eq('borrower_id', id).order('date', { ascending: false })

  const txs: Transaction[] = transactions ?? []
  const total_borrowed = txs.filter(t => t.type === 'borrow').reduce((s, t) => s + Number(t.amount), 0)
  const total_repaid = txs.filter(t => t.type === 'repay').reduce((s, t) => s + Number(t.amount), 0)
  const balance = total_borrowed - total_repaid

  return (
    <main className="max-w-2xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Link href="/" className="text-gray-400 hover:text-black">←</Link>
        <div className="flex-1">
          <h1 className="text-xl font-semibold">{borrower.name}</h1>
          {borrower.phone && <p className="text-sm text-gray-400">{borrower.phone}</p>}
        </div>
        <Link href={`/transactions/new?borrower=${id}`}
          className="bg-black text-white text-sm px-4 py-2 rounded-lg hover:bg-gray-800">
          + บันทึก
        </Link>
      </div>

      {/* สรุป */}
      <div className="grid grid-cols-3 gap-3 mb-8">
        <div className="bg-gray-50 rounded-xl p-3 text-center">
          <p className="text-xs text-gray-500 mb-1">ยืมทั้งหมด</p>
          <p className="font-semibold text-gray-800">฿{total_borrowed.toLocaleString()}</p>
        </div>
        <div className="bg-gray-50 rounded-xl p-3 text-center">
          <p className="text-xs text-gray-500 mb-1">คืนแล้ว</p>
          <p className="font-semibold text-green-600">฿{total_repaid.toLocaleString()}</p>
        </div>
        <div className="bg-gray-50 rounded-xl p-3 text-center">
          <p className="text-xs text-gray-500 mb-1">ค้างอยู่</p>
          <p className={`font-semibold ${balance > 0 ? 'text-red-500' : 'text-green-600'}`}>
            {balance > 0 ? `฿${balance.toLocaleString()}` : '✓ หมดแล้ว'}
          </p>
        </div>
      </div>

      {/* รายการ */}
      {txs.length === 0 ? (
        <p className="text-center text-gray-400 py-12">ยังไม่มีรายการ กด + บันทึก</p>
      ) : (
        <div className="space-y-3">
          {txs.map(t => (
            <div key={t.id}
              className="flex items-start justify-between border border-gray-100 rounded-xl px-4 py-3">
              <div className="flex items-start gap-3">
                <span className={`mt-0.5 text-xs font-medium px-2 py-0.5 rounded-full
                  ${t.type === 'borrow' ? 'bg-red-50 text-red-500' : 'bg-green-50 text-green-600'}`}>
                  {t.type === 'borrow' ? 'ยืม' : 'คืน'}
                </span>
                <div>
                  <p className="text-sm text-gray-500">{t.date}</p>
                  {t.note && <p className="text-sm text-gray-400">{t.note}</p>}
                  {t.slip_url && (
                    <a href={t.slip_url} target="_blank" rel="noreferrer"
                      className="text-xs text-blue-500 hover:underline">ดูสลิป</a>
                  )}
                </div>
              </div>
              <p className={`font-semibold ${t.type === 'borrow' ? 'text-red-500' : 'text-green-600'}`}>
                {t.type === 'borrow' ? '-' : '+'}฿{Number(t.amount).toLocaleString()}
              </p>
            </div>
          ))}
        </div>
      )}
    </main>
  )
}