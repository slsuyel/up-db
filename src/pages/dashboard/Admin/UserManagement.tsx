import { useGetAdminUsersQuery, useLoginByAdminMutation } from "@/redux/api/admin/adminUserApi";
import { SearchOutlined, UserOutlined, ReloadOutlined, LoginOutlined } from "@ant-design/icons";
import { Card, Table, Input, Avatar, Space, Button, Pagination, Select, message } from "antd";
import { useState } from "react";
import { TUnion, TDivision, TDistrict, TUpazila } from "@/types/global";
import AddressSelectorUnion from "@/components/reusable/AddressSelectorUnion";
import PouroLocationSelector from "@/components/reusable/PouroLocationSelector";
import { useAppSelector } from "@/redux/features/hooks";
import { RootState } from "@/redux/features/store";

const UserManagement = () => {
    const isUnion = useAppSelector((state: RootState) => state.siteSetting.isUnion);
    const [search, setSearch] = useState("");
    const [position, setPosition] = useState("");
    const [divisionName, setDivisionName] = useState("");
    const [districtName, setDistrictName] = useState("");
    const [upazilaName, setUpazilaName] = useState("");
    const [unionName, setUnionName] = useState("");
    const [page, setPage] = useState(1);
    const [perPage, setPerPage] = useState(10);
    const token = localStorage.getItem("token");
    const [loginByAdmin, { isLoading: isLoggingIn }] = useLoginByAdminMutation();

    const VITE_BASE_DOC_URL = import.meta.env.VITE_BASE_DOC_URL;

    const handleImpersonate = async (userEmail: string) => {
        try {
            const res = await loginByAdmin({ token, email: userEmail }).unwrap();
            if (res.status_code === 200) {
                const impersonationToken = res.data.token;
                message.success("পুনর্নির্দেশ করা হচ্ছে...");
                setTimeout(() => {
                    const finalUrl = VITE_BASE_DOC_URL.replace("api.", "");
                    window.open(`${finalUrl}/login?token=${impersonationToken}`, "_blank");
                }, 1000);
            } else {
                message.error(res.message || "লগইন করা সম্ভব হয়নি");
            }
        } catch (error: any) {
            console.error("Impersonation error:", error);
            message.error(error?.data?.message || "একটি ত্রুটি ঘটেছে");
        }
    };

    const { data, isLoading, isFetching, refetch } = useGetAdminUsersQuery({
        token,
        search,
        position,
        division_name: divisionName,
        district_name: districtName,
        upazila_name: upazilaName,
        unioun: unionName,
        page,
        perPage,
    });

    const columns = [
        {
            title: "ইউনিয়ন",
            key: "unioun",
            render: (_: any, record: any) => {
                const info = record.unioun_info;
                return (
                    <div>
                        <div style={{
                            fontSize: "16px",
                            fontWeight: 700,
                            color: "#0f172a",
                            lineHeight: "1.2"
                        }}>
                            {info?.full_name || info?.short_name_b || record.unioun}
                        </div>
                        <div style={{ fontSize: "12px", color: "#64748b", marginTop: "4px" }}>
                            <div style={{ fontWeight: 600, textTransform: "uppercase", color: "#475569" }}>
                                {record.unioun}
                            </div>
                            {info && (
                                <div>
                                    {info.thana} ({info.thana_en}), {info.district} ({info.district_en})
                                </div>
                            )}
                        </div>
                    </div>
                );
            },
        },
        {
            title: "ব্যবহারকারী",
            key: "user",
            render: (_: any, record: any) => (
                <Space>
                    <Avatar
                        src={record.profile_picture || record.image}
                        icon={<UserOutlined />}
                        style={{ backgroundColor: "#38bdf8" }}
                    />
                    <div>
                        <div style={{ fontWeight: 600, color: "#1e293b" }}>{record.names}</div>
                        <div style={{ fontSize: "12px", color: "#64748b" }}>{record.email}</div>
                    </div>
                </Space>
            ),
        },
        {
            title: "পদবী",
            dataIndex: "position",
            key: "position",
            render: (position: string) => {
                const translations: Record<string, string> = {
                    Chairman: "চেয়ারম্যান",
                    Secretary: "সচিব",
                    UDC: "উদ্যোক্তা (UDC)",
                    Accountant: "হিসাব সহকারী",
                    "Asst-Accountant": "সহকারী হিসাব সহকারী",
                    Member: "সদস্য",
                };
                return translations[position] || position;
            },
        },
        {
            title: "ফোন",
            dataIndex: "phone",
            key: "phone",
        },
        {
            title: "তৈরি হয়েছে",
            dataIndex: "created_at",
            key: "created_at",
            render: (date: string) => new Date(date).toLocaleDateString("bn-BD"),
        },
        {
            title: "অ্যাকশন",
            key: "action",
            render: (_: any, record: any) => (
                <Button
                    type="primary"
                    size="small"
                    icon={<LoginOutlined />}
                    onClick={() => handleImpersonate(record.email)}
                    loading={isLoggingIn}
                    style={{
                        borderRadius: "6px",
                        backgroundColor: "#10b981",
                        borderColor: "#10b981"
                    }}
                >
                    লগইন
                </Button>
            ),
        },
    ];

    const handleSearch = (value: string) => {
        setSearch(value);
        setPage(1);
    };

    const handlePageChange = (newPage: number, newPerPage: number) => {
        setPage(newPage);
        setPerPage(newPerPage);
    };

    return (
        <div style={{ padding: "24px" }}>
            <div className="mb-4 d-flex justify-content-between align-items-center flex-wrap gap-3">
                <div>
                    <h2 style={{ fontWeight: 700, color: "#0f172a", marginBottom: "4px" }}>
                        ব্যবহারকারী ম্যানেজমেন্ট
                    </h2>
                    <p style={{ color: "#64748b", margin: 0 }}>
                        সিস্টেমের সকল ব্যবহারকারীদের তালিকা এবং তথ্য দেখুন
                    </p>
                </div>
                <Button
                    icon={<ReloadOutlined spin={isFetching} />}
                    onClick={() => refetch()}
                    style={{ borderRadius: "8px" }}
                >
                    রিফ্রেশ করুন
                </Button>
            </div>

            <Card
                style={{
                    borderRadius: "16px",
                    boxShadow: "0 4px 20px rgba(0, 0, 0, 0.05)",
                    border: "none",
                }}
                bodyStyle={{ padding: "0" }}
            >
                <div style={{ padding: "0 20px 20px 20px" }}>
                    {isUnion ? (
                        <AddressSelectorUnion
                            onDivisionChange={(division: TDivision | null) => {
                                setDivisionName(division?.name || "");
                                setPage(1);
                            }}
                            onDistrictChange={(district: TDistrict | null) => {
                                setDistrictName(district?.name || "");
                                setPage(1);
                            }}
                            onUpazilaChange={(upazila: TUpazila | null) => {
                                setUpazilaName(upazila?.name || "");
                                setPage(1);
                            }}
                            onUnionChange={(union: TUnion | null) => {
                                setUnionName(union?.name || "");
                                setPage(1);
                            }}
                        />
                    ) : (
                        <PouroLocationSelector
                            onDivisionChange={(division: any) => {
                                setDivisionName(division?.name || "");
                                setPage(1);
                            }}
                            onDistrictChange={(district: any) => {
                                setDistrictName(district?.name || "");
                                setPage(1);
                            }}
                            onUnionChange={(union: any) => {
                                setUnionName(union?.name || "");
                                setPage(1);
                            }}
                            showLabels={true}
                        />
                    )}
                </div>

                <div style={{
                    padding: "20px",
                    borderBottom: "1px solid #f1f5f9",
                    display: "flex",
                    flexWrap: "wrap",
                    gap: "12px"
                }}>
                    <Input
                        placeholder="নাম, ইমেইল বা ফোন..."
                        prefix={<SearchOutlined style={{ color: "#94a3b8" }} />}
                        onChange={(e) => handleSearch(e.target.value)}
                        style={{
                            flex: "1 1 200px",
                            maxWidth: "400px",
                            borderRadius: "10px",
                            height: "45px",
                        }}
                        allowClear
                    />
                    <Select
                        placeholder="পদবী নির্বাচন করুন"
                        onChange={(value: string) => {
                            setPosition(value || "");
                            setPage(1);
                        }}
                        style={{
                            flex: "1 1 150px",
                            maxWidth: "200px",
                            height: "45px",
                        }}
                        allowClear
                    >
                        <Select.Option value="">সকল</Select.Option>
                        <Select.Option value="Chairman">চেয়ারম্যান</Select.Option>
                        <Select.Option value="Secretary">সচিব</Select.Option>
                        <Select.Option value="UDC">উদ্যোক্তা (UDC)</Select.Option>
                        <Select.Option value="Accountant">হিসাব সহকারী</Select.Option>
                        <Select.Option value="Asst-Accountant">সহকারী হিসাব সহকারী</Select.Option>
                        <Select.Option value="Member">সদস্য</Select.Option>
                    </Select>
                </div>

                <Table
                    columns={columns}
                    dataSource={data?.data?.data}
                    loading={isLoading}
                    pagination={false}
                    rowKey="id"
                    scroll={{ x: 800 }}
                    style={{ padding: "0" }}
                    className="custom-premium-table"
                />

                <div
                    style={{
                        padding: "20px",
                        display: "flex",
                        justifyContent: "flex-end",
                        borderTop: "1px solid #f1f5f9",
                    }}
                >
                    <Pagination
                        current={page}
                        pageSize={perPage}
                        total={data?.data?.total || 0}
                        onChange={handlePageChange}
                        showSizeChanger
                        onShowSizeChange={handlePageChange}
                        itemRender={(_, type, originalElement) => {
                            if (type === "prev") return <a style={{ color: "#38bdf8" }}>পূর্ববর্তী</a>;
                            if (type === "next") return <a style={{ color: "#38bdf8" }}>পরবর্তী</a>;
                            return originalElement;
                        }}
                    />
                </div>
            </Card>

            <style>{`
        .custom-premium-table .ant-table-thead > tr > th {
          background: #f8fafc;
          color: #64748b;
          font-weight: 600;
          text-transform: uppercase;
          font-size: 12px;
          letter-spacing: 0.5px;
          padding: 16px;
        }
        .custom-premium-table .ant-table-tbody > tr > td {
          padding: 16px;
        }
        .custom-premium-table .ant-table-row:hover {
          background-color: #f1f5f9 !important;
        }
        @media (max-width: 576px) {
          .ant-pagination {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 10px;
          }
        }
      `}</style>
        </div>
    );
};

export default UserManagement;
