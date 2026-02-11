
'use client';

import { useState, useEffect } from 'react';
import { CheckSquare, Plus, Trash2, Check } from 'lucide-react';

import { createClient, Database } from "@schologic/database";

type Todo = Database['public']['Tables']['instructor_todos']['Row'];
type TodoInsert = Database['public']['Tables']['instructor_todos']['Insert'];

export default function DashboardTodo() {
    const supabase = createClient();
    const [todos, setTodos] = useState<Todo[]>([]);
    const [newTodo, setNewTodo] = useState('');
    const [loading, setLoading] = useState(true);
    const [userId, setUserId] = useState<string | null>(null);

    // Load from Supabase on mount
    useEffect(() => {
        fetchTodos();
    }, []);

    const fetchTodos = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;
            setUserId(user.id);

            const { data, error } = await supabase
                .from('instructor_todos')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false });

            if (data) {
                if (data.length === 0) {
                    // Inject Default Tasks for Onboarding
                    const defaultTasks: TodoInsert[] = [
                        { user_id: user.id, text: "Complete your instructor profile", completed: false },
                        { user_id: user.id, text: "Create your first class", completed: false },
                        { user_id: user.id, text: "Configure class settings", completed: false },
                        { user_id: user.id, text: "Create first assignment", completed: false },
                        { user_id: user.id, text: "Invite students to join your class", completed: false }
                    ];

                    const { data: newTasks, error: insertError } = await supabase
                        .from('instructor_todos')
                        .insert(defaultTasks)
                        .select();

                    if (newTasks) {
                        setTodos(newTasks);
                    }
                } else {
                    setTodos(data);
                }
            }
        } catch (error) {
            console.error('Error fetching todos:', error);
        } finally {
            setLoading(false);
        }
    };

    const addTodo = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newTodo.trim()) return;

        const text = newTodo.trim();
        setNewTodo(''); // Clear input immediately

        // Optimistic UI update
        const tempId = Date.now().toString();
        // Construct a partial-like object cast as Todo ONLY for UI temporarily
        // Note: created_at/updated_at are required by type, so we must mock them
        const optimisticTodo: Todo = {
            id: tempId,
            text,
            completed: false,
            user_id: userId || 'temp', // Fallback if userId not yet set (unlikely)
            created_at: new Date().toISOString()
        };
        setTodos([optimisticTodo, ...todos]);

        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { data, error } = await supabase
                .from('instructor_todos')
                .insert([{ user_id: user.id, text, completed: false }])
                .select()
                .single();

            if (data) {
                // Replace optimistic todo with real one
                setTodos(prev => prev.map(t => t.id === tempId ? data : t));
            } else {
                // Revert on failure
                fetchTodos();
            }
        } catch (error) {
            console.error('Error adding todo:', error);
            fetchTodos();
        }
    };

    const toggleTodo = async (id: string, currentStatus: boolean) => {
        // Optimistic UI
        setTodos(todos.map(t => t.id === id ? { ...t, completed: !currentStatus } : t));

        try {
            await supabase
                .from('instructor_todos')
                .update({ completed: !currentStatus })
                .eq('id', id);
        } catch (error) {
            console.error('Error updating todo:', error);
            fetchTodos(); // Revert
        }
    };

    const deleteTodo = async (id: string) => {
        // Optimistic UI
        setTodos(todos.filter(t => t.id !== id));

        try {
            await supabase
                .from('instructor_todos')
                .delete()
                .eq('id', id);
        } catch (error) {
            console.error('Error deleting todo:', error);
            fetchTodos(); // Revert
        }
    };

    return (
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm h-full flex flex-col">
            <h3 className="font-bold text-slate-700 flex items-center gap-2 mb-4">
                <CheckSquare className="w-5 h-5 text-emerald-500" />
                Quick Tasks
            </h3>

            {/* Input */}
            <form onSubmit={addTodo} className="relative mb-4">
                <input
                    type="text"
                    placeholder="Add a task..."
                    className="w-full pl-4 pr-10 py-3 bg-slate-50 border-none rounded-xl text-sm font-medium focus:ring-2 focus:ring-emerald-500/50 outline-none transition-all placeholder:text-slate-400"
                    value={newTodo}
                    onChange={(e) => setNewTodo(e.target.value)}
                />
                <button
                    type="submit"
                    disabled={!newTodo.trim()}
                    className="absolute right-2 top-2 p-1 bg-white shadow-sm rounded-lg text-emerald-600 hover:text-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                    <Plus className="w-5 h-5" />
                </button>
            </form>

            {/* List */}
            <div className="flex-1 overflow-y-auto pr-2 space-y-2 max-h-[250px] custom-scrollbar">
                {todos.length === 0 ? (
                    <div className="text-center py-8 text-slate-400 text-xs">
                        All clear! No tasks pending.
                    </div>
                ) : (
                    todos.map(todo => (
                        <div
                            key={todo.id}
                            className={`group flex items-start gap-1.5 p-1.5 rounded-lg transition-all ${todo.completed ? 'bg-slate-50 opacity-70' : 'bg-white border border-slate-100 hover:border-emerald-200 hover:shadow-sm'}`}
                        >
                            <button
                                onClick={() => toggleTodo(todo.id, todo.completed ?? false)}
                                className={`w-3.5 h-3.5 mt-0.5 rounded border flex items-center justify-center transition-colors flex-shrink-0 ${todo.completed ? 'bg-emerald-500 border-emerald-500' : 'border-slate-300 hover:border-emerald-400'}`}
                            >
                                {todo.completed && <Check className="w-2.5 h-2.5 text-white" />}
                            </button>

                            <span className={`flex-1 text-xs font-medium leading-tight break-words ${todo.completed ? 'text-slate-400 line-through decoration-slate-300' : 'text-slate-700'}`}>
                                {todo.text}
                            </span>

                            <button
                                onClick={() => deleteTodo(todo.id)}
                                className="opacity-0 group-hover:opacity-100 p-0.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all flex-shrink-0"
                            >
                                <Trash2 className="w-3.5 h-3.5" />
                            </button>
                        </div>
                    ))
                )}
            </div>

            {/* Footer */}
            {todos.length > 0 && (
                <div className="mt-4 pt-4 border-t border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-wider text-center">
                    {todos.filter(t => t.completed).length}/{todos.length} Completed
                </div>
            )}
        </div>
    );
}
