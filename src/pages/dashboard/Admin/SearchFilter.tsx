/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import useAllServices from "@/hooks/useAllServices"
import { useAdminReportMutation } from "@/redux/api/auth/authApi"
import type { TAdminData, TDistrict, TDivision, TUnion, TUpazila } from "@/types"
import type React from "react"
import { useState } from "react"
import { Spinner } from "react-bootstrap"
import Summary from "./Summary"
import { Link } from "react-router-dom"
import { message } from "antd"
import { useAppSelector } from "@/redux/features/hooks"
import type { RootState } from "@/redux/features/store"
import Breadcrumbs from "@/components/reusable/Breadcrumbs"
import DividedReportSummary from "./DividedReportSummary"
import DividedReportCharts from "./DividedReportCharts"
import AddressSelectorUnion from "@/components/reusable/AddressSelectorUnion"
import PouroLocationSelector from "@/components/reusable/PouroLocationSelector"

// Define interfaces for the report data structure
interface SonodReport {
  sonod_name: string
  pending_count: number
  approved_count: number
  cancel_count: number
  Last30DaysPending: number
  Last7DaysPending: number
  Before7DaysPending: number
  Before30DaysPending: number
}

interface PaymentReport {
  sonod_type: string
  total_payments: number
  total_amount: number
}

interface TotalReport {
  sonod_reports: SonodReport[]
  payment_reports: PaymentReport[]
  totals?: any // You can define a more specific type based on your Summary component needs
}

interface AdminReportData extends TAdminData {
  title: any
  total_report: TotalReport
  sonod_reports: SonodReport[]
}

interface AdminReportResponse {
  data: AdminReportData
}

