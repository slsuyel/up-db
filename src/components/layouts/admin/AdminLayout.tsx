/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from "react";
import { Layout, ConfigProvider, Drawer } from "antd";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import { useSiteSettingQuery } from "@/redux/api/auth/authApi";
import { useAppDispatch } from "@/redux/features/hooks";
import { setData, setIsUnion } from "@/redux/features/user/siteSettingSlice";

const { Header, Content, Footer } = Layout;

const AdminLayout: React.FC = () => {
  const dispatch = useAppDispatch();
  const token = localStorage.getItem(`token`);
  const { data } = useSiteSettingQuery({ token });

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    if (data?.data) {
      dispatch(setData(data.data));
      const unionItem = data.data.find((item: any) => item.key === 'union');
      const isUnion = unionItem ? unionItem.value === 'true' : false;
      dispatch(setIsUnion(isUnion));
    }
  }, [data, dispatch]);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 992);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: "#38bdf8",
          borderRadius: 8,
        },
      }}
    >
      <Layout style={{ minHeight: '100vh', background: '#f8fafc' }}>
        {/* Desktop Sidebar - Side-load for fixed positioning */}
        {!isMobile && (
          <div style={{
            width: "280px",
            height: "100vh",
            position: "fixed",
            left: 0,
            top: 0,
            zIndex: 1001,
            flexShrink: 0
          }}>
            <Sidebar />
          </div>
        )}

        {/* Mobile Sidebar (Drawer) */}
        {isMobile && (
          <Drawer
            placement="left"
            onClose={() => setIsMobileMenuOpen(false)}
            open={isMobileMenuOpen}
            styles={{ body: { padding: 0 } }}
            width={280}
            closable={false}
          >
            <Sidebar onClose={() => setIsMobileMenuOpen(false)} />
          </Drawer>
        )}

        {/* Main Wrapper */}
        <Layout style={{
          marginLeft: isMobile ? 0 : "280px",
          transition: "margin 0.2s cubic-bezier(0.645, 0.045, 0.355, 1)",
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          background: '#f8fafc'
        }}>
          <Header
            style={{
              padding: 0,
              height: "70px",
              background: "#1e293b",
              position: "fixed",
              top: 0,
              right: 0,
              zIndex: 1000,
              width: isMobile ? "100%" : "calc(100% - 280px)",
              transition: "width 0.2s cubic-bezier(0.645, 0.045, 0.355, 1)",
              lineHeight: "normal",
            }}
          >
            <Navbar onMenuClick={() => setIsMobileMenuOpen(true)} />
          </Header>

          <Content
            style={{
              padding: isMobile ? '8px' : '24px',
              marginTop: '70px',
              flex: 1,
              background: 'transparent'
            }}
          >
            <div
              className="animate__animated animate__fadeIn"
              style={{
                padding: isMobile ? '12px' : '30px',
                background: '#fff',
                borderRadius: '16px',
                boxShadow: '0 4px 25px rgba(0,0,0,0.02)',
                minHeight: '100%',
              }}
            >
              <Outlet />
            </div>
          </Content>

          <Footer
            style={{
              textAlign: 'center',
              padding: '24px',
              background: '#fff',
              borderTop: '1px solid rgba(0, 0, 0, 0.05)',
              color: 'rgba(0,0,0,0.45)',
              fontSize: '13px'
            }}
          >
            <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 container-fluid">
              <div>
                <strong>Copyright © 2026</strong> || সফটওয়েব সিস্টেম সল্যুশন
              </div>
              <div style={{ fontWeight: 500 }}>
                Digital Union Management System v1.2.0
              </div>
            </div>
          </Footer>
        </Layout>
      </Layout>
    </ConfigProvider>
  );
};

export default AdminLayout;
