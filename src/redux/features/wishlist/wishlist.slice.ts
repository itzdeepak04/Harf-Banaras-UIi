import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { wishlistService } from '../../../services/wishlist.service';
import { Product } from '../../../types/product.types';

interface WishlistState {
  products: Product[];
  loading: boolean;
  error: string | null;
}

const initialState: WishlistState = { products: [], loading: false, error: null };

export const fetchWishlist = createAsyncThunk('wishlist/fetch', async () => wishlistService.get());

export const addToWishlist = createAsyncThunk(
  'wishlist/add',
  async (productId: string) => wishlistService.add(productId),
);

export const removeFromWishlist = createAsyncThunk(
  'wishlist/remove',
  async (productId: string) => wishlistService.remove(productId),
);

const wishlistSlice = createSlice({
  name: 'wishlist',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    const setList = (state: WishlistState, action: PayloadAction<{ products: Product[] }>) => {
      state.loading = false;
      state.products = action.payload.products;
    };
    builder
      .addCase(fetchWishlist.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchWishlist.fulfilled, setList)
      .addCase(addToWishlist.fulfilled, setList)
      .addCase(removeFromWishlist.fulfilled, setList)
      .addCase(fetchWishlist.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch wishlist';
      });
  },
});

export const wishlistReducer = wishlistSlice.reducer;
export default wishlistSlice.reducer;
