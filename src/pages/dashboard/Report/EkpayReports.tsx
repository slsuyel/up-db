"use client"

import { message } from "antd"
import "bootstrap/dist/css/bootstrap.min.css"
import type React from "react"
import { useEffect, useState, type ReactNode } from "react"
import AddressSelection from "../../../components/reusable/AddressSelection"
import "../../../styles/ekpay-reports.css"

import { Link } from "react-router-dom"

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

// Update the UnionReport interface to match the actual API response structure
interface UnionReport {
  id: number
  union: string
  start_date: string
  end_date: string
  ekpay_amount: string
  server_amount: string
  difference_amount: string
  created_at: string
  updated_at: string
}

const EkpayReports: React.FC = () => {
  const [startDate, setStartDate] = useState<string>("")
  const [endDate, setEndDate] = useState<string>("")
  const [upazilaId, setUpazilaId] = useState<string>("399") // Default to 399 as shown in the example
  const [unionList, setUnionList] = useState<UnionInfo[]>([])
  const [unionFormData, setUnionFormData] = useState<UnionFormData[]>([])
  const [reportData] = useState<EkpayReport | null>(null)
  const [] = useState<boolean>(false)
  const [isUnionLoading, setIsUnionLoading] = useState<boolean>(false)
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
  const [token, setToken] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'unionList' | 'unionReports'>('unionList')

  // Union reports state
  const [selectedUnion, setSelectedUnion] = useState<string>("")
  const [unionReports, setUnionReports] = useState<UnionReport[]>([])
  const [isUnionReportsLoading, setIsUnionReportsLoading] = useState<boolean>(false)
  const [currentPage, setCurrentPage] = useState<number>(1)
  const [totalPages, setTotalPages] = useState<number>(1)
  const [reportsPerPage] = useState<number>(10)

  const VITE_BASE_API_URL = import.meta.env.VITE_BASE_API_URL;

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
        message.warning("তারিখ বাছাই করুন!")
      } else if (!upazilaId) {
        message.warning("উপজেলা আইডি দিন!")
      } else if (!token) {
        message.error("অনুগ্রহ করে আবার লগইন করুন।")
      }
      return
    }

    setIsUnionLoading(true)
    try {
      const response = await fetch(`${VITE_BASE_API_URL}/admin/upazilas/${upazilaId}/uniouninfo`, {
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
      message.error("ইউনিয়ন তালিকা লোড করতে ব্যর্থ হয়েছে। আবার চেষ্টা করুন।")
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
      if (!startDate || !endDate) {
        message.warning("তারিখ বাছাই করুন!")
      } else if (unionFormData.length === 0) {
        message.warning("কোন ইউনিয়ন ডাটা নেই!")
      } else if (!token) {
        message.error("অনুগ্রহ করে আবার লগইন করুন।")
      }
      return
    }

    setIsSubmitting(true)

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
      const response = await fetch(`${VITE_BASE_API_URL}/admin/ekpay-reports`, {
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
      message.success("রিপোর্ট ডাটা সফলভাবে জমা হয়েছে!")
    } catch (error) {
      console.error("Error submitting report data:", error)
      message.error(error instanceof Error ? error.message : "রিপোর্ট ডাটা জমা দিতে ব্যর্থ হয়েছে। আবার চেষ্টা করুন।")
    } finally {
      setIsSubmitting(false)
    }
  }

  // Update the fetchUnionReports function to correctly parse the API response
  const fetchUnionReports = async (page = 1) => {
    if (!selectedUnion || !token) {
      if (!selectedUnion) {
        message.warning("ইউনিয়ন বাছাই করুন!")
      }
      return
    }

    setIsUnionReportsLoading(true)

    try {
      const response = await fetch(
        `${VITE_BASE_API_URL}/admin/ekpay-reports/union/${selectedUnion}?page=${page}&limit=${reportsPerPage}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        },
      )

      if (!response.ok) {
        throw new Error(`Failed to fetch union reports: ${response.status}`)
      }

      const responseData = await response.json()
      console.log("Union Reports API Response:", responseData)

      // Check if the response has the expected structure
      if (responseData.data && responseData.data.data) {
        const reports = responseData.data.data
        const currentPage = responseData.data.current_page
        const totalPages = responseData.data.last_page

        setUnionReports(reports)
        setTotalPages(totalPages)
        setCurrentPage(currentPage)

        console.log("Union Reports:", reports)

        if (reports.length === 0) {
          message.info("এই ইউনিয়নের জন্য কোন রিপোর্ট পাওয়া যায়নি।")
        }
      } else {
        throw new Error("Unexpected API response format")
      }
    } catch (error) {
      console.error("Error fetching union reports:", error)
      message.error(error instanceof Error ? error.message : "ইউনিয়ন রিপোর্ট লোড করতে ব্যর্থ হয়েছে। আবার চেষ্টা করুন।")
    } finally {
      setIsUnionReportsLoading(false)
    }
  }

  // Handle page change
  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return
    setCurrentPage(page)
    fetchUnionReports(page)
  }

  // Handle union selection change
  const handleUnionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value
    if (!value) {
      message.warning("ইউনিয়ন বাছাই করুন!")
      return
    }
    setSelectedUnion(value)
  }

  // Fetch reports when union changes
  useEffect(() => {
    if (selectedUnion) {
      fetchUnionReports(1)
    }
  }, [selectedUnion])

  // Generate pagination items
  const renderPaginationItems = () => {
    const items = []

    // Previous button
    items.push(
      <li key="prev" className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
        <button className="page-link" onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1}>
          <i className="fas fa-chevron-left"></i> Previous
        </button>
      </li>,
    )

    // Page numbers
    const startPage = Math.max(1, currentPage - 2)
    const endPage = Math.min(totalPages, startPage + 4)

    for (let i = startPage; i <= endPage; i++) {
      items.push(
        <li key={i} className={`page-item ${currentPage === i ? "active" : ""}`}>
          <button className="page-link" onClick={() => handlePageChange(i)}>
            {i}
          </button>
        </li>,
      )
    }

    // Next button
    items.push(
      <li key="next" className={`page-item ${currentPage === totalPages ? "disabled" : ""}`}>
        <button
          className="page-link"
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          Next <i className="fas fa-chevron-right"></i>
        </button>
      </li>,
    )

    return items
  }

  return (
    <div className="container-fluid py-4">
      <div className="">
        <div className="card-header text-white d-flex justify-content-between align-items-center mb-3">
          <h4 className="card-title mb-0 text-primary">
            <i className="fas fa-chart-bar me-2"></i> Ekpay Reports
          </h4>
 
         
                 <Link
                        to={`/dashboard/ekpay-report-list`}
                        className="btn btn-info btn-sm mr-1"
                      >
                        <i className="fas fa-list me-1"></i> Ekpay Report List
                      </Link>

        </div>
        <div className="card-body">
          {!token ? (
            <div className="alert alert-danger d-flex align-items-center" role="alert">
              <i className="fas fa-exclamation-triangle me-2"></i>
              <div>Authentication token not found. Please login again.</div>
            </div>
          ) : (
            <>
              {/* Date and Location Selection Form */}
              <div className="card mb-4 shadow-sm border-0">
                <div className="card-header bg-light">
                  <h5 className="mb-0">
                    <i className="fas fa-filter me-2"></i> Report Filters
                  </h5>
                </div>
                <div className="card-body">
                  <form>
                    <div className="row mb-3">
                      {/* Start Date Picker */}
                      <div className="col-md-6 col-lg-3 mb-3">
                        <label htmlFor="start_date" className="form-label fw-bold">
                          <i className="far fa-calendar-alt me-1"></i> Start Date
                        </label>
                        <input
                          type="date"
                          className="form-control form-control-lg"
                          id="start_date"
                          value={startDate}
                          onChange={(e) => setStartDate(e.target.value)}
                          required
                        />
                      </div>

                      {/* End Date Picker */}
                      <div className="col-md-6 col-lg-3 mb-3">
                        <label htmlFor="end_date" className="form-label fw-bold">
                          <i className="far fa-calendar-alt me-1"></i> End Date
                        </label>
                        <input
                          type="date"
                          className="form-control form-control-lg"
                          id="end_date"
                          value={endDate}
                          onChange={(e) => setEndDate(e.target.value)}
                          required
                        />
                      </div>
                    </div>

                    {/* Address Selection Component */}
                    <div className="mb-3">
                      <label className="form-label fw-bold">
                        <i className="fas fa-map-marker-alt me-1"></i> Select Location
                      </label>
                      <AddressSelection defaultUpazilaId={upazilaId} onUpazilaChange={(id) => setUpazilaId(id)} />
                    </div>

                    <div className="d-flex justify-content-end mt-3">
                      <button
                        type="button"
                        className="btn btn-primary btn-lg"
                        onClick={fetchUnionList}
                        disabled={!upazilaId || !startDate || !endDate || isUnionLoading}
                      >
                        {isUnionLoading ? (
                          <>
                            <span
                              className="spinner-border spinner-border-sm me-2"
                              role="status"
                              aria-hidden="true"
                            ></span>
                            Loading...
                          </>
                        ) : (
                          <>
                            <i className="fas fa-search me-2"></i> Get Unions
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              </div>

              {/* Tabs for Union List and Union Reports */}
              {unionList.length > 0 && (
                <div className="mb-4">
                  <ul className="nav nav-tabs nav-fill">
                    <li className="nav-item">
                      <button
                        className={`nav-link ${activeTab === 'unionList' ? 'active' : ''}`}
                        onClick={() => setActiveTab('unionList')}
                      >
                        <i className="fas fa-list me-2"></i> Union List
                      </button>
                    </li>
                    <li className="nav-item">
                      <button
                        className={`nav-link ${activeTab === 'unionReports' ? 'active' : ''}`}
                        onClick={() => setActiveTab('unionReports')}
                      >
                        <i className="fas fa-chart-line me-2"></i> Union Reports
                      </button>
                    </li>
                  </ul>
                </div>
              )}

              {/* Union List Table with Input Fields */}
              {unionFormData.length > 0 && activeTab === 'unionList' && (
                <div className="card shadow-sm border-0">
                  <div className="card-header bg-light">
                    <div className="d-flex justify-content-between align-items-center">
                      <h5 className="mb-0">
                        <i className="fas fa-list-alt me-2"></i> Union List for Upazila ID: {upazilaId}
                      </h5>
                      <span className="badge bg-primary">{unionFormData.length} Unions</span>
                    </div>
                  </div>
                  <div className="card-body">
                    <form onSubmit={handleSubmitReport}>
                      <div className="table-responsive">
                        <table className="table table-bordered table-striped table-hover">
                          <thead className="table-primary">
                            <tr>
                              <th>ID</th>
                              <th>Union Name</th>
                              <th>Thana</th>
                              <th>Ekpay Id</th>
                              <th className="text-center">Server Amount</th>
                              <th className="text-center">Ekpay Amount</th>
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
                                  <td className="fw-bold">{union.full_name}</td>
                                  <td>{unionInfo?.thana || ""}</td>
                                  <td>{unionInfo?.AKPAY_MER_REG_ID || ""}</td>
                                  <td className="text-center fw-bold">{serverAmount}</td>
                                  <td>
                                    <div className="input-group">
                                      <span className="input-group-text">৳</span>
                                      <input
                                        type="text"
                                        className="form-control text-center"
                                        value={union.ekpay_amount}
                                        onChange={(e) => {
                                          const value = e.target.value
                                          if (/^\d*\.?\d*$/.test(value)) {
                                            handleInputChange(union.id, "ekpay_amount", value)
                                          }
                                        }}
                                        placeholder={`Enter amount (default: ${serverAmount})`}
                                      />
                                    </div>
                                    {!union.ekpay_amount && (
                                      <small className="text-muted d-block text-center mt-1">
                                        <i className="fas fa-info-circle me-1"></i>
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

                      <div className="d-flex justify-content-between mt-4">
                        <button
                          type="button"
                          className="btn btn-outline-secondary btn-lg"
                          onClick={() => setActiveTab('unionReports')}
                        >
                          <i className="fas fa-chart-line me-2"></i> View Reports
                        </button>
                        <button
                          type="submit"
                          className="btn btn-success btn-lg"
                          disabled={!startDate || !endDate || unionFormData.length === 0 || isSubmitting}
                        >
                          {isSubmitting ? (
                            <>
                              <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                              Submitting...
                            </>
                          ) : (
                            <>
                              <i className="fas fa-save me-2"></i> Submit Report Data
                            </>
                          )}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}

              {/* Report Data Table */}
              {reportData && (
                <div className="card shadow-sm border-0 mt-4">
                  <div className="card-header bg-success text-white">
                    <h5 className="mb-0">
                      <i className="fas fa-file-invoice me-2"></i>
                      Ekpay Report ({reportData.date.start_date} to {reportData.date.end_date})
                    </h5>
                  </div>
                  <div className="card-body">
                    <div className="table-responsive">
                      <table className="table table-bordered table-striped table-hover">
                        <thead className="table-success">
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
                          <tr className="fw-bold table-success">
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
                </div>
              )}

              {/* Union Reports Section */}
              {activeTab === 'unionReports' && (
                <div className="card shadow-sm border-0">
                  <div className="card-header bg-light">
                    <div className="d-flex justify-content-between align-items-center">
                      <h5 className="mb-0">
                        <i className="fas fa-chart-line me-2"></i> Union-Specific Reports
                      </h5>
                      <button
                        className="btn btn-outline-primary"
                        onClick={() => setActiveTab('unionList')}
                      >
                        <i className="fas fa-list me-2"></i> Back to Union List
                      </button>
                    </div>
                  </div>
                  <div className="card-body">
                    <div className="row mb-4">
                      <div className="col-md-6">
                        <label htmlFor="union_select" className="form-label fw-bold">
                          <i className="fas fa-building me-1"></i> Select Union
                        </label>
                        <div className="input-group mb-3">
                          <select
                            className="form-select form-select-lg"
                            id="union_select"
                            value={selectedUnion}
                            onChange={handleUnionChange}
                            disabled={unionList.length === 0}
                          >
                            <option value="">Select a union</option>
                            {unionList.map((union) => (
                              <option key={union.id} value={union.short_name_e || union.full_name}>
                                {union.full_name}
                              </option>
                            ))}
                          </select>
                          <button
                            className="btn btn-primary"
                            type="button"
                            onClick={() => selectedUnion && fetchUnionReports(1)}
                            disabled={!selectedUnion}
                          >
                            <i className="fas fa-search"></i>
                          </button>
                        </div>
                      </div>
                    </div>

                    {isUnionReportsLoading ? (
                      <div className="d-flex justify-content-center my-5">
                        <div className="spinner-border text-primary" role="status">
                          <span className="visually-hidden">Loading...</span>
                        </div>
                      </div>
                    ) : unionReports.length > 0 ? (
                      <>
                        <div className="table-responsive">
                          {/* Update the table rendering to match the actual data structure */}
                          <table className="table table-bordered table-striped table-hover">
                            <thead className="table-info">
                              <tr>
                                <th>#</th>
                                <th>Start Date</th>
                                <th>End Date</th>
                                <th className="text-end">Ekpay Amount</th>
                                <th className="text-end">Server Amount</th>
                                <th className="text-end">Difference</th>
                              </tr>
                            </thead>
                            <tbody>
                              {unionReports.map((report, index) => (
                                <tr key={report.id}>
                                  <td>{(currentPage - 1) * reportsPerPage + index + 1}</td>
                                  <td>{report.start_date}</td>
                                  <td>{report.end_date}</td>
                                  <td className="text-end fw-bold">৳{Number.parseFloat(report.ekpay_amount).toFixed(2)}</td>
                                  <td className="text-end fw-bold">৳{Number.parseFloat(report.server_amount).toFixed(2)}</td>
                                  <td className="text-end fw-bold">৳{Number.parseFloat(report.difference_amount).toFixed(2)}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>

                        {/* Pagination */}
                        <nav aria-label="Union reports pagination" className="mt-4">
                          <ul className="pagination pagination-lg justify-content-center">{renderPaginationItems()}</ul>
                        </nav>
                      </>
                    ) : selectedUnion ? (
                      <div className="alert alert-info d-flex align-items-center">
                        <i className="fas fa-info-circle me-2 fs-4"></i>
                        <div>No reports found for this union.</div>
                      </div>
                    ) : (
                      <div className="alert alert-info d-flex align-items-center">
                        <i className="fas fa-info-circle me-2 fs-4"></i>
                        <div>Please select a union to view its reports.</div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default EkpayReports
