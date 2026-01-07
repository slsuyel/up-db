// src/pages/SystemSettings/SystemSettingsPage.tsx
import React, { useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Nav,
  Tab,
  Button,
  Spinner,
  ToastContainer,
  Toast,
  Card,
  Badge,
} from "react-bootstrap";

import EmailSettings from "./components/EmailSettings";
import AWSS3Settings from "./components/AWSS3Settings";
import StripeSettings from "./components/StripeSettings";
import EkpaySettings from "./components/EkpaySettings";
import BkashSettings from "./components/BkashSettings";
import SMSNOCSettings from "./components/SMSNOCSettings";
import JWTSettings from "./components/JWTSettings";
import GoogleContactSettings from "./components/GoogleContactSettings";
import LogViewer from "./components/LogViewer";

// RTK hooks
import {
  useGetSystemSettingQuery,
  useUpdateMultipleSettingsMutation,
} from "@/redux/api/SystemSettings/SystemSettingsApis";

type SettingItem = { key: string; value: unknown };
type SettingsResponse = { data?: SettingItem[] | Record<string, unknown> } | SettingItem[] | Record<string, unknown>;

// Mock Permissions (Simulated)
const userPermissions: Record<string, boolean> = {
  email: true,
  aws: true,
  stripe: true,
  ekpay: true,
  bkash: true,
  sms: true,
  jwt: true,
  googleContact: true,
  logViewer: true,
};

