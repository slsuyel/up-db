import React from "react";
import { Button, Result } from "antd";
import { useNavigate } from "react-router-dom";
import { HomeOutlined, ArrowLeftOutlined } from "@ant-design/icons";

const NotFound: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div
            style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                minHeight: "60vh",
                padding: "40px 20px",
            }}
        >
            <Result
                status="404"
                title={
                    <span style={{
                        fontSize: "72px",
                        fontWeight: 800,
                        background: "linear-gradient(135deg, #1e293b 0%, #38bdf8 100%)",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                        letterSpacing: "-2px"
                    }}>
                        404
                    </span>
                }
                subTitle={
                    <div style={{ marginTop: "10px" }}>
                        <h2 style={{ fontSize: "24px", color: "#1e293b", fontWeight: 700, marginBottom: "8px" }}>
                            দুঃখিত, পাতাটি খুঁজে পাওয়া যায়নি!
                        </h2>
                        <p style={{ color: "#64748b", fontSize: "16px", maxWidth: "400px", margin: "0 auto" }}>
                            আপনি যে পাতাটি খুঁজছেন তা হয়তো সরিয়ে ফেলা হয়েছে অথবা লিংকটি ভুল।
                        </p>
                    </div>
                }
                extra={
                    <div style={{ display: "flex", gap: "12px", justifyContent: "center", marginTop: "20px" }}>
                        <Button
                            size="large"
                            icon={<ArrowLeftOutlined />}
                            onClick={() => navigate(-1)}
                            style={{
                                borderRadius: "10px",
                                fontWeight: 600,
                                height: "48px",
                                padding: "0 24px",
                                border: "1px solid rgba(0,0,0,0.1)"
                            }}
                        >
                            পেছনে ফিরে যান
                        </Button>
                        <Button
                            type="primary"
                            size="large"
                            icon={<HomeOutlined />}
                            onClick={() => navigate("/dashboard")}
                            style={{
                                borderRadius: "10px",
                                fontWeight: 600,
                                height: "48px",
                                padding: "0 24px",
                                background: "linear-gradient(135deg, #38bdf8 0%, #0ea5e9 100%)",
                                border: "none",
                                boxShadow: "0 4px 15px rgba(56, 189, 248, 0.3)"
                            }}
                        >
                            ড্যাশবোর্ডে ফিরুন
                        </Button>
                    </div>
                }
            />
            <style>{`
        .ant-result-icon {
          margin-bottom: 0 !important;
        }
        .ant-result-title {
          line-height: 1 !important;
          margin-bottom: 0 !important;
        }
      `}</style>
        </div>
    );
};

export default NotFound;
