import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface User {
  id: number | null;
  name: string | null;
  email: string | null;
  position: string | null;
  division_name: string | null;
  district_name: string | null;
  upazila_name: string | null;
  union_name: string | null;
  image: string | null;
  created_at: string | null;
  updated_at: string | null;
}

type TInitialState = {
  user: User | null;
};

const initialState: TInitialState = {
  user: null,
};

export const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUser: (state, { payload }: PayloadAction<User>) => {
      state.user = payload;
    },
    removeUser: state => {
      state.user = null;
    },
  },
});

export const { setUser, removeUser } = userSlice.actions;
export default userSlice.reducer;
