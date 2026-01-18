import { useGetAdminUsersQuery, useLoginByAdminMutation, useGetAdminUserQuery, useUpdateAdminUserMutation } from "@/redux/api/admin/adminUserApi";
import { SearchOutlined, UserOutlined, ReloadOutlined, LoginOutlined, EditOutlined, SaveOutlined, MailOutlined, LockOutlined, PhoneOutlined, GlobalOutlined, DeploymentUnitOutlined, HomeOutlined, InfoCircleOutlined, PictureOutlined, LeftOutlined, RightOutlined } from "@ant-design/icons";
import { Card, Table, Input, Avatar, Space, Button, Pagination, Select, message, Modal, Form, Row, Col, Spin } from "antd";
import { useState, useEffect } from "react";
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

    // Modal states
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [editingUserId, setEditingUserId] = useState<string | null>(null);
    const [editForm] = Form.useForm();

    const [loginByAdmin, { isLoading: isLoggingIn }] = useLoginByAdminMutation();
    const [updateUser, { isLoading: isUpdating }] = useUpdateAdminUserMutation();

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

    // Fetch single user for editing
    const { data: userData, isFetching: isFetchingUser } = useGetAdminUserQuery(
        { token, id: editingUserId },
        { skip: !editingUserId }
    );

    useEffect(() => {
        if (userData?.data && isModalVisible) {
            editForm.setFieldsValue({
                unioun: userData.data.unioun,
                names: userData.data.names || userData.data.name,
                email: userData.data.email,
                phone: userData.data.phone,
                position: userData.data.position,
                full_unioun_name: userData.data.full_unioun_name,
                gram: userData.data.gram,
                district: userData.data.district,
                thana: userData.data.thana,
                word: userData.data.word,
                description: userData.data.description,
                status: userData.data.status,
                role: userData.data.role,
                profile_picture: userData.data.profile_picture,
                image: userData.data.image,
                password: "", // Reset password field
            });
        }
    }, [userData, editForm, isModalVisible]);

    const handleEditClick = (id: string) => {
        setEditingUserId(id);
        setIsModalVisible(true);
    };

    const handleModalCancel = () => {
        setIsModalVisible(false);
        setEditingUserId(null);
        editForm.resetFields();
    };

    const onEditFinish = async (values: any) => {
        try {
            const updateData: any = { ...values };
            if (!values.password) {
                delete updateData.password;
            }

            const res = await updateUser({ token, id: editingUserId, data: updateData }).unwrap();
            if (res.status_code === 200 || res.status === "success") {
                message.success("ব্যবহারকারীর তথ্য সফলভাবে আপডেট করা হয়েছে");
                setIsModalVisible(false);
                setEditingUserId(null);
                editForm.resetFields();
                refetch();
            } else {
                message.error(res.message || "আপডেট করা সম্ভব হয়নি");
            }
        } catch (error: any) {
            console.error("Update error:", error);
            message.error(error?.data?.message || "একটি ত্রুটি ঘটেছে");
        }
    };

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
                <Space>
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
                    <Button
                        type="default"
                        size="small"
                        icon={<EditOutlined />}
                        onClick={() => handleEditClick(record.id)}
                        style={{
                            borderRadius: "6px",
                            color: "#0ea5e9",
                            borderColor: "#0ea5e9"
                        }}
                    >
                        সম্পাদনা
                    </Button>
                </Space>
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
        <div style={{ padding: window.innerWidth < 768 ? "12px" : "24px" }}>
            <div className="mb-4 d-flex justify-content-between align-items-center flex-wrap gap-3">
                <div>
                    <h2 style={{ fontWeight: 700, color: "#0f172a", marginBottom: "4px", fontSize: window.innerWidth < 768 ? "20px" : "24px" }}>
                        ব্যবহারকারী ম্যানেজমেন্ট
                    </h2>
                    <p style={{ color: "#64748b", margin: 0, fontSize: window.innerWidth < 768 ? "12px" : "14px" }}>
                        সিস্টেমের সকল ব্যবহারকারীদের তালিকা এবং তথ্য দেখুন
                    </p>
                </div>
                <Button
                    icon={<ReloadOutlined spin={isFetching} />}
                    onClick={() => refetch()}
                    style={{ borderRadius: "8px" }}
                    size={window.innerWidth < 768 ? "small" : "middle"}
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
                <div style={{ padding: window.innerWidth < 768 ? "10px" : "0 20px 20px 20px" }}>
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
                    padding: window.innerWidth < 768 ? "12px" : "20px",
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
                            flex: "1 1 100%",
                            maxWidth: window.innerWidth < 768 ? "100%" : "400px",
                            borderRadius: "10px",
                            height: window.innerWidth < 768 ? "40px" : "45px",
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
                            flex: "1 1 100%",
                            maxWidth: window.innerWidth < 768 ? "100%" : "200px",
                            height: window.innerWidth < 768 ? "40px" : "45px",
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

                <div className="desktop-table-view">
                    <Table
                        columns={columns}
                        dataSource={data?.data?.data}
                        loading={isLoading}
                        pagination={false}
                        rowKey="id"
                        scroll={{ x: 1000 }}
                        style={{ padding: "0" }}
                        className="custom-premium-table"
                    />
                </div>

                <div className="mobile-card-view" style={{ display: "none", padding: "12px" }}>
                    {isLoading || isFetching ? (
                        <div style={{ textAlign: "center", padding: "40px" }}>
                            <Spin />
                        </div>
                    ) : (
                        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                            {data?.data?.data?.map((record: any) => (
                                <Card
                                    key={record.id}
                                    style={{
                                        borderRadius: "12px",
                                        boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
                                        border: "1px solid #f1f5f9"
                                    }}
                                    bodyStyle={{ padding: "16px" }}
                                >
                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
                                        <Space>
                                            <Avatar
                                                src={record.profile_picture || record.image}
                                                icon={<UserOutlined />}
                                                style={{ backgroundColor: "#38bdf8" }}
                                                size="large"
                                            />
                                            <div>
                                                <div style={{ fontWeight: 700, color: "#1e293b", fontSize: "15px" }}>{record.names}</div>
                                                <div style={{ fontSize: "12px", color: "#64748b" }}>{record.email}</div>
                                            </div>
                                        </Space>
                                        <div style={{
                                            background: "#f0f9ff",
                                            color: "#0ea5e9",
                                            padding: "4px 8px",
                                            borderRadius: "6px",
                                            fontSize: "11px",
                                            fontWeight: 600
                                        }}>
                                            {(() => {
                                                const translations: Record<string, string> = {
                                                    Chairman: "চেয়ারম্যান",
                                                    Secretary: "সচিব",
                                                    UDC: "উদ্যোক্তা (UDC)",
                                                    Accountant: "হিসাব সহকারী",
                                                    "Asst-Accountant": "সহকারী হিসাব সহকারী",
                                                    Member: "সদস্য",
                                                };
                                                return translations[record.position] || record.position;
                                            })()}
                                        </div>
                                    </div>

                                    <div style={{ marginBottom: "12px" }}>
                                        <div style={{ color: "#94a3b8", fontSize: "10px", textTransform: "uppercase", marginBottom: "2px" }}>ইউনিয়ন তথ্য</div>
                                        <div style={{ fontWeight: 700, color: "#0f172a", fontSize: "14px" }}>
                                            {record.unioun_info?.full_name || record.unioun_info?.short_name_b || record.unioun}
                                        </div>
                                        {record.unioun_info && (
                                            <div style={{ fontSize: "11px", color: "#64748b" }}>
                                                {record.unioun_info.thana} ({record.unioun_info.thana_en}), {record.unioun_info.district} ({record.unioun_info.district_en})
                                            </div>
                                        )}
                                    </div>

                                    <div style={{
                                        display: "grid",
                                        gridTemplateColumns: "1fr 1fr",
                                        gap: "12px",
                                        fontSize: "12px",
                                        color: "#475569",
                                        marginBottom: "16px",
                                        background: "#f8fafc",
                                        padding: "10px",
                                        borderRadius: "8px"
                                    }}>
                                        <div>
                                            <div style={{ color: "#94a3b8", fontSize: "10px", textTransform: "uppercase", marginBottom: "2px" }}>ইউনিয়ন কোড</div>
                                            <div style={{ fontWeight: 600 }}>{record.unioun}</div>
                                        </div>
                                        <div>
                                            <div style={{ color: "#94a3b8", fontSize: "10px", textTransform: "uppercase", marginBottom: "2px" }}>ফোন</div>
                                            <div style={{ fontWeight: 600 }}>{record.phone || "N/A"}</div>
                                        </div>
                                        <div>
                                            <div style={{ color: "#94a3b8", fontSize: "10px", textTransform: "uppercase", marginBottom: "2px" }}>তৈরি হয়েছে</div>
                                            <div>{new Date(record.created_at).toLocaleDateString("bn-BD")}</div>
                                        </div>
                                        <div>
                                            <div style={{ color: "#94a3b8", fontSize: "10px", textTransform: "uppercase", marginBottom: "2px" }}>স্ট্যাটাস</div>
                                            <span style={{ color: record.status === 'active' ? '#10b981' : '#f43f5e', fontWeight: 600 }}>
                                                {record.status === 'active' ? 'সক্রিয়' : 'নিষ্ক্রিয়'}
                                            </span>
                                        </div>
                                    </div>

                                    <div style={{ display: "flex", gap: "8px" }}>
                                        <Button
                                            type="primary"
                                            size="middle"
                                            icon={<LoginOutlined />}
                                            onClick={() => handleImpersonate(record.email)}
                                            loading={isLoggingIn}
                                            style={{
                                                flex: 1,
                                                borderRadius: "8px",
                                                backgroundColor: "#10b981",
                                                borderColor: "#10b981",
                                                height: "38px"
                                            }}
                                        >
                                            লগইন
                                        </Button>
                                        <Button
                                            type="default"
                                            size="middle"
                                            icon={<EditOutlined />}
                                            onClick={() => handleEditClick(record.id)}
                                            style={{
                                                flex: 1,
                                                borderRadius: "8px",
                                                color: "#0ea5e9",
                                                borderColor: "#0ea5e9",
                                                height: "38px"
                                            }}
                                        >
                                            সম্পাদনা
                                        </Button>
                                    </div>
                                </Card>
                            ))}
                        </div>
                    )}
                </div>

                <div
                    style={{
                        padding: "20px",
                        display: "flex",
                        justifyContent: window.innerWidth < 768 ? "center" : "flex-end",
                        borderTop: "1px solid #f1f5f9",
                    }}
                >
                    <Pagination
                        current={page}
                        pageSize={perPage}
                        total={data?.data?.total || 0}
                        onChange={handlePageChange}
                        showSizeChanger={window.innerWidth > 768}
                        onShowSizeChange={handlePageChange}
                        size={window.innerWidth < 768 ? "small" : "default"}
                        itemRender={(_, type, originalElement) => {
                            if (type === "prev") return <a style={{ color: "#38bdf8" }}>{window.innerWidth < 768 ? <LeftOutlined /> : "পূর্ববর্তী"}</a>;
                            if (type === "next") return <a style={{ color: "#38bdf8" }}>{window.innerWidth < 768 ? <RightOutlined /> : "পরবর্তী"}</a>;
                            return originalElement;
                        }}
                    />
                </div>
            </Card>

            <Modal
                title={
                    <div style={{ fontSize: window.innerWidth < 768 ? "18px" : "20px", fontWeight: 700, color: "#1e293b" }}>
                        ব্যবহারকারী সম্পাদনা
                    </div>
                }
                open={isModalVisible}
                onCancel={handleModalCancel}
                footer={null}
                width={window.innerWidth < 768 ? "95%" : 800}
                centered
                style={{ top: window.innerWidth < 768 ? 10 : 100 }}
                styles={{ body: { padding: window.innerWidth < 768 ? "10px" : "24px", maxHeight: '80vh', overflowY: 'auto' } }}
            >
                {isFetchingUser ? (
                    <div style={{ textAlign: "center", padding: "40px" }}>
                        <Spin size="large" />
                    </div>
                ) : (
                    <Form
                        form={editForm}
                        layout="vertical"
                        onFinish={onEditFinish}
                        autoComplete="off"
                        style={{ padding: "10px" }}
                    >
                        <h4 style={{ color: "#334155", marginBottom: "20px", borderBottom: "1px solid #f1f5f9", paddingBottom: "10px" }}>বেসিক ইনফরমেশন</h4>
                        <Row gutter={24}>
                            <Col xs={24} md={12}>
                                <Form.Item label="নাম" name="names" rules={[{ required: true, message: "অনুগ্রহ করে নাম লিখুন" }]}>
                                    <Input prefix={<UserOutlined style={{ color: "#94a3b8" }} />} placeholder="নাম লিখুন" style={{ height: "45px", borderRadius: "8px" }} />
                                </Form.Item>
                            </Col>
                            <Col xs={24} md={12}>
                                <Form.Item label="ইমেইল" name="email" rules={[{ required: true, message: "অনুগ্রহ করে ইমেইল লিখুন" }, { type: "email", message: "সঠিক ইমেইল ফরম্যাট প্রদান করুন" }]}>
                                    <Input prefix={<MailOutlined style={{ color: "#94a3b8" }} />} placeholder="ইমেইল লিখুন" style={{ height: "45px", borderRadius: "8px" }} />
                                </Form.Item>
                            </Col>
                            <Col xs={24} md={12}>
                                <Form.Item label="ফোন" name="phone">
                                    <Input prefix={<PhoneOutlined style={{ color: "#94a3b8" }} />} placeholder="ফোন নম্বর লিখুন" style={{ height: "45px", borderRadius: "8px" }} />
                                </Form.Item>
                            </Col>
                            <Col xs={24} md={12}>
                                <Form.Item label="পদবী" name="position">
                                    <Select placeholder="পদবী নির্বাচন করুন" style={{ height: "45px" }}>
                                        <Select.Option value="Chairman">চেয়ারম্যান</Select.Option>
                                        <Select.Option value="Secretary">সচিব</Select.Option>
                                        <Select.Option value="UDC">উদ্যোক্তা (UDC)</Select.Option>
                                        <Select.Option value="Accountant">হিসাব সহকারী</Select.Option>
                                        <Select.Option value="Asst-Accountant">সহকারী হিসাব সহকারী</Select.Option>
                                        <Select.Option value="Member">সদস্য</Select.Option>
                                    </Select>
                                </Form.Item>
                            </Col>
                            <Col xs={24} md={12}>
                                <Form.Item label="রোল" name="role">
                                    <Input prefix={<DeploymentUnitOutlined style={{ color: "#94a3b8" }} />} placeholder="রোল লিখুন" style={{ height: "45px", borderRadius: "8px" }} />
                                </Form.Item>
                            </Col>
                            <Col xs={24} md={12}>
                                <Form.Item label="স্ট্যাটাস" name="status">
                                    <Select placeholder="স্ট্যাটাস নির্বাচন করুন" style={{ height: "45px" }}>
                                        <Select.Option value="active">Active</Select.Option>
                                        <Select.Option value="inactive">Inactive</Select.Option>
                                    </Select>
                                </Form.Item>
                            </Col>
                        </Row>

                        <h4 style={{ color: "#334155", margin: "20px 0", borderBottom: "1px solid #f1f5f9", paddingBottom: "10px" }}>ঠিকানা ও ইউনিয়ন তথ্য</h4>
                        <Row gutter={24}>
                            <Col xs={24} md={12}>
                                <Form.Item label="ইউনিয়ন" name="unioun">
                                    <Input prefix={<GlobalOutlined style={{ color: "#94a3b8" }} />} placeholder="ইউনিয়ন (slug)" style={{ height: "45px", borderRadius: "8px" }} />
                                </Form.Item>
                            </Col>
                            <Col xs={24} md={12}>
                                <Form.Item label="পুরো ইউনিয়নের নাম" name="full_unioun_name">
                                    <Input prefix={<GlobalOutlined style={{ color: "#94a3b8" }} />} placeholder="পুরো ইউনিয়নের নাম লিখুন" style={{ height: "45px", borderRadius: "8px" }} />
                                </Form.Item>
                            </Col>
                            <Col xs={24} md={12}>
                                <Form.Item label="উপজেলা/থানা" name="thana">
                                    <Input prefix={<HomeOutlined style={{ color: "#94a3b8" }} />} placeholder="থানা লিখুন" style={{ height: "45px", borderRadius: "8px" }} />
                                </Form.Item>
                            </Col>
                            <Col xs={24} md={12}>
                                <Form.Item label="জিলা" name="district">
                                    <Input prefix={<HomeOutlined style={{ color: "#94a3b8" }} />} placeholder="জিলা লিখুন" style={{ height: "45px", borderRadius: "8px" }} />
                                </Form.Item>
                            </Col>
                            <Col xs={24} md={8}>
                                <Form.Item label="গ্রাম" name="gram">
                                    <Input prefix={<HomeOutlined style={{ color: "#94a3b8" }} />} placeholder="গ্রাম লিখুন" style={{ height: "45px", borderRadius: "8px" }} />
                                </Form.Item>
                            </Col>
                            <Col xs={24} md={8}>
                                <Form.Item label="ওয়ার্ড" name="word">
                                    <Input prefix={<HomeOutlined style={{ color: "#94a3b8" }} />} placeholder="ওয়ার্ড নং লিখুন" style={{ height: "45px", borderRadius: "8px" }} />
                                </Form.Item>
                            </Col>
                            <Col xs={24} md={8}>
                                <Form.Item label="বিবরণ" name="description">
                                    <Input prefix={<InfoCircleOutlined style={{ color: "#94a3b8" }} />} placeholder="বিবরণ লিখুন" style={{ height: "45px", borderRadius: "8px" }} />
                                </Form.Item>
                            </Col>
                        </Row>

                        <h4 style={{ color: "#334155", margin: "20px 0", borderBottom: "1px solid #f1f5f9", paddingBottom: "10px" }}>অতিরিক্ত তথ্য ও নিরাপত্তা</h4>
                        <Row gutter={24}>
                            <Col xs={24} md={12}>
                                <Form.Item label="প্রোফাইল পিকচার (URL)" name="profile_picture">
                                    <Input prefix={<PictureOutlined style={{ color: "#94a3b8" }} />} placeholder="প্রোফাইল পিকচার URL লিখুন" style={{ height: "45px", borderRadius: "8px" }} />
                                </Form.Item>
                            </Col>
                            <Col xs={24} md={12}>
                                <Form.Item label="ইমেজ (URL)" name="image">
                                    <Input prefix={<PictureOutlined style={{ color: "#94a3b8" }} />} placeholder="ইমেজ URL লিখুন" style={{ height: "45px", borderRadius: "8px" }} />
                                </Form.Item>
                            </Col>
                            <Col xs={24} md={12}>
                                <Form.Item label="নতুন পাসওয়ার্ড (ঐচ্ছিক)" name="password" rules={[{ min: 8, message: "পাসওয়ার্ড কমপক্ষে ৮ অক্ষরের হতে হবে" }]}>
                                    <Input.Password prefix={<LockOutlined style={{ color: "#94a3b8" }} />} placeholder="নতুন পাসওয়ার্ড লিখুন" style={{ height: "45px", borderRadius: "8px" }} />
                                </Form.Item>
                            </Col>
                        </Row>

                        <div style={{ marginTop: "30px", borderTop: "1px solid #f1f5f9", paddingTop: "20px", textAlign: "right" }}>
                            <Space>
                                <Button onClick={handleModalCancel} style={{ height: "45px", borderRadius: "8px" }}>
                                    বাতিল
                                </Button>
                                <Button
                                    type="primary"
                                    htmlType="submit"
                                    icon={<SaveOutlined />}
                                    loading={isUpdating}
                                    style={{
                                        height: "45px",
                                        borderRadius: "8px",
                                        paddingLeft: "30px",
                                        paddingRight: "30px",
                                        backgroundColor: "#0ea5e9",
                                        borderColor: "#0ea5e9",
                                        fontWeight: 600
                                    }}
                                >
                                    আপডেট করুন
                                </Button>
                            </Space>
                        </div>
                    </Form>
                )}
            </Modal>

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
            justify-content: center;
            width: 100%;
          }
          .desktop-table-view {
            display: none !important;
          }
          .mobile-card-view {
            display: block !important;
          }
        }
      `}</style>
        </div>
    );
};

export default UserManagement;
