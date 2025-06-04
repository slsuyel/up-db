// "use client"

// import { useEffect, useState, type ChangeEvent, useCallback } from "react"
// import type { TDivision, TDistrict, TUpazila } from "@/types/global"
// import { useAppSelector } from "@/redux/features/hooks"
// import type { RootState } from "@/redux/features/store"

// type UpazilasSelectorProps = {
//   onUpazilaChange: (upazila: TUpazila | null) => void
// }

// const UpazilaSelector = ({ onUpazilaChange }: UpazilasSelectorProps) => {
//   const user = useAppSelector((state: RootState) => state.user.user)
//   const [divisions, setDivisions] = useState<TDivision[]>([])
//   const [districts, setDistricts] = useState<TDistrict[]>([])
//   const [upazilas, setUpazilas] = useState<TUpazila[]>([])

//   const [selectedDivision, setSelectedDivision] = useState<TDivision | null>(null)
//   const [selectedDistrict, setSelectedDistrict] = useState<TDistrict | null>(null)
//   const [selectedUpazila, setSelectedUpazila] = useState<TUpazila | null>(null)

//   // Move BASE_API_URL outside component or use useMemo to avoid dependency issues
//   const BASE_API_URL = import.meta.env.VITE_BASE_API_URL

//   // Memoize user properties to avoid unnecessary re-renders
//   const userDivisionName = user?.division_name
//   const userDistrictName = user?.district_name
//   const userUpazilaName = user?.upazila_name

//   // Fetch divisions effect
//   useEffect(() => {
//     const fetchDivisions = async () => {
//       try {
//         const response = await fetch(`${BASE_API_URL}/global/divisions`)
//         const data: { data: TDivision[] } = await response.json()
//         const divisionList = data.data
//         setDivisions(divisionList)

//         if (userDivisionName) {
//           const found = divisionList.find((d) => d.name === userDivisionName)
//           if (found) {
//             setSelectedDivision(found)
//             try {
//               localStorage.setItem("selectedDivision", JSON.stringify(found))
//             } catch (error) {
//               console.warn("Failed to save division to localStorage:", error)
//             }
//           }
//         }
//       } catch (error) {
//         console.error("Failed to fetch divisions:", error)
//       }
//     }

//     fetchDivisions()
//   }, [BASE_API_URL, userDivisionName])

//   // Fetch districts effect
//   useEffect(() => {
//     const fetchDistricts = async () => {
//       if (!selectedDivision) return

//       try {
//         const response = await fetch(`${BASE_API_URL}/global/districts/${selectedDivision.id}`)
//         const data: { data: TDistrict[] } = await response.json()
//         const filtered = data.data
//         console.log("Districts:", filtered)
//         setDistricts(filtered)

//         if (userDistrictName) {
//           const found = filtered.find((d) => d.name === userDistrictName)
//           if (found) {
//             setSelectedDistrict(found)
//             try {
//               localStorage.setItem("selectedDistrict", JSON.stringify(found))
//             } catch (error) {
//               console.warn("Failed to save district to localStorage:", error)
//             }
//           }
//         }
//       } catch (error) {
//         console.error("Failed to fetch districts:", error)
//       }
//     }

//     fetchDistricts()
//   }, [selectedDivision, BASE_API_URL, userDistrictName])

//   // Fetch upazilas effect
//   useEffect(() => {
//     const fetchUpazilas = async () => {
//       if (!selectedDistrict) return

//       try {
//         const response = await fetch(`${BASE_API_URL}/global/upazilas/${selectedDistrict.id}`)
//         const data: { data: TUpazila[] } = await response.json()
//         const filtered = data.data
//         setUpazilas(filtered)

//         if (userUpazilaName) {
//           const found = filtered.find((u) => u.name === userUpazilaName)
//           if (found) {
//             setSelectedUpazila(found)
//             try {
//               localStorage.setItem("selectedUpazila", JSON.stringify(found))
//             } catch (error) {
//               console.warn("Failed to save upazila to localStorage:", error)
//             }
//           }
//         }
//       } catch (error) {
//         console.error("Failed to fetch upazilas:", error)
//       }
//     }

//     fetchUpazilas()
//   }, [selectedDistrict, BASE_API_URL, userUpazilaName])

//   // Clear districts when division changes
//   useEffect(() => {
//     if (selectedDivision) {
//       setDistricts([])
//       setSelectedDistrict(null)
//       setSelectedUpazila(null)
//     }
//   }, [selectedDivision])

//   // Clear upazilas when district changes
//   useEffect(() => {
//     if (selectedDistrict) {
//       setUpazilas([])
//       setSelectedUpazila(null)
//     }
//   }, [selectedDistrict])

//   // Memoized event handlers to prevent unnecessary re-renders
//   const handleDivisionChange = useCallback(
//     (e: ChangeEvent<HTMLSelectElement>) => {
//       console.log("Division changed:", e.target.value)
//       const division = divisions.find((d) => d.id.toString() === e.target.value)
//       setSelectedDivision(division || null)
//       setSelectedDistrict(null)
//       setSelectedUpazila(null)
//       onUpazilaChange(null)
//     },
//     [divisions, onUpazilaChange],
//   )

