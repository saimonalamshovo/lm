import { useEffect, useState } from 'react'
import { supabase } from './supabase'

type Task = {
  id: number
  title: string
  status: string
}

export default function App() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)

  // 🔥 FETCH (single source of truth)
  const fetchTasks = async () => {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .order('id', { ascending: false })

    if (error) {
      console.error('FETCH ERROR:', error)
      return
    }

    setTasks(data || [])
    setLoading(false)
  }

  // 🔥 UPDATE
  const markDone = async (id: number) => {
    const { error } = await supabase
      .from('tasks')
      .update({ status: 'done' })
      .eq('id', id)

    if (error) {
      console.error('UPDATE ERROR:', error)
      return
    }

    // 💣 THIS IS THE SYNC FIX
    fetchTasks()
  }

  useEffect(() => {
    fetchTasks()
  }, [])

  if (loading) return <h2>Loading...</h2>

  return (
    <div style={{ padding: 20 }}>
      <h1>Tasks</h1>

      {tasks.length === 0 && <p>No data</p>}

      {tasks.map(task => (
        <div key={task.id} style={{ marginBottom: 10 }}>
          <span>
            {task.title} — <b>{task.status}</b>
          </span>

          {task.status !== 'done' && (
            <button
              style={{ marginLeft: 10 }}
              onClick={() => markDone(task.id)}
            >
              Mark Done
            </button>
          )}
        </div>
      ))}
    </div>
  )
}
