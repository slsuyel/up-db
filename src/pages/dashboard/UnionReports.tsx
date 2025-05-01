import { useState } from "react";
import { message } from "antd";
import Breadcrumbs from "@/components/reusable/Breadcrumbs";

import useAllServices from "@/hooks/useAllServices";
import UnionLocationSelector from "@/components/reusable/AddressSelectorUnion";
import { TUnion } from "@/types/global";

const UnionReports = () => {
  const token = localStorage.getItem(`token`);
  const services = useAllServices();
  const [selectedUnion, setSelectedUnion] = useState<TUnion | null>(null);

  const [formData, setFormData] = useState({
    sonod: "",
    paymentType: "",
    fromDate: "",
    toDate: "",
  });

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { id, value } = event.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!selectedUnion) {
      message.warning("ইউনিয়ন বাছাই করুন!");
      return;
    }

    const smallUnion = `${selectedUnion.name}`.replace(/\s+/g, "").toLowerCase();
    const url = `https://api.uniontax.gov.bd/payment/report/download?union=${smallUnion}&from=${formData.fromDate}&to=${formData.toDate}&sonod_type=${formData.sonod}&payment_type=${formData.paymentType}&token=${token}`;
    window.open(url, "_blank");
  };

  return (
    <div className="container bg-white p-4 rounded shadow-sm">
      <Breadcrumbs current="লেনদেনের প্রতিবেদন" />
      <h4 className="mb-4 border-bottom pb-2 text-primary">ইউনিয়নের লেনদেন প্রতিবেদন</h4>

      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <UnionLocationSelector onUnionChange={setSelectedUnion} />
        </div>

        <div className="row g-3 align-items-end">
          <div className="col-md-3">
            <label htmlFor="sonod" className="form-label fw-bold">সেবা নির্বাচন করুন</label>
            <select
              required
              id="sonod"
              className="form-select"
              value={formData.sonod}
              onChange={handleInputChange}
            >
              <option value="">সেবা নির্বাচন করুন</option>
              <option value="all">সকল</option>
              <option value="holdingtax">হোল্ডিং ট্যাক্স</option>
              {services.map((s) => (
                <option key={s.title} value={s.title}>
                  {s.title}
                </option>
              ))}
            </select>
          </div>

          <div className="col-md-3">
            <label htmlFor="paymentType" className="form-label fw-bold">পেমেন্ট টাইপ</label>
            <select
              required
              id="paymentType"
              className="form-select"
              value={formData.paymentType}
              onChange={handleInputChange}
            >
              <option value="">পেমেন্ট টাইপ</option>
              <option value="all">সকল পেমেন্ট</option>
              <option value="manual">ম্যানুয়াল পেমেন্ট</option>
              <option value="online">অনলাইন পেমেন্ট</option>
            </select>
          </div>

          <div className="col-md-2">
            <label htmlFor="fromDate" className="form-label fw-bold">শুরুর তারিখ</label>
            <input
              type="date"
              id="fromDate"
              className="form-control"
              value={formData.fromDate}
              onChange={handleInputChange}
            />
          </div>

          <div className="col-md-2">
            <label htmlFor="toDate" className="form-label fw-bold">শেষ তারিখ</label>
            <input
              type="date"
              id="toDate"
              className="form-control"
              value={formData.toDate}
              onChange={handleInputChange}
            />
          </div>

          <div className="col-md-2 d-grid">
            <button type="submit" className="btn btn-primary btn-lg">
              প্রতিবেদন দেখুন
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default UnionReports;
