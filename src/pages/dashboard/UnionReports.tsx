/* eslint-disable @typescript-eslint/no-explicit-any */
import { ChangeEvent, useEffect, useState } from 'react';
import Breadcrumbs from '@/components/reusable/Breadcrumbs';
import { useAppSelector } from '@/redux/features/hooks';
import { RootState } from '@/redux/features/store';
import { TDivision } from '@/types/global';
import { TDistrict, TUpazila } from '@/types/global';
import { TUnion } from '@/types/global';
import { message } from 'antd';
import useAllServices from '@/hooks/useAllServices';

const UnionReports = () => {
  const user = useAppSelector((state: RootState) => state.user.user);
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

  const services = useAllServices();
  const [formData, setFormData] = useState({
    sonod: '',
    paymentType: '',
    fromDate: '',
    toDate: '',
  });

  useEffect(() => {
    fetch('/divisions.json')
      .then(res => res.json())
      .then((data: TDivision[]) => {
        setDivisions(data);
        if (user?.division_name) {
          const userDivision = data.find(d => d?.name === user.division_name);
          if (userDivision) {
            setSelectedDivision(userDivision);
          }
        }
      })
      .catch(error => console.error('Error fetching divisions data:', error));
  }, [user]);

  useEffect(() => {
    if (selectedDivision) {
      fetch('/districts.json')
        .then(response => response.json())
        .then((data: TDistrict[]) => {
          const filteredDistricts = data.filter(
            d => d?.division_id === selectedDivision.id
          );
          setDistricts(filteredDistricts);
          if (user?.district_name) {
            const userDistrict = filteredDistricts.find(
              d => d?.name === user.district_name
            );
            if (userDistrict) {
              setSelectedDistrict(userDistrict);
            }
          }
        })
        .catch(error => console.error('Error fetching districts data:', error));
    }
  }, [selectedDivision, user]);

  useEffect(() => {
    if (selectedDistrict) {
      fetch('/upazilas.json')
        .then(response => response.json())
        .then((data: TUpazila[]) => {
          const filteredUpazilas = data.filter(
            upazila => upazila.district_id === selectedDistrict.id
          );
          setUpazilas(filteredUpazilas);
          if (user?.upazila_name) {
            const userUpazila = filteredUpazilas.find(
              u => u?.name === user.upazila_name
            );
            if (userUpazila) {
              setSelectedUpazila(userUpazila);
            }
          }
        })
        .catch(error => console.error('Error fetching upazilas data:', error));
    }
  }, [selectedDistrict, user]);

  useEffect(() => {
    if (selectedUpazila) {
      fetch('/unions.json')
        .then(response => response.json())
        .then((data: TUnion[]) => {
          const filteredUnions = data.filter(
            union => union.upazilla_id === selectedUpazila.id
          );
          setUnions(filteredUnions);
        })
        .catch(error => console.error('Error fetching unions data:', error));
    }
  }, [selectedUpazila]);

  const handleDivisionChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const division = divisions.find(d => d?.id === event.target.value);
    setSelectedDivision(division || null);
    setSelectedDistrict(null);
    setSelectedUpazila(null);
  };

  const handleDistrictChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const district = districts.find(d => d?.id === event.target.value);
    setSelectedDistrict(district || null);
    setSelectedUpazila(null);
  };

  const handleUpazilaChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const upazila = upazilas.find(u => u?.id === event.target.value);
    setSelectedUpazila(upazila || null);
  };

  const handleUnionChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const union = unions.find(u => u?.id === event.target.value);
    setSelectedUnion(union || null);
  };

  const handleInputChange = (event: { target: { id: any; value: any } }) => {
    const { id, value } = event.target;
    setFormData({ ...formData, [id]: value });
  };

  const smallUnion = `${selectedUnion?.name}`.replace(/\s+/g, '').toLowerCase();

  const handleSubmit = (event: { preventDefault: () => void }) => {
    event.preventDefault();
    if (!selectedUnion) {
      message.warning(' ইউনিয়ন বাছাই করুন!');
      return;
    }

    const url = `https://api.uniontax.gov.bd/payment/report/download?union=${smallUnion}&from=${formData?.fromDate}&to=${formData?.toDate}&sonod_type=${formData?.sonod}`;
    window.open(url, '_blank');
  };

  console.log(services);

  return (
    <div>
      <Breadcrumbs current="লেনদেনের প্রতিবেদন" />

      <form onSubmit={handleSubmit}>
        <div className="row mx-auto mb-4">
          <div className="col-md-3">
            <label htmlFor="division">বিভাগ নির্বাচন করুন</label>
            <select
              required
              id="division"
              className="form-control"
              disabled={!!user?.division_name}
              value={selectedDivision?.id || ''}
              onChange={handleDivisionChange}
            >
              <option value="">বিভাগ নির্বাচন করুন</option>
              {divisions?.map(d => (
                <option key={d?.id} value={d?.id}>
                  {d?.bn_name}
                </option>
              ))}
            </select>
          </div>

          <div className="col-md-3">
            <label htmlFor="district">জেলা নির্বাচন করুন</label>
            <select
              required
              id="district"
              className="form-control"
              disabled={!!user?.district_name}
              value={selectedDistrict?.id || ''}
              onChange={handleDistrictChange}
            >
              <option value="">জেলা নির্বাচন করুন</option>
              {districts?.map(d => (
                <option key={d?.id} value={d?.id}>
                  {d?.bn_name}
                </option>
              ))}
            </select>
          </div>

          <div className="col-md-3">
            <label htmlFor="upazila">উপজেলা নির্বাচন করুন</label>
            <select
              required
              id="upazila"
              className="form-control"
              value={selectedUpazila?.id || ''}
              disabled={!!user?.upazila_name}
              onChange={handleUpazilaChange}
            >
              <option value="">উপজেলা নির্বাচন করুন</option>
              {upazilas?.map(u => (
                <option key={u?.id} value={u?.id}>
                  {u?.bn_name}
                </option>
              ))}
            </select>
          </div>

          <div className="col-md-3">
            <label htmlFor="union">ইউনিয়ন নির্বাচন করুন</label>
            <select
              required
              id="union"
              className="form-control"
              value={selectedUnion?.id || ''}
              onChange={handleUnionChange}
            >
              <option value="">ইউনিয়ন নির্বাচন করুন</option>
              {unions?.map(u => (
                <option key={u?.id} value={u?.id}>
                  {u?.bn_name}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div
          className="row mx-auto"
          style={{ alignItems: 'center', justifyContent: 'center' }}
        >
          <div className="form-group col-md-3 my-1">
            <select
              required
              id="sonod"
              className="form-control"
              onChange={handleInputChange}
              value={formData?.sonod}
            >
              <option value="">সেবা নির্বাচন করুন</option>
              {services?.map(d => (
                <option key={d.title} value={d.title}>
                  {d.title}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group col-md-3 my-1">
            <select
              id="paymentType"
              required
              className="form-control"
              onChange={handleInputChange}
              value={formData?.paymentType}
            >
              <option value="">চিহ্নিত করুন</option>
              <option value="all">সকল পেমেন্ট</option>
              <option value="manual">ম্যানুয়াল পেমেন্ট</option>
              <option value="online">অনলাইন পেমেন্ট</option>
            </select>
          </div>
          <div className="form-group col-md-2">
            <input
              type="date"
              id="fromDate"
              className="form-control"
              onChange={handleInputChange}
              value={formData?.fromDate}
            />
          </div>
          <div className="form-group col-md-1 text-center my-2 fs-5">থেকে</div>
          <div className="form-group col-md-2">
            <input
              type="date"
              id="toDate"
              className="form-control"
              onChange={handleInputChange}
              value={formData?.toDate}
            />
          </div>
          <div className="form-group col-md-3 my-1">
            <button
              type="submit"
              className="btn_main mt-3 w-100"
              style={{ fontSize: '22px', marginLeft: '10px' }}
            >
              ডাউনলোড করুন
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default UnionReports;
