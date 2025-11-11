import React, { useState } from "react";
import { useGetAllSupportsQuery, useUpdateSupportStatusMutation } from "@/redux/api/supports/supportsApi";
import { Modal, Form, Badge } from "react-bootstrap";
import 'bootstrap/dist/css/bootstrap.min.css';
import { Button } from "antd";

interface Support {
    id: number;
    union_name: string | null;
    name: string;
    email: string;
    phone: string;
    sonod_name: string;
    support_id: string;
    type: string;
    description: string;
    status: string;
    created_at: string;
}

const SupportPage: React.FC = () => {
    const { data, isLoading, isError, refetch } = useGetAllSupportsQuery(undefined);
    const [updateSupportStatus, { isLoading: updating }] = useUpdateSupportStatusMutation();

    const [showModal, setShowModal] = useState(false);
    const [selectedSupport, setSelectedSupport] = useState<Support | null>(null);
    const [status, setStatus] = useState<string>("pending");
    const [message, setMessage] = useState<string>("");

    const handleOpenModal = (support: Support) => {
        setSelectedSupport(support);
        setStatus(support.status);
        setMessage("");
        setShowModal(true);
    };

    const handleUpdate = async () => {
        if (selectedSupport) {
            try {
                const res = await updateSupportStatus({
                    support_id: selectedSupport.id,
                    status,
                    message,
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
        switch (status) {
            case "pending":
                return <Badge bg="warning">Pending</Badge>;
            case "reviewed":
                return <Badge bg="info">Reviewed</Badge>;
            case "resolved":
                return <Badge bg="success">Resolved</Badge>;
            default:
                return <Badge bg="secondary">{status}</Badge>;
        }
    };

    if (isLoading) {
        return (
            <div className="d-flex justify-content-center align-items-center" style={{ height: "80vh" }}>
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
        <div className="container mt-4">
            <h2 className="mb-4">Support Requests</h2>

            {/* Table View for Desktop */}
            <div className="table-responsive d-none d-md-block">
                <table className="table table-striped table-bordered text-center align-middle">
                    <thead className="table-dark">
                        <tr>
                            <th>#</th>
                            <th>Sender Info</th>
                            <th>Union / Sonod Name</th>
                            <th>Support ID</th>
                            <th>Type</th>
                            <th>Status</th>
                            <th>Description</th>
                            <th>Created At</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data?.data.map((support: Support, index: number) => (
                            <tr key={support.id}>
                                <td>{index + 1}</td>
                                <td className="text-start">
                                    <p className="mb-0 fw-semibold">{support.name}</p>
                                    <p className="mb-0 text-muted small">{support.email}</p>
                                    <p className="mb-0 text-muted small">
                                        <a href={`tel:${support.phone}`} className="text-muted text-decoration-none">
                                            {support.phone}
                                        </a>
                                    </p>
                                </td>
                                <td>
                                    <p className="mb-0">{support.union_name || "-"}</p>
                                    <p className="mb-0">{support.sonod_name}</p>
                                </td>
                                <td>{support.support_id}</td>
                                <td>{support.type}</td>
                                <td>{renderStatusBadge(support.status)}</td>
                                <td>{support.description}</td>
                                <td>{new Date(support.created_at).toLocaleString()}</td>
                                <td>
                                    <Button className="bg-primary text-white" onClick={() => handleOpenModal(support)}>
                                        Update
                                    </Button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Card View for Mobile */}
            <div className="d-block d-md-none">
                {data?.data.map((support: Support) => (
                    <div key={support.id} className="card mb-3 shadow-sm">
                        <div className="card-body">
                            <h6 className="fw-semibold mb-1">{support.name}</h6>
                            <p className="mb-0 text-muted small">{support.email}</p>
                            <p className="mb-1 text-muted small">
                                <a href={`tel:${support.phone}`} className="text-muted text-decoration-none">
                                    {support.phone}
                                </a>
                            </p>
                            <p className="mb-1"><strong>Union:</strong> {support.union_name || "-"}</p>
                            <p className="mb-1"><strong>Sonod:</strong> {support.sonod_name}</p>
                            <p className="mb-1"><strong>Support ID:</strong> {support.support_id}</p>
                            <p className="mb-1"><strong>Type:</strong> {support.type}</p>
                            <p className="mb-1"><strong>Status:</strong> {renderStatusBadge(support.status)}</p>
                            <p className="mb-1"><strong>Description:</strong> {support.description}</p>
                            <p className="mb-2 text-muted small">{new Date(support.created_at).toLocaleString()}</p>
                            <Button
                                className="bg-primary text-white w-100"
                                onClick={() => handleOpenModal(support)}
                            >
                                Update
                            </Button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Modal (unchanged) */}
            <Modal show={showModal} onHide={() => setShowModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Update Support Status</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group className="mb-3">
                            <Form.Label>Status</Form.Label>
                            <Form.Select value={status} onChange={(e) => setStatus(e.target.value)}>
                                <option value="pending">Pending</option>
                                <option value="reviewed">Reviewed</option>
                                <option value="resolved">Resolved</option>
                            </Form.Select>
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Message</Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={3}
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                placeholder="Enter admin message"
                            />
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button onClick={() => setShowModal(false)}>Cancel</Button>
                    <Button
                        className="bg-primary text-white"
                        loading={updating}
                        disabled={updating}
                        onClick={handleUpdate}
                    >
                        Update
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>

    );
};

export default SupportPage;
