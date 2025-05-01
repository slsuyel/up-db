"use client"

import { useState, useEffect } from "react"
// import Image from "next/image"
import { Link, useNavigate, useLocation } from "react-router-dom"

interface SonodReport {
  sonod_name: string
  pending_count: number
  approved_count: number
  cancel_count: number
}

interface CachedAdminData {
  sonod_reports: SonodReport[]
  payment_reports: any[]
  totals: {
    total_pending: number
    total_approved: number
    total_cancel: number
    total_payments: number
    total_amount: string
  }
}

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

  // Parse search params from URL
  const searchParams = new URLSearchParams(location.search)
  const urlSonodName = searchParams.get("sonod_name") || ""
  const urlSonodId = searchParams.get("sonod_Id") || ""

  const [sonodName, setSonodName] = useState<string>(urlSonodName)
  const [sonodId, setSonodId] = useState<string>(urlSonodId)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [result, setResult] = useState<ApiResponse | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [sonodOptions, setSonodOptions] = useState<SonodReport[]>([])

  // Load sonod options from localStorage
  useEffect(() => {
    try {
      const cachedData = localStorage.getItem("cachedAdminData")
      if (cachedData) {
        const parsedData: CachedAdminData = JSON.parse(cachedData)
        if (parsedData.sonod_reports && Array.isArray(parsedData.sonod_reports)) {
          setSonodOptions(parsedData.sonod_reports)
        }
      }
    } catch (err) {
      console.error("Error loading sonod options from localStorage:", err)
    }
  }, [])

  // Function to fetch data based on search parameters
  const fetchData = async (name: string, id: string) => {
    if (!id && !name) {
      return
    }

    setIsLoading(true)
    setError(null)
    setResult(null)

    try {
      // Encode the parameters properly
      const encodedName = encodeURIComponent(name)
      const url = `https://api.uniontax.gov.bd/api/sonod/search?sonod_name=${encodedName}&sonod_Id=${id}`

      const response = await fetch(url)
      const data = await response.json()

      setResult(data)
    } catch (err) {
      setError("সার্ভারে সমস্যা হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।")
    } finally {
      setIsLoading(false)
    }
  }

  // Handle search button click
  const handleSearch = () => {
    if (!sonodId && !sonodName) {
      setError("অনুগ্রহ করে সনদ নাম বা সনদ আইডি প্রদান করুন")
      return
    }

    // Update URL with search parameters
    const params = new URLSearchParams()
    if (sonodName) params.set("sonod_name", sonodName)
    if (sonodId) params.set("sonod_Id", sonodId)

    navigate(`?${params.toString()}`)

    // Fetch data with current form values
    fetchData(sonodName, sonodId)
  }

  // Auto-fetch data when URL parameters change
  useEffect(() => {
    if (urlSonodName || urlSonodId) {
      fetchData(urlSonodName, urlSonodId)
    }
  }, [urlSonodName, urlSonodId])

  // Get the appropriate error message to display
  const getErrorMessage = () => {
    if (error) {
      return error
    }

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

  return (
    <main>
      <div className="container py-5">
        <div className="text-center mb-5">
          <div className="d-flex justify-content-center mb-3">
            {/* <Image src="/bangladesh-govt-logo.png" alt="Bangladesh Government Logo" width={80} height={80} /> */}
          </div>
          <h1 className="fw-bold text-success mb-2">সনদ অনুসন্ধান</h1>
          <p className="text-muted">আপনার সনদ নাম বা সনদ আইডি দিয়ে অনুসন্ধান করুন</p>
        </div>

        <div className="card mb-4 border-success-subtle shadow-sm">
          <div className="card-header bg-success bg-opacity-10 border-bottom border-success-subtle">
            <h5 className="card-title text-success mb-0">সনদ অনুসন্ধান</h5>
            <p className="card-text small text-muted mb-0">সনদ নাম অথবা সনদ আইডি দিয়ে অনুসন্ধান করুন</p>
          </div>
          <div className="card-body">
            <div className="row g-3">
              <div className="col-md-6">
                <label htmlFor="sonod-name" className="form-label">
                  সনদ নাম
                </label>
                <select
                  className="form-select"
                  id="sonod-name"
                  value={sonodName}
                  onChange={(e) => setSonodName(e.target.value)}
                >
                  <option value="">সনদ নাম নির্বাচন করুন</option>
                  {sonodOptions.map((option) => (
                    <option key={option.sonod_name} value={option.sonod_name}>
                      {option.sonod_name} ({option.approved_count})
                    </option>
                  ))}
                </select>
              </div>
              <div className="col-md-6">
                <label htmlFor="sonod-id" className="form-label">
                  সনদ আইডি
                </label>
                <input
                  type="text"
                  className="form-control"
                  id="sonod-id"
                  placeholder="7773712401374"
                  value={sonodId}
                  onChange={(e) => setSonodId(e.target.value)}
                />
              </div>
            </div>
          </div>
          <div className="card-footer bg-light d-flex justify-content-end">
            <button className="btn btn-success" onClick={handleSearch} disabled={isLoading}>
              {isLoading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  অনুসন্ধান হচ্ছে...
                </>
              ) : (
                <>
                  <i className="bi bi-search me-2"></i>
                  অনুসন্ধান করুন
                </>
              )}
            </button>
          </div>
        </div>

        {isLoading && (
          <div className="card border-success-subtle shadow-sm">
            <div className="card-header bg-success bg-opacity-10">
              <div className="placeholder-glow">
                <span className="placeholder col-6"></span>
              </div>
              <div className="placeholder-glow">
                <span className="placeholder col-4"></span>
              </div>
            </div>
            <div className="card-body">
              <div className="placeholder-glow">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="d-flex justify-content-between mb-3">
                    <span className="placeholder col-3"></span>
                    <span className="placeholder col-5"></span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {!isLoading && result && !result.isError && "id" in result.data && (
          <div className="card border-success-subtle shadow-sm">
            <div className="card-header bg-success bg-opacity-10 border-bottom border-success-subtle">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h5 className="card-title text-success mb-0">{result.data.sonod_name}</h5>
                  <p className="card-text small text-muted mb-0">সনদ আইডিঃ {result.data.sonod_Id}</p>
                </div>
                <span
                  className={`badge ${result.data.stutus === "approved" ? "bg-success bg-opacity-10 text-success border border-success-subtle" : "bg-secondary"}`}
                >
                  <i className="bi bi-check-circle me-1"></i>
                  {result.data.stutus === "approved" ? "অনুমোদিত" : result.data.stutus}
                </span>
              </div>
            </div>
            <div className="card-body">
              <div className="row g-4">
                <div className="col-md-6">
                  <div className="mb-3">
                    <h6 className="text-muted small">আবেদনকারীর নাম</h6>
                    <p className="fs-5 fw-medium">{result.data.applicant_name}</p>
                  </div>
                  <div className="mb-3">
                    <h6 className="text-muted small">জাতীয় পরিচয়পত্র নম্বর</h6>
                    <p className="fs-5 fw-medium">{result.data.applicant_national_id_number}</p>
                  </div>
                  <div className="mb-3">
                    <h6 className="text-muted small">লিঙ্গ</h6>
                    <p className="fs-5 fw-medium">{result.data.applicant_gender}</p>
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="mb-3">
                    <h6 className="text-muted small">ইউনিয়ন</h6>
                    <p className="fs-5 fw-medium">{result.data.unioun_name}</p>
                  </div>
                  <div className="mb-3">
                    <h6 className="text-muted small">অর্থবছর</h6>
                    <p className="fs-5 fw-medium">{result.data.orthoBchor}</p>
                  </div>
                  <div className="mb-3">
                    <h6 className="text-muted small">পেমেন্ট স্ট্যাটাস</h6>
                    <span
                      className={`badge ${result.data.payment_status === "Paid" ? "bg-primary bg-opacity-10 text-primary border border-primary-subtle" : "bg-secondary"}`}
                    >
                      {result.data.payment_status === "Paid" ? "পরিশোধিত" : result.data.payment_status}
                    </span>
                  </div>
                </div>
              </div>

              <hr className="my-4" />

              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <p className="small text-muted mb-1">সনদ আইডি: {result.data.id}</p>
                  <p className="small text-muted mb-0">ইস্যু বছর: {result.data.year}</p>
                </div>
                <div className="d-flex gap-2">
                <Link
                    to={`/dashboard/sonod/${encodeURIComponent(result.data.sonod_name)}/action/edit/${result.data.id}`}
                    className="btn btn-info btn-sm mr-1"
                  >
                    <i className="bi bi-pencil-square me-2"></i>
                    এডিট করুন
                  </Link>



                <Link
          to={`https://api.uniontax.gov.bd/applicant/copy/download/${result.data.id}`}
          className="btn btn-success btn-sm mr-1"
          target="_blank"
        >
          প্রাপ্তী স্বীকারপত্র
        </Link>
        
        <Link
          to={`https://api.uniontax.gov.bd/sonod/invoice/download/${result.data.id}`}
          className="btn btn-info btn-sm mr-1"
          target="_blank"
        >
          রশিদ প্রিন্ট
        </Link>



  

                  <a
                    href={result.data.download_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-outline-success"
                  >
                    <i className="bi bi-download me-2"></i>
                    সনদ ডাউনলোড করুন
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}

        {errorMessage && (
          <div className="alert alert-warning mt-4" role="alert">
            <div className="d-flex align-items-center">
              <i className="bi bi-exclamation-triangle-fill me-2"></i>
              <div>{errorMessage}</div>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
