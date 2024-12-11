/* eslint-disable @typescript-eslint/no-explicit-any */

import apiSlice from "../apiSlice";

// Ensure the endpoint is unique and avoid calling injectEndpoints more than once
const authApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    userSignup: builder.mutation({
      query: ({ data }) => ({
        url: `/auth/user/register`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["profileCreate"] as any,
    }),

    userLogin: builder.mutation({
      query: ({ email, password }) => ({
        url: `/auth/admin/login`,
        method: "POST",
        body: { email, password },
      }),
      invalidatesTags: ["profileCreate"] as any,
    }),
    adminReport: builder.mutation({
      query: ({ token, data }) => ({
        url: `/admin/reports/get-reports`,
        method: "POST",
        headers: {
          authorization: `Bearer ${token}`,
        },
        body: data,

      }),
      invalidatesTags: ["profileCreate"] as any,
    }),

    tokenCheck: builder.query({
      query: ({ token }) => ({
        url: `/auth/admin/check-token`,
        headers: { Authorization: `Bearer ${token}` },
      }),
    }),

    dashboardMetrics: builder.query({
      query: ({ token }) => ({
        url: `/user/dashboard/metrics`,
        headers: { Authorization: `Bearer ${token}` },
      }),
    }),

    resetPassLink: builder.mutation({
      query: ({ data }) => ({
        url: `/user/password/email`,
        method: "POST",
        body: data,
      }),
    }),

    resetPassword: builder.mutation({
      query: ({ data }) => ({
        url: `/user/password/reset`,
        method: "POST",
        body: data,
      }),
    }),

    myProfile: builder.query({
      query: ({ token }) => ({
        url: `/user/profile`,
        headers: {
          authorization: `Bearer ${token}`,
        },
      }),
      providesTags: ["profileUpdate", "profileCreate", "logout"] as any,
    }),

    updateProfile: builder.mutation({
      query: ({ token, data }) => ({
        url: `/user/profile`,
        method: "post",
        headers: {
          authorization: `Bearer ${token}`,
        },
        body: data,
      }),
      invalidatesTags: ["profileUpdate"],
    }),

    logout: builder.mutation({
      query: ({ token }) => ({
        url: `/auth/admin/logout`,
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      }),
      invalidatesTags: ["logout"] as any,
    }),

    changePassword: builder.mutation({
      query: ({ token, data }) => ({
        url: `/auth/user/change-password`,
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: data,
      }),
    }),
  }),
});

export const {
  useUserSignupMutation,
  useUserLoginMutation,
  useTokenCheckQuery,
  useResetPasswordMutation,
  useLogoutMutation,
  useMyProfileQuery,
  useDashboardMetricsQuery,
  useUpdateProfileMutation,
  useResetPassLinkMutation,
  useChangePasswordMutation,
  useAdminReportMutation
} = authApi;


