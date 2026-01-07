import React from "react";
import { Card, Form, Button, Spinner, Row, Col } from "react-bootstrap";

export interface LogViewerValues {
  LOG_VIEWER_ENABLED: "true" | "false";
  LOG_VIEWER_API_ONLY: "true" | "false";
  LOG_VIEWER_REQUIRE_AUTH_IN_PRODUCTION: "true" | "false";
  LOG_VIEWER_ROUTE_PATH: string;
  LOG_VIEWER_ASSETS_PATH: string;
  LOG_VIEWER_DATETIME_FORMAT: string;
  LOG_VIEWER_CACHE_KEY_PREFIX: string;
  LOG_VIEWER_LAZY_SCAN_CHUNK_SIZE_IN_MB: string;
  LOG_VIEWER_STRIP_EXTRACTED_CONTEXT: "true" | "false";
  LOG_VIEWER_EXCLUDE_IP_FROM_IDENTIFIERS: "true" | "false";
  LOG_VIEWER_ROOT_FOLDER_PREFIX: string;
  LOG_VIEWER_HOSTS_PRODUCTION_VERIFY_SERVER_CERTIFICATE: "true" | "false";
  LOG_VIEWER_HIDE_UNKNOWN_FILES: "true" | "false";
}

export interface LogViewerProps {
  value?: LogViewerValues;
  onChange?: (next: LogViewerValues) => void;
  onSave?: (() => void) | null;
  isSaving?: boolean;
}

const defaultValues: LogViewerValues = {
  LOG_VIEWER_ENABLED: "false",
  LOG_VIEWER_API_ONLY: "false",
  LOG_VIEWER_REQUIRE_AUTH_IN_PRODUCTION: "true",
  LOG_VIEWER_ROUTE_PATH: "",
  LOG_VIEWER_ASSETS_PATH: "",
  LOG_VIEWER_DATETIME_FORMAT: "Y-m-d H:i:s",
  LOG_VIEWER_CACHE_KEY_PREFIX: "",
  LOG_VIEWER_LAZY_SCAN_CHUNK_SIZE_IN_MB: "50",
  LOG_VIEWER_STRIP_EXTRACTED_CONTEXT: "true",
  LOG_VIEWER_EXCLUDE_IP_FROM_IDENTIFIERS: "false",
  LOG_VIEWER_ROOT_FOLDER_PREFIX: "",
  LOG_VIEWER_HOSTS_PRODUCTION_VERIFY_SERVER_CERTIFICATE: "true",
  LOG_VIEWER_HIDE_UNKNOWN_FILES: "true",
};

