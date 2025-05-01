/* eslint-disable @typescript-eslint/no-explicit-any */
import Breadcrumbs from "@/components/reusable/Breadcrumbs";
import useAllServices from "@/hooks/useAllServices";

import {
  useCallipnMutation,
  useCheckPaymentMutation,
  useFailedPaymentQuery,
} from "@/redux/features/payment/paymentApi";
import { TPaymentFailed } from "@/types";
import { Button, Modal } from "antd";
import { ChangeEvent, useState } from "react";
import { Spinner } from "react-bootstrap";
import AddressSelectorUnion from '@/components/reusable/AddressSelectorUnion';
import './PaymentFailed.css';  // Custom CSS file for additional styling

const PaymentFailed = () => {
  const services = useAllServices();
  const [callIpn, { isLoading: chckingIpn }] = useCallipnMutation();
  const [paymentData, setPaymentData] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loadingTrxId, setLoadingTrxId] = useState<string | null>(null);
  const [checkPayment] = useCheckPaymentMutation();
  const [selectedService, setSelectedService] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const token = localStorage.getItem(`token`);

  const [selectedUnion, setSelectedUnion] = useState<string>("");
  const [triggerSearch, setTriggerSearch] = useState(false);

  const { data, isLoading, isFetching, refetch } = useFailedPaymentQuery(
    triggerSearch
      ? {
          token,
          sonod_type: selectedService,
          date: selectedDate,
          union: selectedUnion.replace(/\s+/g, "").toLowerCase(),
        }
      : null
  );

  const handleChange = (e: ChangeEvent<HTMLSelectElement>) => {
    setSelectedService(e.target.value);
  };

  const handleSearch = () => {
    console.log("Selected Union:", selectedUnion);
    setTriggerSearch(true);
    refetch();
  };

  const failedResult: TPaymentFailed[] = data?.data;

  const handleCheckPayment = async (trx: string) => {
    setLoadingTrxId(trx);
    try {
      const res = await checkPayment({ trnx_id: trx }).unwrap();
      console.log(res.data.akpay);
      setPaymentData(res.data.akpay);
      setIsModalOpen(true);
    } catch (error) {
      console.error("Error checking payment:", error);
    } finally {
      setLoadingTrxId(null);
    }
  };

  const handleRecallCheckPayment = async () => {
    const res = await callIpn({ data: paymentData }).unwrap();
    if (res.status_code == 200) {
      refetch();
      setIsModalOpen(false);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  return (
    <div className="container bg-light p-4 rounded shadow-sm">
      <Breadcrumbs current="পেমেন্ট ফেইল্ড তালিকাঃ" />
      <div className="row mb-4">
        <div className="col-md-12 mb-3">
          <AddressSelectorUnion 
            onUnionChange={(union) => setSelectedUnion(union ? union.name : "")}
          />
        </div>
        <div className="col-md-3 mb-3">
          <select
            id="sonod"
            className="form-control custom-select"
            onChange={handleChange}
            value={selectedService}
          >
            <option value="">চিহ্নিত করুন</option>
            <option value="all">সকল</option>
            <option value="holdingtax">হোল্ডিং ট্যাক্স</option>
            {services.map((d) => (
              <option key={d.title} value={d.title}>
                {d.title}
              </option>
            ))}
          </select>
        </div>
        <div className="col-md-3 mb-3">
          <input
            className="form-control custom-input"
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
          />
        </div>
        <div className="col-md-3 mb-3">
          <Button
            type="primary"
            className="w-100"
            onClick={handleSearch}
            disabled={!selectedDate || !selectedService || !selectedUnion}
          >
            অনুসন্ধান
          </Button>
        </div>
      </div>

      <div className="my-4">
        <h2>পেমেন্ট ফেইল্ড রেকর্ড</h2>
        <div className="table-responsive">
          <table className="table table-striped table-bordered">
            <thead>
              <tr>
                <th>সনদ আইডি</th>
                <th>ইউনিয়ন</th>
                <th>লেনদেন আইডি</th>
                <th>সনদ প্রকার</th>
                <th>তারিখ</th>
                <th>পদ্ধতি</th>
                <th>মালিকের নাম</th>
                <th>গ্রাম</th>
                <th>মোবাইল নম্বর</th>
                <th>হোল্ডিং নম্বর</th>
                <th>অ্যাকশন</th>
              </tr>
            </thead>
            <tbody>
              {isLoading || isFetching ? (
                <tr>
                  <td colSpan={11} className="text-center">
                    <Spinner />
                  </td>
                </tr>
              ) : failedResult?.length > 0 ? (
                failedResult.map((item) => (
                  <tr key={item.id}>
                    <td>{item.sonodId}</td>
                    <td>{item.union}</td>
                    <td>{item.trxId}</td>
                    <td>{item.sonod_type}</td>
                    <td>{new Date(item?.date).toLocaleString()}</td>
                    <td>{item.method}</td>
                    {item?.holding_tax ? (
                      <>
                        <td>{item?.holding_tax?.maliker_name}</td>
                        <td>{item?.holding_tax?.gramer_name}</td>
                        <td>{item?.holding_tax?.mobile_no}</td>
                        <td>{item?.holding_tax?.holding_no}</td>
                      </>
                    ) : (
                      <>
                        <td>{item.sonods?.applicant_name}</td>
                        <td>{item.sonods?.applicant_present_village}</td>
                        <td>{item.sonods?.applicant_mobile}</td>
                        <td>{item.sonods?.applicant_holding_tax_number}</td>
                      </>
                    )}
                    <td>
                      <Button
                        disabled={loadingTrxId !== null}
                        loading={loadingTrxId === item.trxId}
                        onClick={() => handleCheckPayment(item.trxId)}
                        className="btn btn-sm btn-primary"
                      >
                        চেক পেমেন্ট
                      </Button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={11} className="text-center">
                    কোন রেকর্ড পাওয়া যায়নি।
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal
        title="পেমেন্ট বিস্তারিত"
        open={isModalOpen}
        onOk={handleCloseModal}
        onCancel={handleCloseModal}
        footer={[
          <Button key="close" type="primary" onClick={handleCloseModal}>
            বন্ধ
          </Button>,
        ]}
      >
        <div>
          {paymentData?.msg_det}
          <div className=" mt-3">
            {paymentData?.msg_code == "1020" && (
              <Button
                loading={chckingIpn}
                type="primary"
                key="recall"
                onClick={handleRecallCheckPayment}
              >
                পেমেন্ট পুনরায় চেক করুন
              </Button>
            )}
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default PaymentFailed;
