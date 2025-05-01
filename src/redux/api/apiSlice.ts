import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const VITE_BASE_API_URL = import.meta.env.VITE_BASE_API_URL;
const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl: `${VITE_BASE_API_URL}`,
    credentials: 'include',
  }),
  // endpoints: (builder: any) => ({}),
  endpoints: () => ({}),
  tagTypes: [
    'logout',
    'profileCreate',
    'profileUpdate',
    'sonod-action',
    'holding',
    'holding_pay',
  ],
});

export default apiSlice;
