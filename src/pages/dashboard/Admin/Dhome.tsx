import React, { useEffect, useState } from "react";
import { useLazyLocationChildSummaryQuery, useLazyOverviewReportQuery, useLazySonodWiseSummaryQuery } from "@/redux/api/auth/authApi";
import { TAdminData, TDivision, TDistrict, TUpazila, TUnion } from "@/types/global";
import Summary from "./Summary";
import { Spinner } from "react-bootstrap";
import ReportTable from "@/components/reusable/reports/ReportTable";
import ReportModal from "@/components/reusable/reports/ReportModal";
import { DatePicker, ConfigProvider } from "antd";
import dayjs from "dayjs";
import "dayjs/locale/bn";

const { RangePicker } = DatePicker;

const Dhome = () => {
  const [adminReportTrigger, { isLoading, isFetching }] = useLazyOverviewReportQuery();
  const [sonodWiseSummaryTrigger] = useLazySonodWiseSummaryQuery()
  const [locationChildSummaryTrigger] = useLazyLocationChildSummaryQuery()

  const [adminTotals, setAdminTotals] = useState<any | null>(null);
  const [adminDividedReports, setAdminDividedReports] = useState<any[] | null>(null);
  const [adminReportTitle, setAdminReportTitle] = useState<string | null>(null);
  const [reportLevel, setReportLevel] = useState<string>("")

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalData, setModalData] = useState<any>(null)
  const [modalTitle, setModalTitle] = useState("")
  const [modalLoading, setModalLoading] = useState(false)

  // Date filter states
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs | null, dayjs.Dayjs | null]>([
    dayjs().subtract(30, 'day'),
    dayjs()
  ]);
  const [activeFilter, setActiveFilter] = useState<string>("30d");

  const token = localStorage.getItem("token");

  const fetchData = async (range?: [dayjs.Dayjs | null, dayjs.Dayjs | null]) => {
    if (!token) return;
    const [start, end] = range || dateRange;
    try {
      const response = await adminReportTrigger({
        token,
        data: {
          auth: true,
          from_date: start ? start.format('YYYY-MM-DD') : undefined,
          to_date: end ? end.format('YYYY-MM-DD') : undefined,
        },
      }).unwrap();

      const responseData = response.data;
      setAdminTotals(responseData || null);
      setAdminDividedReports(responseData.children || []);
      setAdminReportTitle(responseData.name || null);
      setReportLevel(responseData.level || "");
    } catch (error) {
      console.error("Error fetching report:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, [token, adminReportTrigger]);

  const handleModalReportClick = async (child: any, type: string) => {
    setIsModalOpen(true)
    setModalLoading(true)
    setModalData(null)

    let title = ""
    const [start, end] = dateRange;
    const requestData: any = {
      token: token,
      from_date: start ? start.format('YYYY-MM-DD') : undefined,
      to_date: end ? end.format('YYYY-MM-DD') : undefined,
    }

    if (reportLevel === "division") {
      requestData.division_name = adminReportTitle;
      requestData.district_name = child.name;
    } else if (reportLevel === "district") {
      requestData.district_name = adminReportTitle;
      requestData.upazila_name = child.name;
    } else if (reportLevel === "upazila") {
      requestData.upazila_name = adminReportTitle;
      requestData.union_name = child.name;
    } else if (reportLevel === "union") {
      requestData.union_name = adminReportTitle;
      requestData.sonod_name = child.sonod_name;
    }

    if (type === "union") {
      title = `${child.bn_name || child.name} - ইউনিয়ন ভিত্তিক প্রতিবেদন`
      requestData.report_type = "union"
    } else if (type === "sonod") {
      title = `${child.bn_name || child.name || child.sonod_name} - সনদ ভিত্তিক প্রতিবেদন`
      requestData.report_type = "sonod"
    }

    setModalTitle(title)

    try {
      let res: any;
      if (type === "sonod") {
        res = await sonodWiseSummaryTrigger({ token, data: requestData }).unwrap()
      } else {
        res = await locationChildSummaryTrigger({ token, data: requestData }).unwrap()
      }
      setModalData(res.data)
    } catch (error) {
      console.error("Error fetching detail report:", error)
    } finally {
      setModalLoading(false)
    }
  }

  const currentDate = new Date().toLocaleDateString('bn-BD', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div className="bg-light min-vh-100 p-2 p-md-4 rounded-4 shadow-sm border premium-border">
      {/* Main Content Sections */}
      <div className="row g-0">
        <div className="col-12">
          {/* Date Filter Section */}
          <div className="row g-3 mb-4 align-items-end bg-white p-4 rounded-4 border premium-border mx-0 shadow-sm soft-shadow">
            <div className="col-md-9 mb-2">
              <div className="d-flex flex-wrap gap-2">
                <button
                  className={`btn btn-sm ${activeFilter === '7d' ? 'btn-primary' : 'btn-light border'} rounded-pill px-4 py-2 fw-bold hover-lift shadow-sm d-flex align-items-center`}
                  onClick={() => {
                    const range: [dayjs.Dayjs | null, dayjs.Dayjs | null] = [dayjs().subtract(7, 'day'), dayjs()];
                    setDateRange(range);
                    setActiveFilter('7d');
                    fetchData(range);
                  }}
                  disabled={isLoading || isFetching}
                  style={{ fontSize: '13px' }}
                >
                  {(isLoading || isFetching) && activeFilter === '7d' ? (
                    <Spinner animation="border" size="sm" className="me-2" />
                  ) : (
                    <i className={`fa-solid fa-clock-rotate-left me-1 ${activeFilter === '7d' ? 'text-white' : 'text-primary'}`}></i>
                  )}
                  শেষ ৭ দিন
                </button>
                <button
                  className={`btn btn-sm ${activeFilter === '30d' ? 'btn-primary' : 'btn-light border'} rounded-pill px-4 py-2 fw-bold hover-lift shadow-sm d-flex align-items-center`}
                  onClick={() => {
                    const range: [dayjs.Dayjs | null, dayjs.Dayjs | null] = [dayjs().subtract(1, 'month'), dayjs()];
                    setDateRange(range);
                    setActiveFilter('30d');
                    fetchData(range);
                  }}
                  disabled={isLoading || isFetching}
                  style={{ fontSize: '13px' }}
                >
                  {(isLoading || isFetching) && activeFilter === '30d' ? (
                    <Spinner animation="border" size="sm" className="me-2" />
                  ) : (
                    <i className={`fa-solid fa-calendar-day me-1 ${activeFilter === '30d' ? 'text-white' : 'text-success'}`}></i>
                  )}
                  ৩০ দিন
                </button>
                <button
                  className={`btn btn-sm ${activeFilter === '3m' ? 'btn-primary' : 'btn-light border'} rounded-pill px-4 py-2 fw-bold hover-lift shadow-sm d-flex align-items-center`}
                  onClick={() => {
                    const range: [dayjs.Dayjs | null, dayjs.Dayjs | null] = [dayjs().subtract(3, 'month'), dayjs()];
                    setDateRange(range);
                    setActiveFilter('3m');
                    fetchData(range);
                  }}
                  disabled={isLoading || isFetching}
                  style={{ fontSize: '13px' }}
                >
                  {(isLoading || isFetching) && activeFilter === '3m' ? (
                    <Spinner animation="border" size="sm" className="me-2" />
                  ) : (
                    <i className={`fa-solid fa-calendar-week me-1 ${activeFilter === '3m' ? 'text-white' : 'text-info'}`}></i>
                  )}
                  ৩ মাস
                </button>
                <button
                  className={`btn btn-sm ${activeFilter === '6m' ? 'btn-primary' : 'btn-light border'} rounded-pill px-4 py-2 fw-bold hover-lift shadow-sm d-flex align-items-center`}
                  onClick={() => {
                    const range: [dayjs.Dayjs | null, dayjs.Dayjs | null] = [dayjs().subtract(6, 'month'), dayjs()];
                    setDateRange(range);
                    setActiveFilter('6m');
                    fetchData(range);
                  }}
                  disabled={isLoading || isFetching}
                  style={{ fontSize: '13px' }}
                >
                  {(isLoading || isFetching) && activeFilter === '6m' ? (
                    <Spinner animation="border" size="sm" className="me-2" />
                  ) : (
                    <i className={`fa-solid fa-calendar-days me-1 ${activeFilter === '6m' ? 'text-white' : 'text-warning'}`}></i>
                  )}
                  ৬ মাস
                </button>
                <button
                  className={`btn btn-sm ${activeFilter === '1y' ? 'btn-primary' : 'btn-light border'} rounded-pill px-4 py-2 fw-bold hover-lift shadow-sm d-flex align-items-center`}
                  onClick={() => {
                    const range: [dayjs.Dayjs | null, dayjs.Dayjs | null] = [dayjs().subtract(1, 'year'), dayjs()];
                    setDateRange(range);
                    setActiveFilter('1y');
                    fetchData(range);
                  }}
                  disabled={isLoading || isFetching}
                  style={{ fontSize: '13px' }}
                >
                  {(isLoading || isFetching) && activeFilter === '1y' ? (
                    <Spinner animation="border" size="sm" className="me-2" />
                  ) : (
                    <i className={`fa-solid fa-calendar-check me-1 ${activeFilter === '1y' ? 'text-white' : 'text-danger'}`}></i>
                  )}
                  ১ বছর
                </button>
                <button
                  className={`btn btn-sm ${activeFilter === 'all' ? 'btn-primary' : 'btn-light border'} rounded-pill px-4 py-2 fw-bold hover-lift shadow-sm d-flex align-items-center`}
                  onClick={() => {
                    const range: [dayjs.Dayjs | null, dayjs.Dayjs | null] = [null, null];
                    setDateRange(range);
                    setActiveFilter('all');
                    fetchData(range);
                  }}
                  disabled={isLoading || isFetching}
                  style={{ fontSize: '13px' }}
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

            <div className="col-md-6">
              <label className="form-label small fw-bold text-muted mb-2 ps-1">
                <i className="fa-solid fa-calendar-range me-2 text-primary"></i>তারিখ পরিসীমা (Date Range)
              </label>
              <RangePicker
                className="w-100 border-0 bg-light rounded-3 shadow-none fw-semibold"
                style={{ height: '42px' }}
                value={dateRange}
                onChange={(dates) => setDateRange(dates as [dayjs.Dayjs | null, dayjs.Dayjs | null])}
                format="DD/MM/YYYY"
                placeholder={['শুরুর তারিখ', 'শেষের তারিখ']}
              />
            </div>
            <div className="col-md-2">
              <button
                className="btn btn-primary w-100 rounded-3 shadow-sm border-0 fw-bold d-flex align-items-center justify-content-center gap-2 hover-lift"
                style={{ height: '42px', background: 'linear-gradient(135deg, #4e73df 0%, #224abe 100%)' }}
                onClick={() => fetchData()}
                disabled={isLoading || isFetching}
              >
                {(isLoading || isFetching) ? (
                  <Spinner animation="border" size="sm" />
                ) : (
                  <>
                    <i className="fa-solid fa-magnifying-glass"></i>
                    <span>সার্চ</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {(adminTotals || isLoading) && (
            <section className="mb-5 bg-white p-4 rounded-4 border premium-border soft-shadow">
              <div className="d-flex flex-column flex-md-row align-items-md-center mb-4 ps-1 justify-content-between gap-3">
                <div className="d-flex align-items-center">
                  <div className="p-2 bg-primary rounded-3 me-3 d-flex align-items-center justify-content-center soft-shadow" style={{ width: '38px', height: '38px' }}>
                    <i className="fa-solid fa-chart-pie text-white small"></i>
                  </div>
                  <h5 className="fw-bold mb-0 text-dark">আবেদন ও ফি সারসংক্ষেপ</h5>
                </div>

                <div className="d-flex align-items-center gap-2">
                  <div className="bg-light p-2 px-3 rounded-pill text-primary fw-bold border d-flex align-items-center gap-2 shadow-sm" style={{ fontSize: '13px' }}>
                    <i className="fa-solid fa-calendar-days small"></i>
                    <span>{currentDate}</span>
                  </div>
                  <button className="btn btn-sm btn-white border rounded-pill px-3 fw-bold text-muted hover-lift" onClick={() => window.location.reload()} style={{ fontSize: '12px' }}>
                    <i className="fa-solid fa-rotate me-1"></i> রিফ্রেশ
                  </button>
                </div>
              </div>
              <Summary data={adminTotals} isLoading={isLoading} />
            </section>
          )}

          {(adminDividedReports && adminDividedReports.length > 0 || isLoading) && (
            <section className="mb-4 bg-white p-4 rounded-4 border premium-border soft-shadow">
              <ReportTable
                data={adminDividedReports || []}
                isLoading={isLoading}
                level={reportLevel}
                onReportClick={handleModalReportClick}
              />
            </section>
          )}
        </div>
      </div>

      <ReportModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={modalTitle}
        loading={modalLoading}
        data={modalData}
      />
    </div>
  );
};

export default Dhome;
