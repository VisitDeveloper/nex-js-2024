import { StateCreator } from 'zustand';

export interface User {
    id?: number;
    name?: string;
}

export type UsersSlice = {
    users: User[];
    addUser: (todo?: User) => void;
    updateUser: (id?: number, newUser?: Partial<User>) => void;
    deleteUser: (id?: number) => void;
}

export const createUsersSlice: StateCreator<UsersSlice> = (set) => ({
    users: [],
    addUser: (user) => set((state) => ({
        users: [...state.users, user!],
    })),
    updateUser: (id, newUser) => set((state) => ({
        users: state.users.map((user) =>
            user.id === id ? { ...user, ...newUser } : user
        ),
    })),
    deleteUser: (id) => set((state) => ({
        users: state.users.filter((user) => user.id !== id)
    }))
});