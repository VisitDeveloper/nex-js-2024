import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { TodosSlice , createTodosSlice } from './slices/todo-slice';
import { UsersSlice , createUsersSlice } from './slices/user-slice';

// type StoreState = TodosSlice; // اگر اسلایس‌های دیگر دارید، آنها را اینجا اضافه کنید.
type StoreState = TodosSlice & UsersSlice;

export const useTodoStore = create<StoreState>()(
    persist(
        (...a) => ({
            ...createTodosSlice(...a),
            ...createUsersSlice(...a)
        }),
        {
            name: 'food-storage', // name of the item in the storage (must be unique)
        },
    ),
);
