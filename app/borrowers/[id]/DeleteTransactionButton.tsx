'use client'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function DeleteTransactionButton({ id }: { id: string }) {
  const router = useRouter()

  async function handleDelete() {
    if (!confirm('ลบรายการนี้?')) return
    const { error } = await supabase.from('transactions').delete().eq('id', id)
    if (!error) router.refresh()
    else alert('เกิดข้อผิดพลาด: ' + error.message)
  }

  return (
    <button onClick={handleDelete}
      className="text-xs text-gray-300 hover:text-red-400 transition-colors">
      ลบ
    </button>
  )
}