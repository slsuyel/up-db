import { useEkpayGoogleSheetUploadMutation } from "@/redux/features/payment/paymentApi";
import { LinkOutlined } from "@ant-design/icons";
import { Button, Input, message, Modal } from "antd";
import { useState } from "react";

export default function EkpayGoogleSheetUpload() {
    const token = localStorage.getItem("token");
    const [sheetUrl, setSheetUrl] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [uploadGoogleSheet, { isLoading }] = useEkpayGoogleSheetUploadMutation();

    const handleSubmit = async () => {
        if (!sheetUrl) {
            message.error("Please enter a Google Sheet URL.");
            return;
        }

        try {
            const res = await uploadGoogleSheet({
                data: { sheet_url: sheetUrl },
                token
            }).unwrap();

            if (res.status === "success" || res.data) {
                message.success("Google Sheet processing started successfully!");
                setSheetUrl("");
                setIsModalOpen(false);
            } else {
                message.error(res.message || "Upload failed!");
            }
            console.log(res);
        } catch (err: any) {
            message.error(err?.data?.message || "Upload failed!");
            console.error(err);
        }
    };

    return (
        <div className="d-inline-block">
            <Button
                icon={<LinkOutlined />}
                onClick={() => setIsModalOpen(true)}
            >
                Google Sheet Upload
            </Button>

            <Modal
                title="Google Sheet Upload"
                open={isModalOpen}
                onOk={handleSubmit}
                onCancel={() => setIsModalOpen(false)}
                confirmLoading={isLoading}
                okText="Upload"
            >
                <div className="py-3">
                    <label className="form-label fw-bold mb-2">Google Sheet URL</label>
                    <Input
                        placeholder="Enter Google Sheet URL"
                        value={sheetUrl}
                        onChange={(e) => setSheetUrl(e.target.value)}
                        prefix={<LinkOutlined className="text-muted" />}
                    />
                    <small className="text-muted mt-2 d-block">
                        Make sure the sheet is public or the service account has access.
                    </small>
                </div>
            </Modal>
        </div>
    );
}
