import React from "react";
import { Card, Form, Button, Spinner } from "react-bootstrap";

export interface EkpayValues {
  EKPAY_IPN_URL: string;    // corrected from AKPAY_IPN_URL -> EKPAY_IPN_URL
  WHITE_LIST_IP: string;
}

export interface EkpaySettingsProps {
  value?: EkpayValues;
  onChange?: (next: EkpayValues) => void;
  onSave?: (() => void) | null;
  isSaving?: boolean;
}

const defaultValues: EkpayValues = {
  EKPAY_IPN_URL: "",
  WHITE_LIST_IP: "",
};

export const EkpaySettings: React.FC<EkpaySettingsProps> = ({
  value = defaultValues,
  onChange = () => { },
  onSave = null,
  isSaving = false,
}) => {
  const handleChange = (key: keyof EkpayValues, v: string) =>
    onChange({ ...value, [key]: v });

  const handleSubmit: React.FormEventHandler<HTMLFormElement> = (e) => {
    e.preventDefault();
    if (typeof onSave === "function") onSave();
    else
      console.warn(
        "EkpaySettings: onSave not provided; parent Save Active Tab will be used."
      );
  };

  return (
    <Card className="m-3 p-3 border-0 shadow-sm rounded-4">
      <Card.Body>
        <h5 className="fw-bold mb-4">একপে সেটিংস</h5>
        <p className="text-muted small mb-4">একপে ইন্টিগ্রেশনের জন্য IPN URL এবং হোয়াইটলিস্ট আইপি কনফিগার করুন।</p>

        <Form onSubmit={handleSubmit}>
          {/* IPN URL */}
          <Form.Group className="mb-3" controlId="ekpayIpnUrl">
            <Form.Label>একপে আইপিএন (IPN) URL</Form.Label>
            <Form.Control
              placeholder="https://api.example.com/ipn"
              value={value.EKPAY_IPN_URL ?? ""}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                handleChange("EKPAY_IPN_URL", e.target.value)
              }
            />
          </Form.Group>

          {/* White List IP */}
          <Form.Group className="mb-3" controlId="whiteListIp">
            <Form.Label>হোয়াইটলিস্ট আইপি (White List IP)</Form.Label>
            <Form.Control
              placeholder="203.161.62.45"
              value={value.WHITE_LIST_IP ?? ""}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                handleChange("WHITE_LIST_IP", e.target.value)
              }
            />
          </Form.Group>

          {onSave ? (
            <Button type="submit" disabled={isSaving}>
              {isSaving ? <Spinner size="sm" animation="border" /> : "সংরক্ষণ করুন"}
            </Button>
          ) : (
            <div className="text-muted small mt-3">
              পরিবর্তনগুলো সেভ করতে উপরের <strong>"সংরক্ষণ করুন"</strong> বাটনটি ব্যবহার করুন।
            </div>
          )}
        </Form>
      </Card.Body>
    </Card>
  );
};

export default EkpaySettings;
