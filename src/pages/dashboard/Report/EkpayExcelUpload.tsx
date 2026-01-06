import { useEkpayReportUploadMutation } from "@/redux/features/payment/paymentApi";
import { UploadOutlined, FileExcelOutlined } from "@ant-design/icons";
import { Button, message, Upload, Modal } from "antd";
import { useState } from "react";

export default function EkpayExcelUpload() {
    const token = localStorage.getItem("token");
    const [file, setFile] = useState<File | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [uploadExcel, { isLoading }] = useEkpayReportUploadMutation();

    const handleSubmit = async () => {
        if (!file) {
            message.error("Please select an Excel file.");
            return;
        }

        const formData = new FormData();
        formData.append("excel_file", file);

        try {
            const res = await uploadExcel({ formData, token }).unwrap();
            if (res.status === "success" || res.data) {
                message.success("File uploaded successfully!");
                setFile(null);
                setIsModalOpen(false);
            } else {
                message.error("Upload failed!");
            }
            console.log(res);
        } catch (err) {
            message.error("Upload failed!");
        }
    };

    return (
        <div className="d-inline-block">
            <Button
                icon={<FileExcelOutlined />}
                onClick={() => setIsModalOpen(true)}
            >
                Excel File Upload
            </Button>

            <Modal
                title="Excel File Upload"
                open={isModalOpen}
                onOk={handleSubmit}
                onCancel={() => setIsModalOpen(false)}
                confirmLoading={isLoading}
                okText="Upload"
            >
                <div className="py-3 text-center">
                    <Upload
                        beforeUpload={(file) => {
                            setFile(file);
                            return false;
                        }}
                        accept=".xlsx,.xls"
                        maxCount={1}
                        fileList={file ? [file as any] : []}
                        onRemove={() => setFile(null)}
                    >
                        <Button icon={<UploadOutlined />}>
                            Select Excel File
                        </Button>
                    </Upload>
                    <small className="text-muted mt-2 d-block">
                        Upload the Ekpay report Excel file (.xlsx or .xls)
                    </small>
                </div>
            </Modal>
        </div>
    );
}
