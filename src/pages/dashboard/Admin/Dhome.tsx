import { useEffect, useState } from "react";
import { useAdminReportMutation } from "@/redux/api/auth/authApi";
import { TAdminData } from "@/types/global";
import Summary from "./Summary";
import DividedReportSummary from "./DividedReportSummary";
import Loader from "@/components/reusable/Loader";

const Dhome = () => {
  const [adminReport, { isLoading }] = useAdminReportMutation();
  const [adminTotals, setAdminTotals] = useState<TAdminData["totals"] | null>(null);
  const [adminDividedReports, setAdminDividedReports] = useState<TAdminData["divided_reports"] | null>(null);
  const [adminReportTitle, setAdminReportTitle] = useState<TAdminData | null>(null);
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (token) {
      const fetchData = async () => {
        const lastFetchTime = localStorage.getItem("lastFetchTime");
        const cachedData = localStorage.getItem("cachedAdminData");
        const currentTime = new Date().getTime();
        const thirtyMinutes = 30 * 60 * 1000;

        if (
          cachedData &&
          JSON.parse(cachedData) &&
          lastFetchTime &&
          currentTime - parseInt(lastFetchTime) <= thirtyMinutes
        ) {
          const parsed = JSON.parse(cachedData);
          setAdminTotals(parsed.total_report.totals);
          setAdminDividedReports(parsed.divided_reports);
          setAdminReportTitle(parsed.title);
        } else {
          try {
            const response = await adminReport({
              data: { auth: true },
              token,
            }).unwrap();

            setAdminTotals(response.data.total_report.totals || null);
            setAdminDividedReports(response.data.divided_reports || null);
            setAdminReportTitle(response.data.title || null);

            localStorage.setItem("cachedAdminData", JSON.stringify(response.data));
            localStorage.setItem("lastFetchTime", currentTime.toString());
          } catch (error) {
            console.error("Error fetching report:", error);
          }
        }
      };

      fetchData();
    }
  }, [token, adminReport]);

  if (isLoading) {
    return <Loader />;
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
          {adminTotals && (
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

          {adminDividedReports && (
            <section className="mb-4 bg-white p-4 rounded-4 border premium-border soft-shadow">
              <DividedReportSummary
                data={adminDividedReports}
                title={adminReportTitle || "বিভাগীয় রিপোর্ট সারাংশ"}
                isLoading={isLoading}
              />
            </section>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dhome;
