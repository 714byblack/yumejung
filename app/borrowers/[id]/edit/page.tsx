'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function EditBorrowerPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter()
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [note, setNote] = useState('')
  const [loading, setLoading] = useState(false)
  const [id, setId] = useState('')

  useEffect(() => {
    params.then(({ id }) => {
      setId(id)
      supabase.from('borrowers').select('*').eq('id', id).single().then(({ data }) => {
        if (data) { setName(data.name); setPhone(data.phone ?? ''); setNote(data.note ?? '') }
      })
    })
  }, [params])

  async function handleSave() {
    if (!name.trim()) return
    setLoading(true)
    const { error } = await supabase.from('borrowers')
      .update({ name: name.trim(), phone: phone || null, note: note || null })
      .eq('id', id)
    if (!error) router.push(`/borrowers/${id}`)
    else { alert('เกิดข้อผิดพลาด: ' + error.message); setLoading(false) }
  }

  async function handleDelete() {
    if (!confirm(`ลบ "${name}" และรายการทั้งหมดของคนนี้?`)) return
    setLoading(true)
    const { error } = await supabase.from('borrowers').delete().eq('id', id)
    if (!error) router.push('/')
    else { alert('เกิดข้อผิดพลาด: ' + error.message); setLoading(false) }
  }

  return (
    <main className="max-w-md mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => router.back()} className="text-gray-400 hover:text-black">←</button>
        <h1 className="text-xl font-semibold">แก้ไขข้อมูล</h1>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm text-gray-600 mb-1">ชื่อ *</label>
          <input value={name} onChange={e => setName(e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-black" />
        </div>
        <div>
          <label className="block text-sm text-gray-600 mb-1">เบอร์โทร</label>
          <input value={phone} onChange={e => setPhone(e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-black" />
        </div>
        <div>
          <label className="block text-sm text-gray-600 mb-1">หมายเหตุ</label>
          <textarea value={note} onChange={e => setNote(e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-black"
            rows={3} />
        </div>

        <button onClick={handleSave} disabled={loading || !name.trim()}
          className="w-full bg-black text-white py-2.5 rounded-lg disabled:opacity-40">
          {loading ? 'กำลังบันทึก...' : 'บันทึก'}
        </button>

        <button onClick={handleDelete} disabled={loading}
          className="w-full border border-red-200 text-red-500 py-2.5 rounded-lg hover:bg-red-50 disabled:opacity-40">
          ลบคนนี้ออก
        </button>
      </div>
    </main>
  )
}