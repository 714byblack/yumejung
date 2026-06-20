'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function NewBorrowerPage() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [note, setNote] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit() {
    if (!name.trim()) return
    setLoading(true)
    const { error } = await supabase.from('borrowers').insert({ name: name.trim(), phone: phone || null, note: note || null })
    if (!error) router.push('/')
    else { alert('เกิดข้อผิดพลาด: ' + error.message); setLoading(false) }
  }

  return (
    <main className="max-w-md mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => router.back()} className="text-gray-400 hover:text-black">←</button>
        <h1 className="text-xl font-semibold">เพิ่มคนใหม่</h1>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm text-gray-600 mb-1">ชื่อ *</label>
          <input value={name} onChange={e => setName(e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-black"
            placeholder="ชื่อ-นามสกุล" />
        </div>
        <div>
          <label className="block text-sm text-gray-600 mb-1">เบอร์โทร</label>
          <input value={phone} onChange={e => setPhone(e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-black"
            placeholder="08x-xxx-xxxx" />
        </div>
        <div>
          <label className="block text-sm text-gray-600 mb-1">หมายเหตุ</label>
          <textarea value={note} onChange={e => setNote(e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-black"
            rows={3} placeholder="บันทึกเพิ่มเติม" />
        </div>
        <button onClick={handleSubmit} disabled={loading || !name.trim()}
          className="w-full bg-black text-white py-2.5 rounded-lg disabled:opacity-40">
          {loading ? 'กำลังบันทึก...' : 'บันทึก'}
        </button>
      </div>
    </main>
  )
}