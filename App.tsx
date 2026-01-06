import { useEffect, useState } from 'react'
import { supabase } from './supabase'

function App() {
  const [tasks, setTasks] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  // 🔹 1. FETCH DATA (single source of truth)
  const fetchTasks = async () => {
    const { data, error } = await supabase
      .from('tasks') // ⚠️ আপনার table name যদি আলাদা হয়, এখানে change করুন
      .select('*')
      .order('id', { ascending: false })

    if (error) {
      console.log('FETCH ERROR:', error)
    } else {
      setTasks(data || [])
    }

    setLoading(false)
  }

  // 🔹 2. UPDATE DATA
  const updateTask = async (id: number) => {
    const { error } = await supabase
      .from('tasks')
      .update({ status: 'done' })
      .eq('id', id)

    if (error) {
      console.log('UPDATE ERROR:', error)
      return
    }

    // 🔥 THIS LINE FIXES YOUR WHOLE LIFE
    fetchTasks()
  }

  // 🔹 3. ON LOAD
  useEffect(() => {
    fetchTasks()
  }, [])

  if (loading) return <h2>Loading...</h2>

  return (
    <div style={{ padding: 20 }}>
      <h1>Tasks</h1>

      {tasks.length === 0 && <p>No data found</p>}

      {tasks.map(task => (
        <div key={task.id} style={{ marginBottom: 10 }}>
          <span>
            {task.title} — <b>{task.status}</b>
          </span>

          <button
            style={{ marginLeft: 10 }}
            onClick={() => updateTask(task.id)}
          >
            Mark Done
          </button>
        </div>
      ))}
    </div>
  )
}

export default App
