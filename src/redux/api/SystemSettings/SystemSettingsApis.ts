/* eslint-disable @typescript-eslint/no-explicit-any */

import apiSlice from "../apiSlice";
// import type { TSystemSetting, TSystemSettings } from "@/types/systemSettings";

const token = localStorage.getItem("token") || "";

export const SystemSettingsApis = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        // GET single setting by key: /api/admin/system-setting?key=...
        getSystemSetting: builder.query<{ data: any }, string>({
            query: (key) => ({
                url: "/admin/system-setting",
                params: { key },
                headers: {
                    authorization: `Bearer ${token}`,
                },
            }),
            // providesTags: (result, error, key) => [{ type: "SystemSetting", id: key }],
        }),

        // Update single setting (POST { key, value } )
        updateSystemSetting: builder.mutation<{ data: any }, { key: string; value: any }>({
            query: ({ key, value }) => ({
                url: "/admin/system-setting",
                method: "POST",
                body: { key, value },
                headers: {
                    authorization: `Bearer ${token}`,
                },
            }),
            // invalidatesTags: (result, error, arg) => [{ type: "SystemSetting", id: arg.key }],
        }),

        // Bulk update: expects { settings: { key1: value1, key2: value2, ... } }
        // Adjust URL/method to fit your backend (remove if backend doesn't support bulk).
        updateMultipleSettings: builder.mutation<{ data: any }, Record<string, any>>({
            query: ({settings}) => ({
            url: "/admin/system-setting",
            method: "POST",
            body: settings,
            headers: {
                authorization: `Bearer ${token}`,
            },
            }),
            // invalidate a LIST tag so you can re-fetch lists if you add list endpoints
            // invalidatesTags: [{ type: "SystemSetting", id: "LIST" }],
        }),
    }),
    overrideExisting: false, // set true if you want to override previously injected endpoints
});

export const {
    useGetSystemSettingQuery,
    useUpdateSystemSettingMutation,
    useUpdateMultipleSettingsMutation,
} = SystemSettingsApis ;

export default SystemSettingsApis ;
