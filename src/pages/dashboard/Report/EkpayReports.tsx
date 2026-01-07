"use client"

import { message } from "antd"
import "bootstrap/dist/css/bootstrap.min.css"
import type React from "react"
import { useEffect, useState, type ReactNode } from "react"
import AddressSelection from "../../../components/reusable/AddressSelection"
import "../../../styles/ekpay-reports.css"
import { Link } from "react-router-dom"
import { Card, Button, Spinner, Badge, Table, Form, Row, Col, Container } from "react-bootstrap"

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
  const [upazilaId, setUpazilaId] = useState<string>("399")
  const [unionList, setUnionList] = useState<UnionInfo[]>([])
  const [unionFormData, setUnionFormData] = useState<UnionFormData[]>([])
  const [reportData] = useState<EkpayReport | null>(null)
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

  useEffect(() => {
    const storedToken = localStorage.getItem(`token`)
    setToken(storedToken)
  }, [])

  useEffect(() => {
    if (unionList.length > 0) {
      const initialFormData = unionList.map((union) => ({
        id: union.id,
        short_name_e: union.short_name_e,
        full_name: union.full_name,
        ekpay_amount: union.ekpay_amount?.toString() || union.server_amount?.toString() || "",
        server_amount: union.server_amount?.toString() || "",
      }))
      setUnionFormData(initialFormData)
    }
  }, [unionList])

  const fetchUnionList = async () => {
    if (!upazilaId || !token || !startDate || !endDate) {
      if (!startDate || !endDate) {
        message.warning("অনুগ্রহ করে তারিখ নির্বাচন করুন!")
      } else if (!upazilaId) {
        message.warning("উপজেলা আইডি প্রদান করুন!")
      } else if (!token) {
        message.error("অনুগ্রহ করে পুনরায় লগইন করুন।")
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
      const unions = Array.isArray(data.data) ? data.data : data
      setUnionList(unions)
      console.log("Union List:", unions)
    } catch (error) {
      console.error("Error fetching union list:", error)
      message.error("ইউনিয়ন তালিকা লোড করতে ব্যর্থ হয়েছে। আবার চেষ্টা করুন।")
    } finally {
      setIsUnionLoading(false)
    }
  }

  const handleInputChange = (id: number, field: "ekpay_amount" | "server_amount", value: string) => {
    setUnionFormData((prevData) => prevData.map((union) => (union.id === id ? { ...union, [field]: value } : union)))
  }

  const prepareFormDataForSubmission = () => {
    return unionFormData.map((union) => {
      const unionInfo = unionList.find((u) => u.id === union.id)
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
        message.warning("অনুগ্রহ করে তারিখ নির্বাচন করুন!")
      } else if (unionFormData.length === 0) {
        message.warning("কোন ইউনিয়ন ডাটা পাওয়া যায়নি!")
      } else if (!token) {
        message.error("অনুগ্রহ করে পুনরায় লগইন করুন।")
      }
      return
    }

    setIsSubmitting(true)

    try {
      const preparedFormData = prepareFormDataForSubmission()
      const details = preparedFormData
        .filter((union) => union.ekpay_amount && union.server_amount)
        .map((union) => ({
          union: union.short_name_e,
          ekpay_amount: Number.parseFloat(union.ekpay_amount),
          server_amount: Number.parseFloat(union.server_amount),
        }))

      if (details.length === 0) {
        throw new Error("অন্তত একটি ইউনিয়নের একপে এবং সার্ভার অ্যামাউন্ট প্রদান করুন")
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
      message.success("রিপোর্ট ডাটা সফলভাবে জমা হয়েছে!")
    } catch (error) {
      console.error("Error submitting report data:", error)
      message.error(error instanceof Error ? error.message : "রিপোর্ট ডাটা জমা দিতে ব্যর্থ হয়েছে। আবার চেষ্টা করুন।")
    } finally {
      setIsSubmitting(false)
    }
  }

  const fetchUnionReports = async (page = 1) => {
    if (!selectedUnion || !token) {
      if (!selectedUnion) {
        message.warning("ইউনিয়ন নির্বাচন করুন!")
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

      if (responseData.data && responseData.data.data) {
        const reports = responseData.data.data
        const currentPage = responseData.data.current_page
        const totalPages = responseData.data.last_page

        setUnionReports(reports)
        setTotalPages(totalPages)
        setCurrentPage(currentPage)

        if (reports.length === 0) {
          message.info("এই ইউনিয়নের জন্য কোন রিপোর্ট পাওয়া যায়নি।")
        }
      } else {
        throw new Error("Unexpected API response format")
      }
    } catch (error) {
      console.error("Error fetching union reports:", error)
      message.error(error instanceof Error ? error.message : "ইউনিয়ন রিপোর্ট লোড করতে ব্যর্থ হয়েছে।")
    } finally {
      setIsUnionReportsLoading(false)
    }
  }

  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return
    setCurrentPage(page)
    fetchUnionReports(page)
  }

  const handleUnionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value
    if (!value) {
      message.warning("ইউনিয়ন নির্বাচন করুন!")
      return
    }
    setSelectedUnion(value)
  }

  useEffect(() => {
    if (selectedUnion) {
      fetchUnionReports(1)
    }
  }, [selectedUnion])

  const renderPaginationItems = () => {
    const items = []
    items.push(
      <li key="prev" className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
        <button className="page-link" onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1}>
          <i className="fas fa-chevron-left"></i> পূর্ববর্তী
        </button>
      </li>,
    )

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

    items.push(
      <li key="next" className={`page-item ${currentPage === totalPages ? "disabled" : ""}`}>
        <button
          className="page-link"
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          পরবর্তী <i className="fas fa-chevron-right"></i>
        </button>
      </li>,
    )

    return items
  }

  return (
    <Container fluid className="p-2 p-md-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold mb-1">একপে রিপোর্টস</h2>
          <p className="text-muted mb-0">একপে পেমেন্ট এবং সার্ভার রিপোর্ট ম্যানেজমেন্ট।</p>
        </div>
        <Link to={`/dashboard/ekpay-report-list`}>
          <Button variant="info" className="text-white d-flex align-items-center gap-2 border-0 shadow-sm">
            <i className="fas fa-list"></i> রিপোর্ট তালিকা দেখুন
          </Button>
        </Link>
      </div>

      {!token ? (
        <Card className="border-0 shadow-sm rounded-4 p-4 text-center">
          <Card.Body>
            <div className="text-danger mb-3">
              <i className="fas fa-exclamation-triangle fa-3x"></i>
            </div>
            <h5 className="text-danger fw-bold">অথেন্টিকেশন টোকেন পাওয়া যায়নি</h5>
            <p className="text-muted">অনুগ্রহ করে পুনরায় লগইন করুন।</p>
          </Card.Body>
        </Card>
      ) : (
        <>
          <Card className="border-0 shadow-sm rounded-4 mb-4">
            <Card.Header className="bg-white border-0 py-3">
              <h5 className="mb-0 fw-bold text-primary">
                <i className="fas fa-filter me-2"></i> রিপোর্ট ফিল্টার
              </h5>
            </Card.Header>
            <Card.Body>
              <Form>
                <Row className="mb-3">
                  <Col md={6} lg={3} className="mb-3">
                    <Form.Group controlId="start_date">
                      <Form.Label className="fw-bold text-muted small">শুরুর তারিখ</Form.Label>
                      <Form.Control
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        required
                        className="shadow-sm"
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6} lg={3} className="mb-3">
                    <Form.Group controlId="end_date">
                      <Form.Label className="fw-bold text-muted small">শেষ তারিখ</Form.Label>
                      <Form.Control
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        required
                        className="shadow-sm"
                      />
                    </Form.Group>
                  </Col>
                  <Col md={12} className="mb-3">
                    <Form.Label className="fw-bold text-muted small"><i className="fas fa-map-marker-alt me-1"></i> লোকেশন নির্বাচন করুন</Form.Label>
                    <AddressSelection defaultUpazilaId={upazilaId} onUpazilaChange={(id) => setUpazilaId(id)} />
                  </Col>
                </Row>

                <div className="d-flex justify-content-end">
                  <Button
                    variant="primary"
                    size="lg"
                    onClick={fetchUnionList}
                    disabled={!upazilaId || !startDate || !endDate || isUnionLoading}
                    className="d-flex align-items-center gap-2 shadow-sm"
                  >
                    {isUnionLoading ? (
                      <>
                        <Spinner size="sm" animation="border" /> লোডিং...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-search"></i> ইউনিয়ন খুঁজুন
                      </>
                    )}
                  </Button>
                </div>
              </Form>
            </Card.Body>
          </Card>

          {unionList.length > 0 && (
            <div className="mb-4">
              <ul className="nav nav-pills nav-fill bg-white p-2 rounded-4 shadow-sm">
                <li className="nav-item">
                  <button
                    className={`nav-link ${activeTab === 'unionList' ? 'active' : ''} fw-bold rounded-4`}
                    onClick={() => setActiveTab('unionList')}
                  >
                    <i className="fas fa-list me-2"></i> ইউনিয়ন তালিকা
                  </button>
                </li>
                <li className="nav-item">
                  <button
                    className={`nav-link ${activeTab === 'unionReports' ? 'active' : ''} fw-bold rounded-4`}
                    onClick={() => setActiveTab('unionReports')}
                  >
                    <i className="fas fa-chart-line me-2"></i> ইউনিয়ন রিপোর্ট
                  </button>
                </li>
              </ul>
            </div>
          )}

          {unionFormData.length > 0 && activeTab === 'unionList' && (
            <Card className="border-0 shadow-sm rounded-4">
              <Card.Header className="bg-white border-bottom py-3 d-flex justify-content-between align-items-center">
                <h5 className="mb-0 fw-bold">
                  <i className="fas fa-list-alt me-2 text-primary"></i> ইউনিয়ন তালিকা (উপজেলা আইডি: {upazilaId})
                </h5>
                <Badge bg="primary" pill className="px-3 py-2">{unionFormData.length} টি ইউনিয়ন</Badge>
              </Card.Header>
              <Card.Body>
                <Form onSubmit={handleSubmitReport}>
                  <div className="table-responsive">
                    <Table striped hover bordered className="align-middle">
                      <thead className="bg-light text-center">
                        <tr>
                          <th>ID</th>
                          <th>ইউনিয়ন নাম</th>
                          <th>থানা</th>
                          <th>একপে আইডি</th>
                          <th>সার্ভার অ্যামাউন্ট</th>
                          <th style={{ minWidth: '200px' }}>একপে অ্যামাউন্ট</th>
                        </tr>
                      </thead>
                      <tbody>
                        {unionFormData.map((union) => {
                          const unionInfo = unionList.find((u) => u.id === union.id)
                          const serverAmount = unionInfo?.server_amount || 0

                          return (
                            <tr key={union.id}>
                              <td className="text-center">{union.id}</td>
                              <td className="fw-bold">{union.full_name}</td>
                              <td>{unionInfo?.thana || "-"}</td>
                              <td>{unionInfo?.AKPAY_MER_REG_ID || "-"}</td>
                              <td className="text-center fw-bold">{serverAmount}</td>
                              <td>
                                <div className="input-group">
                                  <span className="input-group-text bg-light border-end-0">৳</span>
                                  <Form.Control
                                    type="text"
                                    className="text-center border-start-0"
                                    value={union.ekpay_amount}
                                    onChange={(e) => {
                                      const value = e.target.value
                                      if (/^\d*\.?\d*$/.test(value)) {
                                        handleInputChange(union.id, "ekpay_amount", value)
                                      }
                                    }}
                                    placeholder={`${serverAmount}`}
                                  />
                                </div>
                                {!union.ekpay_amount && (
                                  <small className="text-muted d-block text-center mt-1" style={{ fontSize: '0.75rem' }}>
                                    খালি থাকলে সার্ভার অ্যামাউন্ট ব্যবহৃত হবে
                                  </small>
                                )}
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </Table>
                  </div>

                  <div className="d-flex justify-content-between mt-4">
                    <Button
                      variant="outline-secondary"
                      size="lg"
                      onClick={() => setActiveTab('unionReports')}
                      className="d-flex align-items-center gap-2"
                    >
                      <i className="fas fa-chart-line"></i> রিপোর্ট দেখুন
                    </Button>
                    <Button
                      type="submit"
                      variant="success"
                      size="lg"
                      disabled={!startDate || !endDate || unionFormData.length === 0 || isSubmitting}
                      className="d-flex align-items-center gap-2 shadow-sm"
                    >
                      {isSubmitting ? (
                        <>
                          <Spinner size="sm" animation="border" /> জমা হচ্ছে...
                        </>
                      ) : (
                        <>
                          <i className="fas fa-save"></i> রিপোর্ট জমা দিন
                        </>
                      )}
                    </Button>
                  </div>
                </Form>
              </Card.Body>
            </Card>
          )}

          {reportData && (
            <Card className="border-0 shadow-sm rounded-4 mt-4">
              <Card.Header className="bg-success text-white py-3">
                <h5 className="mb-0 fw-bold">
                  <i className="fas fa-file-invoice me-2"></i> একপে রিপোর্ট ({reportData.date.start_date} হতে {reportData.date.end_date})
                </h5>
              </Card.Header>
              <Card.Body>
                <Table bordered hover responsive>
                  <thead className="table-light">
                    <tr>
                      <th>ইউনিয়ন</th>
                      <th className="text-end">একপে অ্যামাউন্ট</th>
                      <th className="text-end">সার্ভার অ্যামাউন্ট</th>
                      <th className="text-end">পার্থক্য</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reportData.details.map((detail, index) => (
                      <tr key={index}>
                        <td>{detail.union}</td>
                        <td className="text-end fw-bold">৳{detail.ekpay_amount.toFixed(2)}</td>
                        <td className="text-end fw-bold">৳{detail.server_amount.toFixed(2)}</td>
                        <td className={`text-end fw-bold ${detail.ekpay_amount - detail.server_amount !== 0 ? 'text-danger' : 'text-success'}`}>
                          ৳{(detail.ekpay_amount - detail.server_amount).toFixed(2)}
                        </td>
                      </tr>
                    ))}
                    <tr className="table-primary fw-bold">
                      <td>মোট</td>
                      <td className="text-end">
                        ৳{reportData.details.reduce((sum, detail) => sum + detail.ekpay_amount, 0).toFixed(2)}
                      </td>
                      <td className="text-end">
                        ৳{reportData.details.reduce((sum, detail) => sum + detail.server_amount, 0).toFixed(2)}
                      </td>
                      <td className="text-end">
                        ৳{reportData.details.reduce((sum, detail) => sum + (detail.ekpay_amount - detail.server_amount), 0).toFixed(2)}
                      </td>
                    </tr>
                  </tbody>
                </Table>
              </Card.Body>
            </Card>
          )}

          {activeTab === 'unionReports' && (
            <Card className="border-0 shadow-sm rounded-4">
              <Card.Header className="bg-white border-bottom py-3 d-flex justify-content-between align-items-center">
                <h5 className="mb-0 fw-bold">
                  <i className="fas fa-chart-line me-2 text-primary"></i> ইউনিয়ন ভিত্তিক রিপোর্ট
                </h5>
                <Button variant="outline-primary" size="sm" onClick={() => setActiveTab('unionList')}>
                  <i className="fas fa-arrow-left me-1"></i> তালিকায় ফিরে যান
                </Button>
              </Card.Header>
              <Card.Body>
                <Row className="mb-4">
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label className="fw-bold"><i className="fas fa-building me-1"></i> ইউনিয়ন নির্বাচন করুন</Form.Label>
                      <div className="d-flex gap-2">
                        <Form.Select
                          value={selectedUnion}
                          onChange={handleUnionChange}
                          disabled={unionList.length === 0}
                          className="shadow-sm"
                        >
                          <option value="">নির্বাচন করুন...</option>
                          {unionList.map((union) => (
                            <option key={union.id} value={union.short_name_e || union.full_name}>
                              {union.full_name}
                            </option>
                          ))}
                        </Form.Select>
                        <Button
                          variant="primary"
                          onClick={() => selectedUnion && fetchUnionReports(1)}
                          disabled={!selectedUnion}
                          className="shadow-sm"
                        >
                          <i className="fas fa-search"></i>
                        </Button>
                      </div>
                    </Form.Group>
                  </Col>
                </Row>

                {isUnionReportsLoading ? (
                  <div className="text-center py-5">
                    <Spinner animation="border" variant="primary" />
                    <p className="mt-2 text-muted">লোড হচ্ছে...</p>
                  </div>
                ) : unionReports.length > 0 ? (
                  <>
                    <Table hover bordered responsive className="align-middle">
                      <thead className="bg-light">
                        <tr>
                          <th className="text-center">#</th>
                          <th>শুরুর তারিখ</th>
                          <th>শেষ তারিখ</th>
                          <th className="text-end">একপে অ্যামাউন্ট</th>
                          <th className="text-end">সার্ভার অ্যামাউন্ট</th>
                          <th className="text-end">পার্থক্য</th>
                        </tr>
                      </thead>
                      <tbody>
                        {unionReports.map((report, index) => (
                          <tr key={report.id}>
                            <td className="text-center">{(currentPage - 1) * reportsPerPage + index + 1}</td>
                            <td>{report.start_date}</td>
                            <td>{report.end_date}</td>
                            <td className="text-end fw-bold">৳{Number.parseFloat(report.ekpay_amount).toFixed(2)}</td>
                            <td className="text-end fw-bold">৳{Number.parseFloat(report.server_amount).toFixed(2)}</td>
                            <td className="text-end fw-bold text-danger">৳{Number.parseFloat(report.difference_amount).toFixed(2)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                    <nav className="mt-4">
                      <ul className="pagination justify-content-center">{renderPaginationItems()}</ul>
                    </nav>
                  </>
                ) : (
                  <div className="alert alert-info d-flex align-items-center rounded-3">
                    <i className="fas fa-info-circle fa-2x me-3"></i>
                    <div>
                      {selectedUnion ? "এই ইউনিয়নের জন্য কোন রিপোর্ট পাওয়া যায়নি।" : "রিপোর্ট দেখতে একটি ইউনিয়ন নির্বাচন করুন।"}
                    </div>
                  </div>
                )}
              </Card.Body>
            </Card>
          )}
        </>
      )}
    </Container>
  )
}

export default EkpayReports
