import React, { useState } from "react";
import { Card, Form, Button, Spinner } from "react-bootstrap";

export interface SMSNOCValues {
  SMSNOC_API_KEY: string;
  SMSNOC_SENDER_ID: string;
}

export interface SMSNOCSettingsProps {
  value?: SMSNOCValues;
  onChange?: (next: SMSNOCValues) => void;
  onSave?: (() => void) | null;
  isSaving?: boolean;
}

const defaultValues: SMSNOCValues = {
  SMSNOC_API_KEY: "",
  SMSNOC_SENDER_ID: "",
};

export const SMSNOCSettings: React.FC<SMSNOCSettingsProps> = ({
  value = defaultValues,
  onChange = () => { },
  onSave = null,
  isSaving = false,
}) => {
  const handleChange = (key: keyof SMSNOCValues, v: string) =>
    onChange({ ...value, [key]: v });

  const handleSubmit: React.FormEventHandler<HTMLFormElement> = (e) => {
    e.preventDefault();
    if (typeof onSave === "function") onSave();
    else
      console.warn(
        "SMSNOCSettings: onSave not provided; using parent Save Active Tab."
      );
  };

  const [showPassword, setShowPassword] = useState<boolean>(false);

  return (
    <Card className="m-3 p-3 border-0 shadow-sm rounded-4">
      <Card.Body>
        <h5 className="fw-bold mb-4">এসএমএস নক (SMSNOC) সেটিংস</h5>
        <p className="text-muted small mb-4">API কী এবং সেন্ডার আইডি কনফিগার করুন।</p>

        <Form onSubmit={handleSubmit}>
          {/* API Key */}
          <Form.Group className="mb-3" controlId="smsncoApiKey">
            <Form.Label>SMSNOC API কী</Form.Label>
            <div className="input-group">
              <Form.Control
                type={showPassword ? "text" : "password"}
                value={value.SMSNOC_API_KEY}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  handleChange("SMSNOC_API_KEY", e.target.value)
                }
                placeholder="আপনার SMSNOC API Key"
              />
              <Button
                variant="outline-secondary"
                type="button"
                onClick={() => setShowPassword((s) => !s)}
              >
                {showPassword ? "লুকান" : "দেখুন"}
              </Button>
            </div>
          </Form.Group>

          {/* Sender ID */}
          <Form.Group className="mb-3" controlId="smsncoSenderId">
            <Form.Label>SMSNOC সেন্ডার আইডি (Sender ID)</Form.Label>
            <Form.Control
              placeholder="8809617XXXXXX"
              value={value.SMSNOC_SENDER_ID}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                handleChange("SMSNOC_SENDER_ID", e.target.value)
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

export default SMSNOCSettings;
