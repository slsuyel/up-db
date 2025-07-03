/* eslint-disable @typescript-eslint/no-explicit-any */
import { Layout } from "antd";

import { Outlet } from "react-router-dom";

import Navbar from "./Navbar";
import { useEffect, useState } from "react";
import Sidebar from "./Sidebar";
import { useSiteSettingQuery } from "@/redux/api/auth/authApi";
import { useAppDispatch } from "@/redux/features/hooks";
import { setData, setIsUnion } from "@/redux/features/user/siteSettingSlice";
const { Header, Content, Footer } = Layout;
const UserLayout = () => {
  const dispatch = useAppDispatch(); 
  const token = localStorage.getItem(`token`)
  const { data } = useSiteSettingQuery({token})
  const theme = false;
  const [scrollY, setScrollY] = useState(0);
  useEffect(() => {
    if (data?.data) {
      dispatch(setData(data.data)); 
      const unionItem = data.data.find((item: { key: string; }) => item.key === 'union');
      const isUnion = unionItem ? unionItem.value === 'true' : false;
      dispatch(setIsUnion(isUnion));  
    }
  }, [data, dispatch]);
  



  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);


  return (
    <Layout >
      <Sidebar />
      <Layout>
        <Header
          style={{
            display: "flex",
            alignItems: "center",
            position: "fixed",
            // justifyContent: 'end',
            width: "100%",
            zIndex: 1000,
            backgroundColor: !theme
              ? scrollY > 0
                ? "rgba(0, 0, 0, 0.8)"
                : "#001529"
              : scrollY > 0
                ? "#fffcfc8a"
                : "white",

            backdropFilter: scrollY > 0 ? "blur(4px)" : "none",
            transition: "background-color 0.3s, backdrop-filter 0.3s",
          }}
        >
          <Navbar />
        </Header>
        <Content
          style={{ margin: "24px 0px 0" }}
          className={`${!theme ? "dark " : ""}`}
        >
          <div
            style={{
              padding: 24,
              minHeight: 360,
              marginTop: "50px",
            }}
          >
            <Outlet />
          </div>
        </Content>
        <Footer className={`${!theme ? "dark border-top" : ""}`}>
          <footer>
            <div className="float-right d-none d-sm-inline">Version 1.0.0 </div>
            <strong>Copyright © 2020-2026 সফটওয়েব সিস্টেম সল্যুশন</strong>
            {""} || All rights reserved.
          </footer>
        </Footer>
      </Layout>
    </Layout>
  );
};

export default UserLayout;
