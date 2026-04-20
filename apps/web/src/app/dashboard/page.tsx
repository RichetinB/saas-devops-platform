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

  const completedCount = taskList.filter((task) => task.completed).length;
  const pendingCount = taskList.length - completedCount;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="mono rounded-full border border-slate-300 bg-white/70 px-5 py-2 text-sm text-slate-600">
          Loading workspace...
        </p>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen px-4 py-6 sm:px-8 sm:py-8">
      <div className="noise-overlay" />

      <div className="relative mx-auto w-full max-w-6xl space-y-6">
        <header className="glass-panel animate-fade-up rounded-3xl px-6 py-5 sm:px-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="mono text-xs uppercase tracking-[0.2em] text-slate-500">Task cockpit</p>
              <h1 className="mt-2 text-3xl font-semibold text-slate-900">Bonjour, {user?.email}</h1>
            </div>

            <button
              onClick={handleLogout}
              className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-2 text-sm font-semibold text-rose-700 transition hover:bg-rose-100"
            >
              Logout
            </button>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-slate-200 bg-white/80 px-4 py-3">
              <p className="mono text-xs uppercase tracking-wider text-slate-500">Total</p>
              <p className="mt-1 text-2xl font-semibold text-slate-900">{taskList.length}</p>
            </div>
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50/90 px-4 py-3">
              <p className="mono text-xs uppercase tracking-wider text-emerald-700">Done</p>
              <p className="mt-1 text-2xl font-semibold text-emerald-800">{completedCount}</p>
            </div>
            <div className="rounded-2xl border border-amber-200 bg-amber-50/90 px-4 py-3">
              <p className="mono text-xs uppercase tracking-wider text-amber-700">Pending</p>
              <p className="mt-1 text-2xl font-semibold text-amber-800">{pendingCount}</p>
            </div>
          </div>
        </header>

        <main className="grid gap-6 lg:grid-cols-[minmax(280px,340px),1fr]">
          <section className="glass-panel animate-fade-up-delay-1 rounded-3xl p-5 sm:p-6">
            <h2 className="text-lg font-semibold text-slate-900">Create task</h2>
            <p className="mt-1 text-sm text-slate-600">Ajoute une tache et gere son statut depuis la liste.</p>

            <form onSubmit={handleCreateTask} className="mt-5 space-y-3">
              <input
                type="text"
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                placeholder="Plan sprint review"
                className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-100"
              />
              <button
                type="submit"
                className="w-full rounded-2xl bg-teal-700 px-4 py-3 text-sm font-semibold text-white transition hover:bg-teal-800"
              >
                Add task
              </button>
            </form>

            {error && (
              <div className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                {error}
              </div>
            )}
          </section>

          <section className="glass-panel animate-fade-up-delay-2 rounded-3xl p-5 sm:p-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-900">Task list</h2>
              <span className="mono rounded-full border border-slate-300 bg-white px-3 py-1 text-xs text-slate-600">
                {taskList.length} items
              </span>
            </div>

            <div className="mt-4 space-y-3">
              {taskList.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-300 bg-white/60 px-4 py-10 text-center text-slate-500">
                  No tasks yet. Start by creating your first one.
                </div>
              ) : (
                taskList.map((task, index) => (
                  <article
                    key={task.id}
                    className="animate-fade-up flex items-start gap-3 rounded-2xl border border-slate-200 bg-white/85 px-4 py-3"
                    style={{ animationDelay: `${index * 0.06}s` }}
                  >
                    <input
                      type="checkbox"
                      checked={task.completed}
                      onChange={() => handleToggleTask(task)}
                      className="mt-1 h-4 w-4 cursor-pointer accent-teal-700"
                    />

                    <div className="min-w-0 flex-1">
                      <p
                        className={`break-words text-sm font-medium ${task.completed ? 'text-slate-400 line-through' : 'text-slate-800'}`}
                      >
                        {task.title}
                      </p>
                      <p className="mono mt-1 text-xs text-slate-500">
                        {new Date(task.createdAt).toLocaleString()}
                      </p>
                    </div>

                    <button
                      onClick={() => handleDeleteTask(task.id)}
                      className="rounded-lg px-2 py-1 text-xs font-semibold text-rose-700 transition hover:bg-rose-50"
                    >
                      Delete
                    </button>
                  </article>
                ))
              )}
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
