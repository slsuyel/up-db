/* eslint-disable @typescript-eslint/no-explicit-any */

import apiSlice from "../apiSlice";
/* /admin/sonod/list?sonod_name=নাগরিকত্ব সনদ&stutus=approved&union=test */
const sonodApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    allSonod: builder.query({
      query: ({ sonodName, stutus, token, sondId, union }) => ({
        url: `admin/sonod/list?sonod_name=${sonodName}&stutus=${stutus}&union=${union}${sondId ? `&sondId=${sondId}` : ""
          }`,
        method: "Get",
        headers: { Authorization: `Bearer ${token}` },
      }),
      providesTags: ["sonod-action"],
    }),
    singleSonod: builder.query({
      query: ({ token, id }) => ({
        url: `/admin/sonod/single/${id}`,
        method: "Get",
        headers: { Authorization: `Bearer ${token}` },
      }),
      providesTags: ["sonod-action"],
    }),

    allHolding: builder.query({
      query: ({ word, token, search }) => ({
        url: `/user/holdingtax?page=1&word=${word}${search ? `&search=${search}` : ""
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
    sonodUpdate: builder.mutation({
      query: ({ id, token, data }) => ({
        url: `/admin/sonod/update/${id}`,
        method: "PUT",
        body: data,
        headers: {
          authorization: `Bearer ${token}`,
        },
      }),
      invalidatesTags: ["sonod-action"],
    }),

    /*  */
    sonodFees: builder.mutation({
      query: ({ token, union }) => ({
        url: `/admin/sonodnamelist/with-fees?union=${union}`,
        method: "POST",
        headers: {
          authorization: `Bearer ${token}`,
        },
      }),
      // providesTags: ["sonod-fee"],
    }),
    updateSonodFees: builder.mutation({
      query: ({ token, data }) => ({
        url: `/user/sonodfees`,
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
        body: data,
      }),
      // invalidatesTags: ["sonod-fee"],
    }),

    renewPreviousHolding: builder.mutation({
      query: ({ token, union }) => ({
        url: `admin/holding-tax/Renew?unioun=${union}`,
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`
        },
      }),
      invalidatesTags: ["holding-create-update"],
    }),



  }),
});

export const {
  useAllSonodQuery,
  useSonodActionMutation,
  useAllHoldingQuery,
  useSingleHoldingQuery,
  useAddHoldingMutation,
  useSingleSonodQuery,
  useSonodUpdateMutation,
  useSonodFeesMutation,
  useUpdateSonodFeesMutation,
  useRenewPreviousHoldingMutation
} = sonodApi;
