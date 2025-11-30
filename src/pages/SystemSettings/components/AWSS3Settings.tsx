import React, { useState } from "react";
import { Card, Form, Button, Spinner } from "react-bootstrap";

export interface AWSS3Values {
  AWS_ACCESS_KEY_ID: string;
  AWS_SECRET_ACCESS_KEY: string;
  AWS_DEFAULT_REGION: string;
  AWS_BUCKET: string;
  AWS_USE_PATH_STYLE_ENDPOINT: "true" | "false";
  AWS_FILE_LOAD_BASE: string;
}

export interface AWSS3SettingsProps {
  value?: AWSS3Values;
  onChange?: (nextValue: AWSS3Values) => void;
  onSave?: (() => void) | null;
  isSaving?: boolean;
}

const defaultValues: AWSS3Values = {
  AWS_ACCESS_KEY_ID: "",
  AWS_SECRET_ACCESS_KEY: "",
  AWS_DEFAULT_REGION: "",
  AWS_BUCKET: "",
  AWS_USE_PATH_STYLE_ENDPOINT: "false",
  AWS_FILE_LOAD_BASE: "",
};

export const AWSS3Settings: React.FC<AWSS3SettingsProps> = ({
  value = defaultValues,
  onChange = () => {},
  onSave = null,
  isSaving = false,
}) => {
  const handleChange = (key: keyof AWSS3Values, val: string) => {
    onChange({ ...value, [key]: val });
  };

  const handleSubmit: React.FormEventHandler<HTMLFormElement> = (e) => {
    e.preventDefault();
    if (typeof onSave === "function") onSave();
    else console.warn("AWSS3Settings: onSave not provided; using parent Save Active Tab.");
  };

  const [showPassword, setShowPassword] = useState<boolean>(false);

  return (
    <Card className="m-3 p-3">
      <Card.Body>
        <h4>AWS S3 Settings</h4>

        <Form onSubmit={handleSubmit}>
          {/* AWS Access Key */}
          <Form.Group className="mb-3" controlId="awsAccessKeyId">
            <Form.Label>AWS Access Key ID</Form.Label>
            <Form.Control
              value={value.AWS_ACCESS_KEY_ID ?? ""}
              onChange={(e) => handleChange("AWS_ACCESS_KEY_ID", e.target.value)}
            />
          </Form.Group>

          {/* Secret Access Key */}
          <Form.Group className="mb-3" controlId="awsSecretAccessKey">
            <Form.Label>AWS Secret Access Key</Form.Label>
            <div className="input-group">
              <Form.Control
                type={showPassword ? "text" : "password"}
                value={value.AWS_SECRET_ACCESS_KEY ?? ""}
                onChange={(e) => handleChange("AWS_SECRET_ACCESS_KEY", e.target.value)}
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

          {/* Region */}
          <Form.Group className="mb-3" controlId="awsDefaultRegion">
            <Form.Label>AWS Default Region</Form.Label>
            <Form.Control
              value={value.AWS_DEFAULT_REGION ?? ""}
              onChange={(e) => handleChange("AWS_DEFAULT_REGION", e.target.value)}
            />
          </Form.Group>

          {/* Bucket */}
          <Form.Group className="mb-3" controlId="awsBucket">
            <Form.Label>AWS Bucket Name</Form.Label>
            <Form.Control
              value={value.AWS_BUCKET ?? ""}
              onChange={(e) => handleChange("AWS_BUCKET", e.target.value)}
            />
          </Form.Group>

          {/* Path Style Endpoint */}
          <Form.Group className="mb-3" controlId="awsUsePathStyle">
            <Form.Label>Use Path Style Endpoint</Form.Label>
            <Form.Select
              value={value.AWS_USE_PATH_STYLE_ENDPOINT}
              onChange={(e) => handleChange("AWS_USE_PATH_STYLE_ENDPOINT", e.target.value)}
            >
              <option value="true">true</option>
              <option value="false">false</option>
            </Form.Select>
          </Form.Group>

          {/* File Load Base URL */}
          <Form.Group className="mb-3" controlId="awsFileLoadBase">
            <Form.Label>File Load Base URL</Form.Label>
            <Form.Control
              value={value.AWS_FILE_LOAD_BASE ?? ""}
              onChange={(e) => handleChange("AWS_FILE_LOAD_BASE", e.target.value)}
            />
          </Form.Group>

          {onSave ? (
            <Button type="submit" disabled={isSaving}>
              {isSaving ? <Spinner size="sm" animation="border" /> : "Save"}
            </Button>
          ) : (
            <div className="text-muted">
              Use the parent <strong>Save Active Tab</strong> button to persist changes.
            </div>
          )}
        </Form>
      </Card.Body>
    </Card>
  );
};

export default AWSS3Settings;
