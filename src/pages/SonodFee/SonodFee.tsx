import Breadcrumbs from "@/components/reusable/Breadcrumbs";

import { useSonodFeesMutation } from "@/redux/api/sonod/sonodApi";
import { useAppSelector } from "@/redux/features/hooks";
import { RootState } from "@/redux/features/store";
import { TDistrict, TDivision, TUnion, TUpazila } from "@/types";

import { Button } from "antd";
import { useState, useEffect, ChangeEvent } from "react";
import { Table } from "react-bootstrap";

interface TSonodFee {
  sonod_fees_id: number;
  sonodnamelist_id: number;
  service_id: string;
  bnname: string;
  template: string;
  unioun: string;
  fees: string;
}

const SonodFee = () => {
  const user = useAppSelector((state: RootState) => state.user.user);
  const token = localStorage.getItem("token");
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

  const VITE_BASE_API_URL = import.meta.env.VITE_BASE_API_URL;

  const [sonodFees, { data, isLoading: getting }] = useSonodFeesMutation();
  // const [updateSonod, { isLoading: updating }] = useUpdateSonodFeesMutation();

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

  const handleShowFees = async () => {
    const union_name = selectedUnion?.name.replace(/\s+/g, "").toLowerCase();
    await sonodFees({ union: union_name, token });
  };

  const allFees: TSonodFee[] = data?.data?.data || [];
  return (
    <div className="bg-white p-3 rounded">
      <Breadcrumbs current="সনদ ফি" />

      <div className="row mx-auto align-items-end">
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

        {selectedUnion && (
          <div className="col-md-2 mt-2 d-flex align-items-center gap-2">
            <Button
              disabled={getting}
              loading={getting}
              className="btn btn-sm btn-info"
              onClick={handleShowFees}
            >
              Search
            </Button>
            <div>
              <a
                target="_blank"
                download={true}
                className="btn btn-sm btn-success"
                href={`${VITE_BASE_API_URL}/admin/sonodnamelist/with-fees?union=${selectedUnion?.name
                  .replace(/\s+/g, "")
                  .toLowerCase()}&pdf=1&token=${token}`}
              >
                download
              </a>
            </div>
          </div>
        )}
      </div>

      <Table striped bordered hover responsive className=" mt-4  mx-auto">
        <thead>
          <tr>
            <th>#</th>
            <th>সনদ নাম</th>
            <th>ফি (টাকা)</th>
          </tr>
        </thead>
        <tbody>
          {allFees?.map((fee, index) => (
            <tr key={fee?.sonod_fees_id}>
              <td>{index + 1}</td>
              <td>{fee?.bnname}</td>
              <td>{fee?.fees}</td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
};

export default SonodFee;
