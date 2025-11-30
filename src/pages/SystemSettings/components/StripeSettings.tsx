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
  onChange = () => {},
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
    <Card className="m-3 p-3">
      <Card.Body>
        <h4>Stripe Settings</h4>

        <Form onSubmit={handleSubmit}>
          {/* Publishable Key */}
          <Form.Group className="mb-3" controlId="stripeKey">
            <Form.Label>Publishable Key</Form.Label>
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
            <Form.Label>Secret Key</Form.Label>
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
                {showPassword ? "Hide" : "Show"}
              </Button>
            </div>
          </Form.Group>

          {/* Webhook Secret */}
          <Form.Group className="mb-3" controlId="webhookSecret">
            <Form.Label>Webhook Secret</Form.Label>
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
              {isSaving ? <Spinner size="sm" animation="border" /> : "Save"}
            </Button>
          ) : (
            <div className="text-muted">
              Use <strong>Save Active Tab</strong> (parent button) to update settings.
            </div>
          )}
        </Form>
      </Card.Body>
    </Card>
  );
};

export default StripeSettings;
