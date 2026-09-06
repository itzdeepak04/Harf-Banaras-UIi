import { configureStore } from '@reduxjs/toolkit';
import { authReducer } from './features/auth/auth.slice';
import { productsReducer } from './features/products/products.slice';
import { cartReducer } from './features/cart/cart.slice';
import { wishlistReducer } from './features/wishlist/wishlist.slice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    products: productsReducer,
    cart: cartReducer,
    wishlist: wishlistReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