//   const handleDistrictChange = useCallback(
//     (e: ChangeEvent<HTMLSelectElement>) => {
//       const district = districts.find((d) => d.id.toString() === e.target.value)
//       setSelectedDistrict(district || null)
//       setSelectedUpazila(null)
//       onUpazilaChange(null)
//     },
//     [districts, onUpazilaChange],
//   )

//   const handleUpazilaChange = useCallback(
//     (e: ChangeEvent<HTMLSelectElement>) => {
//       const upazila = upazilas.find((u) => u.id.toString() === e.target.value)
//       setSelectedUpazila(upazila || null)
//       onUpazilaChange(upazila || null)
//     },
//     [upazilas, onUpazilaChange],
//   )

//   return (
//     <div className="card shadow-sm mb-4">
//       <div className="card-body">
//         <div className="row g-3">
//           <div className="col-md-4">
//             <label className="form-label fw-semibold">বিভাগ</label>
//             <select
//               className="form-select"
//               value={selectedDivision?.id || ""}
//               disabled={!!userDivisionName}
//               onChange={handleDivisionChange}
//             >
//               <option value="">নির্বাচন করুন</option>
//               {divisions.map((d) => (
//                 <option key={d.id} value={d.id}>
//                   {d.bn_name}
//                 </option>
//               ))}
//             </select>
//           </div>
//           <div className="col-md-4">
//             <label className="form-label fw-semibold">জেলা</label>
//             <select
//               className="form-select"
//               value={selectedDistrict?.id || ""}
//               disabled={!!userDistrictName}
//               onChange={handleDistrictChange}
//             >
//               <option value="">নির্বাচন করুন</option>
//               {districts.map((d) => (
//                 <option key={d.id} value={d.id}>
//                   {d.bn_name}
//                 </option>
//               ))}
//             </select>
//           </div>
//           <div className="col-md-4">
//             <label className="form-label fw-semibold">উপজেলা</label>
//             <select
//               className="form-select"
//               value={selectedUpazila?.id || ""}
//               disabled={!!userUpazilaName}
//               onChange={handleUpazilaChange}
//             >
//               <option value="">নির্বাচন করুন</option>
//               {upazilas.map((u) => (
//                 <option key={u.id} value={u.id}>
//                   {u.bn_name}
//                 </option>
//               ))}
//             </select>
//           </div>
//         </div>
//       </div>
//     </div>
//   )
// }

// export default UpazilaSelector

import { useGetDistrictsQuery, useGetDivisionsQuery, useGetUpazilasQuery } from "@/redux/api/address/addressaApi"


import { useEffect, useState, type ChangeEvent, useCallback, useMemo } from "react"
import type { TDivision, TDistrict, TUpazila } from "@/types/global"
import { useAppSelector } from "@/redux/features/hooks"
import type { RootState } from "@/redux/features/store"

type UpazilasSelectorProps = {
    onUpazilaChange: (upazila: TUpazila | null) => void
}

