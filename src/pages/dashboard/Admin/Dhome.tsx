import { useEffect } from "react";
import { useAdminReportMutation } from "@/redux/api/auth/authApi";
import { TAdminData } from "@/types/global";
import Summary from "./Summary";
import Loader from "@/components/reusable/Loader";

const Dhome = () => {
  const [adminReport, { isLoading, data }] = useAdminReportMutation();
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (token) {
      const fetchData = async () => {
        const dataToSend = {
          auth: true,
        };
        try {
          await adminReport({ data: dataToSend, token }).unwrap();
        } catch (error) {
          console.error("Error fetching report:", error);
        }
      };
      fetchData();
    }
  }, [token, adminReport]);

  if (isLoading) {
    return <Loader />;
  }

  const admin: TAdminData = data?.data;

  return (
    <div>
      {admin?.totals && <Summary data={admin.totals} isLoading={isLoading} />}
    </div>
  );
};

export default Dhome;
