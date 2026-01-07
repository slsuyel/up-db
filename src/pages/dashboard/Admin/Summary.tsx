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
  variant = "primary",
  loading = false,
}: {
  icon: string;
  title: string;
  value: number;
  variant?: string;
  loading?: boolean;
}) => {
  return (
    <div className="col-12 col-sm-6 col-lg-4 col-xl-3 mb-4">
      <div className={`card h-100 border-0 shadow-sm hover-lift transition-all overflow-hidden bg-gradient-${variant} soft-shadow`}>
        <div className="card-body p-4">
          <div className="d-flex align-items-center justify-content-between">
            <div>
              <p className="text-uppercase fw-bold text-muted mb-2 opacity-75" style={{ fontSize: '1.1rem' }}>{title}</p>
              {loading ? (
                <Spinner animation="border" size="sm" variant="dark" className="mt-1" />
              ) : (
                <h3 className="fw-extrabold mb-0" style={{ fontSize: '1.8rem' }}>{value.toLocaleString()}</h3>
              )}
            </div>
            <div className="p-3 rounded-circle bg-white shadow-sm d-flex align-items-center justify-content-center" style={{ width: "65px", height: "65px" }}>
              <img
                src={icon}
                alt={title}
                style={{ width: "38px", height: "38px", objectFit: "contain" }}
              />
            </div>
          </div>
        </div>
        <div className="progress rounded-0" style={{ height: "4px", backgroundColor: 'rgba(255,255,255,0.2)' }}>
          <div
            className={`progress-bar bg-${variant}`}
            role="progressbar"
            style={{ width: "100%", opacity: 0.6 }}
            aria-valuenow={100}
            aria-valuemin={0}
            aria-valuemax={100}
          ></div>
        </div>
      </div>
    </div>
  );
};

const Summary = ({ data, isLoading }: { data: any; isLoading: boolean }) => {
  const all = data || {};

  const summaryItems = [
    {
      icon: allApplications,
      title: "মোট আবেদন",
      value: (all.total_pending || 0) + (all.total_cancel || 0) + (all.total_approved || 0),
      variant: "primary",
    },
    {
      icon: newApplications,
      title: "নতুন আবেদন",
      value: all.total_pending || 0,
      variant: "warning",
    },
    {
      icon: approvedApplications,
      title: "ইস্যুকৃত সনদ",
      value: all.total_approved || 0,
      variant: "success",
    },
    {
      icon: canceledApplications,
      title: "বাতিলকৃত আবেদন",
      value: all.total_cancel || 0,
      variant: "danger",
    },
    {
      icon: totalFees,
      title: "মোট আদায়কৃত ফি",
      value: typeof all.total_amount === "string" ? parseFloat(all.total_amount) : (all.total_amount || 0),
      variant: "info",
    },
    {
      icon: newApplications,
      title: "৭ দিনের নতুন আবেদন",
      value: all.Last7DaysPending || 0,
      variant: "secondary",
    },
    {
      icon: newApplications,
      title: "৩০ দিনের নতুন আবেদন",
      value: all.Last30DaysPending || 0,
      variant: "secondary",
    },
    {
      icon: newApplications,
      title: "৭ দিনের আগের নতুন আবেদন",
      value: all.Before7DaysPending || 0,
      variant: "warning",
    },
    {
      icon: newApplications,
      title: "৩০ দিনের আগের নতুন আবেদন",
      value: all.Before30DaysPending || 0,
      variant: "danger",
    }
  ];

  return (
    <div className="container-fluid px-0">
      <div className="row g-4 justify-content-center">
        {summaryItems.map((item, index) => (
          <SummaryItem
            key={index}
            icon={item.icon}
            title={item.title}
            value={item.value}
            variant={item.variant}
            loading={isLoading && !data}
          />
        ))}
      </div>
    </div>
  );
};

export default Summary;
