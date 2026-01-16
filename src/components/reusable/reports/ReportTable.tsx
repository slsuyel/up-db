/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { Button, Tooltip } from "antd";
import { ApartmentOutlined, FileTextOutlined } from "@ant-design/icons";
import { Spinner } from "react-bootstrap";

interface ChildStats {
    sonod_name?: string;
    bn_name?: string;
    name?: string;
    total_pending: number;
    total_approved: number;
    total_cancel: number;
    total_payments: number;
    total_amount: string | number;
}

interface ReportTableProps {
    data: ChildStats[];
    isLoading: boolean;
    level?: string;
    onReportClick: (child: any, type: string) => void;
}

const ReportTable: React.FC<ReportTableProps> = ({ data, isLoading, level, onReportClick }) => {
    return (
        <div className="table-responsive">
            <h6 className="mb-4 fs-4 border-bottom pb-2">
                {level === "division"
                    ? "বিভাগীয় জেলা ভিত্তিক প্রতিবেদন"
                    : level === "district"
                        ? "জেলা ভিত্তিক উপজেলা প্রতিবেদন"
                        : level === "upazila"
                            ? "উপজেলা ভিত্তিক ইউনিয়ন প্রতিবেদন"
                            : "বিস্তারিত প্রতিবেদন"}
            </h6>
            <table className="table table-bordered table-hover mt-3">
                <thead className="thead-dark bg-dark text-white">
                    <tr>
                        <th>নাম</th>
                        <th> নতুন আবেদন </th>
                        <th>অনুমোদিত আবেদন</th>
                        <th>বাতিল</th>
                        <th>মোট লেনদেন</th>
                        <th>মোট টাকা</th>
                        <th>রিপোর্ট</th>
                    </tr>
                </thead>
                <tbody>
                    {isLoading && (!data || data.length === 0) && (
                        <tr>
                            <td colSpan={7} className="text-center p-5">
                                <Spinner animation="border" variant="primary" />
                                <p>লোড হচ্ছে...</p>
                            </td>
                        </tr>
                    )}
                    {!isLoading && (!data || data.length === 0) && (
                        <tr>
                            <td colSpan={7} className="text-center p-4">কোন তথ্য পাওয়া যায়নি</td>
                        </tr>
                    )}
                    {data?.map((child, index) => (
                        <tr key={index}>
                            <td>
                                {child.sonod_name || (
                                    <>
                                        {child.bn_name} {child.name && `(${child.name})`}
                                    </>
                                )}
                            </td>
                            <td>{child.total_pending}</td>
                            <td>{child.total_approved}</td>
                            <td>{child.total_cancel}</td>
                            <td>{child.total_payments}</td>
                            <td>{child.total_amount}</td>
                            <td>
                                <div className="d-flex flex-nowrap gap-2">
                                    <Tooltip title="ইউনিয়ন বিস্তারিত প্রতিবেদন (উপজেলা ভিত্তিক)">
                                        <Button
                                            size="small"
                                            type="primary"
                                            icon={<ApartmentOutlined />}
                                            className="d-flex align-items-center justify-content-center"
                                            style={{
                                                background: 'linear-gradient(135deg, #1890ff 0%, #096dd9 100%)',
                                                border: 'none',
                                                borderRadius: '6px',
                                                fontSize: '11px',
                                                fontWeight: 600
                                            }}
                                            onClick={() => onReportClick(child, "union")}
                                        >
                                            ইউনিয়ন
                                        </Button>
                                    </Tooltip>

                                    <Tooltip title="সনদ ভিত্তিক বিস্তারিত প্রতিবেদন">
                                        <Button
                                            size="small"
                                            type="primary"
                                            icon={<FileTextOutlined />}
                                            className="d-flex align-items-center justify-content-center"
                                            style={{
                                                background: 'linear-gradient(135deg, #52c41a 0%, #389e0d 100%)',
                                                border: 'none',
                                                borderRadius: '6px',
                                                fontSize: '11px',
                                                fontWeight: 600
                                            }}
                                            onClick={() => onReportClick(child, "sonod")}
                                        >
                                            সনদ
                                        </Button>
                                    </Tooltip>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default ReportTable;
