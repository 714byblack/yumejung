'use client'
import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Borrower } from '@/lib/types'

function NewTransactionForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [borrowers, setBorrowers] = useState<Borrower[]>([])
  const [borrowerId, setBorrowerId] = useState(searchParams.get('borrower') ?? '')
  const [type, setType] = useState<'borrow' | 'repay'>('borrow')
  const [amount, setAmount] = useState('')
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10))
  const [note, setNote] = useState('')
  const [slip, setSlip] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    supabase.from('borrowers').select('*').order('name').then(({ data }) => {
      if (data) setBorrowers(data)
    })
  }, [])

  async function handleSubmit() {
    if (!borrowerId || !amount) return
    setLoading(true)

    let slip_url: string | null = null
    if (slip) {
      const ext = slip.name.split('.').pop()
      const path = `${borrowerId}/${Date.now()}.${ext}`
      const { error: uploadError } = await supabase.storage.from('slips').upload(path, slip)
      if (uploadError) { alert('อัปโหลดสลิปไม่ได้: ' + uploadError.message); setLoading(false); return }
      const { data } = supabase.storage.from('slips').getPublicUrl(path)
      slip_url = data.publicUrl
    }

    const { error } = await supabase.from('transactions').insert({
      borrower_id: borrowerId,
      type,
      amount: Number(amount),
      date,
      note: note || null,
      slip_url,
    })

    if (!error) router.push(borrowerId ? `/borrowers/${borrowerId}` : '/')
    else { alert('เกิดข้อผิดพลาด: ' + error.message); setLoading(false) }
  }

  return (
    <main className="max-w-md mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => router.back()} className="text-gray-400 hover:text-black">←</button>
        <h1 className="text-xl font-semibold">บันทึกรายการ</h1>
      </div>

      <div className="space-y-4">
        <div className="flex rounded-lg overflow-hidden border border-gray-200">
          {(['borrow', 'repay'] as const).map(t => (
            <button key={t} onClick={() => setType(t)}
              className={`flex-1 py-2 text-sm font-medium transition-colors
                ${type === t ? (t === 'borrow' ? 'bg-red-500 text-white' : 'bg-green-500 text-white') : 'text-gray-500'}`}>
              {t === 'borrow' ? 'ยืม' : 'คืน'}
            </button>
          ))}
        </div>

        <div>
          <label className="block text-sm text-gray-600 mb-1">คน *</label>
          <select value={borrowerId} onChange={e => setBorrowerId(e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-black">
            <option value="">-- เลือกคน --</option>
            {borrowers.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
          </select>
        </div>

        <div>
          <label className="block text-sm text-gray-600 mb-1">จำนวนเงิน (บาท) *</label>
          <input type="number" value={amount} onChange={e => setAmount(e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-black"
            placeholder="0" min="0" />
        </div>

        <div>
          <label className="block text-sm text-gray-600 mb-1">วันที่ *</label>
          <input type="date" value={date} onChange={e => setDate(e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-black" />
        </div>

        <div>
          <label className="block text-sm text-gray-600 mb-1">
            แนบสลิป {type === 'repay' && <span className="text-gray-400">(ไม่บังคับ)</span>}
          </label>
          <input type="file" accept="image/*"
            onChange={e => setSlip(e.target.files?.[0] ?? null)}
            className="w-full text-sm text-gray-500" />
          {slip && <p className="text-xs text-gray-400 mt-1">{slip.name}</p>}
        </div>

        <div>
          <label className="block text-sm text-gray-600 mb-1">หมายเหตุ</label>
          <textarea value={note} onChange={e => setNote(e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-black"
            rows={2} placeholder="บันทึกเพิ่มเติม" />
        </div>

        <button onClick={handleSubmit} disabled={loading || !borrowerId || !amount}
          className="w-full bg-black text-white py-2.5 rounded-lg disabled:opacity-40">
          {loading ? 'กำลังบันทึก...' : 'บันทึก'}
        </button>
      </div>
    </main>
  )
}

export default function NewTransactionPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-gray-400">กำลังโหลด...</div>}>
      <NewTransactionForm />
    </Suspense>
  )
}