/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState, ChangeEvent } from "react";
import { TDivision, TDistrict, TUpazila, TUnion } from "@/types/global";
import { useAppSelector } from "@/redux/features/hooks";
import { RootState } from "@/redux/features/store";

type AddressSelectorProps = {
  onUnionChange: (union: TUnion | null) => void;
};

const AddressSelectorUnion = ({ onUnionChange }: AddressSelectorProps) => {
  const user = useAppSelector((state: RootState) => state.user.user);
  const [divisions, setDivisions] = useState<TDivision[]>([]);
  const [districts, setDistricts] = useState<TDistrict[]>([]);
  const [upazilas, setUpazilas] = useState<TUpazila[]>([]);
  const [unions, setUnions] = useState<TUnion[]>([]);

  const [selectedDivision, setSelectedDivision] = useState<TDivision | null>(null);
  const [selectedDistrict, setSelectedDistrict] = useState<TDistrict | null>(null);
  const [selectedUpazila, setSelectedUpazila] = useState<TUpazila | null>(null);
  const [selectedUnion, setSelectedUnion] = useState<TUnion | null>(null);

  const BASE_API_URL = import.meta.env.VITE_BASE_API_URL;

  useEffect(() => {
    // Fetch divisions
    fetch(`${BASE_API_URL}/global/divisions`)
      .then((res) => res.json())
      .then((data: { data: TDivision[] }) => {
        const divisionList = data.data;
        setDivisions(divisionList);
        if (user?.division_name) {
          const found = divisionList.find((d) => d.name === user.division_name);
          if (found) {
            setSelectedDivision(found);
            localStorage.setItem("selectedDivision", JSON.stringify(found)); // Save to localStorage
          }
        }
      });
  }, [user]);

  useEffect(() => {
    if (selectedDivision) {
      fetch(`${BASE_API_URL}/global/districts/${selectedDivision.id}`)
        .then((res) => res.json())
        .then((data: { data: TDistrict[] }) => {
          const filtered = data.data;
          console.log("Districts:", filtered);
          setDistricts(filtered);
          if (user?.district_name) {
            const found = filtered.find((d) => d.name === user.district_name);
            if (found) {
              setSelectedDistrict(found);
              localStorage.setItem("selectedDistrict", JSON.stringify(found)); // Save to localStorage
            }
          }
        });
    }
  }, [selectedDivision, user]);

  useEffect(() => {
    if (selectedDistrict) {
      fetch(`${BASE_API_URL}/global/upazilas/${selectedDistrict.id}`)
        .then((res) => res.json())
        .then((data: { data: TUpazila[] }) => {
          const filtered = data.data;
          setUpazilas(filtered);
          if (user?.upazila_name) {
            const found = filtered.find((u) => u.name === user.upazila_name);
            if (found) {
              setSelectedUpazila(found);
              localStorage.setItem("selectedUpazila", JSON.stringify(found)); // Save to localStorage
            }
          }
        });
    }
  }, [selectedDistrict, user]);

  useEffect(() => {
    if (selectedUpazila) {
      fetch(`${BASE_API_URL}/global/unions/${selectedUpazila.id}`)
        .then((res) => res.json())
        .then((data: { data: TUnion[] }) => {
          const filtered = data.data;
          setUnions(filtered);
        });
    }
  }, [selectedUpazila]);

  const handleDivisionChange = (e: ChangeEvent<HTMLSelectElement>) => {
    console.log("Division changed:", e.target.value);
    const division = divisions.find((d) => d.id === e.target.value);

    setSelectedDivision(division || null);
    setSelectedDistrict(null);
    setSelectedUpazila(null);
    setSelectedUnion(null);
    onUnionChange(null);

    // Clear any previous localStorage values
    localStorage.removeItem("selectedDistrict");
    localStorage.removeItem("selectedUpazila");
    localStorage.removeItem("selectedUnion");
  };

  const handleDistrictChange = (e: ChangeEvent<HTMLSelectElement>) => {


    const district = districts.find((d) => d.id == e.target.value);
    setSelectedDistrict(district || null);
    setSelectedUpazila(null);
    setSelectedUnion(null);
    onUnionChange(null);

    // Clear upazila and union in localStorage
    localStorage.removeItem("selectedUpazila");
    localStorage.removeItem("selectedUnion");
  };

  const handleUpazilaChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const upazila = upazilas.find((u) => u.id == e.target.value);
    setSelectedUpazila(upazila || null);
    setSelectedUnion(null);
    onUnionChange(null);

    // Clear union in localStorage
    localStorage.removeItem("selectedUnion");
  };

  const handleUnionChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const union = unions.find((u) => u.id == e.target.value);
    setSelectedUnion(union || null);
    onUnionChange(union || null);
  };

  return (
<div className="card shadow-sm mb-4">
  <div className="card-header bg-primary text-white">
    <h5 className="mb-0">ঠিকানা নির্বাচন করুন</h5>
  </div>
  <div className="card-body">
    <div className="row g-3">
      <div className="col-md-3">
        <label className="form-label fw-semibold">বিভাগ</label>
        <select
          className="form-select"
          value={selectedDivision?.id || ""}
          disabled={!!user?.division_name}
          onChange={handleDivisionChange}
        >
          <option value="">নির্বাচন করুন</option>
          {divisions.map((d) => (
            <option key={d.id} value={d.id}>
              {d.bn_name}
            </option>
          ))}
        </select>
      </div>
      <div className="col-md-3">
        <label className="form-label fw-semibold">জেলা</label>
        <select
          className="form-select"
          value={selectedDistrict?.id || ""}
          disabled={!!user?.district_name}
          onChange={handleDistrictChange}
        >
          <option value="">নির্বাচন করুন</option>
          {districts.map((d) => (
            <option key={d.id} value={d.id}>
              {d.bn_name}
            </option>
          ))}
        </select>
      </div>
      <div className="col-md-3">
        <label className="form-label fw-semibold">উপজেলা</label>
        <select
          className="form-select"
          value={selectedUpazila?.id || ""}
          disabled={!!user?.upazila_name}
          onChange={handleUpazilaChange}
        >
          <option value="">নির্বাচন করুন</option>
          {upazilas.map((u) => (
            <option key={u.id} value={u.id}>
              {u.bn_name}
            </option>
          ))}
        </select>
      </div>
      <div className="col-md-3">
        <label className="form-label fw-semibold">ইউনিয়ন</label>
        <select
          className="form-select"
          value={selectedUnion?.id || ""}
          onChange={handleUnionChange}
        >
          <option value="">নির্বাচন করুন</option>
          {unions.map((u) => (
            <option key={u.id} value={u.id}>
              {u.bn_name}
            </option>
          ))}
        </select>
      </div>
    </div>
  </div>
</div>

  );
};

export default AddressSelectorUnion;
