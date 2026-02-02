import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItem {
    id: string;
    title: string;
    price: number;
    thumbnail_url?: string;
}

interface CartStore {
    items: CartItem[];
    addItem: (item: CartItem) => void;
    removeItem: (id: string) => void;
    clearCart: () => void;
    isInCart: (id: string) => boolean;
}

export const useCartStore = create<CartStore>()(
    persist(
        (set, get) => ({
            items: [],
            addItem: (item) =>
                set((state) => {
                    if (state.items.find((i) => i.id === item.id)) {
                        return state;
                    }
                    return { items: [...state.items, item] };
                }),
            removeItem: (id) =>
                set((state) => ({ items: state.items.filter((i) => i.id !== id) })),
            clearCart: () => set({ items: [] }),
            isInCart: (id) => !!get().items.find((i) => i.id === id),
        }),
        {
            name: 'cart-storage',
        }
    )
);
