import useAllServices from "@/hooks/useAllServices";
import { useAdminReportMutation } from "@/redux/api/auth/authApi";
import { TAdminData, TDistrict, TDivision, TUnion, TUpazila } from "@/types";
import React, { ChangeEvent, useEffect, useState } from "react";
import { Spinner } from "react-bootstrap";
import Summary from "./Summary";
import { Link } from "react-router-dom";
import { message } from "antd";
import { useAppSelector } from "@/redux/features/hooks";
import { RootState } from "@/redux/features/store";
import Breadcrumbs from "@/components/reusable/Breadcrumbs";

const SearchFilter: React.FC = () => {
  const user = useAppSelector((state: RootState) => state.user.user);
  const token = localStorage.getItem("token");
  const services = useAllServices();
  const [selected, setSelected] = useState("");
  const [selectedUnion, setSelectedUnion] = useState<TUnion | null>(null);
  const [selectedDivision, setSelectedDivision] = useState<TDivision | null>(
    null
  );
  const [selectedDistrict, setSelectedDistrict] = useState<TDistrict | null>(
    null
  );
  const [selectedUpazila, setSelectedUpazila] = useState<TUpazila | null>(null);
  const [divisions, setDivisions] = useState<TDivision[]>([]);
  const [districts, setDistricts] = useState<TDistrict[]>([]);
  const [upazilas, setUpazilas] = useState<TUpazila[]>([]);
  const [unions, setUnions] = useState<TUnion[]>([]);

  const [adminReport, { isLoading, data }] = useAdminReportMutation();

  useEffect(() => {
    fetch("/divisions.json")
      .then((res) => res.json())
      .then((data: TDivision[]) => {
        setDivisions(data);
        if (user?.division_name) {
          const userDivision = data.find((d) => d?.name === user.division_name);
          if (userDivision) {
            setSelectedDivision(userDivision);
          }
        }
      })
      .catch((error) => console.error("Error fetching divisions data:", error));
  }, [user]);

  useEffect(() => {
    if (selectedDivision) {
      fetch("/districts.json")
        .then((response) => response.json())
        .then((data: TDistrict[]) => {
          const filteredDistricts = data.filter(
            (d) => d?.division_id === selectedDivision.id
          );
          setDistricts(filteredDistricts);
          if (user?.district_name) {
            const userDistrict = filteredDistricts.find(
              (d) => d?.name === user.district_name
            );
            if (userDistrict) {
              setSelectedDistrict(userDistrict);
            }
          }
        })
        .catch((error) =>
          console.error("Error fetching districts data:", error)
        );
    }
  }, [selectedDivision, user]);

  useEffect(() => {
    if (selectedDistrict) {
      fetch("/upazilas.json")
        .then((response) => response.json())
        .then((data: TUpazila[]) => {
          const filteredUpazilas = data.filter(
            (upazila) => upazila.district_id === selectedDistrict.id
          );
          setUpazilas(filteredUpazilas);
          if (user?.upazila_name) {
            const userUpazila = filteredUpazilas.find(
              (u) => u?.name === user.upazila_name
            );
            if (userUpazila) {
              setSelectedUpazila(userUpazila);
            }
          }
        })
        .catch((error) =>
          console.error("Error fetching upazilas data:", error)
        );
    }
  }, [selectedDistrict, user]);

  useEffect(() => {
    if (selectedUpazila) {
      fetch("/unions.json")
        .then((response) => response.json())
        .then((data: TUnion[]) => {
          const filteredUnions = data.filter(
            (union) => union.upazilla_id === selectedUpazila.id
          );
          setUnions(filteredUnions);
        })
        .catch((error) => console.error("Error fetching unions data:", error));
    }
  }, [selectedUpazila]);

  const handleDivisionChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const division = divisions.find((d) => d.id === event.target.value);
    setSelectedDivision(division || null);
    setSelectedDistrict(null);
    setSelectedUpazila(null);
    setSelectedUnion(null);
  };

  const handleDistrictChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const district = districts.find((d) => d.id === event.target.value);
    setSelectedDistrict(district || null);
    setSelectedUpazila(null);
  };

  const handleUpazilaChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const upazila = upazilas.find((u) => u.id === event.target.value);
    setSelectedUpazila(upazila || null);
  };

  const handleUnionChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const union = unions.find((u) => u.id === event.target.value);
    setSelectedUnion(union || null);
  };

  const handleSearchClick = async () => {
    if (!selectedDivision?.name) {
      message.warning("বিভাগ নির্বাচন করুন");
      return;
    }

    const data = {
      division_name: selectedDivision?.name,
      district_name: selectedDistrict?.name,
      upazila_name: selectedUpazila?.name,
      union_name: selectedUnion?.name,
      sonod_name: selected,
    };
    await adminReport({ data, token }).unwrap();
  };

  const admin: TAdminData = data?.data;

  return (
    <>
      <Breadcrumbs current=" সকল প্রতিবেদন" />
      <div className="row mx-auto">
        <div className="col-md-2">
          <label htmlFor="division">বিভাগ নির্বাচন করুন</label>
          <select
            disabled={!!user?.division_name}
            id="division"
            className="searchFrom form-control"
            value={selectedDivision?.id || ""}
            onChange={handleDivisionChange}
          >
            <option value="">বিভাগ নির্বাচন করুন</option>
            {divisions.map((d) => (
              <option key={d.id} value={d.id}>
                {d.bn_name}
              </option>
            ))}
          </select>
        </div>

        {selectedDivision && (
          <div className="col-md-2">
            <label htmlFor="district">জেলা নির্বাচন করুন</label>
            <select
              disabled={!!user?.district_name}
              id="district"
              className="searchFrom form-control"
              value={selectedDistrict?.id || ""}
              onChange={handleDistrictChange}
            >
              <option value="">জেলা নির্বাচন করুন</option>
              {districts.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.bn_name}
                </option>
              ))}
            </select>
          </div>
        )}

        {selectedDistrict && (
          <div className="col-md-2">
            <label htmlFor="upazila">উপজেলা নির্বাচন করুন</label>
            <select
              disabled={!!user?.upazila_name}
              id="upazila"
              className="searchFrom form-control"
              value={selectedUpazila?.id || ""}
              onChange={handleUpazilaChange}
            >
              <option value="">উপজেলা নির্বাচন করুন</option>
              {upazilas.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.bn_name}
                </option>
              ))}
            </select>
          </div>
        )}

        {selectedUpazila && (
          <div className="col-md-2">
            <label htmlFor="union">ইউনিয়ন নির্বাচন করুন</label>
            <select
              id="union"
              className="searchFrom form-control"
              value={selectedUnion?.id || ""}
              onChange={handleUnionChange}
            >
              <option value="">ইউনিয়ন নির্বাচন করুন</option>
              {unions.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.bn_name}
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="col-md-2">
          <label htmlFor="service">সেবা নির্বাচন করুন</label>
          <select
            id="service"
            className="searchFrom form-control"
            value={selected}
            onChange={(e) => setSelected(e.target.value)}
          >
            <option value="">সেবা নির্বাচন করুন</option>
            {/* <option value="all">সকল</option> */}
            <option value="holdingtax">হোল্ডিং ট্যাক্স</option>
            {services?.map((d) => (
              <option key={d.title} value={d.title}>
                {d.title}
              </option>
            ))}
          </select>
        </div>

        <div className="col-md-2">
          <button onClick={handleSearchClick} className="btn btn-primary mt-4">
            Search
          </button>
        </div>
      </div>

      <div className=" w-100"> {isLoading && <Spinner />}</div>

      <div className=" my-3 d-flex justify-content-end text-white">
        {admin?.sonod_reports.length >= 1 && (
          <Link
            target="_blank"
            to={`https://api.uniontax.gov.bd/download/reports/get-reports${
              selectedDivision ? `?division_name=${selectedDivision.name}` : ""
            }${
              selectedDistrict ? `&district_name=${selectedDistrict.name}` : ""
            }${selectedUpazila ? `&upazila_name=${selectedUpazila.name}` : ""}${
              selectedUnion ? `&union_name=${selectedUnion.name}` : ""
            }${selected ? `&sonod_name=${selected}` : ""}`}
            className="btn btn-info text-white"
          >
            প্রতিবেদন ডাউনলোড করুন
          </Link>
        )}
      </div>

      {admin?.totals && <Summary data={admin.totals} isLoading={isLoading} />}

      <div className=" row mx-auto mt-4">
        {admin?.sonod_reports && (
          <h6 className="mb-4 fs-4 border-bottom">
            {selectedUnion?.bn_name
              ? `${selectedUnion.bn_name} ইউনিয়নের সনদের প্রতিবেদন`
              : selectedUpazila?.bn_name
              ? `${selectedUpazila.bn_name} উপজেলার সকল ইউনিয়নের সনদের প্রতিবেদন`
              : selectedDistrict?.bn_name
              ? `${selectedDistrict.bn_name} জেলার সকল ইউনিয়নের সনদের প্রতিবেদন`
              : selectedDivision?.bn_name
              ? `${selectedDivision.bn_name} বিভাগের সকল ইউনিয়নের সনদের প্রতিবেদন`
              : "সনদের প্রতিবেদন"}
          </h6>
        )}

        <table className="table table-bordered table-hover">
          <thead className="thead-dark">
            <tr>
              <th>সনদ নাম</th>
              <th> নতুন আবেদন </th>
              <th>অনুমোদিত আবেদন</th>
              <th>বাতিল</th>
              {!selectedUnion && <th>বিস্তারিত</th>}
            </tr>
          </thead>
          <tbody>
            {admin?.sonod_reports?.map((report, index) => (
              <tr key={index}>
                <td>{report.sonod_name}</td>
                <td>
                  {selectedUnion ? (
                    <Link
                      to={`/dashboard/sonod/${report.sonod_name}/${"Pending"}/${
                        selectedUnion?.name
                      }`}
                    >
                      {" "}
                      {report.pending_count}
                    </Link>
                  ) : (
                    report.pending_count
                  )}
                </td>
                <td>
                  {selectedUnion ? (
                    <Link
                      to={`/dashboard/sonod/${
                        report.sonod_name
                      }/${"approved"}/${selectedUnion?.name}`}
                    >
                      {" "}
                      {report.approved_count}
                    </Link>
                  ) : (
                    report.approved_count
                  )}
                </td>
                <td>
                  {selectedUnion ? (
                    <Link
                      to={`/dashboard/sonod/${report.sonod_name}/${"cancel"}/${
                        selectedUnion?.name
                      }`}
                    >
                      {" "}
                      {report.cancel_count}
                    </Link>
                  ) : (
                    report.cancel_count
                  )}
                </td>
                {!selectedUnion && (
                  <td>
                    <a
                      href={`https://api.uniontax.gov.bd/download/reports/get-reports?${
                        selectedDivision?.name
                          ? `division_name=${selectedDivision.name}&`
                          : ""
                      }${
                        selectedDistrict?.name
                          ? `district_name=${selectedDistrict.name}&`
                          : ""
                      }${
                        selectedUpazila?.name
                          ? `upazila_name=${selectedUpazila.name}&`
                          : ""
                      }${`sonod_name=${report.sonod_name}&`}detials=1`}
                      target="_blank"
                      className="btn btn-sm btn-info"
                    >
                      <i className="fa-solid fa-download text-white"></i>{" "}
                      ডাউনলোড
                    </a>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="row mx-auto  mt-5 ">
        {admin?.payment_reports && (
          <h6 className="mb-4 fs-4 border-bottom">
            {selectedUnion?.bn_name
              ? `${selectedUnion.bn_name} ইউনিয়নের আদায়কৃত ফি এর প্রতিবেদন`
              : selectedUpazila?.bn_name
              ? `${selectedUpazila.bn_name} উপজেলার সকল ইউনিয়নের আদায়কৃত ফি এর প্রতিবেদন`
              : selectedDistrict?.bn_name
              ? `${selectedDistrict.bn_name} জেলার সকল ইউনিয়নের আদায়কৃত ফি এর প্রতিবেদন`
              : selectedDivision?.bn_name
              ? `${selectedDivision.bn_name} বিভাগের সকল ইউনিয়নের আদায়কৃত ফি এর প্রতিবেদন`
              : "আদায়কৃত ফি এর প্রতিবেদন"}
          </h6>
        )}

        <table className="table table-bordered table-hover">
          <thead className="thead-dark">
            <tr>
              <th>সনদ নাম</th>
              <th>মোট লেনদেন</th>
              <th>মোট টাকার পরিমাণ</th>
            </tr>
          </thead>
          <tbody>
            {admin?.payment_reports?.map((report, index) => (
              <tr key={index}>
                <td>{report.sonod_type}</td>
                <td>{report.total_payments}</td>
                <td>{report.total_amount}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
};

export default SearchFilter;
