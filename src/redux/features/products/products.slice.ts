import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { productService } from '../../../services/product.service';
import { ProductListResponse } from '../../../types/product.types';

interface ProductsState {
  list: ProductListResponse | null;
  loading: boolean;
  error: string | null;
}

const initialState: ProductsState = { list: null, loading: false, error: null };

export const fetchProducts = createAsyncThunk(
  'products/fetchAll',
  async (params: Record<string, string>) => productService.list(params),
);

const productsSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchProducts.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchProducts.fulfilled, (state, action: PayloadAction<ProductListResponse>) => {
        state.loading = false;
        state.list = action.payload;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch products';
      });
  },
});

export const productsReducer = productsSlice.reducer;
export default productsSlice.reducer;
