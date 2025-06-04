/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import type React from "react"

import { useState, } from "react"
import { message } from "antd"
import Breadcrumbs from "@/components/reusable/Breadcrumbs"
import type { MaintenanceFee, FilterState, } from "@/types/maintenance"
import useMobile from "@/hooks/useMobile"
import { useMaintenanceFeeCheckMutation } from "@/redux/api/auth/authApi"


// Add this function before the MaintenanceFees component
const generateMonthlyOptions = () => {
  const options = []
  const startDate = new Date(2025, 5) // June 2025 (month is 0-indexed)
  const currentDate = new Date()

  // Helper function to convert numbers to Bangla
  const toBanglaNumber = (num: number) => {
    const banglaDigits = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"]
    return num
      .toString()
      .split("")
      .map((digit) => banglaDigits[Number.parseInt(digit)])
      .join("")
  }

  // Generate months from start date to current date
  const iterDate = new Date(startDate)
  while (iterDate <= currentDate) {
    const year = iterDate.getFullYear()
    const month = iterDate.getMonth() + 1 // Convert to 1-indexed
    const monthStr = month.toString().padStart(2, "0")

    const value = `${year}-${monthStr}`
    const label = `${toBanglaNumber(year)}-${toBanglaNumber(Number.parseInt(monthStr))}`

    options.push({ value, label })

    // Move to next month
    iterDate.setMonth(iterDate.getMonth() + 1)
  }

  return options.reverse() // Show most recent first
}

// Phone link component
const PhoneLink = ({ phone, label }: { phone: string | null; label: string }) => {
  if (!phone) {
    return (
      <div className="d-flex align-items-center gap-1 text-muted">
        <span className="bi bi-telephone opacity-50" style={{ fontSize: 14 }} />
        <span>{label}: N/A</span>
      </div>
    )
  }

  return (
    <div className="d-flex align-items-center gap-1">
      <span className="bi bi-telephone text-primary" style={{ fontSize: 14 }} />
      <span>{label}: </span>
      <a href={`tel:${phone}`} className="text-decoration-none text-primary fw-medium" style={{ fontSize: "0.9rem" }}>
        {phone}
      </a>
    </div>
  )
}

