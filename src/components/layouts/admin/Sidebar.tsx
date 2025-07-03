/* eslint-disable @typescript-eslint/no-explicit-any */

import useAllServices from "@/hooks/useAllServices";
import { useAppSelector } from "@/redux/features/hooks";
import { RootState } from "@/redux/features/store";
import { Badge, Layout, Menu } from "antd";
import { Link } from "react-router-dom";

const { Sider } = Layout;
const { SubMenu } = Menu;

const theme = false;

// Define the type for sidebar items
type SidebarItemBase = {
  key: string;
  title: string;
  slug?: string;
  pendingCount?: string | number;
};

type SidebarItemWithSubmenu = SidebarItemBase & {
  submenu: SidebarItem[];
  new_sonod?: number;
};

type SidebarItemWithoutSubmenu = SidebarItemBase & {
  submenu?: never;
};

type SidebarItem = SidebarItemWithSubmenu | SidebarItemWithoutSubmenu;

const Sidebar = () => {
  const user = useAppSelector((state: RootState) => state.user.user);

  const services = useAllServices();
  const sidebarItems: SidebarItem[] = [
    {
      key: "dashboard",
      title: "ড্যাশবোর্ড",
      slug: "",
      pendingCount: 0,
    },



    ...(user?.position === "Super Admin"
      ? [{ key: "sonod-search", title: "সনদ অনুসন্ধান", slug: "/sonod-search" }]
      : []),

    ...(user?.position === "Super Admin"
      ? [{ key: "maintance-fees", title: "রক্ষণাবেক্ষণ ফি", slug: "/maintance-fees" }]
      : []),

    ...(user?.position === "Super Admin"
      ? [{ key: "union-create", title: "ইউনিয়ন তৈরি", slug: "/create-union" }]
      : []),

    ...(user?.position === "Super Admin"
      ? [{ key: "ekpay-report", title: "একপে প্রতিবেদন", slug: "/ekpay-report" }]
      : []),



    { key: "reports", title: "লেনদেনের প্রতিবেদন", slug: "/reports" },
    { key: "payment-failed", title: "পেমেন্ট ফেইল্ড", slug: "/payment-failed" },
    { key: "search", title: "সকল প্রতিবেদন", slug: "/up-search" },
    { key: "holdingTax", title: "হোল্ডিং ট্যাক্স ম্যানেজ", slug: "/holding-manage" },
    { key: "sonod-fee", title: "সনদ ফি", slug: "/sonod-fee" },

    ...(user?.position === "Super Admin"
      ? [{ key: "tradelicense_fees", title: "ট্রেড লাইসেন্স ফি ব্যবস্থাপনা", slug: "/tradelicense/fees" },]
      : []),



    ...services.map((service, index) => ({
      key: `service-${index}`,
      title: service.title,
      slug: `/sonod-base-report/${service.title}`,
    })),
  ];

  return (
    <Sider
      style={{ minHeight: "100vh" }}
      theme={theme ? "light" : "dark"}
      breakpoint="lg"
      collapsedWidth="0"
    >
      <div
        className="border-bottom "
        style={{
          height: "65px",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <img
          src={"https://school-suyel.netlify.app/assets/dblogo-ixqnXm-n.png"}
          alt=""
          width={150}
        />
      </div>
      <Menu
        theme={theme ? "light" : "dark"}
        mode="inline"
        defaultSelectedKeys={["4"]}
      >
        {sidebarItems.map((item) =>
          item.submenu ? (
            <SubMenu
              key={item.key}
              title={
                <>
                  {item.title}{" "}
                  <Badge className="bg-danger rounded-circle p-2">
                    {item.pendingCount}
                  </Badge>
                </>
              }
            >
              {item.submenu.map((subItem) => (
                <Menu.Item key={subItem.key}>
                  <Link
                    className="text-decoration-none"
                    to={`/dashboard${subItem.slug}`}
                  >
                    {subItem.title}
                  </Link>
                </Menu.Item>
              ))}
            </SubMenu>
          ) : (
            <Menu.Item key={item.key}>
              <Link
                className="text-decoration-none"
                to={`/dashboard${item.slug}`}
              >
                {item.title}{" "}
              </Link>
            </Menu.Item>
          )
        )}
      </Menu>
    </Sider>
  );
};

export default Sidebar;
