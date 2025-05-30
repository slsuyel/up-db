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

  
  console.log("adminTotals:", adminTotals);

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

  return (
    <div className="bg-white p-1 vh-100 rounded">
      {adminTotals && <Summary data={adminTotals} isLoading={isLoading} />}
      {/* Dynamically render reports for each region */}
      {adminDividedReports && (
      <DividedReportSummary data={adminDividedReports} title={adminReportTitle} isLoading={isLoading} />
      )}
    </div>
  );
};

export default Dhome;
