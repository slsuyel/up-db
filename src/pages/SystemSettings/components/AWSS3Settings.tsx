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
  onChange = () => { },
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
    <Card className="m-3 p-3 border-0 shadow-sm rounded-4">
      <Card.Body>
        <h5 className="fw-bold mb-4">এডাব্লিউএস (AWS) S3 সেটিংস</h5>

        <Form onSubmit={handleSubmit}>
          {/* AWS Access Key */}
          <Form.Group className="mb-3" controlId="awsAccessKeyId">
            <Form.Label>AWS অ্যাক্সেস কী আইডি</Form.Label>
            <Form.Control
              value={value.AWS_ACCESS_KEY_ID ?? ""}
              onChange={(e) => handleChange("AWS_ACCESS_KEY_ID", e.target.value)}
              placeholder="আপনার AWS Access Key ID"
            />
          </Form.Group>

          {/* Secret Access Key */}
          <Form.Group className="mb-3" controlId="awsSecretAccessKey">
            <Form.Label>AWS সিক্রেট অ্যাক্সেস কী</Form.Label>
            <div className="input-group">
              <Form.Control
                type={showPassword ? "text" : "password"}
                value={value.AWS_SECRET_ACCESS_KEY ?? ""}
                onChange={(e) => handleChange("AWS_SECRET_ACCESS_KEY", e.target.value)}
                placeholder="আপনার AWS Secret Access Key"
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

          {/* Region */}
          <Form.Group className="mb-3" controlId="awsDefaultRegion">
            <Form.Label>AWS ডিফল্ট রিজিয়ন</Form.Label>
            <Form.Control
              value={value.AWS_DEFAULT_REGION ?? ""}
              onChange={(e) => handleChange("AWS_DEFAULT_REGION", e.target.value)}
              placeholder="উদাঃ ap-southeast-1"
            />
          </Form.Group>

          {/* Bucket */}
          <Form.Group className="mb-3" controlId="awsBucket">
            <Form.Label>AWS বাকেট নাম</Form.Label>
            <Form.Control
              value={value.AWS_BUCKET ?? ""}
              onChange={(e) => handleChange("AWS_BUCKET", e.target.value)}
              placeholder="আপনার s3 bucket এর নাম"
            />
          </Form.Group>

          {/* Path Style Endpoint */}
          <Form.Group className="mb-3" controlId="awsUsePathStyle">
            <Form.Label>পাথ স্টাইল এন্ডপয়েন্ট ব্যবহার করুন</Form.Label>
            <Form.Select
              value={value.AWS_USE_PATH_STYLE_ENDPOINT}
              onChange={(e) => handleChange("AWS_USE_PATH_STYLE_ENDPOINT", e.target.value)}
            >
              <option value="true">হ্যাঁ (True)</option>
              <option value="false">না (False)</option>
            </Form.Select>
          </Form.Group>

          {/* File Load Base URL */}
          <Form.Group className="mb-3" controlId="awsFileLoadBase">
            <Form.Label>ফাইল লোড বেস URL</Form.Label>
            <Form.Control
              value={value.AWS_FILE_LOAD_BASE ?? ""}
              onChange={(e) => handleChange("AWS_FILE_LOAD_BASE", e.target.value)}
              placeholder="ফাইলের বেস URL (ঐচ্ছিক)"
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

export default AWSS3Settings;
