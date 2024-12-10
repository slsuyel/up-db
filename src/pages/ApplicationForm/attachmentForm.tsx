import { useState } from "react";
import { Form, Input, Select } from "antd";

const { Option } = Select;

const AttachmentForm = () => {
  const [attachmentType, setAttachmentType] = useState("national_id");
  const [frontPreview, setFrontPreview] = useState<string | null>(null);
  const [backPreview, setBackPreview] = useState<string | null>(null);
  const [birthCertificatePreview, setBirthCertificatePreview] = useState<
    string | null
  >(null);

  const handleAttachmentTypeChange = (value: string) => {
    setAttachmentType(value);
    setFrontPreview(null);
    setBackPreview(null);
    setBirthCertificatePreview(null);
  };

  const handleFileChange = (
    event: React.ChangeEvent<HTMLInputElement>,
    setPreview: React.Dispatch<React.SetStateAction<string | null>>
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      const previewUrl = URL.createObjectURL(file);
      setPreview(previewUrl);
    }
  };

  return (
    <div className="row mx-auto">
      <div className="col-md-12">
        <div className="app-heading">সংযুক্ত</div>
      </div>
      <div className="col-md-12 row mb-3">
        <div className="col-md-4">
          <Form.Item
            initialValue="national_id"
            name="attachment_type"
            label="সংযুক্তির ধরণ"
          >
            <Select
              style={{ height: 40, width: "100%" }}
              placeholder="নির্বাচন করুন"
              onChange={handleAttachmentTypeChange}
            >
              <Option value="national_id">জাতীয় পরিচয়পত্র</Option>
              <Option value="birthCertificate">জন্ম নিবন্ধন</Option>
            </Select>
          </Form.Item>
        </div>
      </div>
      {attachmentType === "national_id" && (
        <>
          <div className="col-md-4">
            <Form.Item
              name="applicant_national_id_front_attachment"
              label="Upload National ID Front"
              // rules={[
              //   {
              //     required: true,
              //     message: "Please upload the front side of your ID",
              //   },
              // ]}
            >
              <div>
                <Input
                  type="file"
                  onChange={(e) => handleFileChange(e, setFrontPreview)}
                />
                {frontPreview && (
                  <img
                    src={frontPreview}
                    alt="National ID Front Preview"
                    className="border img-thumbnail"
                    style={{ width: "100%", marginTop: 10 }}
                  />
                )}
              </div>
            </Form.Item>
          </div>
          <div className="col-md-4">
            <Form.Item
              name="applicant_national_id_back_attachment"
              label="পেছনের পাতা (জাতীয় পরিচয়পত্র)"
            >
              <div>
                <Input
                  type="file"
                  onChange={(e) => handleFileChange(e, setBackPreview)}
                />
                {backPreview && (
                  <img
                    src={backPreview}
                    alt="National ID Back Preview"
                    className="border img-thumbnail"
                    style={{ width: "100%", marginTop: 10 }}
                  />
                )}
              </div>
            </Form.Item>
          </div>
        </>
      )}
      {attachmentType === "birthCertificate" && (
        <>
          <div className="col-md-4">
            <Form.Item
              name="applicant_birth_certificate_attachment"
              label="জন্ম নিবন্ধন"
              rules={[
                {
                  required: true,
                  message: "জন্ম নিবন্ধন ফাইল আপলোড করুন!",
                },
              ]}
            >
              <div>
                <Input
                  type="file"
                  onChange={(e) =>
                    handleFileChange(e, setBirthCertificatePreview)
                  }
                />
                {birthCertificatePreview && (
                  <img
                    src={birthCertificatePreview}
                    alt="Birth Certificate Preview"
                    className="border img-thumbnail"
                    style={{ width: "100%", marginTop: 10 }}
                  />
                )}
              </div>
            </Form.Item>
          </div>
        </>
      )}
    </div>
  );
};

export default AttachmentForm;
