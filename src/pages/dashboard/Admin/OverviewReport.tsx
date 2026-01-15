/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import useAllServices from "@/hooks/useAllServices"
import { useLazyLocationChildSummaryQuery, useLazyOverviewReportQuery, useLazySonodWiseSummaryQuery } from "@/redux/api/auth/authApi"
import type { TDistrict, TDivision, TUnion, TUpazila } from "@/types"
import React, { type ChangeEvent, useEffect, useState } from "react"
import { Spinner } from "react-bootstrap"
import Summary from "./Summary"
import { Link } from "react-router-dom"
import { Modal, message, Space, Button, Tooltip } from "antd"
import { PlusOutlined, MinusOutlined, ApartmentOutlined, FileTextOutlined } from "@ant-design/icons"
import { useAppSelector } from "@/redux/features/hooks"
import type { RootState } from "@/redux/features/store"
import Breadcrumbs from "@/components/reusable/Breadcrumbs"
// Unused imports: DividedReportSummary, DividedReportCharts (can be restored if needed)

// Define interfaces for the report data structure
interface ChildStats {
    sonod_name: any
    name: string
    bn_name: string
    total_application: number
    total_pending: number
    total_approved: number
    total_cancel: number
    last_7_days_application: number
    last_30_days_application: number
    before_7_days_application: number
    before_30_days_application: number
    total_payments: number
    total_amount: string
}

interface OverviewData {
    name: any
    level: string
    total_application: number
    total_pending: number
    total_approved: number
    total_cancel: number
    last_7_days_application: number
    last_30_days_application: number
    before_7_days_application: number
    before_30_days_application: number
    total_payments: number
    total_amount: string
    children: ChildStats[]
}

interface OverviewResponse {
    data: OverviewData
    isError: boolean
    error: any
    status_code: number
}

