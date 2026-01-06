// src/pages/SystemSettings/SystemSettingsPage.tsx
import React, { useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Tabs,
  Button,
  Spinner,
  ToastContainer,
  Toast,
} from "react-bootstrap";
import ProtectedTab from "./ProtectedTab";

import EmailSettings from "./components/EmailSettings";
import AWSS3Settings from "./components/AWSS3Settings";
import StripeSettings from "./components/StripeSettings";
import EkpaySettings from "./components/EkpaySettings";
import BkashSettings from "./components/BkashSettings";
import SMSNOCSettings from "./components/SMSNOCSettings";
import JWTSettings from "./components/JWTSettings";
import GoogleContactSettings from "./components/GoogleContactSettings";
import LogViewer from "./components/LogViewer";

// RTK hooks (adjust path if needed)
import {
  useGetSystemSettingQuery,
  useUpdateMultipleSettingsMutation,
} from "@/redux/api/SystemSettings/SystemSettingsApis";

type SettingItem = { key: string; value: unknown };
type SettingsResponse = { data?: SettingItem[] | Record<string, unknown> } | SettingItem[] | Record<string, unknown>;

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

    // case: raw has .data array
    if ((raw as any).data && Array.isArray((raw as any).data)) {
      return ((raw as any).data as SettingItem[]).reduce((acc: Record<string, unknown>, cur: SettingItem) => {
        if (cur && cur.key !== undefined) acc[cur.key] = cur.value;
        return acc;
      }, {});
    }

    // case: raw itself is an array of {key, value}
    if (Array.isArray(raw)) {
      return (raw as SettingItem[]).reduce((acc: Record<string, unknown>, cur: SettingItem) => {
        if (cur && cur.key !== undefined) acc[cur.key] = cur.value;
        return acc;
      }, {});
    }

    // case: raw is an object map OR { data: { ... } }
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
      setToast({ show: true, message: "Saved successfully", variant: "success" });
    } catch (err) {
      console.error("Save failed", err);
      setToast({ show: true, message: "Save failed", variant: "danger" });
    }
  }

  // Clear cache handler (always show success at end per your request)
  const [clearingCache, setClearingCache] = useState<boolean>(false);

  async function handleClearCache() {
    setClearingCache(true);

    try {
      // fire GET clear-cache (no strict checking; we will show success anyway)
      await fetch(`${import.meta.env.VITE_BASE_DOC_URL}/clear-cache`, {
        method: "GET",
        // include credentials/header if required:
        // credentials: "include",
      });
    } catch (err) {
      // log but do not show error to the user (you requested always-success behavior)
      console.error("Clear cache failed (ignored):", err);
    } finally {
      setClearingCache(false);

      setToast({
        show: true,
        message: "Cache cleared successfully!",
        variant: "success",
      });

      // trigger refetch of settings so UI updates
      try {
        await refetch();
      } catch (e) {
        // ignore refetch errors
        // console.warn("Refetch after clear-cache failed:", e);
      }
    }
  }

  return (
    <Container fluid className="p-2 p-md-4">
      <Row>
        <Col>
          <h2>System Settings</h2>
          <p className="text-muted">Manage global system configuration.</p>
        </Col>
      </Row>

      <Row className="mb-3">
        <Col>
          <Button onClick={handleSaveActiveTab} disabled={isSaving || loadingSettings}>
            {isSaving ? (
              <>
                <Spinner as="span" animation="border" size="sm" /> Saving...
              </>
            ) : (
              "Save Active Tab"
            )}
          </Button>
        </Col>

        <Col>
          <Button onClick={handleClearCache} disabled={clearingCache}>
            {clearingCache ? (
              <>
                <Spinner as="span" animation="border" size="sm" /> Clearing...
              </>
            ) : (
              "Clear Cache and Refresh Settings"
            )}
          </Button>
        </Col>
      </Row>

      <Row>
        <Col>
          {loadingSettings ? (
            <div>Loading settings...</div>
          ) : isError ? (
            <div className="text-danger">Failed to load settings</div>
          ) : (
            <Tabs
              activeKey={activeKey}
              onSelect={(k: string | null) => k && setActiveKey(k)}
              className="mb-3"
              mountOnEnter
              unmountOnExit
            >
              <ProtectedTab eventKey="email" title="Email Settings" permissionKey="email">
                <EmailSettings value={drafts.email} onChange={(v) => updateDraft("email", v)} />
              </ProtectedTab>

              <ProtectedTab eventKey="aws" title="AWS S3 Settings" permissionKey="aws">
                <AWSS3Settings value={drafts.aws} onChange={(v) => updateDraft("aws", v)} />
              </ProtectedTab>

              <ProtectedTab eventKey="stripe" title="Stripe Settings" permissionKey="stripe">
                <StripeSettings value={drafts.stripe} onChange={(v) => updateDraft("stripe", v)} />
              </ProtectedTab>

              <ProtectedTab eventKey="ekpay" title="EKPay Settings" permissionKey="ekpay">
                <EkpaySettings value={drafts.ekpay} onChange={(v) => updateDraft("ekpay", v)} />
              </ProtectedTab>

              <ProtectedTab eventKey="bkash" title="Bkash Settings" permissionKey="bkash">
                <BkashSettings value={drafts.bkash} onChange={(v) => updateDraft("bkash", v)} />
              </ProtectedTab>

              <ProtectedTab eventKey="sms" title="SMSNOC" permissionKey="sms">
                <SMSNOCSettings value={drafts.sms} onChange={(v) => updateDraft("sms", v)} />
              </ProtectedTab>

              <ProtectedTab eventKey="jwt" title="JWT Settings" permissionKey="jwt">
                <JWTSettings value={drafts.jwt} onChange={(v) => updateDraft("jwt", v)} />
              </ProtectedTab>

              <ProtectedTab eventKey="google" title="Google Contact Settings" permissionKey="googleContact">
                <GoogleContactSettings value={drafts.google} onChange={(v) => updateDraft("google", v)} />
              </ProtectedTab>

              <ProtectedTab eventKey="logs" title="Log Viewer" permissionKey="logViewer">
                <LogViewer value={drafts.logs} onChange={(v) => updateDraft("logs", v)} />
              </ProtectedTab>
            </Tabs>
          )}
        </Col>
      </Row>

      <Row className="mb-3">
        <Col>
          <Button onClick={handleSaveActiveTab} disabled={isSaving || loadingSettings}>
            {isSaving ? (
              <>
                <Spinner as="span" animation="border" size="sm" /> Saving...
              </>
            ) : (
              "Save Active Tab"
            )}
          </Button>
        </Col>
      </Row>

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

export default SystemSettingsPage;
