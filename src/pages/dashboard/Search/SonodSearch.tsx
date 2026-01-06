/* eslint-disable react-hooks/exhaustive-deps */
"use client"

import useAllServices from "@/hooks/useAllServices"
import { useState, useEffect } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { Card, Button, Form, Badge, Spinner, Row, Col } from "react-bootstrap"
import { message, Tooltip } from "antd"

interface SonodData {
  id: number
  unioun_name: string
  year: string
  sonod_Id: string
  sonod_name: string
  applicant_national_id_number: string
  applicant_birth_certificate_number: string | null
  applicant_name: string
  applicant_date_of_birth: string | null
  applicant_gender: string
  payment_status: string
  stutus: string
  successor_list: string
  orthoBchor: string
  renewed_id: number | null
  renewed: number
  hasEnData: number
  renew_able: boolean
  download_url: string
  download_url_en: string
}

interface ErrorDetail {
  code: number
  message: string
  errMsg: string
}

interface ApiResponse {
  data: SonodData | { message: string; data: null }
  isError: boolean
  error: ErrorDetail | null
  status_code: number
}

export default function SonodSearch() {
  const navigate = useNavigate()
  const location = useLocation()
  const services = useAllServices()

  const searchParams = new URLSearchParams(location.search)
  const urlSonodName = searchParams.get("sonod_name") || ""
  const urlSonodId = searchParams.get("sonod_Id") || ""

  const [sonodName, setSonodName] = useState<string>(urlSonodName)
  const [sonodId, setSonodId] = useState<string>(urlSonodId)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [result, setResult] = useState<ApiResponse | null>(null)
  const [error, setError] = useState<string | null>(null)

  const VITE_BASE_API_URL = import.meta.env.VITE_BASE_API_URL;
  const VITE_BASE_DOC_URL = import.meta.env.VITE_BASE_DOC_URL;

  const handleCopy = (text: string) => {
    if (text) {
      navigator.clipboard.writeText(text);
      message.success("ক্লিপবোর্ডে কপি হয়েছে!");
    }
  };

  const fetchData = async (name: string, id: string) => {
    if (!id && !name) return

    setIsLoading(true)
    setError(null)
    setResult(null)

    try {
      const encodedName = encodeURIComponent(name)
      const url = `${VITE_BASE_API_URL}/sonod/search?sonod_name=${encodedName}&sonod_Id=${id}`

      const response = await fetch(url)
      const data = await response.json()
      setResult(data)
    } catch (err) {
      setError("সার্ভারে সমস্যা হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSearch = () => {
    if (!sonodId && !sonodName) {
      message.warning("অনুগ্রহ করে সনদ নাম বা সনদ আইডি প্রদান করুন")
      return
    }

    const params = new URLSearchParams()
    if (sonodName) params.set("sonod_name", sonodName)
    if (sonodId) params.set("sonod_Id", sonodId)

    navigate(`?${params.toString()}`)
    fetchData(sonodName, sonodId)
  }

  useEffect(() => {
    if (urlSonodName || urlSonodId) {
      fetchData(urlSonodName, urlSonodId)
    }
  }, [urlSonodName, urlSonodId])

  const getErrorMessage = () => {
    if (error) return error
    if (result && result.isError) {
      if (result.data && typeof result.data === "object" && "message" in result.data) {
        return result.data.message
      }
      if (result.error && result.error.message) {
        return result.error.message
      }
      return "কোন সনদ পাওয়া যায়নি। অনুগ্রহ করে সঠিক তথ্য দিয়ে আবার চেষ্টা করুন।"
    }
    return null
  }

  const errorMessage = getErrorMessage()

  const renderStatusBadge = (status: string) => {
    const badgeStyle = { fontSize: '14px', padding: '8px 15px', fontWeight: '700' };
    if (status === "approved" || status === "অনুমোদিত") {
      return <Badge bg="success" className="rounded-pill shadow-sm border border-success" style={badgeStyle}><i className="fas fa-check-circle me-2"></i> অনুমোদিত</Badge>;
    }
    return <Badge bg="secondary" className="rounded-pill shadow-sm" style={badgeStyle}><i className="fas fa-info-circle me-2"></i> {status}</Badge>;
  };

  const renderPaymentBadge = (status: string) => {
    const badgeStyle = { fontSize: '13px', padding: '6px 12px', fontWeight: '700' };
    if (status === "Paid" || status === "পরিশোধিত") {
      return <Badge bg="primary" className="rounded-pill shadow-sm border border-primary" style={badgeStyle}><i className="fas fa-money-check-alt me-2"></i> পরিশোধিত</Badge>;
    }
    return <Badge bg="secondary" className="rounded-pill shadow-sm" style={badgeStyle}><i className="fas fa-clock me-2"></i> {status}</Badge>;
  };

  return (
    <div className="p-2 p-md-4 bg-light min-vh-100">
      <style>{`
                .detail-label {
                    font-size: 13px;
                    color: #64748b;
                    font-weight: 600;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                    margin-bottom: 4px;
                }
                .detail-value {
                    font-size: 17px;
                    font-weight: 700;
                    color: #1e293b;
                }
                .copyable-text {
                    cursor: pointer;
                    transition: all 0.2s;
                    border-bottom: 1px dashed transparent;
                }
                .copyable-text:hover {
                    color: #0d6efd !important;
                    border-bottom-color: #0d6efd;
                }
                .search-card {
                    border-radius: 12px;
                    overflow: hidden;
                }
                .result-card {
                    border-radius: 16px;
                    overflow: hidden;
                }
                @media (max-width: 768px) {
                    .action-buttons {
                        flex-direction: column;
                        width: 100%;
                    }
                    .action-buttons a, .action-buttons button {
                        width: 100%;
                        margin-bottom: 8px;
                    }
                    .result-header {
                        flex-direction: column;
                        gap: 12px;
                        text-align: center;
                    }
                }
            `}</style>

      <div className="text-center mb-5">
        <h3 className="fw-bold text-primary mb-2">সনদ অনুসন্ধান</h3>
        <p className="text-muted">আপনার সনদ নাম বা সনদ আইডি দিয়ে অনুসন্ধান করুন</p>
      </div>

      <Card className="search-card mb-4 shadow-sm border-0">
        <Card.Header className="bg-white border-bottom-0 pt-4 px-4 pb-0">
          <h5 className="fw-bold text-primary">সনদ বিবরণ প্রদান করুন</h5>
        </Card.Header>
        <Card.Body className="p-4">
          <Row className="g-3">
            <Col md={6}>
              <Form.Group controlId="sonod-name">
                <Form.Label className="fw-bold mb-2">সনদ নাম</Form.Label>
                <Form.Select
                  value={sonodName}
                  onChange={(e) => setSonodName(e.target.value)}
                  size="lg"
                  className="border-2"
                >
                  <option value="">সনদ নাম নির্বাচন করুন</option>
                  {services.map((option) => (
                    <option key={option.title} value={option.title}>
                      {option.title}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group controlId="sonod-id">
                <Form.Label className="fw-bold mb-2">সনদ আইডি</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="৭৭৭৩৭১২৪০১৩৭৪"
                  value={sonodId}
                  onChange={(e) => setSonodId(e.target.value)}
                  size="lg"
                  className="border-2"
                />
              </Form.Group>
            </Col>
          </Row>
        </Card.Body>
        <Card.Footer className="bg-white border-top-0 p-4 pt-0 d-flex justify-content-end">
          <Button
            variant="primary"
            size="lg"
            onClick={handleSearch}
            disabled={isLoading}
            className="px-4 fw-bold"
          >
            {isLoading ? (
              <>
                <Spinner animation="border" size="sm" className="me-2" />
                অনুসন্ধান হচ্ছে...
              </>
            ) : (
              <>
                <i className="fas fa-search me-2"></i>
                অনুসন্ধান করুন
              </>
            )}
          </Button>
        </Card.Footer>
      </Card>

      {isLoading && (
        <Card className="result-card shadow-sm border-0 mb-4 h-100">
          <Card.Body className="p-5 text-center">
            <Spinner animation="grow" variant="primary" className="mb-3" />
            <h5 className="text-muted">তথ্য পাওয়া যাচ্ছে, অনুগ্রহ করে অপেক্ষা করুন...</h5>
          </Card.Body>
        </Card>
      )}

      {!isLoading && result && !result.isError && "id" in result.data && (
        <Card className="result-card shadow-sm border-0 mb-4 animate__animated animate__fadeIn">
          <Card.Header className="bg-primary bg-opacity-10 border-bottom-0 p-4">
            <div className="d-flex justify-content-between align-items-center result-header">
              <div>
                <h4 className="fw-bold text-primary mb-1">{result.data.sonod_name}</h4>
                <Tooltip title="কপি করতে ক্লিক করুন">
                  <p
                    className="text-muted mb-0 fw-semibold copyable-text"
                    onClick={() => "id" in result.data && handleCopy(result.data.sonod_Id)}
                  >
                    সনদ আইডিঃ {result.data.sonod_Id} <i className="far fa-copy ms-1 small"></i>
                  </p>
                </Tooltip>
              </div>
              <div className="d-flex gap-2 align-items-center">
                {renderStatusBadge(result.data.stutus)}
                {renderPaymentBadge(result.data.payment_status)}
              </div>
            </div>
          </Card.Header>
          <Card.Body className="p-4">
            <Row className="g-4 mb-4">
              <Col md={6}>
                <div className="p-3 bg-light rounded-3 h-100">
                  <div className="mb-4">
                    <div className="detail-label"><i className="fas fa-user me-2"></i>আবেদনকারীর নাম</div>
                    <Tooltip title="কপি করতে ক্লিক করুন">
                      <div className="detail-value copyable-text" onClick={() => "id" in result.data && handleCopy(result.data.applicant_name)}>
                        {"id" in result.data && result.data.applicant_name}
                      </div>
                    </Tooltip>
                  </div>
                  <div className="mb-4">
                    <div className="detail-label"><i className="fas fa-id-card me-2"></i>জাতীয় পরিচয়পত্র নম্বর</div>
                    <Tooltip title="কপি করতে ক্লিক করুন">
                      <div className="detail-value copyable-text" onClick={() => "id" in result.data && handleCopy(result.data.applicant_national_id_number)}>
                        {"id" in result.data && result.data.applicant_national_id_number}
                      </div>
                    </Tooltip>
                  </div>
                  {result.data.applicant_birth_certificate_number && (
                    <div className="mb-4">
                      <div className="detail-label"><i className="fas fa-baby me-2"></i>জন্ম নিবন্ধন নম্বর</div>
                      <Tooltip title="কপি করতে ক্লিক করুন">
                        <div className="detail-value copyable-text" onClick={() => "id" in result.data && result.data.applicant_birth_certificate_number && handleCopy(result.data.applicant_birth_certificate_number)}>
                          {"id" in result.data && result.data.applicant_birth_certificate_number}
                        </div>
                      </Tooltip>
                    </div>
                  )}
                  <div className="mb-0">
                    <div className="detail-label"><i className="fas fa-venus-mars me-2"></i>লিঙ্গ</div>
                    <Tooltip title="কপি করতে ক্লিক করুন">
                      <div className="detail-value copyable-text" onClick={() => "id" in result.data && handleCopy(result.data.applicant_gender)}>
                        {"id" in result.data && result.data.applicant_gender}
                      </div>
                    </Tooltip>
                  </div>
                </div>
              </Col>
              <Col md={6}>
                <div className="p-3 bg-light rounded-3 h-100">
                  <div className="mb-4">
                    <div className="detail-label"><i className="fas fa-university me-2"></i>ইউনিয়ন</div>
                    <Tooltip title="কপি করতে ক্লিক করুন">
                      <div className="detail-value copyable-text" onClick={() => "id" in result.data && handleCopy(result.data.unioun_name)}>
                        {"id" in result.data && result.data.unioun_name}
                      </div>
                    </Tooltip>
                  </div>
                  {result.data.applicant_date_of_birth && (
                    <div className="mb-4">
                      <div className="detail-label"><i className="fas fa-birthday-cake me-2"></i>জন্ম তারিখ</div>
                      <Tooltip title="কপি করতে ক্লিক করুন">
                        <div className="detail-value copyable-text" onClick={() => "id" in result.data && result.data.applicant_date_of_birth && handleCopy(result.data.applicant_date_of_birth)}>
                          {"id" in result.data && result.data.applicant_date_of_birth}
                        </div>
                      </Tooltip>
                    </div>
                  )}
                  <div className="mb-4">
                    <div className="detail-label"><i className="fas fa-calendar-alt me-2"></i>অর্থবছর</div>
                    <Tooltip title="কপি করতে ক্লিক করুন">
                      <div className="detail-value copyable-text" onClick={() => "id" in result.data && handleCopy(result.data.orthoBchor)}>
                        {"id" in result.data && result.data.orthoBchor}
                      </div>
                    </Tooltip>
                  </div>
                  <div className="mb-0">
                    <div className="detail-label"><i className="fas fa-history me-2"></i>ইস্যু বছর</div>
                    <Tooltip title="কপি করতে ক্লিক করুন">
                      <div className="detail-value copyable-text" onClick={() => "id" in result.data && handleCopy(result.data.year)}>
                        {"id" in result.data && result.data.year}
                      </div>
                    </Tooltip>
                  </div>
                </div>
              </Col>
            </Row>

            {result.data.successor_list &&
              result.data.successor_list.trim() !== "" &&
              result.data.successor_list.toLowerCase() !== "null" &&
              result.data.successor_list !== "[]" && (
                <Row className="mb-4">
                  <Col md={12}>
                    <div className="p-4 bg-white rounded-3 shadow-sm border-start border-4 border-primary">
                      <div className="detail-label text-primary mb-3"><i className="fas fa-users me-2"></i>উত্তরাধিকারী তালিকা</div>
                      <Tooltip title="কপি করতে ক্লিক করুন">
                        <div className="detail-value copyable-text" style={{ fontSize: '16px', color: '#1e293b', lineHeight: '1.6' }} onClick={() => "id" in result.data && handleCopy(result.data.successor_list)}>
                          {"id" in result.data && result.data.successor_list}
                        </div>
                      </Tooltip>
                    </div>
                  </Col>
                </Row>
              )}

            <hr className="my-4 opacity-10" />

            <div className="d-flex justify-content-between align-items-center action-buttons pt-2">
              <Tooltip title="কপি করতে ক্লিক করুন">
                <div
                  className="text-primary fw-bold copyable-text px-4 py-2 bg-primary bg-opacity-10 rounded-3 shadow-sm mb-3 mb-md-0"
                  style={{ fontSize: '18px', border: '1px solid rgba(13, 110, 253, 0.3)' }}
                  onClick={() => "id" in result.data && handleCopy(result.data.id.toString())}
                >
                  <span className="small text-muted me-2" style={{ fontSize: '14px' }}>DATABASE ID:</span> {result.data.id} <i className="far fa-copy ms-2 small"></i>
                </div>
              </Tooltip>
              <div className="d-flex gap-2 action-buttons">
                <Button
                  onClick={() => "id" in result.data && navigate(`/dashboard/sonod/${encodeURIComponent(result.data.sonod_name)}/action/edit/${result.data.id}`)}
                  variant="outline-info"
                  className="fw-bold"
                >
                  <i className="fas fa-edit me-2"></i>
                  এডিট করুন
                </Button>

                <Tooltip title="প্রাপ্তী স্বীকারপত্র">
                  <Button
                    as="a"
                    href={`${VITE_BASE_DOC_URL}/applicant/copy/download/${result.data.id}`}
                    variant="outline-secondary"
                    target="_blank"
                    className="fw-bold"
                  >
                    <i className="fas fa-file-invoice me-2"></i>
                    রশিদ
                  </Button>
                </Tooltip>

                <Tooltip title="রশিদ প্রিন্ট">
                  <Button
                    as="a"
                    href={`${VITE_BASE_DOC_URL}/sonod/invoice/download/${result.data.id}`}
                    variant="outline-primary"
                    target="_blank"
                    className="fw-bold"
                  >
                    <i className="fas fa-print me-2"></i>
                    ইনভয়েস
                  </Button>
                </Tooltip>

                <Button
                  as="a"
                  href={result.data.download_url}
                  variant="success"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="fw-bold px-4 shadow-sm"
                >
                  <i className="fas fa-download me-2"></i>
                  সনদ ডাউনলোড
                </Button>
              </div>
            </div>
          </Card.Body>
        </Card>
      )}

      {errorMessage && (
        <Card className="border-0 shadow-sm bg-warning bg-opacity-10 mt-4">
          <Card.Body className="d-flex align-items-center p-4">
            <i className="fas fa-exclamation-triangle text-warning fs-3 me-3"></i>
            <div className="fw-bold text-dark">{errorMessage}</div>
          </Card.Body>
        </Card>
      )}
    </div>
  )
}
