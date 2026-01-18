/* eslint-disable @typescript-eslint/no-explicit-any */
import { useAdminReportMutation } from "@/redux/api/auth/authApi";
import { TAdminData, TDistrict, TDivision, TUnion, TUpazila } from "@/types";
import React, { useCallback, useState } from "react";
import { Spinner } from "react-bootstrap";

import { Link, useParams } from "react-router-dom";
import Breadcrumbs from "@/components/reusable/Breadcrumbs";
import { useAppSelector } from "@/redux/features/hooks";
import { RootState } from "@/redux/features/store";
import AddressSelectorUnion from "@/components/reusable/AddressSelectorUnion";
import PouroLocationSelector from "@/components/reusable/PouroLocationSelector";

const SonodBaseReport: React.FC = () => {
  const { service } = useParams();
  const isUnion = useAppSelector(
    (state: RootState) => state.siteSetting.isUnion
  );
  const token = localStorage.getItem("token");
  const [selectedUnion, setSelectedUnion] = useState<TUnion | null>(null);
  const [selectedDivision, setSelectedDivision] = useState<TDivision | null>(
    null
  );
  const [selectedDistrict, setSelectedDistrict] = useState<TDistrict | null>(
    null
  );
  const [selectedUpazila, setSelectedUpazila] = useState<TUpazila | null>(null);

  const VITE_BASE_DOC_URL = import.meta.env.VITE_BASE_DOC_URL;

  const [adminReport, { isLoading, data }] = useAdminReportMutation();

  const handleSearchClick = useCallback(async () => {
    if (!selectedDivision?.name) {
      return;
    }

    const requestData = {
      division_name: selectedDivision?.name,
      district_name: selectedDistrict?.name || undefined,
      upazila_name: selectedUpazila?.name || undefined,
      union_name: selectedUnion?.name || undefined,
      sonod_name: service,
    };
    await adminReport({ data: requestData, token }).unwrap();
  }, [
    selectedDivision,
    selectedDistrict,
    selectedUpazila,
    selectedUnion,
    service,
    adminReport,
    token,
  ]);

  const admin: TAdminData = data?.data?.total_report;

  return (
    <div className="bg-white p-2 p-md-3 rounded">
      <Breadcrumbs current={` ${service} প্রতিবেদন`} />

      <div className="row mx-auto mb-3">
        <div className="col-md-12">
          {isUnion ? (
            <AddressSelectorUnion
              onDivisionChange={(division: TDivision | null) => setSelectedDivision(division)}
              onDistrictChange={(district: TDistrict | null) => setSelectedDistrict(district)}
              onUpazilaChange={(upazila: TUpazila | null) => setSelectedUpazila(upazila)}
              onUnionChange={(union: TUnion | null) => setSelectedUnion(union)}
            />
          ) : (
            <PouroLocationSelector
              onDivisionChange={(division: any) => setSelectedDivision(division)}
              onDistrictChange={(district: any) => setSelectedDistrict(district)}
              onUnionChange={(union: any) => setSelectedUnion(union)}
              showLabels={true}
            />
          )}
        </div>
      </div>

      <div className="row mx-auto align-items-end g-3">
        <div className="col-md-2">
          <button
            disabled={isLoading}
            onClick={handleSearchClick}
            className="btn btn-primary w-100"
            style={{ height: "38px" }}
          >
            {isLoading ? <Spinner animation="border" size="sm" /> : "সার্চ"}
          </button>
        </div>
      </div>

      <div className=" w-100 text-center my-5"> {isLoading && <Spinner />}</div>

      <div className=" my-3 d-flex justify-content-end text-white">
        {admin?.sonod_reports && admin?.sonod_reports.length >= 1 && (
          <Link
            target="_blank"
            to={`${VITE_BASE_DOC_URL}/download/reports/get-reports${selectedDivision ? `?division_name=${selectedDivision.name}` : ""
              }${selectedDistrict ? `&district_name=${selectedDistrict.name}` : ""
              }${selectedUpazila ? `&upazila_name=${selectedUpazila.name}` : ""}${selectedUnion ? `&union_name=${selectedUnion.name}` : ""
              }&sonod_name=${service}&detials=1&token=${token}`}
            className="btn btn-primary "
          >
            <i className="fa-solid fa-download"></i> রিপোর্ট ডাউনলোড
          </Link>
        )}
      </div>

      <div className="row mx-auto mt-4">
        {admin?.sonod_reports && (
          <h6 className="mb-4 fs-4 border-bottom">
            {selectedUnion?.bn_name
              ? `${selectedUnion.bn_name} ইউনিয়নের সনদের প্রতিবেদন`
              : selectedUpazila?.bn_name
                ? `${selectedUpazila.bn_name} উপজেলার সকল ইউনিয়নের সনদের প্রতিবেদন`
                : selectedDistrict?.bn_name
                  ? `${selectedDistrict.bn_name} জেলার সকল ইউনিয়নের সনদের প্রতিবেদন`
                  : selectedDivision?.bn_name
                    ? `${selectedDivision.bn_name} বিভাগের সকল ইউনিয়নের সনদের প্রতিবেদন`
                    : "সনদের প্রতিবেদন"}
          </h6>
        )}

        <div className="table-responsive">
          <table className="table table-bordered table-hover">
            <thead className="thead-dark">
              <tr>
                <th>সনদ নাম</th>
                <th> নতুন আবেদন </th>
                <th>অনুমোদিত আবেদন</th>
                <th>বাতিল</th>
                <th>মোট লেনদেন</th>
                <th>প্রয়োজনীয় টাকা</th>
              </tr>
            </thead>
            <tbody>
              {admin?.sonod_reports?.map((report, index) => (
                <tr key={index}>
                  <td>{report.sonod_name}</td>
                  <td>{report.pending_count}</td>
                  <td>{report.approved_count}</td>
                  <td>{report.cancel_count}</td>
                  <td>{report.total_payments}</td>
                  <td>{report.total_amount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default SonodBaseReport;
