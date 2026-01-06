import apiSlice from "../apiSlice";

const token = localStorage.getItem("token") || "";

export const EkpayApis = apiSlice.injectEndpoints({
    endpoints: (builder) => ({


        // get Ekpay payment report list
        getEkpayList: builder.query<{ data: any }, { unionName: string, page: number }>({
            query: ({ unionName, page }) => {
                const sanitizedUnion = unionName.replace(/\s+/g, '').toLowerCase();
                return {
                    url: `/admin/ekpay-reports/union/${sanitizedUnion}?page=${page}`,
                    headers: {
                        authorization: `Bearer ${localStorage.getItem("token")}`,
                    },
                };
            },
        }),


        // get My server amount
        getMyServerAmount: builder.query<{ data: any }, { id: string }>({
            query: ({ id }) => ({
                url: `/admin/ekpay-reports/get/server/amount/${id}`,
                headers: {
                    authorization: `Bearer ${token}`,
                },
            }),
        }),





    }),
    overrideExisting: false,
});

export const {
    useLazyGetEkpayListQuery,
    useLazyGetMyServerAmountQuery,
} = EkpayApis;

export default EkpayApis;