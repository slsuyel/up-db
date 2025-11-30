import React, { ReactNode } from "react";
import { Tab, Card, Badge } from "react-bootstrap";

// Replace with your real permissions
const mockPermissions: Record<string, boolean> = {
  email: true,
  aws: true,
  stripe: false,
  ekpay: true,
  bkash: true,
  sms: true,
  jwt: true,
  googleContact: true,
  logViewer: true,
};

interface ProtectedTabProps {
  eventKey: string;
  title: string;
  permissionKey: string;
  children?: ReactNode;
}

const ProtectedTab: React.FC<ProtectedTabProps> = ({
  eventKey,
  title,
  permissionKey,
  children,
}) => {
  const allowed = !!mockPermissions[permissionKey];

  return (
    <Tab
      eventKey={eventKey}
      title={
        <span>
          {title} {!allowed && <Badge bg="secondary" className="ms-2">Locked</Badge>}
        </span>
      }
      disabled={!allowed}
    >
      {!allowed ? (
        <Card className="m-3 p-3">
          <Card.Body>
            <h5>Access Denied</h5>
            <p>You do not have permission to view this settings tab.</p>
          </Card.Body>
        </Card>
      ) : (
        children
      )}
    </Tab>
  );
};

export default ProtectedTab;
