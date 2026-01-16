import React, { useEffect, useState } from "react";
import { useLazyLocationChildSummaryQuery, useLazyOverviewReportQuery, useLazySonodWiseSummaryQuery } from "@/redux/api/auth/authApi";
import { TAdminData, TDivision, TDistrict, TUpazila, TUnion } from "@/types/global";
import Summary from "./Summary";
import { Spinner } from "react-bootstrap";
import ReportTable from "@/components/reusable/reports/ReportTable";
import ReportModal from "@/components/reusable/reports/ReportModal";

const Dhome = () => {
  const [adminReportTrigger, { isLoading }] = useLazyOverviewReportQuery();
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

  const token = localStorage.getItem("token");

  useEffect(() => {
    if (token) {
      const fetchData = async () => {
        try {
          const response = await adminReportTrigger({
            token,
            data: { auth: true },
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

      fetchData();
    }
  }, [token, adminReportTrigger]);

  const handleModalReportClick = async (child: any, type: string) => {
    setIsModalOpen(true)
    setModalLoading(true)
    setModalData(null)

    let title = ""
    const requestData: any = {
      token: token,
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
