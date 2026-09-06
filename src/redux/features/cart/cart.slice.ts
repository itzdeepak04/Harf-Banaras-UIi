import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { cartService } from '../../../services/cart.service';
import { CartSummary } from '../../../types/common.types';

interface CartState {
  cart: CartSummary;
  loading: boolean;
  error: string | null;
  couponMessage: string | null;
}

const initialState: CartState = {
  cart: { items: [], subtotal: 0, itemCount: 0 },
  loading: false,
  error: null,
  couponMessage: null,
};

export const fetchCart = createAsyncThunk('cart/fetch', async () => cartService.getCart());

export const addToCart = createAsyncThunk(
  'cart/add',
  async (payload: { productId: string; quantity?: number }) =>
    cartService.addItem(payload.productId, payload.quantity),
);

// Powers the "- qty +" stepper on product cards / cart page
export const updateCartQuantity = createAsyncThunk(
  'cart/updateQuantity',
  async (payload: { productId: string; quantity: number }) =>
    cartService.updateQuantity(payload.productId, payload.quantity),
);

export const removeFromCart = createAsyncThunk(
  'cart/remove',
  async (productId: string) => cartService.removeItem(productId),
);

export const applyCoupon = createAsyncThunk(
  'cart/applyCoupon',
  async (code: string, { rejectWithValue }) => {
    try {
      return await cartService.applyCoupon(code);
    } catch (error: any) {
      const message = error?.response?.data?.message || error?.message || 'Could not apply this coupon';
      return rejectWithValue(message);
    }
  },
);

export const removeCoupon = createAsyncThunk('cart/removeCoupon', async () => cartService.removeCoupon());

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    const setCart = (state: CartState, action: PayloadAction<CartSummary>) => {
      state.loading = false;
      state.cart = action.payload;
    };
    builder
      .addCase(fetchCart.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchCart.fulfilled, setCart)
      .addCase(addToCart.fulfilled, setCart)
      .addCase(updateCartQuantity.fulfilled, setCart)
      .addCase(removeFromCart.fulfilled, setCart)
      .addCase(applyCoupon.fulfilled, (state, action: PayloadAction<CartSummary>) => {
        state.cart = action.payload;
        state.couponMessage = null;
      })
      .addCase(applyCoupon.rejected, (state, action: any) => {
        state.couponMessage =
          action.payload || action.error?.message || 'Could not apply this coupon';
      })
      .addCase(removeCoupon.fulfilled, setCart)
      .addCase(fetchCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch cart';
      });
  },
});

export const cartReducer = cartSlice.reducer;
export default cartSlice.reducer;
