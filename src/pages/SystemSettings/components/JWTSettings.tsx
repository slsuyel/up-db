import React from "react";
import { Card, Form, Button, Spinner } from "react-bootstrap";

export interface JWTValues {
  JWT_TTL: string;
  JWT_REFRESH_TTL: string;
  JWT_BLACKLIST_ENABLED: "true" | "false";
}

export interface JWTSettingsProps {
  value?: JWTValues;
  onChange?: (next: JWTValues) => void;
  onSave?: (() => void) | null;
  isSaving?: boolean;
}

const defaultValues: JWTValues = {
  JWT_TTL: "",
  JWT_REFRESH_TTL: "",
  JWT_BLACKLIST_ENABLED: "true",
};

export const JWTSettings: React.FC<JWTSettingsProps> = ({
  value = defaultValues,
  onChange = () => {},
  onSave = null,
  isSaving = false,
}) => {
  const handleChange = (key: keyof JWTValues, val: string) => {
    onChange({ ...value, [key]: val });
  };

  const handleSubmit: React.FormEventHandler<HTMLFormElement> = (e) => {
    e.preventDefault();
    if (typeof onSave === "function") onSave();
    else
      console.warn(
        "JWTSettings: onSave not provided; using parent Save Active Tab."
      );
  };

  return (
    <Card className="m-3 p-3">
      <Card.Body>
        <h4>JWT Settings</h4>

        <Form onSubmit={handleSubmit}>
          {/* JWT TTL */}
          <Form.Group className="mb-3" controlId="jwtTtl">
            <Form.Label>JWT TTL (Minutes)</Form.Label>
            <Form.Control
              type="number"
              placeholder="60"
              value={value.JWT_TTL}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                handleChange("JWT_TTL", e.target.value)
              }
            />
          </Form.Group>

          {/* JWT Refresh TTL */}
          <Form.Group className="mb-3" controlId="jwtRefreshTtl">
            <Form.Label>JWT Refresh TTL (Minutes)</Form.Label>
            <Form.Control
              type="number"
              placeholder="20160"
              value={value.JWT_REFRESH_TTL}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                handleChange("JWT_REFRESH_TTL", e.target.value)
              }
            />
          </Form.Group>

          {/* JWT Blacklist Enabled */}
          <Form.Group className="mb-3" controlId="jwtBlacklist">
            <Form.Label>Enable Blacklist</Form.Label>
            <Form.Select
              value={value.JWT_BLACKLIST_ENABLED}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                handleChange("JWT_BLACKLIST_ENABLED", e.target.value)
              }
            >
              <option value="true">true</option>
              <option value="false">false</option>
            </Form.Select>
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

export default JWTSettings;
