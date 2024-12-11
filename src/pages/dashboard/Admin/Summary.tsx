/* eslint-disable @typescript-eslint/no-explicit-any */

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
    <div className="col-md-3 my-1 ">
      <div className="border-0 card hov-card mb-2 py-3 shadow-sm">
        <div className="card-body d-flex align-item-center justify-content-around">
          <i className={`p-3 rounded-circle my-auto ${icon} fs-1`}></i>
          <div className="text-end">
            <h5 className="card-title fw-bold ">{title}</h5>
            <p className="card-text fs-4 mb-0">{value}</p>
          </div>
        </div>
      </div>
    </div>
  );
};



const Summary = ({ data, isLoading }: { data: any, isLoading: boolean }) => {


  if (isLoading) {
    return <Spinner />;
  }

  const all = data;


  console.log(all);


  const summaryItems = [
    {
      icon: "fa-solid fa-file-contract",
      title: "মোট আবেদন",
      value: all.total_pending + all.total_cancel + all.total_approved,
    },
    {
      icon: "fa-solid fa-file-pen",
      title: "নতুন আবেদন",
      value: all.total_pending,
    },
    {
      icon: "fa-solid fa-file-circle-check",
      title: "ইস্যুকৃত সনদ",
      value: all.total_approved,
    },
    {
      icon: "fa-solid fa-file-excel",
      title: "বাতিলকৃত আবেদন",
      value: all.total_cancel,
    },
    {
      icon: "fa-solid fa-bangladeshi-taka-sign",
      title: "মোট আদায়কৃত ফি",
      value: all.total_amount,
    },
  ];

  return (
    <div className="row mx-auto  mt-4">
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