export const LogViewer: React.FC<LogViewerProps> = ({
  value = defaultValues,
  onChange = () => { },
  onSave = null,
  isSaving = false,
}) => {
  const handleChange = (key: keyof LogViewerValues, v: string) =>
    onChange({ ...value, [key]: v });

  const handleSubmit: React.FormEventHandler<HTMLFormElement> = (e) => {
    e.preventDefault();
    if (typeof onSave === "function") onSave();
    else
      console.warn(
        "LogViewer: onSave not provided; using parent Save Active Tab."
      );
  };

  return (
    <>
      <Card className="m-3 p-3 border-0 shadow-sm rounded-4">
        <Card.Body>
          <Row className="mb-3">
            <Col>
              <h5 className="fw-bold">লগ ভিউয়ার কনফিগারেশন</h5>
              <p className="text-muted small">লগ ভিউয়ার আচরণ এবং অ্যাক্সেসিবিলিটি কনফিগার করুন।</p>
            </Col>

            {value.LOG_VIEWER_ENABLED === "true" && (
              <Col>
                <a
                  type="submit"
                  target="_blank"
                  className="btn btn-primary float-end"
                  href={`http://203.161.62.45/log-viewer?token=${localStorage.getItem(
                    "token"
                  )}`}
                >
                  লগ ভিউয়ার দেখুন
                </a>
              </Col>
            )}
          </Row>

          <Form onSubmit={handleSubmit}>
            {/* Enabled */}
            <Form.Group className="mb-3" controlId="lvEnabled">
              <Form.Label>লগ ভিউয়ার চালু করুন (Enable Log Viewer)</Form.Label>
              <Form.Select
                value={value.LOG_VIEWER_ENABLED}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                  handleChange("LOG_VIEWER_ENABLED", e.target.value)
                }
              >
                <option value="true">হ্যাঁ (True)</option>
                <option value="false">না (False)</option>
              </Form.Select>
            </Form.Group>

            {/* API Only */}
            <Form.Group className="mb-3" controlId="lvApiOnly">
              <Form.Label>শুধুমাত্র API মোড (API Only Mode)</Form.Label>
              <Form.Select
                value={value.LOG_VIEWER_API_ONLY}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                  handleChange("LOG_VIEWER_API_ONLY", e.target.value)
                }
              >
                <option value="true">হ্যাঁ (True)</option>
                <option value="false">না (False)</option>
              </Form.Select>
            </Form.Group>

            {/* Require Auth */}
            <Form.Group className="mb-3" controlId="lvRequireAuth">
              <Form.Label>প্রোডাকশনে অথেন্টিকেশন আবশ্যক</Form.Label>
              <Form.Select
                value={value.LOG_VIEWER_REQUIRE_AUTH_IN_PRODUCTION}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                  handleChange(
                    "LOG_VIEWER_REQUIRE_AUTH_IN_PRODUCTION",
                    e.target.value
                  )
                }
              >
                <option value="true">হ্যাঁ (True)</option>
                <option value="false">না (False)</option>
              </Form.Select>
            </Form.Group>

            {/* Route Path */}
            <Form.Group className="mb-3" controlId="lvRoutePath">
              <Form.Label>রাউট পাথ (Route Path)</Form.Label>
              <Form.Control
                placeholder="log-viewer"
                value={value.LOG_VIEWER_ROUTE_PATH}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  handleChange("LOG_VIEWER_ROUTE_PATH", e.target.value)
                }
              />
            </Form.Group>

            {/* Assets Path */}
            <Form.Group className="mb-3" controlId="lvAssetsPath">
              <Form.Label>অ্যাসেট পাথ (Assets Path)</Form.Label>
              <Form.Control
                placeholder="public/vendor/log-viewer"
                value={value.LOG_VIEWER_ASSETS_PATH}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  handleChange("LOG_VIEWER_ASSETS_PATH", e.target.value)
                }
              />
            </Form.Group>

            {/* Datetime Format */}
            <Form.Group className="mb-3" controlId="lvDatetimeFormat">
              <Form.Label>তারিখ-সময় ফরম্যাট (DateTime Format)</Form.Label>
              <Form.Control
                placeholder="Y-m-d H:i:s"
                value={value.LOG_VIEWER_DATETIME_FORMAT}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  handleChange("LOG_VIEWER_DATETIME_FORMAT", e.target.value)
                }
              />
            </Form.Group>

            {/* Cache Key Prefix */}
            <Form.Group className="mb-3" controlId="lvCachePrefix">
              <Form.Label>ক্যাশ কী প্রিফিক্স (Cache Key Prefix)</Form.Label>
              <Form.Control
                value={value.LOG_VIEWER_CACHE_KEY_PREFIX}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  handleChange("LOG_VIEWER_CACHE_KEY_PREFIX", e.target.value)
                }
              />
            </Form.Group>

            {/* Chunk Size */}
            <Form.Group className="mb-3" controlId="lvChunkSize">
              <Form.Label>লেজি স্ক্যান চাঙ্ক সাইজ (MB)</Form.Label>
              <Form.Control
                type="number"
                value={value.LOG_VIEWER_LAZY_SCAN_CHUNK_SIZE_IN_MB}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  handleChange(
                    "LOG_VIEWER_LAZY_SCAN_CHUNK_SIZE_IN_MB",
                    e.target.value
                  )
                }
              />
            </Form.Group>

            {/* Strip Extracted Context */}
            <Form.Group className="mb-3" controlId="lvStripContext">
              <Form.Label>স্ট্রিপ এক্সট্রাক্টেড কনটেক্সট</Form.Label>
              <Form.Select
                value={value.LOG_VIEWER_STRIP_EXTRACTED_CONTEXT}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                  handleChange(
                    "LOG_VIEWER_STRIP_EXTRACTED_CONTEXT",
                    e.target.value
                  )
                }
              >
                <option value="true">হ্যাঁ (True)</option>
                <option value="false">না (False)</option>
              </Form.Select>
            </Form.Group>

            {/* Exclude IP */}
            <Form.Group className="mb-3" controlId="lvExcludeIp">
              <Form.Label>আইডেন্টিফায়ার থেকে আইপি বাদ দিন</Form.Label>
              <Form.Select
                value={value.LOG_VIEWER_EXCLUDE_IP_FROM_IDENTIFIERS}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                  handleChange(
                    "LOG_VIEWER_EXCLUDE_IP_FROM_IDENTIFIERS",
                    e.target.value
                  )
                }
              >
                <option value="true">হ্যাঁ (True)</option>
                <option value="false">না (False)</option>
              </Form.Select>
            </Form.Group>

            {/* Root Folder Prefix */}
            <Form.Group className="mb-3" controlId="lvRootPrefix">
              <Form.Label>রুট ফোল্ডার প্রিফিক্স (Root Folder Prefix)</Form.Label>
              <Form.Control
                value={value.LOG_VIEWER_ROOT_FOLDER_PREFIX}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  handleChange("LOG_VIEWER_ROOT_FOLDER_PREFIX", e.target.value)
                }
              />
            </Form.Group>

            {/* Verify SSL in Production */}
            <Form.Group className="mb-3" controlId="lvVerifySsl">
              <Form.Label>SSL সার্টিফিকেট যাচাই করুন (প্রোডাকশন)</Form.Label>
              <Form.Select
                value={
                  value.LOG_VIEWER_HOSTS_PRODUCTION_VERIFY_SERVER_CERTIFICATE
                }
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                  handleChange(
                    "LOG_VIEWER_HOSTS_PRODUCTION_VERIFY_SERVER_CERTIFICATE",
                    e.target.value
                  )
                }
              >
                <option value="true">হ্যাঁ (True)</option>
                <option value="false">না (False)</option>
              </Form.Select>
            </Form.Group>

            {/* Hide Unknown Files */}
            <Form.Group className="mb-3" controlId="lvHideUnknown">
              <Form.Label>অজানা ফাইল লুকান (Hide Unknown Files)</Form.Label>
              <Form.Select
                value={value.LOG_VIEWER_HIDE_UNKNOWN_FILES}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                  handleChange("LOG_VIEWER_HIDE_UNKNOWN_FILES", e.target.value)
                }
              >
                <option value="true">হ্যাঁ (True)</option>
                <option value="false">না (False)</option>
              </Form.Select>
            </Form.Group>

            {onSave ? (
              <Button type="submit" disabled={isSaving}>
                {isSaving ? (
                  <Spinner size="sm" animation="border" />
                ) : (
                  "সংরক্ষণ করুন"
                )}
              </Button>
            ) : (
              <div className="text-muted small mt-3">
                পরিবর্তনগুলো সেভ করতে উপরের <strong>"সংরক্ষণ করুন"</strong> বাটনটি ব্যবহার করুন।
              </div>
            )}
          </Form>
        </Card.Body>
      </Card>
    </>
  );
};

export default LogViewer;
