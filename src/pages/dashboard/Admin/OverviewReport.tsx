/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import useAllServices from "@/hooks/useAllServices"
import { useLazyLocationChildSummaryQuery, useLazyOverviewReportQuery, useLazySonodWiseSummaryQuery } from "@/redux/api/auth/authApi"
import type { TDistrict, TDivision, TUnion, TUpazila } from "@/types"
import React, { type ChangeEvent, useEffect, useState } from "react"
import { Spinner } from "react-bootstrap"
import Summary from "./Summary"
import { Link } from "react-router-dom"
import { message, DatePicker } from "antd"
import dayjs from "dayjs"

const { RangePicker } = DatePicker
import { useAppSelector } from "@/redux/features/hooks"
import type { RootState } from "@/redux/features/store"
import Breadcrumbs from "@/components/reusable/Breadcrumbs"
import ReportTable from "@/components/reusable/reports/ReportTable"
import ReportModal from "@/components/reusable/reports/ReportModal"

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
    const [dateRange, setDateRange] = useState<[dayjs.Dayjs | null, dayjs.Dayjs | null]>([null, null])
    const [activeFilter, setActiveFilter] = useState<string>("all")
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [modalData, setModalData] = useState<any>(null)
    const [modalTitle, setModalTitle] = useState("")
    const [modalLoading, setModalLoading] = useState(false)

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

    const handleSearchClick = async (range?: [dayjs.Dayjs | null, dayjs.Dayjs | null]) => {
        if (!selectedDivision?.name) {
            message.warning("বিভাগ নির্বাচন করুন")
            return
        }

        const [start, end] = range || dateRange;
        const from_date = start ? start.format('YYYY-MM-DD') : undefined;
        const to_date = end ? end.format('YYYY-MM-DD') : undefined;

        const requestData = {
            division_name: selectedDivision?.name,
            district_name: selectedDistrict?.name || undefined,
            upazila_name: selectedUpazila?.name || undefined,
            union_name: selectedUnion?.name ? selectedUnion.name.replace(/\s+/g, "").toLowerCase() : undefined,
            sonod_name: selected || undefined,
            from_date,
            to_date,
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

        let title = ""
        const [start, end] = dateRange;
        const requestData: any = {
            from_date: start ? start.format('YYYY-MM-DD') : undefined,
            to_date: end ? end.format('YYYY-MM-DD') : undefined,
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

                <div className="col-12 mt-3 mb-2 px-3">
                    <div className="d-flex flex-wrap gap-2 align-items-center">
                        <span className="small fw-bold text-muted me-2">দ্রুত ফিল্টার:</span>
                        <button
                            className={`btn btn-sm ${activeFilter === '7d' ? 'btn-primary' : 'btn-light border'} rounded-pill px-4 py-2 fw-bold shadow-sm hover-lift d-flex align-items-center`}
                            style={{ fontSize: '13px' }}
                            disabled={isLoading || isFetching}
                            onClick={() => {
                                const range: [dayjs.Dayjs | null, dayjs.Dayjs | null] = [dayjs().subtract(7, 'day'), dayjs()];
                                setDateRange(range);
                                setActiveFilter('7d');
                                handleSearchClick(range);
                            }}
                        >
                            {(isLoading || isFetching) && activeFilter === '7d' ? (
                                <Spinner animation="border" size="sm" className="me-2" />
                            ) : (
                                <i className={`fa-solid fa-clock-rotate-left me-1 ${activeFilter === '7d' ? 'text-white' : 'text-primary'}`}></i>
                            )}
                            শেষ ৭ দিন
                        </button>
                        <button
                            className={`btn btn-sm ${activeFilter === '30d' ? 'btn-primary' : 'btn-light border'} rounded-pill px-4 py-2 fw-bold shadow-sm hover-lift d-flex align-items-center`}
                            style={{ fontSize: '13px' }}
                            disabled={isLoading || isFetching}
                            onClick={() => {
                                const range: [dayjs.Dayjs | null, dayjs.Dayjs | null] = [dayjs().subtract(1, 'month'), dayjs()];
                                setDateRange(range);
                                setActiveFilter('30d');
                                handleSearchClick(range);
                            }}
                        >
                            {(isLoading || isFetching) && activeFilter === '30d' ? (
                                <Spinner animation="border" size="sm" className="me-2" />
                            ) : (
                                <i className={`fa-solid fa-calendar-day me-1 ${activeFilter === '30d' ? 'text-white' : 'text-success'}`}></i>
                            )}
                            ৩০ দিন
                        </button>
                        <button
                            className={`btn btn-sm ${activeFilter === '3m' ? 'btn-primary' : 'btn-light border'} rounded-pill px-4 py-2 fw-bold shadow-sm hover-lift d-flex align-items-center`}
                            style={{ fontSize: '13px' }}
                            disabled={isLoading || isFetching}
                            onClick={() => {
                                const range: [dayjs.Dayjs | null, dayjs.Dayjs | null] = [dayjs().subtract(3, 'month'), dayjs()];
                                setDateRange(range);
                                setActiveFilter('3m');
                                handleSearchClick(range);
                            }}
                        >
                            {(isLoading || isFetching) && activeFilter === '3m' ? (
                                <Spinner animation="border" size="sm" className="me-2" />
                            ) : (
                                <i className={`fa-solid fa-calendar-week me-1 ${activeFilter === '3m' ? 'text-white' : 'text-info'}`}></i>
                            )}
                            ৩ মাস
                        </button>
                        <button
                            className={`btn btn-sm ${activeFilter === '6m' ? 'btn-primary' : 'btn-light border'} rounded-pill px-4 py-2 fw-bold shadow-sm hover-lift d-flex align-items-center`}
                            style={{ fontSize: '13px' }}
                            disabled={isLoading || isFetching}
                            onClick={() => {
                                const range: [dayjs.Dayjs | null, dayjs.Dayjs | null] = [dayjs().subtract(6, 'month'), dayjs()];
                                setDateRange(range);
                                setActiveFilter('6m');
                                handleSearchClick(range);
                            }}
                        >
                            {(isLoading || isFetching) && activeFilter === '6m' ? (
                                <Spinner animation="border" size="sm" className="me-2" />
                            ) : (
                                <i className={`fa-solid fa-calendar-days me-1 ${activeFilter === '6m' ? 'text-white' : 'text-warning'}`}></i>
                            )}
                            ৬ মাস
                        </button>
                        <button
                            className={`btn btn-sm ${activeFilter === '1y' ? 'btn-primary' : 'btn-light border'} rounded-pill px-4 py-2 fw-bold shadow-sm hover-lift d-flex align-items-center`}
                            style={{ fontSize: '13px' }}
                            disabled={isLoading || isFetching}
                            onClick={() => {
                                const range: [dayjs.Dayjs | null, dayjs.Dayjs | null] = [dayjs().subtract(1, 'year'), dayjs()];
                                setDateRange(range);
                                setActiveFilter('1y');
                                handleSearchClick(range);
                            }}
                        >
                            {(isLoading || isFetching) && activeFilter === '1y' ? (
                                <Spinner animation="border" size="sm" className="me-2" />
                            ) : (
                                <i className={`fa-solid fa-calendar-check me-1 ${activeFilter === '1y' ? 'text-white' : 'text-danger'}`}></i>
                            )}
                            ১ বছর
                        </button>
                        <button
                            className={`btn btn-sm ${activeFilter === 'all' ? 'btn-primary' : 'btn-light border'} rounded-pill px-4 py-2 fw-bold shadow-sm hover-lift d-flex align-items-center`}
                            style={{ fontSize: '13px' }}
                            disabled={isLoading || isFetching}
                            onClick={() => {
                                const range: [dayjs.Dayjs | null, dayjs.Dayjs | null] = [null, null];
                                setDateRange(range);
                                setActiveFilter('all');
                                handleSearchClick(range);
                            }}
                        >
                            {(isLoading || isFetching) && activeFilter === 'all' ? (
                                <Spinner animation="border" size="sm" className="me-2" />
                            ) : (
                                <i className={`fa-solid fa-earth-asia me-1 ${activeFilter === 'all' ? 'text-white' : 'text-secondary'}`}></i>
                            )}
                            সব সময়
                        </button>
                    </div>
                </div>

                <div className="col-md-4">
                    <label>তারিখ পরিসীমা (Date Range)</label>
                    <RangePicker
                        className="w-100"
                        style={{ height: '38px' }}
                        value={dateRange}
                        onChange={(dates) => setDateRange(dates as [dayjs.Dayjs | null, dayjs.Dayjs | null])}
                        format="DD/MM/YYYY"
                        placeholder={['শুরুর তারিখ', 'শেষের তারিখ']}
                    />
                </div>

                <div className="col-md-2">
                    <button disabled={isLoading || isFetching} onClick={() => handleSearchClick()} className="btn btn-primary mt-4 d-flex align-items-center justify-content-center" style={{ minWidth: '100px', height: '38px' }}>
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
                                লোডিং...
                            </>
                        ) : (
                            "সার্চ"
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
                            }${dateRange[0] ? `&from_date=${dateRange[0].format('YYYY-MM-DD')}` : ""}${dateRange[1] ? `&to_date=${dateRange[1].format('YYYY-MM-DD')}` : ""}&token=${token}`}
                        className="btn btn-info text-white"
                    >
                        প্রতিবেদন ডাউনলোড করুন
                    </Link>
                )}
            </div>

            {summaryData && <Summary data={summaryData} isLoading={isLoading || isFetching} />}


            <div className="row mx-auto mt-4">
                <ReportTable
                    data={overviewData?.children || []}
                    isLoading={isLoading || isFetching}
                    level={overviewData?.level}
                    onReportClick={handleModalReportClick}
                />
            </div>

            <ReportModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={modalTitle}
                loading={modalLoading}
                data={modalData}
            />
        </div>
    )
}

export default OverviewReport
