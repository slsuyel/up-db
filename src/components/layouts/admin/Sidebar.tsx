/* eslint-disable @typescript-eslint/no-explicit-any */
import useAllServices from "@/hooks/useAllServices";
import { useAppSelector } from "@/redux/features/hooks";
import { RootState } from "@/redux/features/store";
import {
  AppstoreOutlined,
  DashboardOutlined,
  FileDoneOutlined,
  FileTextOutlined,
  SearchOutlined,
  SettingOutlined,
  CustomerServiceOutlined,
  LogoutOutlined,
  UserOutlined,
  CloseOutlined
} from "@ant-design/icons";
import { Menu, ConfigProvider, Avatar, Button } from "antd";
import { Link, useLocation, useNavigate } from "react-router-dom";

const { SubMenu } = Menu;

const Sidebar = ({ onClose }: { onClose?: () => void }) => {
  const user = useAppSelector((state: RootState) => state.user.user);
  const location = useLocation();
  const navigate = useNavigate();
  const services = useAllServices();

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
    if (onClose) onClose();
  };

  const menuItems = [
    {
      key: "dashboard",
      title: "ড্যাশবোর্ড",
      slug: "",
      icon: <DashboardOutlined />,
    },
    ...(user?.position === "Super Admin"
      ? [
        { key: "sonod-search", title: "সনদ অনুসন্ধান", slug: "/sonod-search", icon: <SearchOutlined /> },
        { key: "supports", title: "সাপোর্ট", slug: "/supports", icon: <CustomerServiceOutlined /> }
      ]
      : []),

    ...(user?.position === "Super Admin"
      ? [
        {
          key: "admin",
          title: "অ্যাডমিন",
          icon: <SettingOutlined />,
          submenu: [
            { key: "maintance-fees", title: "রক্ষণাবেক্ষণ ফি", slug: "/maintance-fees" },
            { key: "union-create", title: "ইউনিয়ন তৈরি", slug: "/create-union" },
            { key: "system-settings", title: "সিস্টেম সেটিংস", slug: "/system-settings" },
            { key: "ekpay-report", title: "একপে প্রতিবেদন", slug: "/ekpay-report" },
          ],
        },
      ]
      : []),

    {
      key: "reports",
      title: "প্রতিবেদন",
      icon: <FileTextOutlined />,
      submenu: [
        { key: "reports", title: "লেনদেনের প্রতিবেদন", slug: "/reports" },
        { key: "payment-failed", title: "পেমেন্ট ফেইল্ড", slug: "/payment-failed" },
        { key: "search", title: "সকল প্রতিবেদন", slug: "/up-search" },
      ],
    },

    {
      key: "management",
      title: "ম্যানেজমেন্ট",
      icon: <AppstoreOutlined />,
      submenu: [
        { key: "holdingTax", title: "হোল্ডিং ট্যাক্স ম্যানেজ", slug: "/holding-manage" },
        { key: "sonod-fee", title: "সনদ ফি", slug: "/sonod-fee" },
        ...(user?.position === "Super Admin"
          ? [{ key: "tradelicense_fees", title: "ট্রেড লাইসেন্স ফি ব্যবস্থাপনা", slug: "/tradelicense/fees" }]
          : []),
      ],
    },

    {
      key: "sonod-management",
      title: "সনদ ম্যানেজমেন্ট",
      icon: <FileDoneOutlined />,
      submenu: [
        ...services.map((service, index) => ({
          key: `service-${index}`,
          title: service.title,
          slug: `/sonod-base-report/${service.title}`,
        })),
      ],
    },

    {
      key: "admin-settings",
      title: "অ্যাডমিন (সকল)",
      icon: <SettingOutlined />,
      submenu: [
        { key: "site-settings", title: "সাইট সেটিংস", slug: "/site-settings" },
        { key: "users", title: "ব্যবহারকারী", slug: "/users" },
      ],
    },
  ];

  return (
    <ConfigProvider
      theme={{
        components: {
          Menu: {
            darkItemBg: "transparent",
            darkItemColor: "rgba(255, 255, 255, 0.65)",
            darkItemSelectedBg: "rgba(56, 189, 248, 0.1)",
            darkItemSelectedColor: "#38bdf8",
            darkSubMenuItemBg: "transparent",
            itemBorderRadius: 10,
            itemMarginInline: 12,
            itemHoverBg: "rgba(255, 255, 255, 0.05)",
          },
        },
      }}
    >
      <div
        className="sidebar-main-container"
        style={{
          height: "100vh",
          background: "linear-gradient(195deg, #1e293b 0%, #0f172a 100%)",
          display: "flex",
          flexDirection: "column",
          width: "100%",
          boxShadow: "10px 0 30px rgba(0, 0, 0, 0.2)",
          overflow: "hidden"
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
          <div
            className="sidebar-logo-container"
            style={{
              height: "80px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "0 24px",
              background: "rgba(255, 255, 255, 0.02)",
              backdropFilter: "blur(5px)",
              borderBottom: "1px solid rgba(255, 255, 255, 0.05)",
              flexShrink: 0,
            }}
          >
            <img
              src={"https://school-suyel.netlify.app/assets/dblogo-ixqnXm-n.png"}
              alt="Logo"
              style={{ width: "140px", height: "auto", filter: "drop-shadow(0 0 10px rgba(56, 189, 248, 0.2))" }}
            />
            {onClose && (
              <Button
                type="text"
                icon={<CloseOutlined style={{ color: "#fff", fontSize: "22px" }} />}
                onClick={onClose}
                className="d-flex align-items-center justify-content-center"
                style={{ background: "rgba(255,255,255,0.05)", borderRadius: "8px" }}
              />
            )}
          </div>

          <div style={{ flex: 1, overflowY: "auto", overflowX: "hidden" }} className="custom-sidebar-scroll">
            <Menu
              theme="dark"
              mode="inline"
              selectedKeys={[location.pathname.split("/").pop() || "dashboard"]}
              style={{ border: "none", background: "transparent", marginTop: "10px" }}
              onClick={() => { if (onClose) onClose(); }}
            >
              {menuItems.map((item) =>
                item.submenu ? (
                  <SubMenu
                    key={item.key}
                    icon={item.icon}
                    title={<span style={{ fontWeight: 600, fontSize: "14px" }}>{item.title}</span>}
                  >
                    {item.submenu.map((subItem) => (
                      <Menu.Item key={subItem.key}>
                        <Link
                          className="text-decoration-none"
                          to={`/dashboard${subItem.slug}`}
                          style={{ fontSize: "13px" }}
                        >
                          {subItem.title}
                        </Link>
                      </Menu.Item>
                    ))}
                  </SubMenu>
                ) : (
                  <Menu.Item key={item.key} icon={item.icon}>
                    <Link
                      className="text-decoration-none"
                      to={`/dashboard${item.slug}`}
                      style={{ fontWeight: 600, fontSize: "14px" }}
                    >
                      {item.title}
                    </Link>
                  </Menu.Item>
                )
              )}
            </Menu>
            <div style={{ height: "20px" }}></div>
          </div>

          <div style={{
            padding: "20px",
            background: "rgba(15, 23, 42, 0.8)",
            borderTop: "1px solid rgba(255, 255, 255, 0.05)",
            backdropFilter: "blur(15px)",
            flexShrink: 0,
          }}>
            <div className="d-flex align-items-center gap-3 mb-3">
              <Avatar
                size={48}
                icon={<UserOutlined />}
                src={(user as any)?.image}
                style={{
                  border: "2px solid #38bdf8",
                  backgroundColor: "#1e293b",
                  boxShadow: "0 0 15px rgba(56, 189, 248, 0.2)"
                }}
              />
              <div style={{ overflow: "hidden" }}>
                <div style={{
                  color: "#fff",
                  fontWeight: 700,
                  fontSize: "15px",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis"
                }}>
                  {user?.name || "Admin User"}
                </div>
                <div style={{
                  color: "rgba(255, 255, 255, 0.45)",
                  fontSize: "12px",
                  textTransform: "uppercase",
                  letterSpacing: "1px"
                }}>
                  {user?.position || "Administrator"}
                </div>
              </div>
            </div>
            <Button
              type="primary"
              danger
              icon={<LogoutOutlined />}
              onClick={handleLogout}
              block
              style={{
                height: "40px",
                borderRadius: "8px",
                fontWeight: 600,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "rgba(255, 77, 79, 0.1)",
                border: "1px solid rgba(255, 77, 79, 0.15)",
                color: "#ff4d4f"
              }}
              className="btn-logout-premium"
            >
              লগ আউট
            </Button>
          </div>
        </div>

        <style>{`
          .custom-sidebar-scroll::-webkit-scrollbar {
            width: 4px;
          }
          .custom-sidebar-scroll::-webkit-scrollbar-track {
            background: transparent;
          }
          .custom-sidebar-scroll::-webkit-scrollbar-thumb {
            background: rgba(255, 255, 255, 0.08);
            border-radius: 10px;
          }
          .custom-sidebar-scroll::-webkit-scrollbar-thumb:hover {
            background: rgba(56, 189, 248, 0.3);
          }
          .ant-menu-item-selected {
            background: linear-gradient(90deg, rgba(56, 189, 248, 0.1) 0%, transparent 100%) !important;
            border-right: 3px solid #38bdf8 !important;
          }
          .btn-logout-premium:hover {
            background: #ff4d4f !important;
            color: #fff !important;
          }
        `}</style>
      </div>
    </ConfigProvider>
  );
};

export default Sidebar;
