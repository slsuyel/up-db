import useAllServices from "@/hooks/useAllServices";
import { useAdminReportMutation } from "@/redux/api/auth/authApi";
import { TAdminData, TDistrict, TDivision, TUnion, TUpazila } from "@/types";
import React, { ChangeEvent, useEffect, useState } from "react";
import { Spinner } from "react-bootstrap";
import Summary from "./Summary";
import { Link } from "react-router-dom";

const SearchFilter: React.FC = () => {
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
      .then((data: TDivision[]) => setDivisions(data))
      .catch((error) => console.error("Error fetching divisions data:", error));
  }, []);

  useEffect(() => {
    if (selectedDivision) {
      fetch("/districts.json")
        .then((response) => response.json())
        .then((data: TDistrict[]) => {
          const filteredDistricts = data.filter(
            (d) => d.division_id === selectedDivision.id
          );
          setDistricts(filteredDistricts);
        })
        .catch((error) =>
          console.error("Error fetching districts data:", error)
        );
    }
  }, [selectedDivision]);

  useEffect(() => {
    if (selectedDistrict) {
      fetch("/upazilas.json")
        .then((response) => response.json())
        .then((data: TUpazila[]) => {
          const filteredUpazilas = data.filter(
            (upazila) => upazila.district_id === selectedDistrict.id
          );
          setUpazilas(filteredUpazilas);
        })
        .catch((error) =>
          console.error("Error fetching upazilas data:", error)
        );
    }
  }, [selectedDistrict]);

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
      <div className="row mx-auto">
        <div className="col-md-2">
          <label htmlFor="division">বিভাগ নির্বাচন করুন</label>
          <select
            id="division"
            className="searchFrom form_control"
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
              id="district"
              className="searchFrom form_control"
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
              id="upazila"
              className="searchFrom form_control"
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
              className="searchFrom form_control"
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
            className="searchFrom form_control"
            value={selected}
            onChange={(e) => setSelected(e.target.value)}
          >
            <option value="">সেবা নির্বাচন করুন</option>
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
            </tr>
          </thead>
          <tbody>
            {admin?.sonod_reports?.map((report, index) => (
              <tr key={index}>
                <td>{report.sonod_name}</td>
                <td>

                  {selectedUnion ? <Link to={`/dashboard/sonod/${report.sonod_name}/${'pending'}/${selectedUnion?.name}`}> {report.pending_count}</Link> : report.pending_count}


                </td>
                <td>{report.approved_count}</td>
                <td>{report.cancel_count}</td>
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
              <th>মোট পেমেন্ট</th>
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
