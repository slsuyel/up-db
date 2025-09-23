/* eslint-disable @typescript-eslint/no-unused-vars */
import { Checkbox, Input, message } from "antd";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import { useUserLoginMutation } from "@/redux/api/auth/authApi";

const Login = () => {
  const [userLogin, { isLoading }] = useUserLoginMutation();

  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/dashboard";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false); // Check if there's a saved email in localStorage when the component mounts

  useEffect(() => {
    const savedEmail = localStorage.getItem("rememberedEmail");
    if (savedEmail) {
      setEmail(savedEmail);
      setRememberMe(true);
    }
  }, []);

  const handleSubmit = async (e: { preventDefault: () => void }) => {
    e.preventDefault();
    try {
      const res = await userLogin({ email, password }).unwrap();
      if (res.status_code == 200) {
        localStorage.setItem("token", res.data.token);
        if (rememberMe) {
          localStorage.setItem("rememberedEmail", email);
        } else {
          localStorage.removeItem("rememberedEmail");
        }
        navigate(from);
      } else if (res.status_code == 401) {
        message.error("Unauthorized access");
        console.error("Unauthorized access");
      } else {
        console.error("Login failed");
      }
    } catch (error) {
      console.error("Login error:", error);
    }
  };

  return (
    <>
      <div className="d-flex align-items-center justify-content-center vh-100 bg-light p-3">
        <div
          className="card p-4 shadow-lg"
          style={{ maxWidth: "450px", width: "100%" }}
        >
          <div className="text-center mb-4">
            <img
              width="60px"
              src="/bangladesh-govt.png"
              alt="Bangladesh Government"
              className="mb-2"
            />
            <h4 className="fw-bold mb-0">স্মার্ট বাংলাদেশ</h4> 
            <p className="text-muted">ক্যাশ লেস, পেপার লেস সেবা সিস্টেম</p> 
          </div>

          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label htmlFor="loginEmail" className="form-label text-secondary">
                ইমেইল
              </label>

              <Input
                id="loginEmail"
                className="form-control"
                placeholder="আপনার ইমেইল লিখুন"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="mb-3">
              <label
                htmlFor="loginPassword"
                className="form-label text-secondary"
              >
                পাসওয়ার্ড
              </label>

              <Input.Password
                id="loginPassword"
                className=" d-flex form-control "
                placeholder="পাসওয়ার্ড লিখুন"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <div className="form-check mb-4">
              <Checkbox
                id="rememberMe"
                className="form-check-input"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />

              <label className="form-check-label" htmlFor="rememberMe">
                মনে রাখুন
              </label>
            </div>
            <div className="d-grid gap-2">
              <button
                disabled={isLoading}
                type="submit"
                className="btn btn-primary btn-lg"
              >
                {isLoading ? "লগইন হচ্ছে..." : "লগইন"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default Login;
