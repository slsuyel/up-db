"use client"

import type React from "react"
import { useState, useEffect, ReactNode } from "react"
import "bootstrap/dist/css/bootstrap.min.css"

interface UnionInfo {
  short_name_e: any
  id: number
  full_name: string
  thana: string
  district: string
  u_code: string
  AKPAY_MER_REG_ID: string
  AKPAY_MER_PASS_KEY: string
  chairman_phone: string
  secretary_phone: string
  udc_phone: string
  user_phone: string
  ekpay_amount?: number | null
  server_amount?: number | null
}

interface UnionFormData {
  full_name: ReactNode
  id: number
  short_name_e: string
  ekpay_amount: string
  server_amount: string
}

interface EkpayReportDetail {
  union: string
  ekpay_amount: number
  server_amount: number
}

interface EkpayReport {
  date: {
    start_date: string
    end_date: string
  }
  details: EkpayReportDetail[]
}

const EkpayReports: React.FC = () => {
  const [startDate, setStartDate] = useState<string>("")
  const [endDate, setEndDate] = useState<string>("")
  const [upazilaId, setUpazilaId] = useState<string>("399") // Default to 399 as shown in the example
  const [unionList, setUnionList] = useState<UnionInfo[]>([])
  const [unionFormData, setUnionFormData] = useState<UnionFormData[]>([])
  const [reportData] = useState<EkpayReport | null>(null)
  const [isLoading] = useState<boolean>(false)
  const [isUnionLoading, setIsUnionLoading] = useState<boolean>(false)
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
  const [token, setToken] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  // Get token from localStorage when component mounts
  useEffect(() => {
    const storedToken = localStorage.getItem(`token`)
    setToken(storedToken)
  }, [])

  // Initialize form data when union list changes
  useEffect(() => {
    if (unionList.length > 0) {
      const initialFormData = unionList.map((union) => ({
        id: union.id,
        short_name_e: union.short_name_e,
        full_name: union.full_name, // Include full_name property
        // Set ekpay_amount to server_amount by default if available
        ekpay_amount: union.ekpay_amount?.toString() || union.server_amount?.toString() || "",
        server_amount: union.server_amount?.toString() || "",
      }))
      setUnionFormData(initialFormData)
    }
  }, [unionList])

  const fetchUnionList = async () => {
    if (!upazilaId || !token || !startDate || !endDate) {
      if (!startDate || !endDate) {
        setError("Please select start date and end date first")
      }
      return
    }

    setIsUnionLoading(true)
    setError(null)
    setSuccess(null)
    try {
      const response = await fetch(`https://api.uniontax.gov.bd/api/admin/upazilas/${upazilaId}/uniouninfo`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          start_date: startDate,
          end_date: endDate,
        }),
      })

      if (!response.ok) {
        throw new Error(`Failed to fetch union list: ${response.status}`)
      }

      const data = await response.json()
      // Check if the response has a data property, otherwise use the response directly
      const unions = Array.isArray(data.data) ? data.data : data
      setUnionList(unions)
      console.log("Union List:", unions)
    } catch (error) {
      console.error("Error fetching union list:", error)
      setError("Failed to fetch union list. Please try again.")
    } finally {
      setIsUnionLoading(false)
    }
  }

  const handleInputChange = (id: number, field: "ekpay_amount" | "server_amount", value: string) => {
    setUnionFormData((prevData) => prevData.map((union) => (union.id === id ? { ...union, [field]: value } : union)))
  }

  // Function to ensure ekpay_amount has a value before submission
  const prepareFormDataForSubmission = () => {
    return unionFormData.map((union) => {
      const unionInfo = unionList.find((u) => u.id === union.id)
      // If ekpay_amount is empty, use server_amount
      const ekpayAmount = union.ekpay_amount || unionInfo?.server_amount?.toString() || "0"

      return {
        ...union,
        ekpay_amount: ekpayAmount,
      }
    })
  }

  const handleSubmitReport = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!startDate || !endDate || unionFormData.length === 0 || !token) {
      return
    }

    setIsSubmitting(true)
    setError(null)
    setSuccess(null)

    try {
      // Prepare form data with default values applied
      const preparedFormData = prepareFormDataForSubmission()
      console.log("Prepared Form Data:", preparedFormData)

      // Format the data according to the required payload structure
      const details = preparedFormData
        .filter((union) => union.ekpay_amount && union.server_amount) // Only include unions with both amounts
        .map((union) => ({
          union: union.short_name_e,
          ekpay_amount: Number.parseFloat(union.ekpay_amount),
          server_amount: Number.parseFloat(union.server_amount),
        }))

      console.log("Details:", details)

      if (details.length === 0) {
        throw new Error("Please enter at least one union's ekpay and server amounts")
      }

      const payload = [
        {
          date: {
            start_date: startDate,
            end_date: endDate,
          },
          details,
        },
      ]

      console.log("Submitting payload:", payload)

      // Uncomment this to actually submit the data
      const response = await fetch("https://api.uniontax.gov.bd/api/admin/ekpay-reports", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        throw new Error(`Failed to submit report data: ${response.status}`)
      }

      const data = await response.json()
      console.log("Report submission response:", data)
      setSuccess("Report data submitted successfully!")

 
    } catch (error) {
      console.error("Error submitting report data:", error)
      setError(error instanceof Error ? error.message : "Failed to submit report data. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="container-fluid py-4">
      <div className="card">
        <div className="card-header">
          <h4 className="card-title">Ekpay Reports</h4>
        </div>
        <div className="card-body">
          {!token ? (
            <div className="alert alert-danger" role="alert">
              Authentication token not found. Please login again.
            </div>
          ) : (
            <>
              {error && (
                <div className="alert alert-danger" role="alert">
                  {error}
                </div>
              )}
              {success && (
                <div className="alert alert-success" role="alert">
                  {success}
                </div>
              )}
              <form>
                <div className="row mb-4">
                  {/* Start Date Picker */}
                  <div className="col-md-4 mb-3">
                    <label htmlFor="start_date" className="form-label">
                      Start Date
                    </label>
                    <input
                      type="date"
                      className="form-control"
                      id="start_date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      required
                    />
                  </div>

                  {/* End Date Picker */}
                  <div className="col-md-4 mb-3">
                    <label htmlFor="end_date" className="form-label">
                      End Date
                    </label>
                    <input
                      type="date"
                      className="form-control"
                      id="end_date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      required
                    />
                  </div>

                  {/* Upazila ID Input */}
                  <div className="col-md-4 mb-3">
                    <label htmlFor="upazila_id" className="form-label">
                      Upazila ID
                    </label>
                    <div className="input-group">
                      <input
                        type="text"
                        className="form-control"
                        id="upazila_id"
                        value={upazilaId}
                        onChange={(e) => setUpazilaId(e.target.value)}
                        placeholder="Enter Upazila ID"
                        required
                      />
                      <button
                        type="button"
                        className="btn btn-outline-secondary"
                        onClick={fetchUnionList}
                        disabled={!upazilaId || !startDate || !endDate || isUnionLoading}
                      >
                        {isUnionLoading ? (
                          <>
                            <span
                              className="spinner-border spinner-border-sm me-1"
                              role="status"
                              aria-hidden="true"
                            ></span>
                            Loading...
                          </>
                        ) : (
                          "Get Unions"
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </form>
            </>
          )}

          {/* Union List Table with Input Fields */}
          {unionFormData.length > 0 && (
            <div className="mt-4">
              <h5 className="mb-3">Union List for Upazila ID: {upazilaId}</h5>
              <form onSubmit={handleSubmitReport}>
                <div className="table-responsive">
                  <table className="table table-bordered table-striped table-hover">
                    <thead className="table-light">
                      <tr>
                        <th>ID</th>
                        <th>Union Name</th>
                        <th>Thana</th>
                        <th>Ekpay Id</th>
                        <th className="text-left">Server Amount</th>
                        <th className="text-left">Ekpay Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {unionFormData.map((union) => {
                        // Find the corresponding union info from unionList
                        const unionInfo = unionList.find((u) => u.id === union.id)
                        const serverAmount = unionInfo?.server_amount || 0

                        return (
                          <tr key={union.id}>
                            <td>{union.id}</td>
                            <td>{union.full_name}</td>
                            <td>{unionInfo?.thana || ""}</td>
                            <td>{unionInfo?.AKPAY_MER_REG_ID || ""}</td>
                            <td>{serverAmount}</td>
                            <td>
                              <input
                                type="text"
                                className="form-control text-left"
                                value={union.ekpay_amount}
                                onChange={(e) => {
                                  const value = e.target.value
                                  if (/^\d*\.?\d*$/.test(value)) {
                                    handleInputChange(union.id, "ekpay_amount", value)
                                  }
                                }}
                                placeholder={`Enter amount (default: ${serverAmount})`}
                              />
                              {!union.ekpay_amount && (
                                <small className="text-muted">
                                  Will use server amount ({serverAmount}) if left empty
                                </small>
                              )}
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>

                <div className="d-flex justify-content-between mt-3">
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={!startDate || !endDate || unionFormData.length === 0 || isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
                        Submitting...
                      </>
                    ) : (
                      "Submit Report Data"
                    )}
                  </button>

        
                </div>
              </form>
            </div>
          )}

          {/* Report Data Table */}
          {reportData && (
            <div className="mt-4">
              <h5 className="mb-3">
                Ekpay Report ({reportData.date.start_date} to {reportData.date.end_date})
              </h5>
              <div className="table-responsive">
                <table className="table table-bordered table-striped table-hover">
                  <thead className="table-light">
                    <tr>
                      <th>Union</th>
                      <th className="text-end">Ekpay Amount</th>
                      <th className="text-end">Server Amount</th>
                      <th className="text-end">Difference</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reportData.details.map((detail, index) => (
                      <tr key={index}>
                        <td>{detail.union}</td>
                        <td className="text-end">৳{detail.ekpay_amount.toFixed(2)}</td>
                        <td className="text-end">৳{detail.server_amount.toFixed(2)}</td>
                        <td className="text-end">৳{(detail.ekpay_amount - detail.server_amount).toFixed(2)}</td>
                      </tr>
                    ))}
                    <tr className="fw-bold table-secondary">
                      <td>Total</td>
                      <td className="text-end">
                        ৳{reportData.details.reduce((sum, detail) => sum + detail.ekpay_amount, 0).toFixed(2)}
                      </td>
                      <td className="text-end">
                        ৳{reportData.details.reduce((sum, detail) => sum + detail.server_amount, 0).toFixed(2)}
                      </td>
                      <td className="text-end">
                        ৳
                        {reportData.details
                          .reduce((sum, detail) => sum + (detail.ekpay_amount - detail.server_amount), 0)
                          .toFixed(2)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default EkpayReports
