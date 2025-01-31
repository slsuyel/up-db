/* eslint-disable @typescript-eslint/no-explicit-any */
import allApplications from "/images/all-application.png";
import approvedApplications from "/images/approved-application.png";
import canceledApplications from "/images/cancel-application.png";
import newApplications from "/images/new-application.png";
import totalFees from "/images/total-fees.png";

import { Spinner } from "react-bootstrap";

const SummaryItem = ({
  icon,
  title,
  value,
}: {
  icon: string;
  title: string;
  value: number;
}) => {
  return (
    <div className="mb-2 mt-2 mb-4">
      <div className="border-0 card h-100  py-2 shadow hover-effect">
        <div className="card-body d-flex align-items-center justify-content-around">
          <img
            src={icon}
            alt={title}
            style={{ width: "70px", height: "70px" }}
          />
          <div className="text-end">
            <h5 className="card-title fw-bold ">{title}</h5>
            <p className="card-text fs-4 mb-0">{value}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

const Summary = ({ data, isLoading }: { data: any; isLoading: boolean }) => {
  if (isLoading) {
    return <Spinner />;
  }

  const all = data;

  const summaryItems = [
    {
      icon: allApplications,
      title: "মোট আবেদন",
      value: all.total_pending + all.total_cancel + all.total_approved,
    },
    {
      icon: newApplications,
      title: "নতুন আবেদন",
      value: all.total_pending,
    },
    {
      icon: approvedApplications,
      title: "ইস্যুকৃত সনদ",
      value: all.total_approved,
    },
    {
      icon: canceledApplications,
      title: "বাতিলকৃত আবেদন",
      value: all.total_cancel,
    },
    {
      icon: totalFees,
      title: "মোট আদায়কৃত ফি",
      value: all.total_amount,
    },
  ];

  return (
    <div className="d-flex justify-content-around gap-2 flex-wrap">
      {summaryItems.map((item, index) => (
        <SummaryItem
          key={index}
          icon={item.icon}
          title={item.title}
          value={
            typeof item.value === "string" ? parseFloat(item.value) : item.value
          }
        />
      ))}
    </div>
  );
};

export default Summary;
