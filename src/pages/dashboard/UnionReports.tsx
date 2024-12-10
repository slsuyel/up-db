/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from 'react';
import Breadcrumbs from '@/components/reusable/Breadcrumbs';
import { useAppSelector } from '@/redux/features/hooks';
import { RootState } from '@/redux/features/store';


const UnionReports = () => {
  const unionInfo = useAppSelector((state: RootState) => state.union.unionInfo);
  const sonodInfo = useAppSelector((state: RootState) => state.union.sonodList);
  const [formData, setFormData] = useState({
    sonod: '',
    paymentType: '',
    fromDate: '',
    toDate: '',
  });


  const handleInputChange = (event: { target: { id: any; value: any } }) => {
    const { id, value } = event.target;
    setFormData({ ...formData, [id]: value });
  };

  const handleSubmit = (event: { preventDefault: () => void }) => {
    event.preventDefault();
    console.log('ফর্ম ডেটা:', formData);
    const url = `https://api.uniontax.gov.bd/payment/report/download?union=${unionInfo?.short_name_e}&from=${formData.fromDate}&to=${formData.toDate}&sonod_type=${formData.sonod}`;
    window.open(url, '_blank');
  };

  return (
    <div>
      <Breadcrumbs current="প্রতিবেদন" />

      <form onSubmit={handleSubmit}>
        <div
          className="row"
          style={{ alignItems: 'center', justifyContent: 'center' }}
        >
          <div className="form-group col-md-3 my-1">
            <select
              id="sonod"
              required
              className="form-control"
              onChange={handleInputChange}
              value={formData.sonod}
            >


              <option value="">চিহ্নিত করুন</option>
              <option value="all">সকল</option>
              <option value="holdingtax">হোল্ডিং ট্যাক্স</option>
              {sonodInfo.map((d) => <option value={d.bnname}>{d.bnname}</option>)}

            </select>
          </div>
          <div className="form-group col-md-3 my-1">
            <select
              id="paymentType"
              required
              className="form-control"
              onChange={handleInputChange}
              value={formData.paymentType}
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
              value={formData.fromDate}
            />
          </div>
          <div className="form-group col-md-1 text-center my-2 fs-5">থেকে</div>
          <div className="form-group col-md-2">
            <input
              type="date"
              id="toDate"
              className="form-control"
              onChange={handleInputChange}
              value={formData.toDate}
            />
          </div>
          <div className="form-group col-md-3 my-1">
            <button
              type="submit"
              className="btn_main mt-3"
              style={{ fontSize: '22px', marginLeft: '10px' }}
            >
              খুজুন
            </button>
          </div>
        </div>
      </form>


    </div>
  );
};

export default UnionReports;
