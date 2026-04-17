'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { tasks } from '@/lib/api';

interface Task {
  id: string;
  title: string;
  completed: boolean;
  createdAt: string;
}

interface User {
  id: string;
  email: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [taskList, setTaskList] = useState<Task[]>([]);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadTasks = useCallback(async () => {
    try {
      const data = await tasks.getAll();
      setTaskList(data);
    } catch {
      setError('Failed to load tasks');
    }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');

    if (!token) {
      router.push('/login');
      return;
    }

    if (userData) {
      setUser(JSON.parse(userData) as User);
    }

    setLoading(false);
    loadTasks();
  }, [router, loadTasks]);

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    try {
      const task = await tasks.create(newTaskTitle.trim());
      setTaskList((prev) => [task, ...prev]);
      setNewTaskTitle('');
    } catch {
      setError('Failed to create task');
    }
  };

  const handleToggleTask = async (task: Task) => {
    try {
      const updated = await tasks.update(task.id, { completed: !task.completed });
      setTaskList((prev) => prev.map((t) => (t.id === task.id ? updated : t)));
    } catch {
      setError('Failed to update task');
    }
  };

  const handleDeleteTask = async (id: string) => {
    try {
      await tasks.delete(id);
      setTaskList((prev) => prev.filter((t) => t.id !== id));
    } catch {
      setError('Failed to delete task');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm px-6 py-4 flex justify-between items-center">
        <h1 className="text-xl font-bold text-gray-900">Task Manager</h1>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-600">{user?.email}</span>
          <button
            onClick={handleLogout}
            className="text-sm text-red-600 hover:underline"
          >
            Logout
          </button>
        </div>
      </nav>

      <main className="max-w-2xl mx-auto p-6">
        {error && (
          <div className="mb-4 bg-red-50 text-red-600 p-3 rounded text-sm">{error}</div>
        )}

        <form onSubmit={handleCreateTask} className="mb-6 flex gap-2">
          <input
            type="text"
            value={newTaskTitle}
            onChange={(e) => setNewTaskTitle(e.target.value)}
            placeholder="Add a new task..."
            className="flex-1 border border-gray-300 rounded p-2 focus:border-blue-500 focus:outline-none"
          />
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Add
          </button>
        </form>

        <div className="space-y-2">
          {taskList.length === 0 ? (
            <p className="text-center text-gray-500 py-8">No tasks yet. Create one above!</p>
          ) : (
            taskList.map((task) => (
              <div
                key={task.id}
                className="bg-white rounded shadow-sm p-4 flex items-center gap-3"
              >
                <input
                  type="checkbox"
                  checked={task.completed}
                  onChange={() => handleToggleTask(task)}
                  className="h-4 w-4 cursor-pointer"
                />
                <span
                  className={`flex-1 ${task.completed ? 'line-through text-gray-400' : 'text-gray-900'}`}
                >
                  {task.title}
                </span>
                <button
                  onClick={() => handleDeleteTask(task.id)}
                  className="text-red-500 hover:text-red-700 text-sm"
                >
                  Delete
                </button>
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  );
}