const OverviewReport: React.FC = () => {

    const isUnion = useAppSelector((state: RootState) => state.siteSetting.isUnion);
    const user = useAppSelector((state: RootState) => state.user.user)
    const token = localStorage.getItem("token")
    const services = useAllServices()
    const [selected, setSelected] = useState<string>("")
    const [selectedUnion, setSelectedUnion] = useState<TUnion | null>(null)
    const [selectedDivision, setSelectedDivision] = useState<TDivision | null>(null)
    const [selectedDistrict, setSelectedDistrict] = useState<TDistrict | null>(null)
    const [selectedUpazila, setSelectedUpazila] = useState<TUpazila | null>(null)
    const [divisions, setDivisions] = useState<TDivision[]>([])
    const [districts, setDistricts] = useState<TDistrict[]>([])
    const [upazilas, setUpazilas] = useState<TUpazila[]>([])
    const [unions, setUnions] = useState<TUnion[]>([])
    const [fromDate, setFromDate] = useState<string>("")
    const [toDate, setToDate] = useState<string>("")
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [modalData, setModalData] = useState<any>(null)
    const [modalTitle, setModalTitle] = useState("")
    const [modalLoading, setModalLoading] = useState(false)
    const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set())

    const [adminReport, { isLoading, isFetching, data }] = useLazyOverviewReportQuery()
    const [sonodWiseSummaryTrigger] = useLazySonodWiseSummaryQuery()
    const [locationChildSummaryTrigger] = useLazyLocationChildSummaryQuery()

    const VITE_BASE_DOC_URL = import.meta.env.VITE_BASE_DOC_URL as string

    useEffect(() => {
        fetch("/divisions.json")
            .then((res) => res.json())
            .then((data: TDivision[]) => {
                setDivisions(data)
                if (user?.division_name) {
                    const userDivision = data.find((d) => d?.name === user.division_name)
                    if (userDivision) {
                        setSelectedDivision(userDivision)
                    }
                }
            })
            .catch((error) => console.error("Error fetching divisions data:", error))
    }, [user])

    useEffect(() => {
        if (selectedDivision) {
            fetch("/districts.json")
                .then((response) => response.json())
                .then((data: TDistrict[]) => {
                    const filteredDistricts = data.filter((d) => d?.division_id === selectedDivision.id)
                    setDistricts(filteredDistricts)
                    if (user?.district_name) {
                        const userDistrict = filteredDistricts.find((d) => d?.name === user.district_name)
                        if (userDistrict) {
                            setSelectedDistrict(userDistrict)
                        }
                    }
                })
                .catch((error) => console.error("Error fetching districts data:", error))
        }
    }, [selectedDivision, user])

    useEffect(() => {
        if (selectedDistrict) {
            fetch("/upazilas.json")
                .then((response) => response.json())
                .then((data: TUpazila[]) => {
                    const filteredUpazilas = data.filter((upazila) => upazila.district_id === selectedDistrict.id)
                    setUpazilas(filteredUpazilas)
                    if (user?.upazila_name) {
                        const userUpazila = filteredUpazilas.find((u) => u?.name === user.upazila_name)
                        if (userUpazila) {
                            setSelectedUpazila(userUpazila)
                        }
                    }
                })
                .catch((error) => console.error("Error fetching upazilas data:", error))
        }
    }, [selectedDistrict, user])

    useEffect(() => {
        if (selectedUpazila) {
            fetch("/unions.json")
                .then((response) => response.json())
                .then((data: TUnion[]) => {
                    const filteredUnions = data.filter((union) => union.upazilla_id === selectedUpazila.id)
                    setUnions(filteredUnions)
                })
                .catch((error) => console.error("Error fetching unions data:", error))
        }
    }, [selectedUpazila])

    useEffect(() => {
        if (selectedDistrict) {
            fetch("/pouroseba.json")
                .then((res) => res.json())
                .then((data) => {
                    const filteredPorasova = data.filter((u: any) => u.district_id == selectedDistrict.id);
                    console.log(filteredPorasova);
                    setUnions(filteredPorasova);
                })
                .catch((error) => console.error("Error fetching unions:", error));
        } else {
            setUnions([]);
        }
    }, [selectedDistrict]);


    const handleDivisionChange = (event: ChangeEvent<HTMLSelectElement>) => {
        const division = divisions.find((d) => d.id === event.target.value)
        setSelectedDivision(division || null)
        setSelectedDistrict(null)
        setSelectedUpazila(null)
        setSelectedUnion(null)
    }

    const handleDistrictChange = (event: ChangeEvent<HTMLSelectElement>) => {
        const district = districts.find((d) => d.id === event.target.value)
        setSelectedDistrict(district || null)
        setSelectedUpazila(null)
        setSelectedUnion(null)
    }

    const handleUpazilaChange = (event: ChangeEvent<HTMLSelectElement>) => {
        const upazila = upazilas.find((u) => u.id === event.target.value)
        setSelectedUpazila(upazila || null)
        setSelectedUnion(null)
    }

    const handleUnionChange = (event: ChangeEvent<HTMLSelectElement>) => {
        const union = unions.find((u) => u.id === event.target.value)
        setSelectedUnion(union || null)
    }

    const handleSearchClick = async () => {
        if (!selectedDivision?.name) {
            message.warning("বিভাগ নির্বাচন করুন")
            return
        }

        const requestData = {
            division_name: selectedDivision?.name,
            district_name: selectedDistrict?.name || undefined,
            upazila_name: selectedUpazila?.name || undefined,
            union_name: selectedUnion?.name ? selectedUnion.name.replace(/\s+/g, "").toLowerCase() : undefined,
            sonod_name: selected || undefined,
            from_date: fromDate || undefined,
            to_date: toDate || undefined,
        }

        try {
            await adminReport({ data: requestData, token }).unwrap()
        } catch (error) {
            console.error("Error fetching overview report:", error)
        }
    }

    const handleModalReportClick = async (child: ChildStats, type: string) => {
        setIsModalOpen(true)
        setModalLoading(true)
        setModalData(null)
        setExpandedRows(new Set()) // Reset expansions when opening modal

        let title = ""
        const requestData: any = {
            from_date: fromDate || undefined,
            to_date: toDate || undefined,
            token: token,
        }

        // Determine level and names based on current overview level
        if (overviewData?.level === "division") {
            requestData.division_name = overviewData.name; // assuming overviewData has name if it came from API, but wait...
            // Let's use the selected values from state which should be accurate
            requestData.division_name = selectedDivision?.name;
            requestData.district_name = child.name;
        } else if (overviewData?.level === "district") {
            requestData.division_name = selectedDivision?.name;
            requestData.district_name = selectedDistrict?.name;
            requestData.upazila_name = child.name;
        } else if (overviewData?.level === "upazila") {
            requestData.division_name = selectedDivision?.name;
            requestData.district_name = selectedDistrict?.name;
            requestData.upazila_name = selectedUpazila?.name;
            requestData.union_name = child.name;
        }

        if (type === "union") {
            title = `${child.bn_name} - ইউনিয়ন ভিত্তিক প্রতিবেদন`
            requestData.report_type = "union"
        } else if (type === "sonod") {
            title = `${child.bn_name} - সনদ ভিত্তিক প্রতিবেদন`
            requestData.report_type = "sonod"
        } else if (type === "union_sonod") {
            title = `${child.bn_name} - ইউনিয়ন ও সনদ ভিত্তিক প্রতিবেদন`
            requestData.report_type = "union_sonod"
        }

        setModalTitle(title)
        setExpandedRows(new Set())

        try {
            let res: any;
            if (type === "sonod") {
                res = await sonodWiseSummaryTrigger({ data: requestData, token }).unwrap()
            } else if (type === "union") {
                res = await locationChildSummaryTrigger({ data: requestData, token }).unwrap()
            } else {
                res = await adminReport({ data: requestData, token }).unwrap()
            }
            setModalData(res?.data)
        } catch (error) {
            console.error("Error fetching modal report:", error)
            message.error("রিপোর্ট লোড করতে সমস্যা হয়েছে")
        } finally {
            setModalLoading(false)
        }
    }

    // Type assertion with proper null checking
    const overviewData: OverviewData | undefined = (data as OverviewResponse)?.data

    // Map to Summary props
    const summaryData = overviewData ? {
        total_pending: overviewData.total_pending,
        total_approved: overviewData.total_approved,
        total_cancel: overviewData.total_cancel,
        total_amount: overviewData.total_amount,
        Last7DaysPending: overviewData.last_7_days_application,
        Last30DaysPending: overviewData.last_30_days_application,
        Before7DaysPending: overviewData.before_7_days_application,
        Before30DaysPending: overviewData.before_30_days_application,
    } : null;

    return (
        <div className="bg-white p-2 p-md-3 rounded">
            <Breadcrumbs current=" ওভারভিউ প্রতিবেদন" />
            <div className="row mx-auto">
                <div className="col-md-2">
                    <label htmlFor="division">বিভাগ নির্বাচন করুন</label>
                    <select
                        disabled={!!user?.division_name}
                        id="division"
                        className="searchFrom form-control"
                        value={selectedDivision?.id || ""}
                        onChange={handleDivisionChange}
                    >
                        <option value="">বিভাগ নির্বাচন করুন</option>
                        {divisions.map((d) => (
                            <option key={d.id} value={d.id}>
                                {d.bn_name}
                            </option>
                        ))}
                    </select>
                </div>

                {selectedDivision && (
                    <div className="col-md-2">
                        <label htmlFor="district">জেলা নির্বাচন করুন</label>
                        <select
                            disabled={!!user?.district_name}
                            id="district"
                            className="searchFrom form-control"
                            value={selectedDistrict?.id || ""}
                            onChange={handleDistrictChange}
                        >
                            <option value="">জেলা নির্বাচন করুন</option>
                            {districts.map((d) => (
                                <option key={d.id} value={d.id}>
                                    {d.bn_name}
                                </option>
                            ))}
                        </select>
                    </div>
                )}

                {isUnion ? <>
                    {selectedDistrict && (
                        <div className="col-md-2">
                            <label htmlFor="upazila">উপজেলা নির্বাচন করুন</label>
                            <select
                                disabled={!!user?.upazila_name}
                                id="upazila"
                                className="searchFrom form-control"
                                value={selectedUpazila?.id || ""}
                                onChange={handleUpazilaChange}
                            >
                                <option value="">উপজেলা নির্বাচন করুন</option>
                                {upazilas.map((u) => (
                                    <option key={u.id} value={u.id}>
                                        {u.bn_name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}

                    {selectedUpazila && (
                        <div className="col-md-2">
                            <label htmlFor="union">ইউনিয়ন নির্বাচন করুন</label>
                            <select
                                id="union"
                                className="searchFrom form-control"
                                value={selectedUnion?.id || ""}
                                onChange={handleUnionChange}
                            >
                                <option value="">ইউনিয়ন নির্বাচন করুন</option>
                                {unions.map((u) => (
                                    <option key={u.id} value={u.id}>
                                        {u.bn_name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}
                </> : <div className="col-md-2">
                    <label htmlFor="union">পৌরসভা নির্বাচন করুন</label>
                    <select
                        id="union"
                        className="searchFrom form-control"
                        value={selectedUnion?.id || ""}
                        onChange={handleUnionChange}
                    >
                        <option value="">পৌরসভা নির্বাচন করুন</option>
                        {unions.map((u) => (
                            <option key={u.id} value={u.id}>
                                {u.bn_name}
                            </option>
                        ))}
                    </select>
                </div>}

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

                <div className="col-md-2">
                    <label htmlFor="fromDate">শুরুর তারিখ</label>
                    <input
                        type="date"
                        id="fromDate"
                        className="searchFrom form-control"
                        value={fromDate}
                        onChange={(e) => setFromDate(e.target.value)}
                    />
                </div>

                <div className="col-md-2">
                    <label htmlFor="toDate">শেষের তারিখ</label>
                    <input
                        type="date"
                        id="toDate"
                        className="searchFrom form-control"
                        value={toDate}
                        onChange={(e) => setToDate(e.target.value)}
                    />
                </div>

                <div className="col-md-2">
                    <button disabled={isLoading || isFetching} onClick={handleSearchClick} className="btn btn-primary mt-4 d-flex align-items-center justify-content-center" style={{ minWidth: '100px', height: '38px' }}>
                        {(isLoading || isFetching) ? (
                            <>
                                <Spinner
                                    as="span"
                                    animation="border"
                                    size="sm"
                                    role="status"
                                    aria-hidden="true"
                                    className="me-2"
                                />
                                Loading...
                            </>
                        ) : (
                            "Search"
                        )}
                    </button>
                </div>
            </div>

            <div className="w-100">{(isLoading || isFetching) && <Spinner />}</div>

            <div className="my-3 d-flex justify-content-end text-white">
                {overviewData?.children && overviewData.children.length >= 1 && (
                    <Link
                        target="_blank"
                        to={`${VITE_BASE_DOC_URL}/download/reports/get-reports${selectedDivision ? `?division_name=${selectedDivision.name}` : ""
                            }${selectedDistrict ? `&district_name=${selectedDistrict.name}` : ""}${selectedUpazila ? `&upazila_name=${selectedUpazila.name}` : ""
                            }${selectedUnion ? `&union_name=${selectedUnion.name}` : ""}${selected ? `&sonod_name=${selected}` : ""
                            }${fromDate ? `&from_date=${fromDate}` : ""}${toDate ? `&to_date=${toDate}` : ""}&token=${token}`}
                        className="btn btn-info text-white"
                    >
                        প্রতিবেদন ডাউনলোড করুন
                    </Link>
                )}
            </div>

            {summaryData && <Summary data={summaryData} isLoading={isLoading || isFetching} />}


            <div className="row mx-auto mt-4">
                {overviewData?.children && (
                    <h6 className="mb-4 fs-4 border-bottom">
                        {overviewData.level === "division"
                            ? "বিভাগীয় জেলা ভিত্তিক প্রতিবেদন"
                            : overviewData.level === "district"
                                ? "জেলা ভিত্তিক উপজেলা প্রতিবেদন"
                                : overviewData.level === "upazila"
                                    ? "উপজেলা ভিত্তিক ইউনিয়ন প্রতিবেদন"
                                    : "বিস্তারিত প্রতিবেদন"}
                    </h6>
                )}

                <table className="table table-bordered table-hover">
                    <thead className="thead-dark">
                        <tr>
                            <th>নাম</th>
                            <th> নতুন আবেদন </th>
                            <th>অনুমোদিত আবেদন</th>
                            <th>বাতিল</th>
                            <th>মোট লেনদেন</th>
                            <th>মোট টাকা</th>
                            <th>রিপোর্ট</th>
                        </tr>
                    </thead>
                    <tbody>
                        {overviewData?.children?.map((child, index) => (
                            <tr key={index}>
                                <td>
                                    {child.sonod_name || (
                                        <>
                                            {child.bn_name} {child.name && `(${child.name})`}
                                        </>
                                    )}
                                </td>
                                <td>{child.total_pending}</td>
                                <td>{child.total_approved}</td>
                                <td>{child.total_cancel}</td>
                                <td>{child.total_payments}</td>
                                <td>{child.total_amount}</td>
                                <td>
                                    <div className="d-flex flex-nowrap gap-2">
                                        <Tooltip title="ইউনিয়ন বিস্তারিত প্রতিবেদন (উপজেলা ভিত্তিক)">
                                            <Button
                                                size="small"
                                                type="primary"
                                                icon={<ApartmentOutlined />}
                                                className="d-flex align-items-center justify-content-center"
                                                style={{
                                                    background: 'linear-gradient(135deg, #1890ff 0%, #096dd9 100%)',
                                                    border: 'none',
                                                    borderRadius: '6px',
                                                    fontSize: '11px',
                                                    fontWeight: 600
                                                }}
                                                onClick={() => handleModalReportClick(child, "union")}
                                            >
                                                ইউনিয়ন
                                            </Button>
                                        </Tooltip>

                                        <Tooltip title="সনদ ভিত্তিক বিস্তারিত প্রতিবেদন">
                                            <Button
                                                size="small"
                                                type="primary"
                                                icon={<FileTextOutlined />}
                                                className="d-flex align-items-center justify-content-center"
                                                style={{
                                                    background: 'linear-gradient(135deg, #52c41a 0%, #389e0d 100%)',
                                                    border: 'none',
                                                    borderRadius: '6px',
                                                    fontSize: '11px',
                                                    fontWeight: 600
                                                }}
                                                onClick={() => handleModalReportClick(child, "sonod")}
                                            >
                                                সনদ
                                            </Button>
                                        </Tooltip>

                                        {/* <Tooltip title="ইউনিয়ন ও সনদ সমন্বিত প্রতিবেদন">
                                            <Button
                                                size="small"
                                                type="primary"
                                                icon={<AuditOutlined />}
                                                className="d-flex align-items-center justify-content-center"
                                                style={{
                                                    background: 'linear-gradient(135deg, #722ed1 0%, #531dab 100%)',
                                                    border: 'none',
                                                    borderRadius: '6px',
                                                    fontSize: '11px',
                                                    fontWeight: 600
                                                }}
                                                onClick={() => handleModalReportClick(child, "union_sonod")}
                                            >
                                                সমন্বিত
                                            </Button>
                                        </Tooltip> */}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <Modal
                title={modalTitle}
                open={isModalOpen}
                onCancel={() => setIsModalOpen(false)}
                footer={null}
                width={1000}
                style={{ top: 20 }}
            >
                {modalLoading ? (
                    <div className="text-center p-5">
                        <Spinner animation="border" variant="primary" />
                        <p className="mt-2">লোড হচ্ছে...</p>
                    </div>
                ) : modalData ? (
                    <div className="table-responsive">
                        <table className="table table-bordered table-hover">
                            <thead className="table-light">
                                <tr>
                                    <th>নাম</th>
                                    <th>নতুন আবেদন</th>
                                    <th>অনুমোদিত</th>
                                    <th>বাতিল</th>
                                    <th>লেনদেন</th>
                                    <th>টাকা</th>
                                </tr>
                            </thead>
                            <tbody>
                                {Array.isArray(modalData) && modalData.some(item => item.children) ? (
                                    // Handle nested location-child-summary (Upazila > Unions) with expansion
                                    modalData.map((group: any, gIdx: number) => {
                                        const isExpanded = expandedRows.has(group.name);
                                        // Calculate parent totals
                                        const parentTotals = group.children?.reduce((acc: any, curr: any) => ({
                                            pending: acc.pending + (curr.pending || 0),
                                            approved: acc.approved + (curr.approved || 0),
                                            cancel: acc.cancel + (curr.cancel || 0),
                                            payments: acc.payments + (curr.payments || 0),
                                            amount: acc.amount + parseFloat(curr.amount || 0)
                                        }), { pending: 0, approved: 0, cancel: 0, payments: 0, amount: 0 });

                                        return (
                                            <React.Fragment key={gIdx}>
                                                <tr
                                                    onClick={() => {
                                                        const newExpanded = new Set<string>();
                                                        if (!isExpanded) newExpanded.add(group.name);
                                                        setExpandedRows(newExpanded);
                                                    }}
                                                    style={{
                                                        cursor: 'pointer',
                                                        backgroundColor: isExpanded ? '#003a8c' : '#f0f2f5',
                                                        color: isExpanded ? '#ffffff' : '#000000',
                                                        transition: 'all 0.3s'
                                                    }}
                                                    className="fw-bold"
                                                >
                                                    <td style={{ color: isExpanded ? '#ffffff' : 'inherit', backgroundColor: isExpanded ? '#003a8c' : '#f0f2f5' }}>
                                                        <Space>
                                                            {isExpanded ? <MinusOutlined style={{ fontSize: '12px', color: '#fff' }} /> : <PlusOutlined style={{ fontSize: '12px' }} />}
                                                            {group.bn_name || group.name}
                                                        </Space>
                                                    </td>
                                                    <td style={{ color: isExpanded ? '#ffffff' : 'inherit', backgroundColor: isExpanded ? '#003a8c' : '#f0f2f5' }}>{parentTotals.pending}</td>
                                                    <td style={{ color: isExpanded ? '#ffffff' : 'inherit', backgroundColor: isExpanded ? '#003a8c' : '#f0f2f5' }}>{parentTotals.approved}</td>
                                                    <td style={{ color: isExpanded ? '#ffffff' : 'inherit', backgroundColor: isExpanded ? '#003a8c' : '#f0f2f5' }}>{parentTotals.cancel}</td>
                                                    <td style={{ color: isExpanded ? '#ffffff' : 'inherit', backgroundColor: isExpanded ? '#003a8c' : '#f0f2f5' }}>{parentTotals.payments}</td>
                                                    <td style={{ color: isExpanded ? '#ffffff' : 'inherit', backgroundColor: isExpanded ? '#003a8c' : '#f0f2f5' }}>{parentTotals.amount.toFixed(2)}</td>
                                                </tr>
                                                {isExpanded && group.children?.map((item: any, cIdx: number) => (
                                                    <tr key={`${gIdx}-${cIdx}`}>
                                                        <td style={{ paddingLeft: '40px', borderLeft: '4px solid #003a8c', backgroundColor: '#e6f7ff' }}>
                                                            <div className="d-flex align-items-center">
                                                                <span className="me-2 text-primary">•</span>
                                                                {item.sonod_name || item.bn_name || item.name}
                                                            </div>
                                                        </td>
                                                        <td style={{ backgroundColor: '#e6f7ff' }}>{item.pending || 0}</td>
                                                        <td style={{ backgroundColor: '#e6f7ff' }}>{item.approved || 0}</td>
                                                        <td style={{ backgroundColor: '#e6f7ff' }}>{item.cancel || 0}</td>
                                                        <td style={{ backgroundColor: '#e6f7ff' }}>{item.payments || 0}</td>
                                                        <td style={{ backgroundColor: '#e6f7ff' }}>{item.amount || 0}</td>
                                                    </tr>
                                                ))}
                                            </React.Fragment>
                                        );
                                    })
                                ) : Array.isArray(modalData) ? (
                                    // Handle flat sonod-wise summary
                                    modalData.map((item: any, idx: number) => (
                                        <tr key={idx}>
                                            <td>{item.sonod_name || item.bn_name || item.name}</td>
                                            <td>{item.pending || item.total_pending || 0}</td>
                                            <td>{item.approved || item.total_approved || 0}</td>
                                            <td>{item.cancel || item.total_cancel || 0}</td>
                                            <td>{item.payments || item.total_payments || 0}</td>
                                            <td>{item.amount || item.total_amount || 0}</td>
                                        </tr>
                                    ))
                                ) : modalData?.children && modalData.children.length > 0 ? (
                                    modalData.children.map((item: any, idx: number) => (
                                        <tr key={idx}>
                                            <td>{item.sonod_name || item.bn_name || item.name}</td>
                                            <td> {item.total_pending ?? item.pending ?? 0} </td>
                                            <td> {item.total_approved ?? item.approved ?? 0} </td>
                                            <td> {item.total_cancel ?? item.cancel ?? 0} </td>
                                            <td> {item.total_payments ?? item.payments ?? 0} </td>
                                            <td> {item.total_amount ?? item.amount ?? 0} </td>
                                        </tr>
                                    ))
                                ) : modalData.sonod_reports && modalData.sonod_reports.length > 0 ? (
                                    modalData.sonod_reports.map((item: any, idx: number) => (
                                        <tr key={idx}>
                                            <td>{item.sonod_name}</td>
                                            <td>{item.pending_count}</td>
                                            <td>{item.approved_count}</td>
                                            <td>{item.cancel_count}</td>
                                            <td>-</td>
                                            <td>-</td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={6} className="text-center">কোন তথ্য পাওয়া যায়নি</td>
                                    </tr>
                                )}
                            </tbody>
                            <tfoot className="table-secondary fw-bold">
                                <tr>
                                    <td>সর্বমোট</td>
                                    <td>
                                        {Array.isArray(modalData)
                                            ? modalData.some(item => item.children)
                                                ? modalData.reduce((acc, curr) => acc + (curr.children?.reduce((sum: number, c: any) => sum + (c.pending || 0), 0) || 0), 0)
                                                : modalData.reduce((acc, curr) => acc + (curr.pending || curr.total_pending || 0), 0)
                                            : (modalData.total_pending || 0)}
                                    </td>
                                    <td>
                                        {Array.isArray(modalData)
                                            ? modalData.some(item => item.children)
                                                ? modalData.reduce((acc, curr) => acc + (curr.children?.reduce((sum: number, c: any) => sum + (c.approved || 0), 0) || 0), 0)
                                                : modalData.reduce((acc, curr) => acc + (curr.approved || curr.total_approved || 0), 0)
                                            : (modalData.total_approved || 0)}
                                    </td>
                                    <td>
                                        {Array.isArray(modalData)
                                            ? modalData.some(item => item.children)
                                                ? modalData.reduce((acc, curr) => acc + (curr.children?.reduce((sum: number, c: any) => sum + (c.cancel || 0), 0) || 0), 0)
                                                : modalData.reduce((acc, curr) => acc + (curr.cancel || curr.total_cancel || 0), 0)
                                            : (modalData.total_cancel || 0)}
                                    </td>
                                    <td>
                                        {Array.isArray(modalData)
                                            ? modalData.some(item => item.children)
                                                ? modalData.reduce((acc, curr) => acc + (curr.children?.reduce((sum: number, c: any) => sum + (c.payments || 0), 0) || 0), 0)
                                                : modalData.reduce((acc, curr) => acc + (curr.payments || curr.total_payments || 0), 0)
                                            : (modalData.total_payments || 0)}
                                    </td>
                                    <td>
                                        {Array.isArray(modalData)
                                            ? modalData.some(item => item.children)
                                                ? modalData.reduce((acc, curr) => acc + (curr.children?.reduce((sum: number, c: any) => sum + parseFloat(c.amount || 0), 0) || 0), 0).toFixed(2)
                                                : modalData.reduce((acc, curr) => acc + parseFloat(curr.amount || curr.total_amount || 0), 0).toFixed(2)
                                            : (modalData.total_amount || 0)}
                                    </td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                ) : (
                    <div className="text-center p-5 text-muted">কোন তথ্য নেই</div>
                )}
            </Modal>
        </div>
    )
}

export default OverviewReport
