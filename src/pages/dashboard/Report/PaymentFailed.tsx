/* eslint-disable @typescript-eslint/no-explicit-any */
import { useAppSelector } from "@/redux/features/hooks";
import {
  useCallipnMutation,
  useCheckPaymentMutation,
  useFailedPaymentQuery,
} from "@/redux/features/payment/paymentApi";
import { RootState } from "@/redux/features/store";
import {
  TDistrict,
  TDivision,
  TPaymentFailed,
  TUnion,
  TUpazila,
} from "@/types";
import { Button, Modal } from "antd";
import { ChangeEvent, useEffect, useState } from "react";
import { Spinner } from "react-bootstrap";

const PaymentFailed = () => {
  const [callIpn, { isLoading: chckingIpn }] = useCallipnMutation();
  const [paymentData, setPaymentData] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loadingTrxId, setLoadingTrxId] = useState<string | null>(null);
  const sonodInfo = useAppSelector((state: RootState) => state.union.sonodList);
  const [checkPayment] = useCheckPaymentMutation();
  const [selectedService, setSelectedService] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const token = localStorage.getItem(`token`);
  const user = useAppSelector((state: RootState) => state.user.user);

  const [selectedDivision, setSelectedDivision] = useState<string>("");
  const [selectedDistrict, setSelectedDistrict] = useState<string>("");
  const [selectedUpazila, setSelectedUpazila] = useState<string>("");
  const [selectedUnion, setSelectedUnion] = useState<string>("");

  const [divisions, setDivisions] = useState<TDivision[]>([]);
  const [districts, setDistricts] = useState<TDistrict[]>([]);
  const [upazilas, setUpazilas] = useState<TUpazila[]>([]);
  const [unions, setUnions] = useState<TUnion[]>([]);

  const [triggerSearch, setTriggerSearch] = useState(false);
  const { data, isLoading, isFetching, refetch } = useFailedPaymentQuery(
    triggerSearch
      ? {
          token,
          sonod_type: selectedService,
          date: selectedDate,
          union: selectedUnion, // Send union name as parameter
        }
      : null
  );

  // Fetch divisions
  useEffect(() => {
    fetch("/divisions.json")
      .then((res) => res.json())
      .then((data: TDivision[]) => {
        setDivisions(data);
        if (user?.division_name) {
          const userDivision = data.find((d) => d.name === user.division_name);
          if (userDivision) {
            setSelectedDivision(userDivision.id);
          }
        }
      })
      .catch((error) => console.error("Error fetching divisions:", error));
  }, [user]);

  // Fetch districts based on selected division
  useEffect(() => {
    if (selectedDivision) {
      fetch("/districts.json")
        .then((res) => res.json())
        .then((data: TDistrict[]) => {
          const filteredDistricts = data.filter(
            (d) => d.division_id === selectedDivision
          );
          setDistricts(filteredDistricts);
          if (user?.district_name) {
            const userDistrict = filteredDistricts.find(
              (d) => d.name === user.district_name
            );
            if (userDistrict) {
              setSelectedDistrict(userDistrict.id);
            }
          }
        })
        .catch((error) => console.error("Error fetching districts:", error));
    } else {
      setDistricts([]);
      setSelectedDistrict("");
      setSelectedUpazila("");
      setSelectedUnion("");
    }
  }, [selectedDivision, user]);

  // Fetch upazilas based on selected district
  useEffect(() => {
    if (selectedDistrict) {
      fetch("/upazilas.json")
        .then((res) => res.json())
        .then((data: TUpazila[]) => {
          const filteredUpazilas = data.filter(
            (u) => u.district_id === selectedDistrict
          );
          setUpazilas(filteredUpazilas);
          if (user?.upazila_name) {
            const userUpazila = filteredUpazilas.find(
              (u) => u.name === user.upazila_name
            );
            if (userUpazila) {
              setSelectedUpazila(userUpazila.id);
            }
          }
        })
        .catch((error) => console.error("Error fetching upazilas:", error));
    } else {
      setUpazilas([]);
      setSelectedUpazila("");
      setSelectedUnion("");
    }
  }, [selectedDistrict, user]);

  // Fetch unions based on selected upazila
  useEffect(() => {
    if (selectedUpazila) {
      fetch("/unions.json")
        .then((res) => res.json())
        .then((data: TUnion[]) => {
          const filteredUnions = data.filter(
            (u) => u.upazilla_id === selectedUpazila
          );
          setUnions(filteredUnions);
        })
        .catch((error) => console.error("Error fetching unions:", error));
    } else {
      setUnions([]);
      setSelectedUnion("");
    }
  }, [selectedUpazila]);

  const handleChange = (e: ChangeEvent<HTMLSelectElement>) => {
    setSelectedService(e.target.value);
  };

  const handleSearch = () => {
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
    <div className="card p-3 border-0">
      <div className=" mt-5">
        <h4>পেমেন্ট ফেইল্ড তালিকাঃ</h4>
        <div className="row ">
          <div className="form-group col-md-3 my-1">
            <select
              className="form-control"
              value={selectedDivision}
              disabled={!!user?.division_name}
              onChange={(e) => setSelectedDivision(e.target.value)}
            >
              <option value="">বিভাগ নির্বাচন করুন</option>
              {divisions.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.bn_name}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group col-md-3 my-1">
            <select
              className="form-control"
              value={selectedDistrict}
              disabled={!!user?.district_name}
              onChange={(e) => setSelectedDistrict(e.target.value)}
            >
              <option value="">জেলা নির্বাচন করুন</option>
              {districts.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.bn_name}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group col-md-3 my-1">
            <select
              className="form-control"
              value={selectedUpazila}
              disabled={!!user?.upazila_name}
              onChange={(e) => setSelectedUpazila(e.target.value)}
            >
              <option value="">উপজেলা নির্বাচন করুন</option>
              {upazilas.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.bn_name}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group col-md-3 my-1">
            <select
              className="form-control"
              value={selectedUnion}
              onChange={(e) => setSelectedUnion(e.target.value)}
              disabled={!selectedUpazila}
            >
              <option value="">ইউনিয়ন নির্বাচন করুন</option>
              {unions.map((u) => (
                <option key={u.id} value={u.name}>
                  {u.bn_name}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group col-md-3 my-1">
            <select
              id="sonod"
              required
              className="form-control"
              onChange={handleChange}
              value={selectedService}
            >
              <option value="">চিহ্নিত করুন</option>
              <option value="all">সকল</option>
              <option value="holdingtax">হোল্ডিং ট্যাক্স</option>
              {sonodInfo.map((d) => (
                <option key={d.id} value={d.bnname}>
                  {d.bnname}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group col-md-3 my-1">
            <input
              className="form-control"
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
            />
          </div>
          <div className="form-group col-md-3 my-1">
            <button
              className="btn_main"
              onClick={handleSearch}
              disabled={!selectedDate || !selectedService || !selectedUnion}
            >
              অনুসন্ধান
            </button>
          </div>
        </div>
      </div>

      <div className="my-4">
        <h2>পেমেন্ট ফেইল্ড রেকর্ড</h2>
        <div className="table-responsive d-none d-md-block">
          <table className="table table-bordered table-hover">
            <thead className="thead-dark">
              <tr>
                <th>আইডি</th>
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
                  <td colSpan={14} className="text-center">
                    <Spinner />
                  </td>
                </tr>
              ) : failedResult?.length > 0 ? (
                failedResult.map((item) => (
                  <tr key={item.id}>
                    <td>{item.id}</td>
                    <td>{item.sonodId}</td>
                    <td>{item.union}</td>
                    <td>{item.trxId}</td>
                    <td>{item.sonod_type}</td>
                    <td>{item.date}</td>
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
                        {" "}
                        চেক পেমেন্ট
                      </Button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={14} className="text-center">
                    কোন রেকর্ড পাওয়া যায়নি।
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {/* Card View for Mobile */}
        <div className="card-view d-block d-md-none">
          {isLoading || isFetching ? (
            <div className="text-center">
              <Spinner />
            </div>
          ) : failedResult?.length > 0 ? (
            failedResult.map((item) => (
              <div key={item.id} className="card mb-3">
                <div className="card-body">
                  <p>
                    <strong>আইডি:</strong> {item.id}
                  </p>
                  <p>
                    <strong>সনদ আইডি:</strong> {item.sonodId}
                  </p>
                  <p>
                    <strong>ইউনিয়ন:</strong> {item.union}
                  </p>
                  <p>
                    <strong>লেনদেন আইডি:</strong> {item.trxId}
                  </p>
                  <p>
                    <strong>সনদ প্রকার:</strong> {item.sonod_type}
                  </p>
                  <p>
                    <strong>তারিখ:</strong> {item.date}
                  </p>
                  <p>
                    <strong>পদ্ধতি:</strong> {item.method}
                  </p>
                  {item?.holding_tax ? (
                    <>
                      <p>
                        <strong>মালিকের নাম:</strong>{" "}
                        {item.holding_tax.maliker_name}
                      </p>
                      <p>
                        <strong>গ্রাম:</strong> {item.holding_tax.gramer_name}
                      </p>
                      <p>
                        <strong>মোবাইল নম্বর:</strong>{" "}
                        {item.holding_tax.mobile_no}
                      </p>
                      <p>
                        <strong>হোল্ডিং নম্বর:</strong>{" "}
                        {item.holding_tax.holding_no}
                      </p>
                    </>
                  ) : (
                    <>
                      <p>
                        <strong>মালিকের নাম:</strong>{" "}
                        {item.sonods?.applicant_name}
                      </p>
                      <p>
                        <strong>গ্রাম:</strong>{" "}
                        {item.sonods?.applicant_present_village}
                      </p>
                      <p>
                        <strong>মোবাইল নম্বর:</strong>{" "}
                        {item.sonods?.applicant_mobile}
                      </p>
                      <p>
                        <strong>হোল্ডিং নম্বর:</strong>{" "}
                        {item.sonods?.applicant_holding_tax_number}
                      </p>
                    </>
                  )}

                  <td>
                    <Button
                      disabled={loadingTrxId !== null}
                      loading={loadingTrxId === item.trxId}
                      onClick={() => handleCheckPayment(item.trxId)}
                      className="btn btn-sm btn-primary"
                    >
                      {" "}
                      চেক পেমেন্ট
                    </Button>
                  </td>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center">কোন রেকর্ড পাওয়া যায়নি।</div>
          )}
        </div>
      </div>

      <Modal
        // loading={}
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
