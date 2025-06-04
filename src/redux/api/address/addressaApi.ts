/* eslint-disable @typescript-eslint/no-explicit-any */

import apiSlice from "../apiSlice";
import type { TDivision, TDistrict, TUpazila } from "@/types/global";

const addressApi = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        getDivisions: builder.query<{ data: TDivision[] }, void>({
            query: () => "/global/divisions",
        }),
        getDistricts: builder.query<{ data: TDistrict[] }, string>({
            query: (divisionId) => `/global/districts/${divisionId}`,
        }),
        getUpazilas: builder.query<{ data: TUpazila[] }, string>({
            query: (districtId) => `/global/upazilas/${districtId}`,
        }),
    }),
});

export const {
    useGetDivisionsQuery,
    useGetDistrictsQuery,
    useGetUpazilasQuery,
} = addressApi;
