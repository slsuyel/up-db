import React, { useState } from "react";
import { Card, Form, Button, Spinner } from "react-bootstrap";

export interface GoogleContactValues {
  GOOGLE_CLIENT_ID: string;
  GOOGLE_CLIENT_SECRET: string;
  GOOGLE_REDIRECT_URI: string;
}

export interface GoogleContactSettingsProps {
  value?: GoogleContactValues;
  onChange?: (next: GoogleContactValues) => void;
  onSave?: (() => void) | null;
  isSaving?: boolean;
}

const defaultValues: GoogleContactValues = {
  GOOGLE_CLIENT_ID: "",
  GOOGLE_CLIENT_SECRET: "",
  GOOGLE_REDIRECT_URI: "",
};

export const GoogleContactSettings: React.FC<GoogleContactSettingsProps> = ({
  value = defaultValues,
  onChange = () => {},
  onSave = null,
  isSaving = false,
}) => {
  const handleChange = (key: keyof GoogleContactValues, v: string) =>
    onChange({ ...value, [key]: v });

  const handleSubmit: React.FormEventHandler<HTMLFormElement> = (e) => {
    e.preventDefault();
    if (typeof onSave === "function") onSave();
    else
      console.warn(
        "GoogleContactSettings: onSave not provided; parent Save Active Tab will handle submit."
      );
  };

  const [showPassword, setShowPassword] = useState<boolean>(false);

  return (
    <Card className="m-3 p-3">
      <Card.Body>
        <h4>Google Contact Settings</h4>
        <p>Configure Google OAuth Client, Secret, and Redirect URL.</p>

        <Form onSubmit={handleSubmit}>
          {/* Client ID */}
          <Form.Group className="mb-3" controlId="googleClientId">
            <Form.Label>Google Client ID</Form.Label>
            <Form.Control
              placeholder="your-client-id.apps.googleusercontent.com"
              value={value.GOOGLE_CLIENT_ID}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                handleChange("GOOGLE_CLIENT_ID", e.target.value)
              }
            />
          </Form.Group>

          {/* Client Secret */}
          <Form.Group className="mb-3" controlId="googleClientSecret">
            <Form.Label>Google Client Secret</Form.Label>
            <div className="input-group">
              <Form.Control
                type={showPassword ? "text" : "password"}
                value={value.GOOGLE_CLIENT_SECRET}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  handleChange("GOOGLE_CLIENT_SECRET", e.target.value)
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

          {/* Redirect URI */}
          <Form.Group className="mb-3" controlId="googleRedirectUri">
            <Form.Label>Redirect URI</Form.Label>
            <Form.Control
              placeholder="https://example.com/google/callback"
              value={value.GOOGLE_REDIRECT_URI}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                handleChange("GOOGLE_REDIRECT_URI", e.target.value)
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

export default GoogleContactSettings;
