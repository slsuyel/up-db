import React, { useState } from "react";
import { Card, Form, Button, Spinner } from "react-bootstrap";

export interface BkashValues {
  BKASH_APP_KEY: string;
  BKASH_APP_SECRET: string;
  BKASH_USERNAME: string;
  BKASH_PASSWORD: string;
  BKASH_BASE_URL: string;
}

export interface BkashSettingsProps {
  value?: BkashValues;
  onChange?: (next: BkashValues) => void;
  onSave?: (() => void) | null;
  isSaving?: boolean;
}

const defaultValues: BkashValues = {
  BKASH_APP_KEY: "",
  BKASH_APP_SECRET: "",
  BKASH_USERNAME: "",
  BKASH_PASSWORD: "",
  BKASH_BASE_URL: "",
};

export const BkashSettings: React.FC<BkashSettingsProps> = ({
  value = defaultValues,
  onChange = () => { },
  onSave = null,
  isSaving = false,
}) => {
  const handleChange = (key: keyof BkashValues, v: string) =>
    onChange({ ...value, [key]: v });

  const handleSubmit: React.FormEventHandler<HTMLFormElement> = (e) => {
    e.preventDefault();
    if (typeof onSave === "function") onSave();
    else console.warn("BkashSettings: onSave not provided; using parent Save Active Tab.");
  };

  const [showSecret, setShowSecret] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState<boolean>(false);

  return (
    <Card className="m-3 p-3 border-0 shadow-sm rounded-4">
      <Card.Body>
        <h5 className="fw-bold mb-4">বিকাশ পেমেন্ট সেটিংস</h5>
        <p className="text-muted small mb-4">বিকাশ ক্রেডেনশিয়াল এবং API বেস URL কনফিগার করুন।</p>

        <Form onSubmit={handleSubmit}>
          {/* App Key */}
          <Form.Group className="mb-3" controlId="bkashAppKey">
            <Form.Label>বিকাশ অ্যাপ কী (App Key)</Form.Label>
            <Form.Control
              value={value.BKASH_APP_KEY ?? ""}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                handleChange("BKASH_APP_KEY", e.target.value)
              }
              placeholder="আপনার বিকাশ App Key"
            />
          </Form.Group>

          {/* App Secret */}
          <Form.Group className="mb-3" controlId="bkashAppSecret">
            <Form.Label>বিকাশ অ্যাপ সিক্রেট (App Secret)</Form.Label>
            <div className="input-group">
              <Form.Control
                type={showSecret ? "text" : "password"}
                value={value.BKASH_APP_SECRET ?? ""}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  handleChange("BKASH_APP_SECRET", e.target.value)
                }
                placeholder="আপনার বিকাশ App Secret"
              />
              <Button
                variant="outline-secondary"
                onClick={() => setShowSecret((s) => !s)}
                type="button"
              >
                {showSecret ? "লুকান" : "দেখুন"}
              </Button>
            </div>
          </Form.Group>

          {/* Username */}
          <Form.Group className="mb-3" controlId="bkashUsername">
            <Form.Label>বিকাশ ইউজারনেম (Username)</Form.Label>
            <Form.Control
              value={value.BKASH_USERNAME ?? ""}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                handleChange("BKASH_USERNAME", e.target.value)
              }
              placeholder="আপনার বিকাশ ইউজারনেম"
            />
          </Form.Group>

          {/* Password */}
          <Form.Group className="mb-3" controlId="bkashPassword">
            <Form.Label>বিকাশ পাসওয়ার্ড (Password)</Form.Label>
            <div className="input-group">
              <Form.Control
                type={showPassword ? "text" : "password"}
                value={value.BKASH_PASSWORD ?? ""}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  handleChange("BKASH_PASSWORD", e.target.value)
                }
                placeholder="আপনার বিকাশ পাসওয়ার্ড"
              />
              <Button
                variant="outline-secondary"
                onClick={() => setShowPassword((s) => !s)}
                type="button"
              >
                {showPassword ? "লুকান" : "দেখুন"}
              </Button>
            </div>
          </Form.Group>

          {/* Base URL */}
          <Form.Group className="mb-3" controlId="bkashBaseUrl">
            <Form.Label>বিকাশ API বেস URL</Form.Label>
            <Form.Control
              value={value.BKASH_BASE_URL ?? ""}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                handleChange("BKASH_BASE_URL", e.target.value)
              }
              placeholder="উদাঃ https://checkout.sandbox.bka.sh/v1.2.0-beta"
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

export default BkashSettings;
