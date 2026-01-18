/* eslint-disable @typescript-eslint/no-explicit-any */
import apiSlice from "../apiSlice";

const adminUserApi = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        getAdminUsers: builder.query({
            query: ({ token, search = "", perPage = 10, page = 1, position = "", unioun = "", division_name = "", district_name = "", upazila_name = "" }) => ({
                url: `/admin/users?search=${search}&per_page=${perPage}&page=${page}${position ? `&position=${position}` : ""}${unioun ? `&unioun=${unioun}` : ""}${division_name ? `&division_name=${division_name}` : ""}${district_name ? `&district_name=${district_name}` : ""}${upazila_name ? `&upazila_name=${upazila_name}` : ""}`,
                method: "GET",
                headers: { Authorization: `Bearer ${token}` },
            }),
            providesTags: ["sonod-action"], // Reusing sonod-action for now, can add specific tag if needed
        }),
        loginByAdmin: builder.mutation({
            query: ({ token, email }) => ({
                url: `/admin/users/login/by/admin`,
                method: "POST",
                headers: { Authorization: `Bearer ${token}` },
                body: { email },
            }),
        }),
    }),
});

export const { useGetAdminUsersQuery, useLoginByAdminMutation } = adminUserApi;
export default adminUserApi;
