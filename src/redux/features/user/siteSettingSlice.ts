import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// Define the type for the data items
interface DataItem {
  id: number;
  key: string;
  value: string;
  created_at: string | null;
  updated_at: string | null;
}

// Define the state structure for site settings
interface SiteSettingState {
  data: DataItem[];  // To store the full data
  isUnion: boolean;   // To store the union flag
}

// Initial state
const initialState: SiteSettingState = {
  data: [],
  isUnion: false,
};

// Create the slice
const siteSettingSlice = createSlice({
  name: 'siteSetting',
  initialState,
  reducers: {
    // Action to set data
    setData: (state, action: PayloadAction<DataItem[]>) => {
      state.data = action.payload;
    },
    // Action to set the union flag
    setIsUnion: (state, action: PayloadAction<boolean>) => {
      state.isUnion = action.payload;
    }
  }
});

// Export actions
export const { setData, setIsUnion } = siteSettingSlice.actions;

// Export the reducer
export default siteSettingSlice.reducer;
