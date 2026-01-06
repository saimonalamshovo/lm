import { useEffect, useState } from 'react'
import { supabase } from './supabase'

export default function App() {
  const [data, setData] = useState<any>({})
  const [loading, setLoading] = useState(true)

  // 🔥 FETCH app_data WHERE id = 'main'
  const fetchData = async () => {
    const { data, error } = await supabase
      .from('app_data')
      .select('data')
      .eq('id', 'main')
      .single()

    if (error) {
      console.error('FETCH ERROR:', error)
      return
    }

    setData(data?.data || {})
    setLoading(false)
  }

  // 🔥 UPDATE JSONB DATA
  const updateData = async () => {
    const newData = {
      ...data,
      updatedFromUI: new Date().toISOString(),
    }

    const { error } = await supabase
      .from('app_data')
      .update({ data: newData })
      .eq('id', 'main')

    if (error) {
      console.error('UPDATE ERROR:', error)
      return
    }

    // 💣 THIS LINE IS THE SYNC FIX
    fetchData()
  }

  useEffect(() => {
    fetchData()
  }, [])

  if (loading) return <h2>Loading...</h2>

  return (
    <div style={{ padding: 20 }}>
      <h1>App Data</h1>

      <pre
        style={{
          background: '#111',
          color: '#0f0',
          padding: 10,
          borderRadius: 6,
        }}
      >
        {JSON.stringify(data, null, 2)}
      </pre>

      <button
        style={{ marginTop: 10, padding: '6px 12px' }}
        onClick={updateData}
      >
        Update Data
      </button>
    </div>
  )
}
