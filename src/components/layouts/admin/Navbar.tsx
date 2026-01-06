import { useAppSelector } from "@/redux/features/hooks";
import { RootState } from "@/redux/features/store";
import {
  LogoutOutlined,
  UserOutlined,
  BellOutlined,
  SettingOutlined,
  HomeOutlined,
  MenuOutlined
} from "@ant-design/icons";
import { Avatar, Dropdown, MenuProps, Button, Badge, Breadcrumb } from "antd";
import { useNavigate, useLocation, Link } from "react-router-dom";

const Navbar = ({ onMenuClick }: { onMenuClick?: () => void }) => {
  const user = useAppSelector((state: RootState) => state.user.user);
  const navigate = useNavigate();
  const location = useLocation();



  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  const menuItems: MenuProps["items"] = [
    {
      key: "profile",
      label: "My Profile",
      icon: <UserOutlined />,
    },
    {
      key: "settings",
      label: "Settings",
      icon: <SettingOutlined />,
    },
    {
      type: "divider",
    },
    {
      key: "logout",
      label: "Logout",
      icon: <LogoutOutlined />,
      danger: true,
      onClick: handleLogout,
    },
  ];

  // Generate breadcrumbs based on location
  const pathSnippets = location.pathname.split("/").filter((i) => i);
  const breadcrumbItems = [
    {
      title: <Link to="/dashboard"><HomeOutlined /></Link>,
    },
    ...pathSnippets.map((snippet, index) => {
      const url = `/${pathSnippets.slice(0, index + 1).join("/")}`;
      const title = snippet.charAt(0).toUpperCase() + snippet.slice(1).replace(/-/g, " ");
      return {
        title: index === pathSnippets.length - 1 ? title : <Link to={url}>{title}</Link>,
      };
    }),
  ];

  return (
    <div
      className="navbar-premium"
      style={{
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 24px",
        background: "#1e293b",
        borderBottom: "1px solid rgba(255, 255, 255, 0.05)",
        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        boxShadow: "0 4px 20px rgba(0, 0, 0, 0.2)",
        overflow: "visible", // Ensure nothing is clipped
      }}
    >
      <div className="d-flex align-items-center gap-3">
        {onMenuClick && (
          <Button
            type="text"
            icon={<MenuOutlined style={{ color: "#fff", fontSize: "20px" }} />}
            onClick={onMenuClick}
            className="d-lg-none"
            style={{ display: "flex", alignItems: "center", justifyContent: "center" }}
          />
        )}
        <Breadcrumb
          items={breadcrumbItems}
          style={{ fontSize: "13px", fontWeight: 500 }}
          separator={<span style={{ color: "rgba(255,255,255,0.2)" }}>/</span>}
          className="d-none d-sm-block"
        />
      </div>

      <div className="d-flex align-items-center gap-2 gap-md-4">
        <Badge count={5} size="small" offset={[2, 2]} className="d-none d-md-block">
          <Button
            type="text"
            icon={<BellOutlined style={{ fontSize: "20px", color: "rgba(255,255,255,0.65)" }} />}
            style={{ display: "flex", alignItems: "center", justifyContent: "center" }}
            className="navbar-icon-btn"
          />
        </Badge>

        <Dropdown menu={{ items: menuItems }} trigger={["click"]} placement="bottomRight">
          <div
            className="user-profile-premium-pill"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              cursor: "pointer",
              padding: "4px 4px 4px 12px",
              borderRadius: "30px",
              transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
              background: "rgba(255, 255, 255, 0.03)",
              border: "1px solid rgba(255, 255, 255, 0.08)",
            }}
          >
            <div className="text-end d-none d-md-block">
              <div style={{ fontSize: "13px", fontWeight: 700, color: "#fff", lineHeight: "1" }}>
                {user?.name || "Admin"}
              </div>
              <div style={{ fontSize: "10px", color: "rgba(255, 255, 255, 0.5)", fontWeight: 600, marginTop: "2px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                {user?.position || "Admin"}
              </div>
            </div>
            <Avatar
              size={32}
              src={user?.image}
              icon={<UserOutlined />}
              style={{
                border: "2px solid #38bdf8",
                boxShadow: "0 0 10px rgba(56, 189, 248, 0.3)",
                backgroundColor: "#0f172a"
              }}
            />
          </div>
        </Dropdown>
      </div>

      <style>{`
        .user-profile-premium-pill:hover {
          background: rgba(255, 255, 255, 0.08) !important;
          border-color: rgba(56, 189, 248, 0.3) !important;
        }
        .navbar-icon-btn:hover {
          background: rgba(255, 255, 255, 0.05) !important;
        }
        .ant-breadcrumb-link a, .ant-breadcrumb-link {
          color: rgba(255, 255, 255, 0.45) !important;
        }
        .ant-breadcrumb-link a:hover {
          color: #38bdf8 !important;
        }
        .ant-breadcrumb-last-item {
          color: #fff !important;
          font-weight: 600;
        }
      `}</style>
    </div>
  );
};

export default Navbar;
