import { StateCreator } from 'zustand';

export interface Todo {
    id: number;
    name: string;
    description?: string;
    completed: boolean;
}

export type TodosSlice = {
    todos: Todo[];
    addTodo: (todo?: Todo) => void;
    updateTodo: (id?: number, newTodo?: Partial<Todo>) => void;
    deleteTodo: (id?: number) => void;
}

export const createTodosSlice: StateCreator<TodosSlice> = (set) => ({
    todos: [],
    addTodo: (todo) => set((state) => ({
        todos: [...state.todos, todo!],
    })),
    updateTodo: (id, newTodo) => set((state) => ({
        todos: state.todos.map((todo) =>
            todo.id === id ? { ...todo, ...newTodo } : todo
        ),
    })),
    deleteTodo: (id) => set((state) => ({
        todos: state.todos.filter((todo) => todo.id !== id)
    }))
});