const SystemSettingsPage: React.FC = () => {
  const [activeKey, setActiveKey] = useState<string>("email");
  const [toast, setToast] = useState<{ show: boolean; message: string; variant: "success" | "danger" | "warning" }>({
    show: false,
    message: "",
    variant: "success",
  });

  // drafts shape: separate sub-objects for each tab (controlled)
  const [drafts, setDrafts] = useState<Record<string, any>>({
    email: {},
    aws: {},
    stripe: {},
    ekpay: {},
    bkash: {},
    sms: {},
    jwt: {},
    google: {},
    logs: {},
  });

  // fetch all settings (bulk GET)
  const {
    data: allSettingsResponse,
    isLoading: loadingSettings,
    isError,
    refetch,
  } = useGetSystemSettingQuery("");

  // mutation for bulk update
  const [updateMultipleSettings, { isLoading: isSaving }] = useUpdateMultipleSettingsMutation();

  // ---------- Normalizer ----------
  const normalizeSettingsResponse = (raw: SettingsResponse | null): Record<string, unknown> => {
    if (!raw) return {};

    if ((raw as any).data && Array.isArray((raw as any).data)) {
      return ((raw as any).data as SettingItem[]).reduce((acc: Record<string, unknown>, cur: SettingItem) => {
        if (cur && cur.key !== undefined) acc[cur.key] = cur.value;
        return acc;
      }, {});
    }

    if (Array.isArray(raw)) {
      return (raw as SettingItem[]).reduce((acc: Record<string, unknown>, cur: SettingItem) => {
        if (cur && cur.key !== undefined) acc[cur.key] = cur.value;
        return acc;
      }, {});
    }

    if (typeof raw === "object") {
      if ((raw as any).data && typeof (raw as any).data === "object" && !Array.isArray((raw as any).data)) {
        return { ...((raw as any).data as Record<string, unknown>) };
      }
      return { ...(raw as Record<string, unknown>) };
    }

    return {};
  };

  // map server keys to per-tab shape and set drafts
  useEffect(() => {
    if (!allSettingsResponse) return;
    const kv = normalizeSettingsResponse(allSettingsResponse);

    const emailShape = {
      MAIL_MAILER: (kv.MAIL_MAILER as string) ?? "smtp",
      MAIL_HOST: (kv.MAIL_HOST as string) ?? "",
      MAIL_PORT: (kv.MAIL_PORT as string) ?? "587",
      MAIL_USERNAME: (kv.MAIL_USERNAME as string) ?? "",
      MAIL_PASSWORD: (kv.MAIL_PASSWORD as string) ?? "",
      MAIL_ENCRYPTION: (kv.MAIL_ENCRYPTION as string) ?? "tls",
      MAIL_FROM_ADDRESS: (kv.MAIL_FROM_ADDRESS as string) ?? "",
      MAIL_FROM_NAME: (kv.MAIL_FROM_NAME as string) ?? "",
    };

    const awsShape = {
      AWS_ACCESS_KEY_ID: (kv.AWS_ACCESS_KEY_ID as string) ?? "",
      AWS_SECRET_ACCESS_KEY: (kv.AWS_SECRET_ACCESS_KEY as string) ?? "",
      AWS_DEFAULT_REGION: (kv.AWS_DEFAULT_REGION as string) ?? "",
      AWS_BUCKET: (kv.AWS_BUCKET as string) ?? "",
      AWS_USE_PATH_STYLE_ENDPOINT: (kv.AWS_USE_PATH_STYLE_ENDPOINT as string) ?? "false",
      AWS_FILE_LOAD_BASE: (kv.AWS_FILE_LOAD_BASE as string) ?? "",
    };

    const stripeShape = {
      STRIPE_SECRET: (kv.STRIPE_SECRET as string) ?? "",
      STRIPE_KEY: (kv.STRIPE_KEY as string) ?? "",
      STRIPE_WEBHOOK_SECRET: (kv.STRIPE_WEBHOOK_SECRET as string) ?? "",
    };

    const bkashShape = {
      BKASH_APP_KEY: (kv.BKASH_APP_KEY as string) ?? "",
      BKASH_APP_SECRET: (kv.BKASH_APP_SECRET as string) ?? "",
      BKASH_USERNAME: (kv.BKASH_USERNAME as string) ?? "",
      BKASH_PASSWORD: (kv.BKASH_PASSWORD as string) ?? "",
      BKASH_BASE_URL: (kv.BKASH_BASE_URL as string) ?? "",
    };

    const ekpayShape = {
      AKPAY_IPN_URL: (kv.AKPAY_IPN_URL as string) ?? "",
      WHITE_LIST_IP: (kv.WHITE_LIST_IP as string) ?? "",
    };

    const smsShape = {
      SMSNOC_API_KEY: (kv.SMSNOC_API_KEY as string) ?? "",
      SMSNOC_SENDER_ID: (kv.SMSNOC_SENDER_ID as string) ?? "",
    };

    const jwtShape = {
      JWT_TTL: (kv.JWT_TTL as string) ?? "",
      JWT_REFRESH_TTL: (kv.JWT_REFRESH_TTL as string) ?? "",
      JWT_BLACKLIST_ENABLED: (kv.JWT_BLACKLIST_ENABLED as string) ?? "true",
    };

    const googleShape = {
      GOOGLE_CLIENT_ID: (kv.GOOGLE_CLIENT_ID as string) ?? "",
      GOOGLE_CLIENT_SECRET: (kv.GOOGLE_CLIENT_SECRET as string) ?? "",
      GOOGLE_REDIRECT_URI: (kv.GOOGLE_REDIRECT_URI as string) ?? "",
    };

    const logsShape = {
      LOG_VIEWER_ENABLED: (kv.LOG_VIEWER_ENABLED as string) ?? "false",
      LOG_VIEWER_API_ONLY: (kv.LOG_VIEWER_API_ONLY as string) ?? "false",
      LOG_VIEWER_REQUIRE_AUTH_IN_PRODUCTION: (kv.LOG_VIEWER_REQUIRE_AUTH_IN_PRODUCTION as string) ?? "true",
      LOG_VIEWER_ROUTE_PATH: (kv.LOG_VIEWER_ROUTE_PATH as string) ?? "",
      LOG_VIEWER_ASSETS_PATH: (kv.LOG_VIEWER_ASSETS_PATH as string) ?? "",
      LOG_VIEWER_DATETIME_FORMAT: (kv.LOG_VIEWER_DATETIME_FORMAT as string) ?? "Y-m-d H:i:s",
      LOG_VIEWER_CACHE_KEY_PREFIX: (kv.LOG_VIEWER_CACHE_KEY_PREFIX as string) ?? "",
      LOG_VIEWER_LAZY_SCAN_CHUNK_SIZE_IN_MB: (kv.LOG_VIEWER_LAZY_SCAN_CHUNK_SIZE_IN_MB as string) ?? "50",
      LOG_VIEWER_STRIP_EXTRACTED_CONTEXT: (kv.LOG_VIEWER_STRIP_EXTRACTED_CONTEXT as string) ?? "true",
      LOG_VIEWER_EXCLUDE_IP_FROM_IDENTIFIERS: (kv.LOG_VIEWER_EXCLUDE_IP_FROM_IDENTIFIERS as string) ?? "false",
      LOG_VIEWER_ROOT_FOLDER_PREFIX: (kv.LOG_VIEWER_ROOT_FOLDER_PREFIX as string) ?? "",
      LOG_VIEWER_HOSTS_PRODUCTION_VERIFY_SERVER_CERTIFICATE: (kv.LOG_VIEWER_HOSTS_PRODUCTION_VERIFY_SERVER_CERTIFICATE as string) ?? "true",
      LOG_VIEWER_HIDE_UNKNOWN_FILES: (kv.LOG_VIEWER_HIDE_UNKNOWN_FILES as string) ?? "true",
    };

    setDrafts((prev) => ({
      ...prev,
      email: emailShape,
      aws: awsShape,
      stripe: stripeShape,
      ekpay: ekpayShape,
      bkash: bkashShape,
      sms: smsShape,
      jwt: jwtShape,
      google: googleShape,
      logs: logsShape,
    }));
  }, [allSettingsResponse]);

  // generic updater children will call
  function updateDraft(tabKey: string, nextValue: any) {
    setDrafts((prev) => ({ ...prev, [tabKey]: nextValue }));
  }

  // Save active tab using bulk mutation (array payload)
  async function handleSaveActiveTab() {
    const valueObj = drafts[activeKey] || {};
    const payloadArray = Object.entries(valueObj).map(([k, v]) => ({
      key: k,
      value: v,
    }));

    try {
      await updateMultipleSettings({ settings: payloadArray }).unwrap();
      setToast({ show: true, message: "সেটিংস সফলভাবে সংরক্ষিত হয়েছে", variant: "success" });
    } catch (err) {
      console.error("Save failed", err);
      setToast({ show: true, message: "সংরক্ষণ ব্যর্থ হয়েছে", variant: "danger" });
    }
  }

  // Clear cache handler
  const [clearingCache, setClearingCache] = useState<boolean>(false);

  async function handleClearCache() {
    setClearingCache(true);

    try {
      await fetch(`${import.meta.env.VITE_BASE_DOC_URL}/clear-cache`, {
        method: "GET",
      });
    } catch (err) {
      console.error("Clear cache failed (ignored):", err);
    } finally {
      setClearingCache(false);
      setToast({
        show: true,
        message: "ক্যাশ সফলভাবে ক্লিয়ার করা হয়েছে!",
        variant: "success",
      });
      try {
        await refetch();
      } catch (e) {
        // ignore
      }
    }
  }

  // Menus configuration
  const menus = [
    { key: "email", label: "ইমেইল সেটিংস", perm: "email" },
    { key: "aws", label: "AWS S3", perm: "aws" },
    { key: "stripe", label: "স্ট্রাইপ পেমেন্ট", perm: "stripe" },
    { key: "ekpay", label: "একপে পেমেন্ট", perm: "ekpay" },
    { key: "bkash", label: "বিকাশ পেমেন্ট", perm: "bkash" },
    { key: "sms", label: "SMSNOC", perm: "sms" },
    { key: "jwt", label: "JWT টোকেন", perm: "jwt" },
    { key: "google", label: "গুগল কন্টাক্ট", perm: "googleContact" },
    { key: "logs", label: "লগ ভিউয়ার", perm: "logViewer" },
  ];

  return (
    <Container fluid className="p-2 p-md-4">
      {/* Header Section */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold mb-1">সিস্টেম সেটিংস</h2>
          <p className="text-muted mb-0">গ্লোবাল সিস্টেম কনফিগারেশন ম্যানেজ করুন।</p>
        </div>
        <div className="d-flex gap-2">
          <Button
            variant="outline-secondary"
            onClick={handleClearCache}
            disabled={clearingCache}
            className="d-flex align-items-center gap-2"
          >
            {clearingCache && <Spinner as="span" animation="border" size="sm" />}
            ক্যাশ ক্লিয়ার করুন
          </Button>
          <Button
            variant="primary"
            onClick={handleSaveActiveTab}
            disabled={isSaving || loadingSettings}
            className="d-flex align-items-center gap-2 text-white"
          >
            {isSaving && <Spinner as="span" animation="border" size="sm" />}
            সেটিংস সংরক্ষণ করুন
          </Button>
        </div>
      </div>

      {loadingSettings ? (
        <div className="text-center py-5">
          <Spinner animation="border" variant="primary" />
          <p className="mt-2 text-muted">সেটিংস লোড হচ্ছে...</p>
        </div>
      ) : isError ? (
        <div className="text-danger">সেটিংস লোড করতে ব্যর্থ হয়েছে। অনুগ্রহ করে রিলোড করুন।</div>
      ) : (
        <Tab.Container activeKey={activeKey} onSelect={(k) => k && setActiveKey(k)}>
          <Row>
            {/* Sidebar Navigation */}
            <Col md={3} className="mb-3 mb-md-0">
              <Card className="border-0 shadow-sm rounded-4 overflow-hidden">
                <Card.Body className="p-0">
                  <Nav variant="pills" className="flex-column p-2 bg-white rounded-4">
                    {menus.map((menu) => {
                      const allowed = userPermissions[menu.perm];
                      return (
                        <Nav.Item key={menu.key}>
                          <Nav.Link
                            eventKey={menu.key}
                            disabled={!allowed}
                            className={`mb-1 fw-medium text-start px-3 py-2 ${activeKey === menu.key ? "bg-primary text-white" : "text-dark"
                              }`}
                            style={{ borderRadius: "8px", transition: "all 0.2s" }}
                          >
                            <div className="d-flex justify-content-between align-items-center">
                              {menu.label}
                              {!allowed && <Badge bg="secondary" style={{ fontSize: "0.6rem" }}>Locked</Badge>}
                            </div>
                          </Nav.Link>
                        </Nav.Item>
                      );
                    })}
                  </Nav>
                </Card.Body>
              </Card>
            </Col>

            {/* Content Area */}
            <Col md={9}>
              <Tab.Content>
                <Tab.Pane eventKey="email">
                  {userPermissions.email ? (
                    <EmailSettings value={drafts.email} onChange={(v) => updateDraft("email", v)} onSave={handleSaveActiveTab} isSaving={isSaving} />
                  ) : <AccessDenied />}
                </Tab.Pane>
                <Tab.Pane eventKey="aws">
                  {userPermissions.aws ? (
                    <AWSS3Settings value={drafts.aws} onChange={(v) => updateDraft("aws", v)} onSave={handleSaveActiveTab} isSaving={isSaving} />
                  ) : <AccessDenied />}
                </Tab.Pane>
                <Tab.Pane eventKey="stripe">
                  {userPermissions.stripe ? (
                    <StripeSettings value={drafts.stripe} onChange={(v) => updateDraft("stripe", v)} onSave={handleSaveActiveTab} isSaving={isSaving} />
                  ) : <AccessDenied />}
                </Tab.Pane>
                <Tab.Pane eventKey="ekpay">
                  {userPermissions.ekpay ? (
                    <EkpaySettings value={drafts.ekpay} onChange={(v) => updateDraft("ekpay", v)} onSave={handleSaveActiveTab} isSaving={isSaving} />
                  ) : <AccessDenied />}
                </Tab.Pane>
                <Tab.Pane eventKey="bkash">
                  {userPermissions.bkash ? (
                    <BkashSettings value={drafts.bkash} onChange={(v) => updateDraft("bkash", v)} onSave={handleSaveActiveTab} isSaving={isSaving} />
                  ) : <AccessDenied />}
                </Tab.Pane>
                <Tab.Pane eventKey="sms">
                  {userPermissions.sms ? (
                    <SMSNOCSettings value={drafts.sms} onChange={(v) => updateDraft("sms", v)} onSave={handleSaveActiveTab} isSaving={isSaving} />
                  ) : <AccessDenied />}
                </Tab.Pane>
                <Tab.Pane eventKey="jwt">
                  {userPermissions.jwt ? (
                    <JWTSettings value={drafts.jwt} onChange={(v) => updateDraft("jwt", v)} onSave={handleSaveActiveTab} isSaving={isSaving} />
                  ) : <AccessDenied />}
                </Tab.Pane>
                <Tab.Pane eventKey="google">
                  {userPermissions.googleContact ? (
                    <GoogleContactSettings value={drafts.google} onChange={(v) => updateDraft("google", v)} onSave={handleSaveActiveTab} isSaving={isSaving} />
                  ) : <AccessDenied />}
                </Tab.Pane>
                <Tab.Pane eventKey="logs">
                  {userPermissions.logViewer ? (
                    <LogViewer value={drafts.logs} onChange={(v) => updateDraft("logs", v)} onSave={handleSaveActiveTab} isSaving={isSaving} />
                  ) : <AccessDenied />}
                </Tab.Pane>
              </Tab.Content>
            </Col>
          </Row>
        </Tab.Container>
      )}

      <ToastContainer position="bottom-end" className="p-3">
        <Toast
          onClose={() => setToast((t) => ({ ...t, show: false }))}
          show={toast.show}
          bg={toast.variant === "danger" ? "danger" : "success"}
          delay={3000}
          autohide
        >
          <Toast.Body className="text-white">{toast.message}</Toast.Body>
        </Toast>
      </ToastContainer>
    </Container>
  );
};

const AccessDenied = () => (
  <Card className="border-0 shadow-sm rounded-4 p-4 text-center">
    <Card.Body>
      <h5 className="text-danger fw-bold">প্রবেশাধিকার নেই</h5>
      <p className="text-muted">আপনার এই সেটিংস দেখার অনুমতি নেই।</p>
    </Card.Body>
  </Card>
);

export default SystemSettingsPage;
