/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { Modal, Space } from "antd";
import { PlusOutlined, MinusOutlined } from "@ant-design/icons";
import { Spinner } from "react-bootstrap";

interface ReportModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    loading: boolean;
    data: any;
}

const ReportModal: React.FC<ReportModalProps> = ({ isOpen, onClose, title, loading, data }) => {
    const [expandedRows, setExpandedRows] = React.useState<Set<string>>(new Set());

    // Reset expansions when data changes or modal closes
    React.useEffect(() => {
        if (!isOpen) {
            setExpandedRows(new Set());
        }
    }, [isOpen]);

    return (
        <Modal
            title={title}
            open={isOpen}
            onCancel={onClose}
            footer={null}
            width={1000}
            style={{ top: 20 }}
        >
            {loading ? (
                <div className="text-center p-5">
                    <Spinner animation="border" variant="primary" />
                    <p className="mt-2">লোড হচ্ছে...</p>
                </div>
            ) : data ? (
                <div className="table-responsive">
                    <table className="table table-bordered table-hover">
                        <thead className="table-light">
                            <tr>
                                <th>নাম</th>
                                <th>নতুন আবেদন</th>
                                <th>অনুমোদিত</th>
                                <th>বাতিল</th>
                                <th>লেনদেন</th>
                                <th>টাকা</th>
                            </tr>
                        </thead>
                        <tbody>
                            {Array.isArray(data) && data.some(item => item.children) ? (
                                data.map((group: any, gIdx: number) => {
                                    const isExpanded = expandedRows.has(group.name);
                                    const parentTotals = group.children?.reduce((acc: any, curr: any) => ({
                                        pending: acc.pending + (curr.pending || 0),
                                        approved: acc.approved + (curr.approved || 0),
                                        cancel: acc.cancel + (curr.cancel || 0),
                                        payments: acc.payments + (curr.payments || 0),
                                        amount: acc.amount + parseFloat(curr.amount || 0)
                                    }), { pending: 0, approved: 0, cancel: 0, payments: 0, amount: 0 });

                                    return (
                                        <React.Fragment key={gIdx}>
                                            <tr
                                                onClick={() => {
                                                    const newExpanded = new Set<string>();
                                                    if (!isExpanded) newExpanded.add(group.name);
                                                    setExpandedRows(newExpanded);
                                                }}
                                                style={{
                                                    cursor: 'pointer',
                                                    backgroundColor: isExpanded ? '#003a8c' : '#f0f2f5',
                                                    color: isExpanded ? '#ffffff' : '#000000',
                                                    transition: 'all 0.3s'
                                                }}
                                                className="fw-bold"
                                            >
                                                <td style={{ color: isExpanded ? '#ffffff' : 'inherit', backgroundColor: isExpanded ? '#003a8c' : '#f0f2f5' }}>
                                                    <Space>
                                                        {isExpanded ? <MinusOutlined style={{ fontSize: '12px', color: '#fff' }} /> : <PlusOutlined style={{ fontSize: '12px' }} />}
                                                        {group.bn_name || group.name}
                                                    </Space>
                                                </td>
                                                <td style={{ color: isExpanded ? '#ffffff' : 'inherit', backgroundColor: isExpanded ? '#003a8c' : '#f0f2f5' }}>{parentTotals.pending}</td>
                                                <td style={{ color: isExpanded ? '#ffffff' : 'inherit', backgroundColor: isExpanded ? '#003a8c' : '#f0f2f5' }}>{parentTotals.approved}</td>
                                                <td style={{ color: isExpanded ? '#ffffff' : 'inherit', backgroundColor: isExpanded ? '#003a8c' : '#f0f2f5' }}>{parentTotals.cancel}</td>
                                                <td style={{ color: isExpanded ? '#ffffff' : 'inherit', backgroundColor: isExpanded ? '#003a8c' : '#f0f2f5' }}>{parentTotals.payments}</td>
                                                <td style={{ color: isExpanded ? '#ffffff' : 'inherit', backgroundColor: isExpanded ? '#003a8c' : '#f0f2f5' }}>{parentTotals.amount.toFixed(2)}</td>
                                            </tr>
                                            {isExpanded && group.children?.map((item: any, cIdx: number) => (
                                                <tr key={`${gIdx}-${cIdx}`}>
                                                    <td style={{ paddingLeft: '40px', borderLeft: '4px solid #003a8c', backgroundColor: '#e6f7ff' }}>
                                                        <div className="d-flex align-items-center">
                                                            <span className="me-2 text-primary">•</span>
                                                            {item.sonod_name || item.bn_name || item.name}
                                                        </div>
                                                    </td>
                                                    <td style={{ backgroundColor: '#e6f7ff' }}>{item.pending || 0}</td>
                                                    <td style={{ backgroundColor: '#e6f7ff' }}>{item.approved || 0}</td>
                                                    <td style={{ backgroundColor: '#e6f7ff' }}>{item.cancel || 0}</td>
                                                    <td style={{ backgroundColor: '#e6f7ff' }}>{item.payments || 0}</td>
                                                    <td style={{ backgroundColor: '#e6f7ff' }}>{item.amount || 0}</td>
                                                </tr>
                                            ))}
                                        </React.Fragment>
                                    );
                                })
                            ) : Array.isArray(data) ? (
                                data.map((item: any, idx: number) => (
                                    <tr key={idx}>
                                        <td>{item.sonod_name || item.bn_name || item.name}</td>
                                        <td>{item.pending || item.total_pending || 0}</td>
                                        <td>{item.approved || item.total_approved || 0}</td>
                                        <td>{item.cancel || item.total_cancel || 0}</td>
                                        <td>{item.payments || item.total_payments || 0}</td>
                                        <td>{item.amount || item.total_amount || 0}</td>
                                    </tr>
                                ))
                            ) : data?.children && data.children.length > 0 ? (
                                data.children.map((item: any, idx: number) => (
                                    <tr key={idx}>
                                        <td>{item.sonod_name || item.bn_name || item.name}</td>
                                        <td> {item.total_pending ?? item.pending ?? 0} </td>
                                        <td> {item.total_approved ?? item.approved ?? 0} </td>
                                        <td> {item.total_cancel ?? item.cancel ?? 0} </td>
                                        <td> {item.total_payments ?? item.payments ?? 0} </td>
                                        <td> {item.total_amount ?? item.amount ?? 0} </td>
                                    </tr>
                                ))
                            ) : data?.sonod_reports && data.sonod_reports.length > 0 ? (
                                data.sonod_reports.map((item: any, idx: number) => (
                                    <tr key={idx}>
                                        <td>{item.sonod_name}</td>
                                        <td>{item.pending_count}</td>
                                        <td>{item.approved_count}</td>
                                        <td>{item.cancel_count}</td>
                                        <td>-</td>
                                        <td>-</td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={6} className="text-center">কোন তথ্য পাওয়া যায়নি</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            ) : (
                <div className="text-center p-4">কোন তথ্য পাওয়া যায়নি</div>
            )}
        </Modal>
    );
};

export default ReportModal;
