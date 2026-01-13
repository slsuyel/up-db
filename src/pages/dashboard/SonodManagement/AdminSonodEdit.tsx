/* eslint-disable @typescript-eslint/no-explicit-any */
import Loader from "@/components/reusable/Loader";
import {
  useSingleSonodQuery,
  useSonodUpdateCancelMutation,
} from "@/redux/api/sonod/sonodApi";
import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { Input, Select, Checkbox, Button, Modal, Card, message } from "antd";
import { EditOutlined, WarningOutlined, SaveOutlined } from "@ant-design/icons";

const { Option } = Select;

const AdminSonodEdit = () => {
  const { id } = useParams();
  const token = localStorage.getItem("token");

  const { data, isLoading } = useSingleSonodQuery({ id, token });
  const [sonodUpdateCancel, { isLoading: updating }] =
    useSonodUpdateCancelMutation();

  // State initialization
  const [basicData, setBasicData] = useState({
    orthoBchor: "",
    format: "",
    font_family: "",
    prottoyon: "",
    sec_prottoyon: "",
    organization_word_no: "",
  });

  const [chairmanData, setChairmanData] = useState({
    chaireman_name: "",
    isupdate_chaireman_name_from_unioninfo: true,
    chaireman_type: "Chairman",
    isupdate_chaireman_type_from_unioninfo: false,
    c_email: "",
    isupdate_c_email_from_unioninfo: true,
    chaireman_sign: "",
    isupdate_chaireman_sign_from_unioninfo: true,
  });

  const [socibData, setSocibData] = useState({
    socib_name: "নতুন সচিব",
    isupdate_socib_name_from_unioninfo: false,
    socib_signture: "",
    isupdate_socib_signture_from_unioninfo: true,
    socib_email: "",
    isupdate_socib_email_from_unioninfo: true,
  });
  useEffect(() => {
    if (data?.data) {
      const sonod = data.data;

      setBasicData({
        orthoBchor: sonod.orthoBchor || "2024-2025",
        format: sonod.format || "new",
        font_family: sonod.font_family || "bangla",
        prottoyon: sonod.prottoyon || "yes",
        sec_prottoyon: sonod.sec_prottoyon || "no",
        organization_word_no: sonod.organization_word_no || "",
      });

      setChairmanData({
        chaireman_name: sonod.chaireman_name || "",
        isupdate_chaireman_name_from_unioninfo:
          sonod.isupdate_chaireman_name_from_unioninfo ?? true,
        chaireman_type: sonod.chaireman_type || "Chairman",
        isupdate_chaireman_type_from_unioninfo:
          sonod.isupdate_chaireman_type_from_unioninfo ?? false,
        c_email: sonod.c_email || "",
        isupdate_c_email_from_unioninfo:
          sonod.isupdate_c_email_from_unioninfo ?? true,
        chaireman_sign: sonod.chaireman_sign || "",
        isupdate_chaireman_sign_from_unioninfo:
          sonod.isupdate_chaireman_sign_from_unioninfo ?? true,
      });

      setSocibData({
        socib_name: sonod.socib_name || "",
        isupdate_socib_name_from_unioninfo:
          sonod.isupdate_socib_name_from_unioninfo ?? false,
        socib_signture: sonod.socib_signture || "",
        isupdate_socib_signture_from_unioninfo:
          sonod.isupdate_socib_signture_from_unioninfo ?? true,
        socib_email: sonod.socib_email || "",
        isupdate_socib_email_from_unioninfo:
          sonod.isupdate_socib_email_from_unioninfo ?? true,
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
      const res = await sonodUpdateCancel({
        id,
        token,
        data: payload,
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

  if (isLoading) return <Loader />;

  return (
    <div className="">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="fw-bold text-primary mb-0">
          <EditOutlined /> Admin Sonod Management
        </h2>
        <span className="badge bg-secondary">ID: {id}</span>
      </div>

      <div className="row g-4">
        {/* ================= Basic Info Card ================= */}
        <div className="col-12">
          <Card title="Basic Information" className="shadow-sm">
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
                  {Array.from({ length: 9 }, (_, i) => {
                    const start = 2023 + i;
                    const end = start + 1;
                    return (
                      <Option key={start} value={`${start}-${end}`}>
                        {start}-{end}
                      </Option>
                    );
                  })}
                </Select>
              </div>

              <div className="col-md-4">
                <label className="form-label fw-semibold">Format</label>
                <Select
                  className="w-100 "
                  style={{ height: 42 }}
                  value={basicData.format}
                  onChange={(v) => setBasicData({ ...basicData, format: v })}
                >
                  <Option value="new">New</Option>
                  <Option value="old">Old</Option>
                </Select>
              </div>
              <div className="col-md-4">
                <label className="form-label fw-semibold">Font Family</label>
                <Select
                  className="w-100 "
                  style={{ height: 42 }}
                  value={basicData.font_family}
                  onChange={(v) =>
                    setBasicData({ ...basicData, font_family: v })
                  }
                >
                  <Option value="bangla">Bangla</Option>
                  <Option value="english">English</Option>
                </Select>
              </div>
              <div className="col-md-4">
                <label className="form-label fw-semibold">Prottoyon</label>
                <Input.TextArea
                  className="w-100 "
                  rows={3}
                  placeholder="Prottoyon লিখুন..."
                  value={basicData.prottoyon}
                  onChange={(e) =>
                    setBasicData({ ...basicData, prottoyon: e.target.value })
                  }
                />
              </div>

              <div className="col-md-4">
                <label className="form-label fw-semibold">Sec Prottoyon</label>
                <Input.TextArea
                  className="w-100 "
                  rows={3}
                  placeholder="Sec Prottoyon লিখুন..."
                  value={basicData.sec_prottoyon}
                  onChange={(e) =>
                    setBasicData({
                      ...basicData,
                      sec_prottoyon: e.target.value,
                    })
                  }
                />
              </div>

              <div className="col-md-4">
                <label className="form-label fw-semibold">Word No</label>
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
                  Save Basic Info
                </Button>
              </div>
            </div>
          </Card>
        </div>

        {/* ================= Chairman Card ================= */}
        <div className="col-md-6">
          <Card title="Chairman Details" className="shadow-sm h-100">
            <div className="mb-3">
              <label className="form-label fw-semibold">Chairman Name</label>
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
                Fetch from Union Info
              </Checkbox>
            </div>
            <div className="mb-3">
              <label className="form-label fw-semibold">Type / Title</label>
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
            </div>
            <div className="mb-3">
              <label className="form-label fw-semibold">Email Address</label>
              <Input
                className="form-control"
                value={chairmanData.c_email}
                onChange={(e) =>
                  setChairmanData({ ...chairmanData, c_email: e.target.value })
                }
              />
            </div>
            <div className="mb-4">
              <label className="form-label fw-semibold">
                Signature URL/Text
              </label>
              <Input
                className="form-control"
                value={chairmanData.chaireman_sign}
                onChange={(e) =>
                  setChairmanData({
                    ...chairmanData,
                    chaireman_sign: e.target.value,
                  })
                }
              />
            </div>
            <Button
              size="large"
              type="primary"
              icon={<SaveOutlined />}
              loading={updating}
              onClick={() => handleUpdate(chairmanData)}
            >
              Update Chairman
            </Button>
          </Card>
        </div>

        {/* ================= Socib Card ================= */}
        <div className="col-md-6">
          <Card title="Socib Details" className="shadow-sm h-100">
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
                Fetch from Union Info
              </Checkbox>
            </div>
            <div className="mb-3">
              <label className="form-label fw-semibold">Email Address</label>
              <Input
                className="form-control"
                value={socibData.socib_email}
                onChange={(e) =>
                  setSocibData({ ...socibData, socib_email: e.target.value })
                }
              />
            </div>
            <div className="mb-4">
              <label className="form-label fw-semibold">
                Signature URL/Text
              </label>
              <Input
                className="form-control"
                value={socibData.socib_signture}
                onChange={(e) =>
                  setSocibData({ ...socibData, socib_signture: e.target.value })
                }
              />
            </div>
            <Button
              size="large"
              type="primary"
              icon={<SaveOutlined />}
              loading={updating}
              onClick={() => handleUpdate(socibData)}
            >
              Update Socib
            </Button>
          </Card>
        </div>

        {/* ================= Danger Zone ================= */}
        <div className="col-12 mt-4">
          <div className="card border-danger bg-light">
            <div className="card-body d-flex justify-content-between align-items-center">
              <div>
                <h5 className="text-danger fw-bold mb-1">
                  <WarningOutlined /> Danger Zone
                </h5>
                <p className="mb-0 text-muted small">
                  Once a Sonod is cancelled, the action cannot be undone.
                </p>
              </div>
              <Button
                size="large"
                danger
                type="primary"
                onClick={() => setCancelModalOpen(true)}
              >
                Cancel Sonod
              </Button>
            </div>
          </div>
        </div>
      </div>

      <Modal
        title={
          <span className="text-danger">
            <WarningOutlined /> Confirm Cancellation
          </span>
        }
        open={cancelModalOpen}
        onOk={handleCancel}
        onCancel={() => setCancelModalOpen(false)}
        okButtonProps={{ danger: true }}
        okText="Yes, Cancel Forever"
      >
        <div className="alert alert-warning">
          আপনি কি নিশ্চিত? এই Sonod টি বাতিল হলে আর পুনরুদ্ধার করা যাবে না।
        </div>
        <label className="form-label fw-semibold">
          Reason for cancellation:
        </label>
        <Input.TextArea
          rows={4}
          placeholder="বাতিলের কারণ বিস্তারিত লিখুন..."
          value={cancelReason}
          onChange={(e) => setCancelReason(e.target.value)}
        />
      </Modal>
    </div>
  );
};

export default AdminSonodEdit;
