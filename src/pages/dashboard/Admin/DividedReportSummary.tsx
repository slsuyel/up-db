/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import type React from "react"
import { useState } from "react"

// Type definitions
interface RegionTotals {
  total_pending: number
  total_approved: number
  total_cancel: number
  total_payments: number
  total_amount: string
}

interface SonodReport {
  sonod_name: string
  pending_count: number
  approved_count: number
  cancel_count: number
}

interface PaymentReport {
  sonod_type: string
  total_payments: number
  total_amount: string
}

interface RegionData {
  totals: RegionTotals
  sonod_reports?: SonodReport[]
  payment_reports?: PaymentReport[]
}

interface AdminTotals {
  // Define the structure of admin totals based on your data
  [key: string]: unknown
}

interface SummaryProps {
  data: AdminTotals
  isLoading: boolean
}

// Summary component placeholder - replace with your actual Summary component
const Summary: React.FC<SummaryProps> = ({ isLoading }) => {
  if (isLoading) return <div className="text-center">Loading summary...</div>
  return (
    <div className="card mb-4">
      <div className="card-header">
        <h5 className="card-title mb-0">Admin Summary</h5>
      </div>
      <div className="card-body">
        <p className="card-text">Admin totals data would be displayed here</p>
      </div>
    </div>
  )
}

