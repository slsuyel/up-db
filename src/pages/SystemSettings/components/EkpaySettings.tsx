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
  onChange = () => {},
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
    <Card className="m-3 p-3">
      <Card.Body>
        <h4>EKPay Settings</h4>
        <p>Configure IPN URL and white-listed IPs for EKPay integration.</p>

        <Form onSubmit={handleSubmit}>
          {/* IPN URL */}
          <Form.Group className="mb-3" controlId="ekpayIpnUrl">
            <Form.Label>EKPay IPN URL</Form.Label>
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
            <Form.Label>White List IP</Form.Label>
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
              {isSaving ? <Spinner size="sm" animation="border" /> : "Save"}
            </Button>
          ) : (
            <div className="text-muted">
              Use <strong>Save Active Tab</strong> button to persist changes.
            </div>
          )}
        </Form>
      </Card.Body>
    </Card>
  );
};

export default EkpaySettings;
