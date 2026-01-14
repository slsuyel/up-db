import React, { useState } from "react";
import {
  useGetAllSupportsQuery,
  useUpdateSupportStatusMutation,
} from "@/redux/api/supports/supportsApi";
import {
  Table,
  Modal,
  Form,
  Badge,
  Card,
  Button,
  Spinner,
} from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import { message, Tooltip } from "antd";
import { useAppSelector } from "@/redux/features/hooks";
import { RootState } from "@/redux/features/store";
import { Link } from "react-router-dom";
import AdminSonodEdit from "../dashboard/SonodManagement/AdminSonodEdit";

interface Support {
  id: number;
  union_name: string | null;
  name: string;
  email: string;
  phone: string;
  sonod_name: string;
  support_id: string;
  sonod_id?: string;
  type: string;
  description: string;
  status: string;
  created_at: string;
}

const SupportPage: React.FC = () => {
  const isUnion = useAppSelector(
    (state: RootState) => state.siteSetting.isUnion
  );

  const { data, isLoading, isError, refetch } =
    useGetAllSupportsQuery(undefined);
  const [updateSupportStatus, { isLoading: updating }] =
    useUpdateSupportStatusMutation();

  const [showModal, setShowModal] = useState(false);
  const [selectedSupport, setSelectedSupport] = useState<Support | null>(null);
  const [status, setStatus] = useState<string>("pending");
  const [messageText, setMessageText] = useState<string>("");

  // Sonod Edit Modal State
  const [showSonodModal, setShowSonodModal] = useState(false);
  const [sonodEditId, setSonodEditId] = useState<string | null>(null);
  const [sonodEditName, setSonodEditName] = useState<string | null>(null);

  const [searchTerm, setSearchTerm] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const handleCopy = (text: string) => {
    if (text) {
      navigator.clipboard.writeText(text);
      message.success("ক্লিপবোর্ডে কপি হয়েছে!");
    }
  };

  const handleOpenModal = (support: Support) => {
    setSelectedSupport(support);
    setStatus(support.status);
    setMessageText("");
    setShowModal(true);
  };

  const handleOpenSonodEditModal = (sonodId: string, sonodName: string) => {
    setSonodEditId(sonodId);
    setSonodEditName(sonodName);
    setShowSonodModal(true);
  };

  const handleUpdate = async () => {
    if (selectedSupport) {
      try {
        const res = await updateSupportStatus({
          support_id: selectedSupport.id,
          status,
          message: messageText,
        }).unwrap();

        console.log(res);
        // Optionally show success message or toast
        alert(res.data.message);

        setShowModal(false);
        refetch();
      } catch (error) {
        console.error("Update failed:", error);
        alert("Failed to update support status.");
      }
    }
  };

  const renderStatusBadge = (status: string) => {
    const badgeStyle = {
      fontSize: "14px",
      padding: "8px 15px",
      fontWeight: "700",
      minWidth: "120px",
    };
    switch (status) {
      case "pending":
        return (
          <Badge
            bg="warning"
            text="dark"
            className="rounded-pill shadow-sm border border-warning"
            style={badgeStyle}
          >
            <i className="fas fa-history fa-spin me-2"></i> পেন্ডিং
          </Badge>
        );
      case "reviewed":
        return (
          <Badge
            bg="info"
            className="rounded-pill shadow-sm border border-info"
            style={badgeStyle}
          >
            <i className="fas fa-search me-2"></i> চেক করা হচ্ছে
          </Badge>
        );
      case "resolved":
        return (
          <Badge
            bg="success"
            className="rounded-pill shadow-sm border border-success"
            style={badgeStyle}
          >
            <i className="fas fa-check-double me-2"></i> সমাধান হয়েছে
          </Badge>
        );
      default:
        return (
          <Badge
            bg="secondary"
            className="rounded-pill shadow-sm"
            style={badgeStyle}
          >
            <i className="fas fa-info-circle me-2"></i> {status}
          </Badge>
        );
    }
  };

  const filteredData =
    data?.data.filter((support: Support) => {
      const matchesSearch =
        support.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        support.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        support.phone.includes(searchTerm) ||
        support.support_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (support.sonod_id &&
          support.sonod_id.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (support.union_name &&
          support.union_name.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesStatus =
        statusFilter === "all" || support.status === statusFilter;

      return matchesSearch && matchesStatus;
    }) || [];

  const renderTypeBadge = (type: string) => {
    const typeLower = type ? type.toLowerCase() : "";
    const badgeStyle = {
      fontSize: "13px",
      padding: "7px 15px",
      fontWeight: "700",
      letterSpacing: "0.3px",
    };

    if (
      typeLower.includes("payment") ||
      typeLower.includes("পেমেন্ট") ||
      typeLower.includes("টাকা")
    ) {
      return (
        <Badge
          bg="success"
          className="rounded-pill shadow-sm border border-success"
          style={badgeStyle}
        >
          <i className="fas fa-wallet me-2"></i> {type}
        </Badge>
      );
    } else if (
      typeLower.includes("tech") ||
      typeLower.includes("টেকনিক্যাল") ||
      typeLower.includes("সফটওয়্যার")
    ) {
      return (
        <Badge
          bg="danger"
          className="rounded-pill shadow-sm border border-danger"
          style={badgeStyle}
        >
          <i className="fas fa-microchip me-2"></i> {type}
        </Badge>
      );
    } else if (
      typeLower.includes("sonod") ||
      typeLower.includes("সনদ") ||
      typeLower.includes("সার্টিফিকেট")
    ) {
      return (
        <Badge
          bg="primary"
          className="rounded-pill shadow-sm border border-primary"
          style={badgeStyle}
        >
          <i className="fas fa-file-contract me-2"></i> {type}
        </Badge>
      );
    } else if (
      typeLower.includes("edit") ||
      typeLower.includes("এডিট") ||
      typeLower.includes("সংশোধন")
    ) {
      return (
        <Badge
          bg="warning"
          text="dark"
          className="rounded-pill shadow-sm border border-warning"
          style={badgeStyle}
        >
          <i className="fas fa-pen-nib me-2"></i> {type}
        </Badge>
      );
    } else if (
      typeLower.includes("login") ||
      typeLower.includes("লগইন") ||
      typeLower.includes("পাসওয়ার্ড")
    ) {
      return (
        <Badge
          bg="dark"
          className="rounded-pill shadow-sm border border-light"
          style={badgeStyle}
        >
          <i className="fas fa-user-lock me-2"></i> {type}
        </Badge>
      );
    } else if (
      typeLower.includes("mobile") ||
      typeLower.includes("মোবাইল") ||
      typeLower.includes("sms")
    ) {
      return (
        <Badge
          bg="info"
          className="rounded-pill shadow-sm border border-info"
          style={badgeStyle}
        >
          <i className="fas fa-sms me-2"></i> {type}
        </Badge>
      );
    } else if (
      typeLower.includes("complain") ||
      typeLower.includes("অভিযোগ") ||
      typeLower.includes("সমস্যা")
    ) {
      return (
        <Badge
          bg="danger"
          className="rounded-pill shadow-sm border border-danger"
          style={badgeStyle}
        >
          <i className="fas fa-bullhorn me-2"></i> {type}
        </Badge>
      );
    } else if (typeLower.includes("report") || typeLower.includes("রিপোর্ট")) {
      return (
        <Badge
          bg="secondary"
          className="rounded-pill shadow-sm border border-secondary"
          style={badgeStyle}
        >
          <i className="fas fa-chart-pie me-2"></i> {type}
        </Badge>
      );
    }

    return (
      <Badge
        bg="light"
        text="dark"
        className="rounded-pill shadow-sm border border-dark"
        style={badgeStyle}
      >
        <i className="fas fa-hashtag me-2"></i> {type}
      </Badge>
    );
  };

  if (isLoading) {
    return (
      <div
        className="d-flex justify-content-center align-items-center"
        style={{ height: "80vh" }}
      >
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="alert alert-danger" role="alert">
        Failed to load support data.
      </div>
    );
  }

  return (
    <div className="p-2 p-md-4">
      <style>{`
                .support-table {
                    font-size: 15px;
                }
                .support-table th {
                    padding: 15px 10px !important;
                    font-size: 15px;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }
                .support-table td {
                    padding: 15px 10px !important;
                    vertical-align: middle;
                }
                .copyable-text {
                    cursor: pointer;
                    color: #0d6efd;
                    transition: opacity 0.2s;
                }
                .copyable-text:hover {
                    opacity: 0.7;
                    text-decoration: underline;
                }
                @media (max-width: 768px) {
                    .report-header {
                        flex-direction: column;
                        align-items: flex-start !important;
                        gap: 1rem;
                    }
                    .table-responsive {
                        border: none;
                    }
                    .table-responsive table, 
                    .table-responsive thead, 
                    .table-responsive tbody, 
                    .table-responsive th, 
                    .table-responsive td, 
                    .table-responsive tr {
                        display: block;
                    }
                    .table-responsive thead tr {
                        position: absolute;
                        top: -9999px;
                        left: -9999px;
                    }
                    .table-responsive tr {
                        border: 1px solid #dee2e6;
                        margin-bottom: 1rem;
                        border-radius: 8px;
                        background: #fff;
                        padding: 10px;
                        box-shadow: 0 2px 4px rgba(0,0,0,0.05);
                    }
                    .table-responsive td {
                        border: none;
                        border-bottom: 1px solid #eee;
                        position: relative;
                        padding-left: 50% !important;
                        text-align: right !important;
                        padding-top: 10px !important;
                        padding-bottom: 10px !important;
                        min-height: 40px;
                        font-size: 14px;
                    }
                    .table-responsive td:last-child {
                        border-bottom: 0;
                    }
                    .table-responsive td:before {
                        position: absolute;
                        top: 10px;
                        left: 10px;
                        width: 45%;
                        padding-right: 10px;
                        white-space: nowrap;
                        content: attr(data-label);
                        font-weight: bold;
                        text-align: left;
                        color: #666;
                    }
                }
            `}</style>

      <div className="d-flex justify-content-between align-items-center mb-4 report-header">
        <h3 className="mb-0 text-primary fw-bold">সাপোর্ট রিকোয়েস্ট সমূহ</h3>
        <div className="bg-white px-3 py-2 rounded shadow-sm border small fw-semibold text-primary">
          মোট: {filteredData.length.toLocaleString("bn-BD")} টি
        </div>
      </div>

      <Card className="mb-4 shadow-sm border-0 bg-light">
        <Card.Body>
          <div className="row g-3">
            <div className="col-md-8">
              <Form.Label className="fw-bold mb-2">সার্চ করুন</Form.Label>
              <div className="input-group">
                <span className="input-group-text bg-white border-end-0">
                  <i className="fas fa-search text-muted"></i>
                </span>
                <Form.Control
                  type="text"
                  placeholder="আইডি, নাম, ফোন, ইমেইল অথবা ইউনিয়ন দিয়ে খুঁজুন..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="border-start-0 ps-0"
                />
              </div>
            </div>
            <div className="col-md-4">
              <Form.Label className="fw-bold mb-2">
                স্ট্যাটাস ফিল্টার
              </Form.Label>
              <Form.Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">সকল স্ট্যাটাস</option>
                <option value="pending">পেন্ডিং</option>
                <option value="reviewed">পর্যালোচনা করা হয়েছে</option>
                <option value="resolved">সমাধান করা হয়েছে</option>
              </Form.Select>
            </div>
          </div>
        </Card.Body>
      </Card>

      <Card className="shadow-sm border-0">
        <Card.Body className="p-0">
          <div className="table-responsive">
            <Table striped hover bordered className="mb-0 support-table">
              <thead className="table-dark">
                <tr>
                  <th>আইডি</th>
                  <th>প্রেরকের তথ্য</th>
                  <th>সনদের বিবরণ</th>
                  <th>ধরণ</th>
                  <th>স্ট্যাটাস</th>
                  <th>বিস্তারিত বর্ণনা</th>
                  <th>প্রেরণের সময়</th>
                  <th className="text-end">অ্যাকশন</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center py-4 text-muted">
                      কোন তথ্য পাওয়া যায়নি।
                    </td>
                  </tr>
                ) : (
                  filteredData.map((support: Support) => (
                    <tr key={support.id}>
                      <td data-label="আইডি" className="fw-bold">
                        #{support.support_id}
                      </td>
                      <td data-label="প্রেরকের তথ্য">
                        <div className="d-flex flex-column">
                          <span className="fw-bold fs-6">{support.name}</span>
                          <span className="text-muted">
                            <i className="fas fa-envelope me-1"></i>
                            {support.email}
                          </span>
                          <a
                            href={`tel:${support.phone}`}
                            className="text-decoration-none text-muted"
                          >
                            <i className="fas fa-phone me-1"></i>
                            {support.phone}
                          </a>
                        </div>
                      </td>
                      <td data-label="সনদের বিবরণ">
                        <div className="d-flex flex-column gap-1">
                          <Tooltip title="কপি করতে ক্লিক করুন">
                            <span
                              className="copyable-text fw-bold"
                              onClick={() => handleCopy(support.sonod_id || "")}
                            >
                              <i className="far fa-copy me-1"></i>{" "}
                              {support.sonod_id || "-"}
                            </span>
                          </Tooltip>
                          <span>
                            <i className="fas fa-file-alt me-1 text-muted"></i>
                            {support.sonod_name}
                          </span>
                          <span className="text-muted small">
                            {support.union_name || "-"}
                          </span>
                        </div>
                      </td>

                      <td data-label="ধরণ">{renderTypeBadge(support.type)}</td>
                      <td data-label="স্ট্যাটাস">
                        {renderStatusBadge(support.status)}
                      </td>
                      <td data-label="বিস্তারিত বর্ণনা">
                        <Tooltip title={support.description}>
                          <div
                            className="copyable-text text-muted text-truncate"
                            style={{ maxWidth: "180px" }}
                            onClick={() => handleCopy(support.description)}
                          >
                            {support.description}
                          </div>
                        </Tooltip>
                      </td>
                      <td data-label="প্রেরণের সময়">
                        <div className="text-muted">
                          <i className="far fa-calendar-alt me-1"></i>
                          {new Date(support.created_at).toLocaleDateString(
                            "bn-BD"
                          )}
                          <br />
                          <span className="opacity-75 small">
                            {new Date(support.created_at).toLocaleTimeString(
                              "bn-BD",
                              { hour: "2-digit", minute: "2-digit" }
                            )}
                          </span>
                        </div>
                      </td>
                      <td data-label="অ্যাকশন" className="text-end">
                        <div className="d-flex gap-2 justify-content-end align-items-center">
                          {support?.sonod_id && (
                            <Button
                              variant="outline-danger"
                              size="sm"
                              as="a"
                              target="_blank"
                              href={`${isUnion
                                ? `https://uniontax.gov.bd/sonod/search?sonodType=${support.sonod_name}&sonodNo=${support.sonod_id}`
                                : `https://pouroseba.gov.bd/sonod/search?sonodType=${support.sonod_name}&sonodNo=${support.sonod_id}`
                                }`}
                              title="পিডিএফ দেখুন"
                            >
                              <i className="fas fa-file-pdf"></i>
                            </Button>
                          )}
                          <Button
                            variant="outline-info"
                            size="sm"
                            onClick={() => handleOpenModal(support)}
                            title="রেকর্ড আপডেট"
                          >
                            <i className="fas fa-history"></i>
                          </Button>
                          {/* <Button
                            variant="primary"
                            size="sm"
                            onClick={() =>
                              navigate(
                                `/dashboard/sonod-search?sonod_name=${
                                  support.sonod_name
                                }&sonod_Id=${support.sonod_id || ""}`
                              )
                            }
                          >
                            এডিট
                          </Button> */}
                          <Link
                            to={`/dashboard/sonod-search?sonod_name=${encodeURIComponent(
                              support.sonod_name
                            )}&sonod_Id=${support.sonod_id || ""}`}
                            target="_blank"
                            className="btn btn-primary btn-sm fw-bold text-decoration-none"
                          >
                            <i className="fas fa-search"></i>
                          </Link>
                          {support?.sonod_id && (
                            <Button
                              variant="outline-primary"
                              size="sm"
                              onClick={() =>
                                handleOpenSonodEditModal(support.sonod_id!, support.sonod_name)
                              }
                              title="সনদ এডিট করুন"
                            >
                              <i className="fas fa-edit"></i>
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </Table>
          </div>
        </Card.Body>
      </Card>

      {/* Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton className="bg-light">
          <Modal.Title className="fw-bold">
            সাপোর্ট রিকোয়েস্ট স্ট্যাটাস আপডেট
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label className="fw-bold small">নতুন স্ট্যাটাস</Form.Label>
              <Form.Select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              >
                <option value="pending">পেন্ডিং</option>
                <option value="reviewed">পর্যালোচনা করা হয়েছে</option>
                <option value="resolved">সমাধান করা হয়েছে</option>
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-2">
              <Form.Label className="fw-bold small">
                অ্যাডমিন রেসপন্স মেসেজ
              </Form.Label>
              <Form.Control
                as="textarea"
                rows={4}
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                placeholder="এখানে আপনার মন্তব্য লিখুন..."
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            বাতিল করুন
          </Button>
          <Button variant="primary" disabled={updating} onClick={handleUpdate}>
            {updating ? (
              <Spinner as="span" animation="border" size="sm" />
            ) : (
              "সেভ করুন"
            )}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Sonod Edit Modal */}
      <Modal
        show={showSonodModal}
        onHide={() => setShowSonodModal(false)}
        fullscreen
        centered
      >
        <Modal.Header closeButton className="bg-light">
          <Modal.Title className="fw-bold">সনদ এডিট করুন</Modal.Title>
        </Modal.Header>
        <Modal.Body className="bg-light p-0">
          {sonodEditId && (
            <div className="p-4">
              <AdminSonodEdit sonodId={sonodEditId} sonodName={sonodEditName || ""} />
            </div>
          )}
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default SupportPage;
