import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { authService } from '../../../services/auth.service';
import { User } from '../../../types/common.types';

interface AuthState {
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: JSON.parse(localStorage.getItem('hb_user') || 'null'),
  token: localStorage.getItem('hb_token'),
  loading: false,
  error: null,
};

export const login = createAsyncThunk(
  'auth/login',
  async (payload: { identifier: string; password: string }) => authService.login(payload),
);

export const register = createAsyncThunk(
  'auth/register',
  async (payload: { name: string; email?: string; mobile?: string; password: string }) =>
    authService.register(payload),
);

export const restoreSession = createAsyncThunk('auth/restoreSession', async () => authService.getProfile());

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout(state) {
      state.user = null;
      state.token = null;
      localStorage.removeItem('hb_token');
      localStorage.removeItem('hb_user');
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action: PayloadAction<any>) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        localStorage.setItem('hb_token', action.payload.token);
        localStorage.setItem('hb_user', JSON.stringify(action.payload.user));
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Login failed';
      })
      .addCase(register.fulfilled, (state, action: PayloadAction<any>) => {
        state.user = action.payload.user;
        state.token = action.payload.token;
        localStorage.setItem('hb_token', action.payload.token);
        localStorage.setItem('hb_user', JSON.stringify(action.payload.user));
      })
      .addCase(restoreSession.fulfilled, (state, action: PayloadAction<User>) => {
        state.user = action.payload;
        localStorage.setItem('hb_user', JSON.stringify(action.payload));
      })
      .addCase(restoreSession.rejected, (state) => {
        state.user = null;
        state.token = null;
        localStorage.removeItem('hb_token');
        localStorage.removeItem('hb_user');
      });
  },
});

export const { logout } = authSlice.actions;
export const authReducer = authSlice.reducer;
export default authSlice.reducer;
