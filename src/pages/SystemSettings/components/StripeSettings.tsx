import React, { useState } from "react";
import { Card, Form, Button, Spinner } from "react-bootstrap";

export interface StripeValues {
  STRIPE_SECRET: string;
  STRIPE_KEY: string;
  STRIPE_WEBHOOK_SECRET: string;
}

export interface StripeSettingsProps {
  value?: StripeValues;
  onChange?: (next: StripeValues) => void;
  onSave?: (() => void) | null;
  isSaving?: boolean;
}

const defaultValues: StripeValues = {
  STRIPE_SECRET: "",
  STRIPE_KEY: "",
  STRIPE_WEBHOOK_SECRET: "",
};

export const StripeSettings: React.FC<StripeSettingsProps> = ({
  value = defaultValues,
  onChange = () => { },
  onSave = null,
  isSaving = false,
}) => {
  const handleChange = (key: keyof StripeValues, val: string) => {
    onChange({ ...value, [key]: val });
  };

  const handleSubmit: React.FormEventHandler<HTMLFormElement> = (e) => {
    e.preventDefault();
    if (typeof onSave === "function") onSave();
    else
      console.warn(
        "StripeSettings: onSave not provided; parent Save Active Tab will be used."
      );
  };

  const [showPassword, setShowPassword] = useState<boolean>(false);

  return (
    <Card className="m-3 p-3 border-0 shadow-sm rounded-4">
      <Card.Body>
        <h5 className="fw-bold mb-4">স্ট্রাইপ পেমেন্ট সেটিংস</h5>

        <Form onSubmit={handleSubmit}>
          {/* Publishable Key */}
          <Form.Group className="mb-3" controlId="stripeKey">
            <Form.Label>পাবলিশেবল কী (Publishable Key)</Form.Label>
            <Form.Control
              placeholder="pk_live_..."
              value={value.STRIPE_KEY}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                handleChange("STRIPE_KEY", e.target.value)
              }
            />
          </Form.Group>

          {/* Secret Key */}
          <Form.Group className="mb-3" controlId="stripeSecret">
            <Form.Label>সিক্রেট কী (Secret Key)</Form.Label>
            <div className="input-group">
              <Form.Control
                type={showPassword ? "text" : "password"}
                value={value.STRIPE_SECRET}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  handleChange("STRIPE_SECRET", e.target.value)
                }
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

          {/* Webhook Secret */}
          <Form.Group className="mb-3" controlId="webhookSecret">
            <Form.Label>ওয়েবহুক সিক্রেট (Webhook Secret)</Form.Label>
            <Form.Control
              placeholder="whsec_..."
              value={value.STRIPE_WEBHOOK_SECRET}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                handleChange("STRIPE_WEBHOOK_SECRET", e.target.value)
              }
            />
          </Form.Group>

          {/* Save Button */}
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

export default StripeSettings;