const DividedReportSummary = ({ data, isLoading, adminTotals, title }: any) => {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedRegionData, setSelectedRegionData] = useState<RegionData | null>(null)
  const [selectedRegionName, setSelectedRegionName] = useState<string>("")

  // Update the বিভাগ column text color - darker purple
  const regionNameCellStyle = { backgroundColor: "#f3e8ff", color: "#5e35b1" }

  // Update the মোট আবেদন column text color - darker orange
  const totalApplicationsCellStyle = { backgroundColor: "#fff3e0", color: "#e65100" }

  // Update the নতুন আবেদন column text color - darker teal
  const newApplicationsCellStyle = { backgroundColor: "#e8f5f0", color: "#00796b" }

  // Update the ইস্যুকৃত সনদ column text color - darker cyan
  const issuedCertificatesCellStyle = { backgroundColor: "#e5f9fc", color: "#0277bd" }

  // Update the বাতিলকৃত আবেদন column text color - darker red
  const canceledApplicationsCellStyle = { backgroundColor: "#f8e7e9", color: "#b71c1c" }

  // Update the মোট আদায়কৃত ফি column text color - darker green
  const totalFeesCellStyle = { backgroundColor: "#e6f4ea", color: "#1b5e20" }

  // Update the অ্যাকশন column text color - darker gray
  const actionCellStyle = { backgroundColor: "#e9ecef", color: "#37474f" }

  if (isLoading) {
    return (
      <div className="d-flex justify-content-center align-items-center p-5">
        <p className="text-muted fs-5">বিভাগীয় রিপোর্ট লোড হচ্ছে...</p>
      </div>
    )
  }

  // Calculate totals for the table
  let totalPending = 0
  let totalApproved = 0
  let totalCanceled = 0
  let totalPayments = 0
  let totalAmount = 0

  Object.entries(data).forEach(([, regionData]: any) => {
    totalPending += regionData?.totals?.total_pending || 0
    totalApproved += regionData?.totals?.total_approved || 0
    totalCanceled += regionData?.totals?.total_cancel || 0
    totalPayments += regionData?.totals?.total_payments || 0
    totalAmount += Number.parseFloat(regionData?.totals?.total_amount || "0")
  })

  // Function to open modal and set selected region data
  const openModal = (regionName: string, regionData: RegionData) => {
    console.log("Opening modal for region:", regionName, "with data:", regionData)
    setSelectedRegionName(regionName)
    setSelectedRegionData(regionData)
    setIsModalOpen(true)
  }

  // Function to close modal
  const closeModal = () => {
    setIsModalOpen(false)
    setSelectedRegionData(null)
    setSelectedRegionName("")
  }

  return (
    <div className="mt-4">
      <h2 className="text-center mb-4 fw-semibold">{title}</h2>

      {/* Render Admin Totals using the Summary component */}
      {adminTotals && <Summary data={adminTotals} isLoading={isLoading} />}

      {/* Display Division Summary as a Table */}
      <div className="card">
        <div className="card-header">
          <h5 className="card-title mb-0">{title}</h5>
        </div>
        <div className="card-body">
          <div className="table-responsive">
            <table className="table table-bordered table-hover">
              <thead>
                <tr>
                  <th scope="col" style={{ backgroundColor: "#6f42c1", color: "white" }} className="text-center">
                    বিভাগ
                  </th>
                  <th scope="col" style={{ backgroundColor: "#fd7e14", color: "white" }} className="text-center">
                    মোট আবেদন
                  </th>
                  <th scope="col" style={{ backgroundColor: "#20c997", color: "white" }} className="text-center">
                    নতুন আবেদন
                  </th>
                  <th scope="col" style={{ backgroundColor: "#0dcaf0", color: "white" }} className="text-center">
                    ইস্যুকৃত সনদ
                  </th>
                  <th scope="col" style={{ backgroundColor: "#dc3545", color: "white" }} className="text-center">
                    বাতিলকৃত আবেদন
                  </th>
                  <th scope="col" style={{ backgroundColor: "#198754", color: "white" }} className="text-center">
                    মোট আদায়কৃত ফি
                  </th>
                  <th scope="col" style={{ backgroundColor: "#6c757d", color: "white" }} className="text-center">
                    অ্যাকশন
                  </th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(data).map(([regionName, regionData]: any, index) => {
                  const regionTotals = regionData?.totals || {
                    total_pending: 0,
                    total_approved: 0,
                    total_cancel: 0,
                    total_payments: 0,
                    total_amount: "0",
                  }

                  return (
                    <tr key={regionName} style={{ backgroundColor: index % 2 === 0 ? "#f8f9fa" : "white" }}>
                      <td className="fw-semibold" style={regionNameCellStyle}>
                        {regionName}
                      </td>
                      <td style={totalApplicationsCellStyle} className="text-center">
                        {regionTotals.total_pending + regionTotals.total_approved + regionTotals.total_cancel}
                      </td>
                      <td style={newApplicationsCellStyle} className="text-center">
                        {regionTotals.total_pending}
                      </td>
                      <td style={issuedCertificatesCellStyle} className="text-center">
                        {regionTotals.total_approved}
                      </td>
                      <td style={canceledApplicationsCellStyle} className="text-center">
                        {regionTotals.total_cancel}
                      </td>
                      <td style={totalFeesCellStyle} className="text-center fw-bold">
                        {regionTotals.total_amount}
                      </td>
                      <td style={actionCellStyle} className="text-center">
                        <button
                          type="button"
                          className="btn btn-primary btn-sm"
                          onClick={() => openModal(regionName, regionData)}
                        >
                          বিস্তারিত রিপোর্ট দেখুন
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
              <tfoot>
                <tr style={{ backgroundColor: "#343a40" }}>
                  <th scope="row" className="text-white fw-bold text-center">
                    মোট
                  </th>
                  <td className="fw-bold text-center" style={totalApplicationsCellStyle}>
                    {totalPending + totalApproved + totalCanceled}
                  </td>
                  <td className="fw-bold text-center" style={newApplicationsCellStyle}>
                    {totalPending}
                  </td>
                  <td className="fw-bold text-center" style={issuedCertificatesCellStyle}>
                    {totalApproved}
                  </td>
                  <td className="fw-bold text-center" style={canceledApplicationsCellStyle}>
                    {totalCanceled}
                  </td>
                  <td className="fw-bold text-center" style={totalFeesCellStyle}>
                    {totalAmount.toFixed(2)}
                  </td>
                  <td className="text-center">-</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </div>

      {/* Bootstrap Modal */}
      {isModalOpen && (
        <div className="modal fade show d-block" tabIndex={-1} style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog modal-xl modal-dialog-scrollable">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">{selectedRegionName} - বিভাগীয় রিপোর্ট</h5>
                <button type="button" className="btn-close" aria-label="Close" onClick={closeModal}></button>
              </div>
              <div className="modal-body">
                {selectedRegionData && (
                  <div className="table-responsive">
                    <table className="table table-bordered table-striped table-hover">
                      <thead>
                        <tr>
                          <th
                            scope="col"
                            rowSpan={2}
                            className="align-middle text-center"
                            style={{ backgroundColor: "#6c757d", color: "white" }}
                          >
                            সনদের নাম
                          </th>
                          <th
                            scope="col"
                            colSpan={3}
                            className="text-center"
                            style={{ backgroundColor: "#0d6efd", color: "white" }}
                          >
                            সনদ রিপোর্ট
                          </th>
                          <th
                            scope="col"
                            colSpan={2}
                            className="text-center"
                            style={{ backgroundColor: "#198754", color: "white" }}
                          >
                            পেমেন্ট রিপোর্ট
                          </th>
                        </tr>
                        <tr>
                          <th scope="col" style={{ backgroundColor: "#b6d7ff", color: "#0d47a1" }}>
                            অপেক্ষমাণ
                          </th>
                          <th scope="col" style={{ backgroundColor: "#b6d7ff", color: "#0d47a1" }}>
                            অনুমোদিত
                          </th>
                          <th scope="col" style={{ backgroundColor: "#b6d7ff", color: "#0d47a1" }}>
                            বাতিল
                          </th>
                          <th scope="col" style={{ backgroundColor: "#c3e6cb", color: "#1b5e20" }}>
                            পেমেন্টস
                          </th>
                          <th scope="col" style={{ backgroundColor: "#c3e6cb", color: "#1b5e20" }}>
                            অর্থ
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedRegionData.sonod_reports?.map((report, index) => {
                          const paymentReport = selectedRegionData.payment_reports?.find(
                            (payment) => payment.sonod_type === report.sonod_name,
                          )

                          return (
                            <tr key={index} style={{ backgroundColor: index % 2 === 0 ? "#f8f9fa" : "white" }}>
                              <td className="fw-semibold" style={{ backgroundColor: "#e9ecef", color: "#212529" }}>
                                {report.sonod_name}
                              </td>
                              <td style={{ backgroundColor: "#f0f8ff", color: "#0d47a1" }}>{report.pending_count}</td>
                              <td style={{ backgroundColor: "#f0f8ff", color: "#0d47a1" }}>{report.approved_count}</td>
                              <td style={{ backgroundColor: "#f0f8ff", color: "#0d47a1" }}>{report.cancel_count}</td>
                              <td style={{ backgroundColor: "#f0fff4", color: "#1b5e20" }}>
                                {paymentReport ? paymentReport.total_payments : 0}
                              </td>
                              <td style={{ backgroundColor: "#f0fff4", color: "#1b5e20" }}>
                                {paymentReport ? paymentReport.total_amount : "0"}
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                      <tfoot>
                        <tr style={{ backgroundColor: "#343a40" }}>
                          <th scope="row" className="text-white fw-bold text-center">
                            মোট
                          </th>
                          <td className="fw-bold text-center" style={{ backgroundColor: "#b6d7ff", color: "#0d47a1" }}>
                            {selectedRegionData.sonod_reports?.reduce((sum, report) => sum + report.pending_count, 0) ||
                              0}
                          </td>
                          <td className="fw-bold text-center" style={{ backgroundColor: "#b6d7ff", color: "#0d47a1" }}>
                            {selectedRegionData.sonod_reports?.reduce(
                              (sum, report) => sum + report.approved_count,
                              0,
                            ) || 0}
                          </td>
                          <td className="fw-bold text-center" style={{ backgroundColor: "#b6d7ff", color: "#0d47a1" }}>
                            {selectedRegionData.sonod_reports?.reduce((sum, report) => sum + report.cancel_count, 0) ||
                              0}
                          </td>
                          <td className="fw-bold text-center" style={{ backgroundColor: "#c3e6cb", color: "#1b5e20" }}>
                            {selectedRegionData.payment_reports?.reduce(
                              (sum, payment) => sum + payment.total_payments,
                              0,
                            ) || 0}
                          </td>
                          <td className="fw-bold text-center" style={{ backgroundColor: "#c3e6cb", color: "#1b5e20" }}>
                            {selectedRegionData.payment_reports
                              ?.reduce((sum, payment) => sum + Number.parseFloat(payment.total_amount || "0"), 0)
                              .toFixed(2) || "0.00"}
                          </td>
                        </tr>
                      </tfoot>
                    </table>

                    {(!selectedRegionData.sonod_reports || selectedRegionData.sonod_reports.length === 0) && (
                      <div className="text-center py-5 text-muted">
                        <p>কোন বিস্তারিত রিপোর্ট পাওয়া যায়নি</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={closeModal}>
                  বন্ধ করুন
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default DividedReportSummary
