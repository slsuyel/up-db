/* eslint-disable @typescript-eslint/no-explicit-any */

import apiSlice from "../apiSlice";
/* /admin/sonod/list?sonod_name=নাগরিকত্ব সনদ&stutus=approved&union=test */
const sonodApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    allSonod: builder.query({
      query: ({ sonodName, stutus, token, sondId,union }) => ({
        url: `admin/sonod/list?sonod_name=${sonodName}&stutus=${stutus}$union=${union}${
          sondId ? `&sondId=${sondId}` : ""
        }`,
        method: "Get",
        headers: { Authorization: `Bearer ${token}` },
      }),
      providesTags: ["sonod-action"],
    }),

    allHolding: builder.query({
      query: ({ word, token, search }) => ({
        url: `/user/holdingtax?page=1&word=${word}${
          search ? `&search=${search}` : ""
        }`,
        method: "Get",
        headers: { Authorization: `Bearer ${token}` },
      }),
      providesTags: ["holding"],
    }),

    singleHolding: builder.query({
      query: ({ id, token }) => ({
        url: `/user/holdingtax/${id}`,
        method: "Get",
        headers: { Authorization: `Bearer ${token}` },
      }),
      providesTags: ["holding"],
    }),

    addHolding: builder.mutation({
      query: ({ data, token }) => ({
        url: `/user/holdingtax`,
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: data,
      }),
      invalidatesTags: ["holding"],
    }),

    sonodAction: builder.mutation({
      query: ({ id, token }) => ({
        url: `/user/sonod/action/${id}`,
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      }),
      invalidatesTags: ["sonod-action"],
    }),
  }),
});

export const {
  useAllSonodQuery,
  useSonodActionMutation,
  useAllHoldingQuery,
  useSingleHoldingQuery,
  useAddHoldingMutation,
} = sonodApi;