const SearchFilter: React.FC = () => {

  const isUnion = useAppSelector((state: RootState) => state.siteSetting.isUnion);
  const token = localStorage.getItem("token")
  const services = useAllServices()
  const [selected, setSelected] = useState<string>("")
  const [selectedUnion, setSelectedUnion] = useState<TUnion | null>(null)
  const [selectedDivision, setSelectedDivision] = useState<TDivision | null>(null)
  const [selectedDistrict, setSelectedDistrict] = useState<TDistrict | null>(null)
  const [selectedUpazila, setSelectedUpazila] = useState<TUpazila | null>(null)
  const [fromDate, setFromDate] = useState<string>("")
  const [toDate, setToDate] = useState<string>("")
  const [showCharts, setShowCharts] = useState<boolean>(false)

  const [adminReport, { isLoading, data }] = useAdminReportMutation()

  const VITE_BASE_DOC_URL = import.meta.env.VITE_BASE_DOC_URL as string

  const handleSearchClick = async () => {
    if (!selectedDivision?.name) {
      message.warning("বিভাগ নির্বাচন করুন")
      return
    }

    const requestData = {
      division_name: selectedDivision?.name,
      district_name: selectedDistrict?.name || undefined,
      upazila_name: selectedUpazila?.name || undefined,
      union_name: selectedUnion?.name || undefined,
      sonod_name: selected || undefined,
      from_date: fromDate || undefined,
      to_date: toDate || undefined,
    }

    try {
      await adminReport({ data: requestData, token }).unwrap()
    } catch (error) {
      console.error("Error fetching admin report:", error)
    }
  }

  // Type assertion with proper null checking
  const admin: AdminReportData | undefined = (data as AdminReportResponse)?.data

  return (
    <div className="bg-white p-2 p-md-3 rounded">
      <Breadcrumbs current=" সকল প্রতিবেদন" />

      <div className="row mx-auto mb-3">
        <div className="col-md-12">
          {isUnion ? (
            <AddressSelectorUnion
              onDivisionChange={(division: TDivision | null) => setSelectedDivision(division)}
              onDistrictChange={(district: TDistrict | null) => setSelectedDistrict(district)}
              onUpazilaChange={(upazila: TUpazila | null) => setSelectedUpazila(upazila)}
              onUnionChange={(union: TUnion | null) => setSelectedUnion(union)}
            />
          ) : (
            <PouroLocationSelector
              onDivisionChange={(division: any) => setSelectedDivision(division)}
              onDistrictChange={(district: any) => setSelectedDistrict(district)}
              onUnionChange={(union: any) => setSelectedUnion(union)}
              showLabels={true}
            />
          )}
        </div>
      </div>

      <div className="row mx-auto align-items-end g-3">
        <div className="col-md-2">
          <label htmlFor="service">সেবা নির্বাচন করুন</label>
          <select
            id="service"
            className="searchFrom form-control"
            value={selected}
            onChange={(e) => setSelected(e.target.value)}
          >
            <option value="">সেবা নির্বাচন করুন</option>
            <option value="holdingtax">হোল্ডিং ট্যাক্স</option>
            {services?.map((d) => (
              <option key={d.title} value={d.title}>
                {d.title}
              </option>
            ))}
          </select>
        </div>

        <div className="col-md-3">
          <label>শ শুরুর তারিখ</label>
          <input
            type="date"
            className="form-control"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
          />
        </div>

        <div className="col-md-3">
          <label>শেষ তারিখ</label>
          <input
            type="date"
            className="form-control"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
          />
        </div>

        <div className="col-md-2">
          <button
            disabled={isLoading}
            onClick={handleSearchClick}
            className="btn btn-primary w-100"
            style={{ height: "38px" }}
          >
            {isLoading ? <Spinner animation="border" size="sm" /> : "সার্চ"}
          </button>
        </div>

        <div className="col-md-2">
          <button
            onClick={() => setShowCharts(!showCharts)}
            className="btn btn-secondary w-100"
            style={{ height: "38px" }}
          >
            {showCharts ? "চার্ট লুকান" : "চার্ট দেখুন"}
          </button>
        </div>
      </div>

      <div className="row mx-auto mt-4">
        {admin?.total_report?.totals && (
          <Summary data={admin.total_report.totals} isLoading={isLoading} />
        )}
      </div>

      {admin?.divided_reports && showCharts && (
        <div className="mt-4">
          <DividedReportCharts
            data={admin.divided_reports}
            title={`${admin.title} - চার্ট বিশ্লেষণ`}
            isLoading={isLoading}
          />
        </div>
      )}

      {admin?.divided_reports && (
        <div className="mt-4">
          <DividedReportSummary data={admin.divided_reports} title={admin.title} isLoading={isLoading} />
        </div>
      )}

      <div className="row mx-auto mt-4">
        {admin?.total_report?.sonod_reports && (
          <h6 className="mb-4 fs-4 border-bottom">
            {selectedUnion?.bn_name
              ? `${selectedUnion.bn_name} ইউনিয়নের সনদের প্রতিবেদন`
              : selectedUpazila?.bn_name
                ? `${selectedUpazila.bn_name} উপজেলার সকল ইউনিয়নের সনদের প্রতিবেদন`
                : selectedDistrict?.bn_name
                  ? `${selectedDistrict.bn_name} জেলার সকল ইউনিয়নের সনদের প্রতিবেদন`
                  : selectedDivision?.bn_name
                    ? `${selectedDivision.bn_name} বিভাগের সকল ইউনিয়নের সনদের প্রতিবেদন`
                    : "সনদের প্রতিবেদন"}
          </h6>
        )}

        <div className="table-responsive">
          <table className="table table-bordered table-hover">
            <thead className="thead-dark">
              <tr>
                <th>সনদ নাম</th>
                <th> নতুন আবেদন </th>
                <th>অনুমোদিত আবেদন</th>
                <th>বাতিল</th>
                {!selectedUnion && <th>বিস্তারিত</th>}
              </tr>
            </thead>
            <tbody>
              {admin?.total_report?.sonod_reports?.map((report, index) => (
                <tr key={index}>
                  <td>{report.sonod_name}</td>
                  <td>
                    {selectedUnion ? (
                      <Link to={`/dashboard/sonod/${report.sonod_name}/Pending/${selectedUnion.name}`}>
                        {report.pending_count}
                      </Link>
                    ) : (
                      report.pending_count
                    )}
                  </td>
                  <td>
                    {selectedUnion ? (
                      <Link to={`/dashboard/sonod/${report.sonod_name}/approved/${selectedUnion.name}`}>
                        {report.approved_count}
                      </Link>
                    ) : (
                      report.approved_count
                    )}
                  </td>
                  <td>
                    {selectedUnion ? (
                      <Link to={`/dashboard/sonod/${report.sonod_name}/cancel/${selectedUnion.name}`}>
                        {report.cancel_count}
                      </Link>
                    ) : (
                      report.cancel_count
                    )}
                  </td>
                  {!selectedUnion && (
                    <td>
                      <a
                        href={`${VITE_BASE_DOC_URL}/download/reports/get-reports?${selectedDivision?.name ? `division_name=${selectedDivision.name}&` : ""
                          }${selectedDistrict?.name ? `district_name=${selectedDistrict.name}&` : ""}${selectedUpazila?.name ? `upazila_name=${selectedUpazila.name}&` : ""
                          }sonod_name=${report.sonod_name}&detials=1&token=${token}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-sm btn-info"
                      >
                        <i className="fa-solid fa-download text-white"></i> ডাউনলোড
                      </a>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="row mx-auto mt-5">
        {admin?.total_report?.payment_reports && (
          <h6 className="mb-4 fs-4 border-bottom">
            {selectedUnion?.bn_name
              ? `${selectedUnion.bn_name} ইউনিয়নের আদায়কৃত ফি এর প্রতিবেদন`
              : selectedUpazila?.bn_name
                ? `${selectedUpazila.bn_name} উপজেলার সকল ইউনিয়নের আদায়কৃত ফি এর প্রতিবেদন`
                : selectedDistrict?.bn_name
                  ? `${selectedDistrict.bn_name} জেলার সকল ইউনিয়নের আদায়কৃত ফি এর প্রতিবেদন`
                  : selectedDivision?.bn_name
                    ? `${selectedDivision.bn_name} বিভাগের সকল ইউনিয়নের সনদের প্রতিবেদন`
                    : "আদায়কৃত ফি এর প্রতিবেদন"}
          </h6>
        )}

        <div className="table-responsive">
          <table className="table table-bordered table-hover">
            <thead className="thead-dark">
              <tr>
                <th>সনদ নাম</th>
                <th>মোট লেনদেন</th>
                <th>মোট টাকার পরিমাণ</th>
              </tr>
            </thead>
            <tbody>
              {admin?.total_report?.payment_reports?.map((report, index) => (
                <tr key={index}>
                  <td>{report.sonod_type}</td>
                  <td>{report.total_payments}</td>
                  <td>{report.total_amount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default SearchFilter
