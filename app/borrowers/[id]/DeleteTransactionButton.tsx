'use client'
import { supabase } from '@/lib/supabase'

export default function DeleteTransactionButton({ id, onDeleted }: { id: string, onDeleted: () => void }) {
  async function handleDelete() {
    if (!confirm('ลบรายการนี้?')) return
    const { error } = await supabase.from('transactions').delete().eq('id', id)
    if (!error) onDeleted()
    else alert('เกิดข้อผิดพลาด: ' + error.message)
  }

  return (
    <button onClick={handleDelete} className="text-xs text-gray-300 hover:text-red-400 transition-colors">
      ลบ
    </button>
  )
}