const MaintenanceFees = () => {
  const [maintenanceFeeCheck, { isLoading, data, error }] = useMaintenanceFeeCheckMutation()
  const token = localStorage.getItem(`token`)
  const isMobile = useMobile()

  const [filters, setFilters] = useState<FilterState>({
    type: "yearly",
    period: "2024-25",
    status: "paid",
    upazila_name: "Tetulia",
  })

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { id, value } = event.target
    setFilters((prev) => ({ ...prev, [id]: value }))
  }





  const handleSubmit = async (e: any) => {
    e.preventDefault()
    // fetchData()
    const result = await maintenanceFeeCheck({ token, filters }).unwrap()
    console.log(result);
  }

  const formatCurrency = (amount: string) => {
    return `৳${Number.parseFloat(amount).toLocaleString()}`
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("bn-BD", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }
  console.log(data);
  // Card component for mobile view
  const MobileCard = ({ item }: { item: MaintenanceFee }) => {
    return (
      <div className="card mb-3 border-0 shadow-sm">
        <div className="card-header bg-light d-flex justify-content-between align-items-center">
          <h5 className="mb-0">{item.full_name}</h5>
          <span className={`badge ${item.payment_info ? "bg-success" : "bg-warning"}`}>
            {item.payment_info ? "পরিশোধিত" : "বকেয়া"}
          </span>
        </div>
        <div className="card-body">
          <div className="row mb-2">
            <div className="col-6 text-muted">সংক্ষিপ্ত নাম:</div>
            <div className="col-6">{item.short_name_e}</div>
          </div>
          <div className="row mb-2">
            <div className="col-6 text-muted">অবস্থান:</div>
            <div className="col-6">
              {item.upazila_name}, {item.district_name}, {item.division_name}
            </div>
          </div>
          <div className="row mb-2">
            <div className="col-6 text-muted">ফি পরিমাণ:</div>
            <div className="col-6 fw-bold">{formatCurrency(item.maintance_fee)}</div>
          </div>
          <div className="row mb-2">
            <div className="col-6 text-muted">ফি টাইপ:</div>
            <div className="col-6">
              <span className="badge bg-primary">{item.maintance_fee_type === "yearly" ? "বাৎসরিক" : "মাসিক"}</span>
            </div>
          </div>
          <div className="row mb-2">
            <div className="col-6 text-muted">সময়কাল:</div>
            <div className="col-6">{item.payment_info?.period || "-"}</div>
          </div>
          <div className="row mb-2">
            <div className="col-6 text-muted">পেমেন্ট তারিখ:</div>
            <div className="col-6">{item.payment_info?.paid_at ? formatDate(item.payment_info.paid_at) : "-"}</div>
          </div>
          <div className="row mb-2">
            <div className="col-12 text-muted mb-2">যোগাযোগ:</div>
            <div className="col-12">
              <div className="d-flex flex-column gap-2">
                <PhoneLink phone={item.chairman_phone} label="চেয়ারম্যান" />
                <PhoneLink phone={item.secretary_phone} label="সচিব" />
                <PhoneLink phone={item.udc_phone} label="UDC" />
                {item.user_phone && <PhoneLink phone={item.user_phone} label="ইউজার" />}
              </div>
            </div>
          </div>
        </div>
        <div className="card-footer bg-white">
          <button
            className="btn btn-sm btn-outline-primary w-100"
            onClick={() => message.info("বিস্তারিত দেখার ফাংশনালিটি যোগ করা হবে")}
          >
            বিস্তারিত দেখুন
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="container bg-white p-4 rounded shadow-sm">
      <Breadcrumbs current="রক্ষণাবেক্ষণ ফি" />
      <h4 className="mb-4 border-bottom pb-2 text-primary">ইউনিয়নের রক্ষণাবেক্ষণ ফি</h4>

      <form onSubmit={handleSubmit}>
        <div className="row g-3 align-items-end mb-4">
          <div className="col-md-3 col-6">
            <label htmlFor="type" className="form-label fw-bold">
              ফি টাইপ
            </label>
            <select id="type" className="form-select" value={filters.type} onChange={handleInputChange}>
              <option value="all">সকল</option>
              <option value="yearly">বাৎসরিক</option>
              <option value="monthly">মাসিক</option>
            </select>
          </div>

          <div className="col-md-3 col-6">
            <label htmlFor="period" className="form-label fw-bold">
              সময়কাল
            </label>
            <select id="period" className="form-select" value={filters.period} onChange={handleInputChange}>
              <option value="all">সকল</option>
              {filters.type === "monthly" ? (
                <>
                  {generateMonthlyOptions().map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </>
              ) : (
                <>
                  <option value="2024-25">২০২৪-২৫</option>
                  <option value="2023-24">২০২৩-২৪</option>
                  <option value="2022-23">২০২২-২৩</option>
                  <option value="2021-22">২০২১-২২</option>
                  <option value="2020-21">২০২০-২১</option>
                </>
              )}
            </select>
          </div>

          <div className="col-md-3 col-6">
            <label htmlFor="status" className="form-label fw-bold">
              স্টেটাস
            </label>
            <select id="status" className="form-select" value={filters.status} onChange={handleInputChange}>
              <option value="all">সকল</option>
              <option value="paid">পরিশোধিত</option>
              <option value="pending">বকেয়া</option>
            </select>
          </div>

          <div className="col-md-3 col-6">
            <label htmlFor="upazila_name" className="form-label fw-bold">
              উপজেলা
            </label>
            <select id="upazila_name" className="form-select" value={filters.upazila_name} onChange={handleInputChange}>
              <option value="all">সকল</option>
              <option value="Tetulia">তেতুলিয়া</option>
              <option value="Panchagarh Sadar">পঞ্চগড় সদর</option>
            </select>
          </div>

          <div className="col-12 d-flex justify-content-end mt-3">
            <button type="submit" className="btn btn-primary">
              {isLoading ? "লোড হচ্ছে..." : "ফিল্টার করুন"}
            </button>
          </div>
        </div>
      </form>

      {error && (
        <div className="alert alert-danger" role="alert">
          "Something went wrong"
        </div>
      )}

      {isLoading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">লোড হচ্ছে...</span>
          </div>
          <p className="mt-2">ডাটা লোড হচ্ছে...</p>
        </div>
      ) : !data ? (
        <div className="alert alert-info text-center" role="alert">
          কোন ডাটা পাওয়া যায়নি
        </div>
      ) : isMobile ? (
        // Mobile view - Cards
        <div className="mt-3">
          {data?.data?.map((item:MaintenanceFee, index:number) => (
            <MobileCard key={`${item.short_name_e}-${index}`} item={item} />
          ))}
        </div>
      ) : (
        // Desktop view - Table
        <div className="table-responsive">
          <table className="table table-striped table-hover">
            <thead className="table-light">
              <tr>
                <th>ইউনিয়নের নাম</th>
                <th>সংক্ষিপ্ত নাম</th>
                <th>অবস্থান</th>
                <th>যোগাযোগ</th>
                <th>ফি পরিমাণ</th>
                <th>ফি টাইপ</th>
                <th>সময়কাল</th>
                <th>স্টেটাস</th>
                <th>পেমেন্ট তারিখ</th>
              </tr>
            </thead>
            <tbody>
              {data?.data?.map((item:MaintenanceFee, index:number) => (
                <tr key={`${item.short_name_e}-${index}`}>
                  <td>{item.full_name}</td>
                  <td>{item.short_name_e}</td>
                  <td>
                    <div>{item.upazila_name}</div>
                    <small className="text-muted">
                      {item.district_name}, {item.division_name}
                    </small>
                  </td>
                  <td>
                    <div className="d-flex flex-column gap-1">
                      <PhoneLink phone={item.chairman_phone} label="চেয়ারম্যান" />
                      <PhoneLink phone={item.secretary_phone} label="সচিব" />
                      <PhoneLink phone={item.udc_phone} label="UDC" />
                      {item.user_phone && <PhoneLink phone={item.user_phone} label="ইউজার" />}
                    </div>
                  </td>
                  <td className="fw-bold">{formatCurrency(item.maintance_fee)}</td>
                  <td>
                    <span className="badge bg-primary">{item.maintance_fee_type === "yearly" ? "বাৎসরিক" : "মাসিক"}</span>
                  </td>
                  <td>{item.payment_info?.period || "-"}</td>
                  <td>
                    <span className={`badge ${item.payment_info ? "bg-success" : "bg-warning"}`}>
                      {item.payment_info ? "পরিশোধিত" : "বকেয়া"}
                    </span>
                  </td>
                  <td>{item.payment_info?.paid_at ? formatDate(item.payment_info.paid_at) : "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {data?.data?.length > 0 && (
        <div className="d-flex justify-content-between align-items-center mt-3 flex-wrap">
          <div>
            <span className="text-muted">মোট {data.length}টি রেকর্ড</span>
          </div>
          <div className="mt-2 mt-md-0">
            <button
              className="btn btn-outline-primary me-2"
              onClick={() => {
                message.info("এক্সপোর্ট ফাংশনালিটি যোগ করা হবে")
              }}
            >
              এক্সপোর্ট করুন
            </button>
            <button
              className="btn btn-outline-secondary"
              onClick={() => {
                message.info("প্রিন্ট ফাংশনালিটি যোগ করা হবে")
              }}
            >
              প্রিন্ট করুন
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default MaintenanceFees
