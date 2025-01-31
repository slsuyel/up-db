import { useEffect, useState } from "react";
import { useAdminReportMutation } from "@/redux/api/auth/authApi";
import { TAdminData } from "@/types/global";
import Summary from "./Summary";
import Loader from "@/components/reusable/Loader";

const Dhome = () => {
  const [adminReport, { isLoading }] = useAdminReportMutation();
  const [admin, setAdmin] = useState<TAdminData | null>(null);
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (token) {
      const fetchData = async () => {
        const lastFetchTime = localStorage.getItem("lastFetchTime");
        const cachedData = localStorage.getItem("cachedAdminData");
        const currentTime = new Date().getTime();
        const thirtyMinutes = 30 * 60 * 1000; // 30 minutes in milliseconds

        // Check if cached data exists and is not stale
        if (
          cachedData &&
          lastFetchTime &&
          currentTime - parseInt(lastFetchTime) <= thirtyMinutes
        ) {
          // Use cached data
          setAdmin(JSON.parse(cachedData));
        } else {
          // Fetch new data
          const dataToSend = {
            auth: true,
          };
          try {
            const response = await adminReport({
              data: dataToSend,
              token,
            }).unwrap();
            setAdmin(response.data);

            // Update localStorage with new data and timestamp
            localStorage.setItem(
              "cachedAdminData",
              JSON.stringify(response.data)
            );
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
      {admin?.totals && <Summary data={admin.totals} isLoading={isLoading} />}
    </div>
  );
};

export default Dhome;