const UpazilaSelector = ({ onUpazilaChange }: UpazilasSelectorProps) => {
    const user = useAppSelector((state: RootState) => state.user.user)

    const [selectedDivision, setSelectedDivision] = useState<TDivision | null>(null)
    const [selectedDistrict, setSelectedDistrict] = useState<TDistrict | null>(null)
    const [selectedUpazila, setSelectedUpazila] = useState<TUpazila | null>(null)

    // Memoize user properties to avoid unnecessary re-renders
    const userDivisionName = user?.division_name
    const userDistrictName = user?.district_name
    const userUpazilaName = user?.upazila_name

    // RTK Query hooks
    const { data: divisionsData, isLoading: divisionsLoading, error: divisionsError } = useGetDivisionsQuery()

    const {
        data: districtsData,
        isLoading: districtsLoading,
        error: districtsError,
    } = useGetDistrictsQuery(selectedDivision?.id || "", {
        skip: !selectedDivision?.id,
    })

    const {
        data: upazilasData,
        isLoading: upazilasLoading,
        error: upazilasError,
    } = useGetUpazilasQuery(selectedDistrict?.id || "", {
        skip: !selectedDistrict?.id,
    })

    // Extract data from RTK Query responses with memoization
    const divisions = useMemo(() => divisionsData?.data || [], [divisionsData?.data])
    const districts = useMemo(() => districtsData?.data || [], [districtsData?.data])
    const upazilas = useMemo(() => upazilasData?.data || [], [upazilasData?.data])

    // Set initial division based on user data
    useEffect(() => {
        if (divisions.length > 0 && userDivisionName && !selectedDivision) {
            const found = divisions.find((d) => d.name === userDivisionName)
            if (found) {
                setSelectedDivision(found)
                try {
                    localStorage.setItem("selectedDivision", JSON.stringify(found))
                } catch (error) {
                    console.warn("Failed to save division to localStorage:", error)
                }
            }
        }
    }, [divisions, userDivisionName, selectedDivision])

    // Set initial district based on user data
    useEffect(() => {
        if (districts.length > 0 && userDistrictName && !selectedDistrict) {
            const found = districts.find((d) => d.name === userDistrictName)
            if (found) {
                setSelectedDistrict(found)
                try {
                    localStorage.setItem("selectedDistrict", JSON.stringify(found))
                } catch (error) {
                    console.warn("Failed to save district to localStorage:", error)
                }
            }
        }
    }, [districts, userDistrictName, selectedDistrict])

    // Set initial upazila based on user data
    useEffect(() => {
        if (upazilas.length > 0 && userUpazilaName && !selectedUpazila) {
            const found = upazilas.find((u) => u.name === userUpazilaName)
            if (found) {
                setSelectedUpazila(found)
                try {
                    localStorage.setItem("selectedUpazila", JSON.stringify(found))
                } catch (error) {
                    console.warn("Failed to save upazila to localStorage:", error)
                }
            }
        }
    }, [upazilas, userUpazilaName, selectedUpazila])

    // Reset dependent selections when parent changes
    useEffect(() => {
        setSelectedDistrict(null)
        setSelectedUpazila(null)
        onUpazilaChange(null)
    }, [selectedDivision, onUpazilaChange])

    useEffect(() => {
        setSelectedUpazila(null)
        onUpazilaChange(null)
    }, [selectedDistrict, onUpazilaChange])

    // Event handlers
    const handleDivisionChange = useCallback(
        (e: ChangeEvent<HTMLSelectElement>) => {
            console.log("Division changed:", e.target.value)
            const division = divisions.find((d) => d.id.toString() === e.target.value)
            setSelectedDivision(division || null)
        },
        [divisions],
    )

    const handleDistrictChange = useCallback(
        (e: ChangeEvent<HTMLSelectElement>) => {
            const district = districts.find((d) => d.id.toString() === e.target.value)
            setSelectedDistrict(district || null)
        },
        [districts],
    )

    const handleUpazilaChange = useCallback(
        (e: ChangeEvent<HTMLSelectElement>) => {
            const upazila = upazilas.find((u) => u.id.toString() === e.target.value)
            setSelectedUpazila(upazila || null)
            onUpazilaChange(upazila || null)
        },
        [upazilas, onUpazilaChange],
    )

    // Error handling
    if (divisionsError) {
        console.error("Failed to fetch divisions:", divisionsError)
    }
    if (districtsError) {
        console.error("Failed to fetch districts:", districtsError)
    }
    if (upazilasError) {
        console.error("Failed to fetch upazilas:", upazilasError)
    }

    return (
        <div className="row mx-auto g-3">
            <div className="col-md-4">
                <label className="form-label fw-semibold">বিভাগ</label>
                <select
                    className="form-select"
                    value={selectedDivision?.id || ""}
                    disabled={!!userDivisionName || divisionsLoading}
                    onChange={handleDivisionChange}
                >
                    <option value="">{divisionsLoading ? "লোড হচ্ছে..." : "নির্বাচন করুন"}</option>
                    {divisions.map((d) => (
                        <option key={d.id} value={d.id}>
                            {d.bn_name}
                        </option>
                    ))}
                </select>
                {divisionsError && <div className="text-danger small mt-1">বিভাগ লোড করতে সমস্যা হয়েছে</div>}
            </div>

            <div className="col-md-4">
                <label className="form-label fw-semibold">জেলা</label>
                <select
                    className="form-select"
                    value={selectedDistrict?.id || ""}
                    disabled={!!userDistrictName || districtsLoading || !selectedDivision}
                    onChange={handleDistrictChange}
                >
                    <option value="">{districtsLoading ? "লোড হচ্ছে..." : "নির্বাচন করুন"}</option>
                    {districts.map((d) => (
                        <option key={d.id} value={d.id}>
                            {d.bn_name}
                        </option>
                    ))}
                </select>
                {districtsError && <div className="text-danger small mt-1">জেলা লোড করতে সমস্যা হয়েছে</div>}
            </div>

            <div className="col-md-4">
                <label className="form-label fw-semibold">উপজেলা</label>
                <select
                    className="form-select"
                    value={selectedUpazila?.id || ""}
                    disabled={!!userUpazilaName || upazilasLoading || !selectedDistrict}
                    onChange={handleUpazilaChange}
                >
                    <option value="">{upazilasLoading ? "লোড হচ্ছে..." : "নির্বাচন করুন"}</option>
                    {upazilas.map((u) => (
                        <option key={u.id} value={u.id}>
                            {u.bn_name}
                        </option>
                    ))}
                </select>
                {upazilasError && <div className="text-danger small mt-1">উপজেলা লোড করতে সমস্যা হয়েছে</div>}
            </div>
        </div>
    )
}

export default UpazilaSelector
