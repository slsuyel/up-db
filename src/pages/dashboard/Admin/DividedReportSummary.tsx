/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { useState } from "react"
import { Modal, Table, Button, Badge } from "react-bootstrap"

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
  last30DaysPending: number
  last7DaysPending: number
  Before7DaysPending: number
  Before30DaysPending: number
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

const DividedReportSummary = ({ data, isLoading, title }: any) => {
  const [showModal, setShowModal] = useState(false)
  const [selectedRegionData, setSelectedRegionData] = useState<RegionData | null>(null)
  const [selectedRegionName, setSelectedRegionName] = useState<string>("")
  const [searchTerm, setSearchTerm] = useState("")

  // Calculate totals and filter data
  let totalPending = 0
  let totalApproved = 0
  let totalCanceled = 0
  let totalAmount = 0

  const filteredEntries = data ? Object.entries(data).filter(([name]: any) =>
    name.toLowerCase().includes(searchTerm.toLowerCase())
  ) : [];

  if (data) {
    Object.values(data).forEach((regionData: any) => {
      totalPending += regionData?.totals?.total_pending || 0
      totalApproved += regionData?.totals?.total_approved || 0
      totalCanceled += regionData?.totals?.total_cancel || 0
      totalAmount += Number.parseFloat(regionData?.totals?.total_amount || "0")
    })
  }

  const openModal = (regionName: string, regionData: RegionData) => {
    setSelectedRegionName(regionName)
    setSelectedRegionData(regionData)
    setShowModal(true)
  }

  return (
    <div className="mt-5 pt-3">
      <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between mb-4 gap-3">
        <div className="d-flex align-items-center gap-3">
          <div className="p-2 bg-primary rounded-3 soft-shadow d-flex align-items-center justify-content-center" style={{ width: '45px', height: '45px' }}>
            <i className="fa-solid fa-chart-column text-white"></i>
          </div>
          <div>
            <h4 className="fw-bold text-dark mb-0 fs-4">
              {title || "বিভাগীয় রিপোর্ট সারাংশ"}
            </h4>
            <p className="text-muted small mb-0 fw-medium">বিভাগ ভিত্তিক আবেদনের বিস্তারিত পরিসংখ্যান রিপোর্ট</p>
          </div>
        </div>

        <div className="d-flex align-items-center gap-3">
          <div className="position-relative search-container">
            <i className="fa-solid fa-magnifying-glass position-absolute top-50 start-0 translate-middle-y ms-3 text-muted small"></i>
            <input
              type="text"
              className="form-control ps-5 rounded-pill border-0 soft-shadow bg-white"
              placeholder="বিভাগ খুঁজুন..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ width: '280px', height: '42px', fontSize: '14px' }}
            />
          </div>
          <Badge bg="primary" className="p-2 px-3 rounded-pill bg-opacity-10 text-primary border border-primary border-opacity-10 fw-bold shadow-sm">
            সর্বমোট বিভাগ: {Object.keys(data || {}).length}
          </Badge>
        </div>
      </div>

      <div className="card border-0 soft-shadow rounded-4 overflow-hidden mb-5 premium-table-card">
        <div className="table-responsive">
          <Table hover className="align-middle mb-0 table-premium-dark">
            <thead>
              <tr className="bg-primary text-white">
                <th className="ps-4 py-3 border-0 rounded-start-4">বিভাগ নাম</th>
                <th className="text-center py-3 border-0">মোট আবেদন</th>
                <th className="text-center py-3 border-0">নতুন আবেদন</th>
                <th className="text-center py-3 border-0">ইস্যুকৃত সনদ</th>
                <th className="text-center py-3 border-0">বাতিল আবেদন</th>
                <th className="text-center py-3 border-0">সংগৃহীত ফি</th>
                <th className="text-end pe-4 py-3 border-0 rounded-end-4">রিপোর্ট</th>
              </tr>
            </thead>
            <tbody>
              {isLoading && !data && (
                <tr>
                  <td colSpan={7} className="text-center py-5">
                    <div className="spinner-border text-primary" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                    <p className="mt-2 text-muted small">ডেটা লোড হচ্ছে...</p>
                  </td>
                </tr>
              )}
              {filteredEntries.map(([regionName, regionData]: any) => {
                const totals = regionData?.totals
                const totalApps = (totals?.total_pending || 0) + (totals?.total_approved || 0) + (totals?.total_cancel || 0)

                return (
                  <tr key={regionName} className="border-bottom border-light">
                    <td className="ps-4 py-4">
                      <span className="fw-bold text-dark d-block fs-6 mb-0">{regionName}</span>
                      <span className="text-muted extra-small text-uppercase fw-semibold" style={{ fontSize: '10px', letterSpacing: '0.5px' }}>Division Records List</span>
                    </td>
                    <td className="text-center">
                      <span className="badge-soft-primary fw-bold p-2 px-3 rounded-pill fs-7">
                        {totalApps}
                      </span>
                    </td>
                    <td className="text-center">
                      <span className="badge-soft-warning fw-bold p-2 px-3 rounded-pill fs-7">
                        {totals?.total_pending || 0}
                      </span>
                    </td>
                    <td className="text-center">
                      <span className="badge-soft-success fw-bold p-2 px-3 rounded-pill fs-7">
                        {totals?.total_approved || 0}
                      </span>
                    </td>
                    <td className="text-center">
                      <span className="badge-soft-danger fw-bold p-2 px-3 rounded-pill fs-7">
                        {totals?.total_cancel || 0}
                      </span>
                    </td>
                    <td className="text-center">
                      <div className="fw-bold text-primary fs-6">
                        ৳ {parseFloat(totals?.total_amount || "0").toLocaleString()}
                      </div>
                    </td>
                    <td className="text-end pe-4">
                      <Button
                        variant="primary"
                        className="btn-sm rounded-pill px-4 fw-bold soft-shadow border-0 py-2 d-inline-flex align-items-center gap-2"
                        onClick={() => openModal(regionName, regionData)}
                        style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.8px', background: 'linear-gradient(45deg, #4e73df, #224abe)' }}
                      >
                        <i className="fa-solid fa-file-invoice small"></i> বিস্তারিত
                      </Button>
                    </td>
                  </tr>
                )
              })}
              {!isLoading && filteredEntries.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center py-5">
                    <i className="fa-solid fa-folder-open text-muted fs-1 mb-3 opacity-25"></i>
                    <p className="text-muted mb-0 fw-medium">দুঃখিত, এই নামে কোন বিভাগ খুঁজে পাওয়া যায়নি</p>
                  </td>
                </tr>
              )}
            </tbody>
            <tfoot className="total-row-premium">
              <tr className="bg-light">
                <td className="ps-4 py-4 fw-bold fs-6 text-dark border-0 rounded-start-4">মোট ভিত্তিক পরিসংখ্যান রিপোর্ট</td>
                <td className="text-center py-4 fs-5 fw-extrabold text-primary border-0">{totalPending + totalApproved + totalCanceled}</td>
                <td className="text-center py-4 fs-5 fw-extrabold text-warning border-0">{totalPending}</td>
                <td className="text-center py-4 fs-5 fw-extrabold text-success border-0">{totalApproved}</td>
                <td className="text-center py-4 fs-5 fw-extrabold text-danger border-0">{totalCanceled}</td>
                <td className="text-center py-4 fs-5 fw-extrabold text-primary border-0 bg-white shadow-sm rounded-3">৳ {totalAmount.toLocaleString()}</td>
                <td className="pe-4 border-0 rounded-end-4"></td>
              </tr>
            </tfoot>
          </Table>
        </div>
      </div>

      <Modal show={showModal} onHide={() => setShowModal(false)} size="xl" centered scrollable>
        <Modal.Header closeButton className="border-0 pb-0">
          <Modal.Title className="fw-bold">{selectedRegionName} - বিস্তারিত রিপোর্ট</Modal.Title>
        </Modal.Header>
        <Modal.Body className="px-4 pb-4">
          <div className="table-responsive rounded border border-light">
            <Table hover className="align-middle mb-0">
              <thead className="bg-light">
                <tr>
                  <th className="border-0 text-muted small fw-bold py-3">সনদের নাম</th>
                  <th className="text-center border-0 text-muted small fw-bold py-3">অপেক্ষমাণ</th>
                  <th className="text-center border-0 text-muted small fw-bold py-3">অনুমোদিত</th>
                  <th className="text-center border-0 text-muted small fw-bold py-3">বাতিল</th>
                  <th className="text-center border-0 text-muted small fw-bold py-3">পেমেন্টস</th>
                  <th className="text-end border-0 text-muted small fw-bold py-3 pe-3">মোট অর্থ</th>
                </tr>
              </thead>
              <tbody>
                {selectedRegionData?.sonod_reports?.map((report, idx) => {
                  const payment = selectedRegionData.payment_reports?.find(p => p.sonod_type === report.sonod_name)
                  return (
                    <tr key={idx}>
                      <td className="fw-semibold text-dark py-3">{report.sonod_name}</td>
                      <td className="text-center">{report.pending_count}</td>
                      <td className="text-center text-success">{report.approved_count}</td>
                      <td className="text-center text-danger">{report.cancel_count}</td>
                      <td className="text-center">{payment?.total_payments || 0}</td>
                      <td className="text-end fw-bold text-primary pe-3">
                        ৳ {parseFloat(payment?.total_amount || "0").toLocaleString()}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </Table>
          </div>
        </Modal.Body>
        <Modal.Footer className="border-0 pt-0">
          <Button variant="secondary" className="px-4" onClick={() => setShowModal(false)}>বন্ধ করুন</Button>
        </Modal.Footer>
      </Modal>
    </div>
  )
}

export default DividedReportSummary
