/* eslint-disable @typescript-eslint/no-explicit-any */
import Loader from "@/components/reusable/Loader";
import {
  useSingleSonodQuery,
  useSonodUpdateCancelMutation,
  useLazyGetSonodDetailsQuery,
} from "@/redux/api/sonod/sonodApi";
import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { Input, Select, Checkbox, Button, Modal, Card, message } from "antd";
import {
  EditOutlined,
  WarningOutlined,
  SaveOutlined,
  CheckCircleOutlined,
  CopyOutlined,
  InfoCircleOutlined,
  FileTextOutlined,
  UserOutlined,
  TeamOutlined,
  ReloadOutlined,
} from "@ant-design/icons";

const { Option } = Select;

interface AdminSonodEditProps {
  sonodId?: string;
  sonodName?: string;
}

const AdminSonodEdit = ({ sonodId, sonodName }: AdminSonodEditProps) => {
  const { id: paramId } = useParams();
  const id = sonodId || paramId;
  const token = localStorage.getItem("token");

  const { data, isLoading } = useSingleSonodQuery({ id, token, sonod_name: sonodName });
  const [sonodUpdateCancel, { isLoading: updating }] =
    useSonodUpdateCancelMutation();

  const [triggerGetDetails, { data: detailsData, isFetching: detailsFetching }] = useLazyGetSonodDetailsQuery();

  // State initialization
  const [basicData, setBasicData] = useState({
    orthoBchor: "",
    format: "",
    font_family: "",
    prottoyon: "",
    sec_prottoyon: "",
    organization_word_no: "",
  });
  const [prevSecProttoyon, setPrevSecProttoyon] = useState("");

  const [chairmanData, setChairmanData] = useState<{
    chaireman_name: string;
    isupdate_chaireman_name_from_unioninfo: boolean;
    chaireman_type: string;
    isupdate_chaireman_type_from_unioninfo: boolean;
    c_email: string;
    isupdate_c_email_from_unioninfo: boolean;
    chaireman_sign: string | File;
    isupdate_chaireman_sign_from_unioninfo: boolean;
  }>({
    chaireman_name: "",
    isupdate_chaireman_name_from_unioninfo: false,
    chaireman_type: "Chairman",
    isupdate_chaireman_type_from_unioninfo: false,
    c_email: "",
    isupdate_c_email_from_unioninfo: false,
    chaireman_sign: "",
    isupdate_chaireman_sign_from_unioninfo: false,
  });

  const [socibData, setSocibData] = useState<{
    socib_name: string;
    isupdate_socib_name_from_unioninfo: boolean;
    socib_signture: string | File;
    isupdate_socib_signture_from_unioninfo: boolean;
    socib_email: string;
    isupdate_socib_email_from_unioninfo: boolean;
  }>({
    socib_name: "নতুন সচিব",
    isupdate_socib_name_from_unioninfo: false,
    socib_signture: "",
    isupdate_socib_signture_from_unioninfo: false,
    socib_email: "",
    isupdate_socib_email_from_unioninfo: false,
  });
  useEffect(() => {
    if (data?.data) {
      const sonod = data.data;

      setBasicData({
        orthoBchor: sonod.orthoBchor || "2024-25",
        format: sonod.format || "1",
        font_family: sonod.font_family || "bangla",
        prottoyon: sonod.prottoyon || "",
        sec_prottoyon: sonod.sec_prottoyon || "",
        organization_word_no: sonod.organization_word_no || "",
      });

      setChairmanData({
        chaireman_name: sonod.chaireman_name || "",
        isupdate_chaireman_name_from_unioninfo:
          sonod.isupdate_chaireman_name_from_unioninfo ?? false,
        chaireman_type: sonod.chaireman_type || "Chairman",
        isupdate_chaireman_type_from_unioninfo:
          sonod.isupdate_chaireman_type_from_unioninfo ?? false,
        c_email: sonod.c_email || "",
        isupdate_c_email_from_unioninfo:
          sonod.isupdate_c_email_from_unioninfo ?? false,
        chaireman_sign: "",
        isupdate_chaireman_sign_from_unioninfo:
          sonod.isupdate_chaireman_sign_from_unioninfo ?? false,
      });

      setSocibData({
        socib_name: sonod.socib_name || "",
        isupdate_socib_name_from_unioninfo:
          sonod.isupdate_socib_name_from_unioninfo ?? false,
        socib_signture: "",
        isupdate_socib_signture_from_unioninfo:
          sonod.isupdate_socib_signture_from_unioninfo ?? false,
        socib_email: sonod.socib_email || "",
        isupdate_socib_email_from_unioninfo:
          sonod.isupdate_socib_email_from_unioninfo ?? false,
      });
    }
  }, [data]);

  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState("");

  /* ===============================
      Handlers
  =============================== */
  const handleUpdate = async (payload: any) => {
    try {
      // Filter payload to remove empty values
      const filteredPayload: any = {};
      Object.entries(payload).forEach(([key, value]) => {
        if (value !== null && value !== undefined && value !== "") {
          filteredPayload[key] = value;
        }
      });

      let finalPayload = filteredPayload;
      const hasFile = Object.values(filteredPayload).some(
        (val) => val instanceof File
      );

      if (hasFile) {
        const formData = new FormData();
        Object.entries(filteredPayload).forEach(([key, value]) => {
          formData.append(key, value as any);
        });
        finalPayload = formData;
      }

      const res = await sonodUpdateCancel({
        id,
        token,
        data: finalPayload,
      }).unwrap();
      if (!res.isError) {
        message.success("Updated Successfully");
      } else {
        message.error("Updated Failed");
      }
    } catch (err) {
      console.error(err);
      alert("Update Failed");
    }
  };

  const handleCancel = async () => {
    if (!cancelReason) return alert("Please provide a reason");
    try {
      const res = await sonodUpdateCancel({
        id,
        token,
        data: { stutus: "cancel", cancel_reason: cancelReason },
      }).unwrap();

      setCancelModalOpen(false);
      if (!res.isError) {
        message.success("Sonod Cancelled Successfully");
      } else {
        message.error("Cancel Failed");
      }
    } catch (err) {
      alert("Cancel Failed");
    }
  };

  const handleApprove = async () => {
    try {
      const res = await sonodUpdateCancel({
        id,
        token,
        data: { stutus: "approved" },
      }).unwrap();

      if (!res.isError) {
        message.success("Sonod Approved Successfully");
      } else {
        message.error("Approval Failed");
      }
    } catch (err) {
      alert("Approval Failed");
    }
  };

  if (isLoading) return <Loader />;

  return (
    <div className="">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="fw-bold text-primary mb-0">
          <EditOutlined /> অ্যাডমিন সনদ ব্যবস্থাপনা
        </h2>
        <div className="d-flex gap-2 align-items-center">
          <span className="badge bg-secondary">আইডি: {id}</span>
          {data?.data?.stutus && (
            <span className={`badge bg-${data.data.stutus === 'approved' ? 'success' : data.data.stutus === 'cancel' ? 'danger' : 'warning'}`}>
              {data.data.stutus.toUpperCase()}
            </span>
          )}
        </div>
      </div>

      <div className="row g-4">
        {/* ================= Basic Info Card ================= */}
        <div className="col-12">
          <Card title={<><InfoCircleOutlined className="text-info" /> মৌলিক তথ্য</>} className="shadow-sm border-start border-4 border-info">
            <div className="row g-3">
              <div className="col-md-4">
                <label className="form-label fw-semibold">অর্থবছর</label>
                <Select
                  className="w-100 "
                  style={{ height: 42 }}
                  value={basicData.orthoBchor}
                  placeholder="অর্থবছর নির্বাচন করুন"
                  onChange={(v) =>
                    setBasicData({ ...basicData, orthoBchor: v })
                  }
                >
                  {Array.from({ length: 30 }, (_, i) => {
                    const start = 2010 + i;
                    const end = (start + 1).toString().slice(-2);
                    return (
                      <Option key={start} value={`${start}-${end}`}>
                        {start}-{end}
                      </Option>
                    );
                  })}
                </Select>
              </div>

              <div className="col-md-4">
                <label className="form-label fw-semibold">ফরম্যাট</label>
                <Select
                  className="w-100 "
                  style={{ height: 42 }}
                  value={basicData.format}
                  onChange={(v) => setBasicData({ ...basicData, format: v })}
                >
                  <Option value="2">নতুন</Option>
                  <Option value="1">পুরাতন</Option>
                </Select>
              </div>
              <div className="col-md-4">
                <label className="form-label fw-semibold">ফন্ট ফ্যামিলি</label>
                <Select
                  className="w-100 "
                  style={{ height: 42 }}
                  value={basicData.font_family}
                  onChange={(v) =>
                    setBasicData({ ...basicData, font_family: v })
                  }
                >
                  <Option value="bangla">বাংলা</Option>
                  <Option value="noto_sans_bengali">noto_sans_bengali</Option>
                </Select>
              </div>


              <div className="col-md-4">
                <label className="form-label fw-semibold">ওয়ার্ড নং</label>
                <Input
                  className="form-control"
                  value={basicData.organization_word_no}
                  onChange={(e) =>
                    setBasicData({
                      ...basicData,
                      organization_word_no: e.target.value,
                    })
                  }
                />
              </div>
              <div className="col-12 text-end mt-3">
                <Button
                  size="large"
                  type="primary"
                  icon={<SaveOutlined />}
                  loading={updating}
                  onClick={() => handleUpdate(basicData)}
                >
                  মৌলিক তথ্য সংরক্ষণ করুন
                </Button>
              </div>
            </div>
          </Card>
        </div>

        {/* ================= Content & Details Card ================= */}
        <div className="col-12">
          <Card title={<><FileTextOutlined className="text-primary" /> সনদ কন্টেন্ট এবং বিস্তারিত</>} className="shadow-sm border-start border-4 border-primary">
            <div className="row g-3">
              <div className="col-md-6">
                <label className="form-label fw-semibold">প্রত্যয়ন</label>
                <Input.TextArea
                  className="w-100"
                  rows={6}
                  placeholder="Prottoyon write here..."
                  value={basicData.prottoyon}
                  onChange={(e) =>
                    setBasicData({ ...basicData, prottoyon: e.target.value })
                  }
                />
              </div>

              <div className="col-md-6">
                <div className="d-flex justify-content-between align-items-center mb-1">
                  <label className="form-label fw-semibold mb-0">
                    সনদ এর বিবরণ
                  </label>
                  <div>
                    <Button
                      type="link"
                      size="small"
                      className="p-0 me-2"
                      onClick={() => {
                        setPrevSecProttoyon(basicData.sec_prottoyon);
                        setBasicData({
                          ...basicData,
                          sec_prottoyon: basicData.prottoyon,
                        });
                      }}
                    >
                      প্রত্যয়ন থেকে কপি করুন
                    </Button>
                    {prevSecProttoyon && (
                      <Button
                        type="link"
                        size="small"
                        danger
                        onClick={() => {
                          setBasicData({
                            ...basicData,
                            sec_prottoyon: prevSecProttoyon,
                          });
                          setPrevSecProttoyon("");
                        }}
                      >
                        পূর্বাবস্থায়
                      </Button>
                    )}
                  </div>
                </div>
                <Input.TextArea
                  className="w-100"
                  rows={6}
                  placeholder="সনদ এর বিবরণ লিখুন..."
                  value={basicData.sec_prottoyon}
                  onChange={(e) =>
                    setBasicData({
                      ...basicData,
                      sec_prottoyon: e.target.value,
                    })
                  }
                />
              </div>



              <div className="col-12">
                <div className="p-3 border rounded bg-white">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <label className="form-label fw-bold mb-0 text-primary">API থেকে প্রাপ্ত বিবরণ</label>
                    <Button
                      size="middle"
                      onClick={() => triggerGetDetails({ id, token })}
                      loading={detailsFetching}
                      type="primary"
                      icon={<ReloadOutlined />}
                      className="fw-bold shadow-sm"
                    >
                      সনদ এর বিবরণ জেনারেট করুন
                    </Button>
                  </div>

                  {detailsData && (
                    <div>
                      <Input.TextArea
                        className="mb-2"
                        value={detailsData?.data?.data}
                        rows={3}
                        readOnly
                      />
                      <div className="d-flex gap-2">
                        <Button
                          className="flex-grow-1"
                          icon={<CopyOutlined />}
                          onClick={() => {
                            navigator.clipboard.writeText(detailsData?.data?.data);
                            message.success("Copied!");
                          }}
                        >
                          টেক্সট কপি করুন
                        </Button>
                        <Button
                          className="flex-grow-1"
                          type="primary"
                          danger
                          onClick={() => {
                            setPrevSecProttoyon(basicData.sec_prottoyon);
                            setBasicData({
                              ...basicData,
                              sec_prottoyon: detailsData?.data?.data
                            });
                            message.success("Replaced Sec Prottoyon!");
                          }}
                        >
                          সনদ এর বিবরণ রিপ্লেস করুন
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="col-12 text-end mt-2">
                <Button
                  size="large"
                  type="primary"
                  icon={<SaveOutlined />}
                  loading={updating}
                  className="px-5"
                  onClick={() => handleUpdate(basicData)}
                >
                  কন্টেন্ট আপডেট করুন
                </Button>
              </div>
            </div>
          </Card>
        </div>

        {/* ================= Chairman Card ================= */}
        <div className="col-md-6">
          <Card title={<><UserOutlined className="text-warning" /> চেয়ারম্যান বিস্তারিত</>} className="shadow-sm h-100 border-start border-4 border-warning">
            <div className="mb-3">
              <label className="form-label fw-semibold">চেয়ারম্যানের নাম</label>
              <Input
                value={chairmanData.chaireman_name}
                onChange={(e) =>
                  setChairmanData({
                    ...chairmanData,
                    chaireman_name: e.target.value,
                  })
                }
                className="mb-2 form-control"
              />
              <Checkbox
                checked={chairmanData.isupdate_chaireman_name_from_unioninfo}
                onChange={(e) =>
                  setChairmanData({
                    ...chairmanData,
                    isupdate_chaireman_name_from_unioninfo: e.target.checked,
                  })
                }
              >
                ইউনিয়ন তথ্য থেকে দিন
              </Checkbox>
            </div>
            <div className="mb-3">
              <label className="form-label fw-semibold">ধরন / পদবী</label>
              <Input
                className="form-control"
                value={chairmanData.chaireman_type}
                onChange={(e) =>
                  setChairmanData({
                    ...chairmanData,
                    chaireman_type: e.target.value,
                  })
                }
              />
              <Checkbox
                checked={chairmanData.isupdate_chaireman_type_from_unioninfo}
                onChange={(e) =>
                  setChairmanData({
                    ...chairmanData,
                    isupdate_chaireman_type_from_unioninfo: e.target.checked,
                  })
                }
              >
                ইউনিয়ন তথ্য থেকে দিন
              </Checkbox>
            </div>
            <div className="mb-3">
              <label className="form-label fw-semibold">ইমেল ঠিকানা</label>
              <Input
                className="form-control"
                value={chairmanData.c_email}
                onChange={(e) =>
                  setChairmanData({ ...chairmanData, c_email: e.target.value })
                }
              />
              <Checkbox
                checked={chairmanData.isupdate_c_email_from_unioninfo}
                onChange={(e) =>
                  setChairmanData({
                    ...chairmanData,
                    isupdate_c_email_from_unioninfo: e.target.checked,
                  })
                }
              >
                ইউনিয়ন তথ্য থেকে দিন
              </Checkbox>
            </div>
            <div className="mb-4">
              <label className="form-label fw-semibold">
                স্বাক্ষর (ফাইল বা URL)
              </label>
              <div className="mb-2">
                {/* File Input */}
                <input
                  type="file"
                  className="form-control mb-2"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setChairmanData({ ...chairmanData, chaireman_sign: file });
                    }
                  }}
                />

                {/* Preview */}
                <div className="mt-2">
                  {chairmanData.chaireman_sign instanceof File ? (
                    <img
                      src={URL.createObjectURL(chairmanData.chaireman_sign)}
                      alt="New Signature Preview"
                      style={{
                        height: 60,
                        border: "1px solid #ddd",
                        padding: 2,
                      }}
                    />
                  ) : (
                    data?.data?.chaireman_sign && (
                      <img
                        src={data.data.chaireman_sign}
                        alt="Current Signature"
                        style={{
                          height: 60,
                          border: "1px solid #ddd",
                          padding: 2,
                        }}
                      />
                    )
                  )}
                </div>
              </div>
              <Checkbox
                checked={chairmanData.isupdate_chaireman_sign_from_unioninfo}
                onChange={(e) =>
                  setChairmanData({
                    ...chairmanData,
                    isupdate_chaireman_sign_from_unioninfo: e.target.checked,
                  })
                }
              >
                ইউনিয়ন তথ্য থেকে দিন
              </Checkbox>
            </div>
            <Button
              size="large"
              type="primary"
              icon={<SaveOutlined />}
              loading={updating}
              onClick={() => handleUpdate(chairmanData)}
            >
              চেয়ারম্যান আপডেট করুন
            </Button>
          </Card>
        </div>

        {/* ================= Socib Card ================= */}
        <div className="col-md-6">
          <Card title={<><TeamOutlined className="text-success" /> সচিব বিস্তারিত</>} className="shadow-sm h-100 border-start border-4 border-success">
            <div className="mb-3">
              <label className="form-label fw-semibold">সচিবের নাম</label>
              <Input
                value={socibData.socib_name}
                onChange={(e) =>
                  setSocibData({ ...socibData, socib_name: e.target.value })
                }
                className="mb-2 form-control"
              />
              <Checkbox
                checked={socibData.isupdate_socib_name_from_unioninfo}
                onChange={(e) =>
                  setSocibData({
                    ...socibData,
                    isupdate_socib_name_from_unioninfo: e.target.checked,
                  })
                }
              >
                ইউনিয়ন তথ্য থেকে দিন
              </Checkbox>
            </div>
            <div className="mb-3">
              <label className="form-label fw-semibold">ইমেল ঠিকানা</label>
              <Input
                className="form-control"
                value={socibData.socib_email}
                onChange={(e) =>
                  setSocibData({ ...socibData, socib_email: e.target.value })
                }
              />
              <Checkbox
                checked={socibData.isupdate_socib_email_from_unioninfo}
                onChange={(e) =>
                  setSocibData({
                    ...socibData,
                    isupdate_socib_email_from_unioninfo: e.target.checked,
                  })
                }
              >
                ইউনিয়ন তথ্য থেকে দিন
              </Checkbox>
            </div>
            <div className="mb-4">
              <label className="form-label fw-semibold">
                স্বাক্ষর (ফাইল বা URL)
              </label>
              <div className="mb-2">
                <input
                  type="file"
                  className="form-control mb-2"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setSocibData({ ...socibData, socib_signture: file });
                    }
                  }}
                />
                {/* Preview */}
                <div className="mt-2">
                  {socibData.socib_signture instanceof File ? (
                    <img
                      src={URL.createObjectURL(socibData.socib_signture)}
                      alt="New Signature Preview"
                      style={{
                        height: 60,
                        border: "1px solid #ddd",
                        padding: 2,
                      }}
                    />
                  ) : (
                    data?.data?.socib_signture && (
                      <img
                        src={data.data.socib_signture}
                        alt="Current Signature"
                        style={{
                          height: 60,
                          border: "1px solid #ddd",
                          padding: 2,
                        }}
                      />
                    )
                  )}
                </div>
              </div>
              <Checkbox
                checked={socibData.isupdate_socib_signture_from_unioninfo}
                onChange={(e) =>
                  setSocibData({
                    ...socibData,
                    isupdate_socib_signture_from_unioninfo: e.target.checked,
                  })
                }
              >
                ইউনিয়ন তথ্য থেকে দিন
              </Checkbox>
            </div>
            <Button
              size="large"
              type="primary"
              icon={<SaveOutlined />}
              loading={updating}
              onClick={() => handleUpdate(socibData)}
            >
              সচিব আপডেট করুন
            </Button>
          </Card>
        </div>





        {/* ================= Approval Zone ================= */}
        <div className="col-12 mt-4">
          <div className="card border-success bg-light">
            <div className="card-body d-flex justify-content-between align-items-center">
              <div>
                <h5 className="text-success fw-bold mb-1">
                  <CheckCircleOutlined /> অনুমোদন অ্যাকশন
                </h5>
                <p className="mb-0 text-muted small">
                  অফিসিয়াল করার জন্য এই সনদটি অনুমোদন করুন।
                </p>
              </div>
              <Button
                size="large"
                type="primary"
                className="bg-success"
                onClick={handleApprove}
                loading={updating}
              >
                সনদ অনুমোদন করুন
              </Button>
            </div>
          </div>
        </div>

        {/* ================= Danger Zone ================= */}
        <div className="col-12 mt-4">
          <div className="card border-danger bg-light">
            <div className="card-body d-flex justify-content-between align-items-center">
              <div>
                <h5 className="text-danger fw-bold mb-1">
                  <WarningOutlined /> ডেঞ্জার জোন
                </h5>
                <p className="mb-0 text-muted small">
                  একবার সনদ বাতিল হলে, তা আর ফিরিয়ে আনা যাবে না।
                </p>
              </div>
              <Button
                size="large"
                danger
                type="primary"
                onClick={() => setCancelModalOpen(true)}
              >
                সনদ বাতিল করুন
              </Button>
            </div>
          </div>
        </div>
      </div >

      <Modal
        title={
          <span className="text-danger">
            <WarningOutlined /> বাতিল নিশ্চিতকরণ
          </span>
        }
        open={cancelModalOpen}
        onOk={handleCancel}
        onCancel={() => setCancelModalOpen(false)}
        okButtonProps={{ danger: true }}
        okText="হ্যাঁ, চিরতরে বাতিল করুন"
      >
        <div className="alert alert-warning">
          আপনি কি নিশ্চিত? এই Sonod টি বাতিল হলে আর পুনরুদ্ধার করা যাবে না।
        </div>
        <label className="form-label fw-semibold">
          বাতিলের কারণ:
        </label>
        <Input.TextArea
          rows={4}
          placeholder="বাতিলের কারণ বিস্তারিত লিখুন..."
          value={cancelReason}
          onChange={(e) => setCancelReason(e.target.value)}
        />
      </Modal>
    </div >
  );
};

export default AdminSonodEdit;
