import React, { useState } from "react";
import { Card, Form, Button, Spinner } from "react-bootstrap";

export interface EmailValues {
  MAIL_MAILER: string;
  MAIL_HOST: string;
  MAIL_PORT: string;
  MAIL_USERNAME: string;
  MAIL_PASSWORD: string;
  MAIL_ENCRYPTION: string;
  MAIL_FROM_ADDRESS: string;
  MAIL_FROM_NAME: string;
}

export interface EmailSettingsProps {
  value?: EmailValues;
  onChange?: (next: EmailValues) => void;
  onSave?: (() => void) | null;
  isSaving?: boolean;
}

const defaultValues: EmailValues = {
  MAIL_MAILER: "smtp",
  MAIL_HOST: "",
  MAIL_PORT: "587",
  MAIL_USERNAME: "",
  MAIL_PASSWORD: "",
  MAIL_ENCRYPTION: "tls",
  MAIL_FROM_ADDRESS: "",
  MAIL_FROM_NAME: "",
};

export const EmailSettings: React.FC<EmailSettingsProps> = ({
  value = defaultValues,
  onChange = () => { },
  onSave = null,
  isSaving = false,
}) => {
  const handleChange = (key: keyof EmailValues, v: string) =>
    onChange({ ...value, [key]: v });

  const handleSubmit: React.FormEventHandler<HTMLFormElement> = (e) => {
    e.preventDefault();
    if (typeof onSave === "function") onSave();
    else console.warn("EmailSettings: onSave not provided; use parent Save Active Tab.");
  };

  const [showPassword, setShowPassword] = useState<boolean>(false);

  return (
    <Card className="m-3 p-3 border-0 shadow-sm rounded-4">
      <Card.Body>
        <h5 className="fw-bold mb-4">ইমেইল সেটিংস</h5>

        <Form onSubmit={handleSubmit}>
          {/* Mailer */}
          <Form.Group className="mb-3" controlId="mailMailer">
            <Form.Label>মেইল ড্রাইভার</Form.Label>
            <Form.Select
              value={value.MAIL_MAILER}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                handleChange("MAIL_MAILER", e.target.value)
              }
            >
              <option value="smtp">smtp</option>
              <option value="sendmail">sendmail</option>
              <option value="mailgun">mailgun</option>
              <option value="ses">ses</option>
              <option value="log">log</option>
            </Form.Select>
          </Form.Group>

          {/* Host */}
          <Form.Group className="mb-3" controlId="mailHost">
            <Form.Label>মেইল হোস্ট</Form.Label>
            <Form.Control
              value={value.MAIL_HOST}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                handleChange("MAIL_HOST", e.target.value)
              }
              placeholder="উদাঃ smtp.mailtrap.io"
            />
          </Form.Group>

          {/* Port */}
          <Form.Group className="mb-3" controlId="mailPort">
            <Form.Label>মেইল পোর্ট</Form.Label>
            <Form.Control
              value={value.MAIL_PORT}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                handleChange("MAIL_PORT", e.target.value)
              }
              placeholder="উদাঃ 587"
            />
          </Form.Group>

          {/* Username */}
          <Form.Group className="mb-3" controlId="mailUsername">
            <Form.Label>মেইল ইউজারনেম</Form.Label>
            <Form.Control
              value={value.MAIL_USERNAME}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                handleChange("MAIL_USERNAME", e.target.value)
              }
              placeholder="আপনার মেইল ইউজারনেম"
            />
          </Form.Group>

          {/* Password */}
          <Form.Group className="mb-3" controlId="mailPassword">
            <Form.Label>মেইল পাসওয়ার্ড</Form.Label>
            <div className="input-group">
              <Form.Control
                type={showPassword ? "text" : "password"}
                value={value.MAIL_PASSWORD}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  handleChange("MAIL_PASSWORD", e.target.value)
                }
                placeholder="আপনার মেইল পাসওয়ার্ড"
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

          {/* Encryption */}
          <Form.Group className="mb-3" controlId="mailEncryption">
            <Form.Label>মেইল এনক্রিপশন</Form.Label>
            <Form.Select
              value={value.MAIL_ENCRYPTION}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                handleChange("MAIL_ENCRYPTION", e.target.value)
              }
            >
              <option value="tls">TLS</option>
              <option value="ssl">SSL</option>
              <option value="">None</option>
            </Form.Select>
          </Form.Group>

          {/* From Email */}
          <Form.Group className="mb-3" controlId="mailFromAddress">
            <Form.Label>প্রেরকের ইমেইল (From Address)</Form.Label>
            <Form.Control
              value={value.MAIL_FROM_ADDRESS}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                handleChange("MAIL_FROM_ADDRESS", e.target.value)
              }
              placeholder="উদাঃ no-reply@example.com"
            />
          </Form.Group>

          {/* From Name */}
          <Form.Group className="mb-3" controlId="mailFromName">
            <Form.Label>প্রেরকের নাম (From Name)</Form.Label>
            <Form.Control
              value={value.MAIL_FROM_NAME}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                handleChange("MAIL_FROM_NAME", e.target.value)
              }
              placeholder="উদাঃ ইউনিয়ন পরিষদ"
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

export default EmailSettings;
