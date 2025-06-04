"use client"

import { useState, useEffect } from "react"
import type { MaintenanceFee, FilterState, ApiResponse } from "@/types/maintenance"

const BASE_API_URL = process.env.NEXT_PUBLIC_BASE_API_URL || ""

export function useMaintenanceFees(filters: FilterState) {
  const [data, setData] = useState<MaintenanceFee[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchData = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`${BASE_API_URL}/admin/maintance-fees/maintenance/unpaid-unions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type: filters.type === "all" ? undefined : filters.type,
          period: filters.period === "all" ? undefined : filters.period,
          status: filters.status === "all" ? undefined : filters.status,
          upazila_name: filters.upazila_name === "all" ? undefined : filters.upazila_name,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to fetch data")
      }

      const result: ApiResponse = await response.json()

      if (result.isError) {
        throw new Error(result.error || "API returned an error")
      }

      setData(result.data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [filters])

  return { data, loading, error, refetch: fetchData }
}
