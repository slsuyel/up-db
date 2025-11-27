import { useEkpayReportUploadMutation } from "@/redux/features/payment/paymentApi";
import { UploadOutlined } from "@ant-design/icons";
import { Button, message, Upload } from "antd";
import { useState } from "react";

export default function EkpayExcelUpload() {
    const token = localStorage.getItem("token");
    const [file, setFile] = useState<File | null>(null);
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
            if (res.data) {
                message.success("File uploaded successfully!");
            }
            // message.success("File uploaded successfully!")
            console.log(res);
        } catch (err) {
            message.error("Upload failed!");
        }
    };

    return (
        <div className="d-flex justify-content-between align-items-center gap-3">

            <Upload
                beforeUpload={(file) => {
                    setFile(file);
                    return false;
                }}
                accept=".xlsx,.xls"
                maxCount={1}
            >
                <Button icon={<UploadOutlined />} className="mt-4">
                    Select Excel File
                </Button>
            </Upload>

            <Button
                type="primary"
                loading={isLoading}
                onClick={handleSubmit}
                className="mt-4"
            >
                {isLoading ? "Uploading..." : "Upload"}
            </Button>
        </div>
    );
}
