/* eslint-disable @typescript-eslint/no-unused-vars */
import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Checkbox, Input, message } from "antd";

import { useUserLoginMutation } from "@/redux/api/auth/authApi";

const Login = () => {
  const [userLogin, { isLoading }] = useUserLoginMutation();

  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/dashboard";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);

  // Check if there's a saved email in localStorage when the component mounts
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
      <div className="row mx-auto py-5  ">
        <div className="col-md-4 mx-auto my-3 pt-5">
          <div className="p-3 w-100 mx-auto border-0 rounded shadow py-5">
            <form onSubmit={handleSubmit} className="px-3">
              <div className="form-group mb-2">
                <label
                  className="fs-5 my-1 text-secondary"
                  htmlFor="loginEmail"
                >
                  ইমেইল
                </label>
                <Input
                  id="loginEmail"
                  placeholder="আপনার ইমেইল লিখুন"
                  style={{ height: 35 }}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="form-group mb-2">
                <label
                  className="fs-5 my-1 text-secondary"
                  htmlFor="loginPassword"
                >
                  পাসওয়ার্ড
                </label>
                <Input.Password
                  className=""
                  id="loginPassword"
                  placeholder="পাসওয়ার্ড লিখুন"
                  style={{ height: 35 }}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <div className="d-flex justify-content-between mb-3">
                <div className="form-group ">
                  <Checkbox
                    id="rememberMe"
                    className="text-color"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                  >
                    মনে রাখুন
                  </Checkbox>
                </div>
              </div>
              <div className="form-group">
                <button
                  disabled={isLoading}
                  type="submit"
                  className="border-1 btn_main w-100"
                >
                  {isLoading ? "লগইন হচ্ছে..." : "লগইন"}
                </button>
              </div>
            </form>
            <div className="text-center mt-5">
              <img width="50px" src="/bangladesh-govt.png" alt="" />{" "}
              <h4 style={{ margin: "10px 0px 0px" }}>স্মার্ট বাংলাদেশ</h4>
              ক্যাশ লেস , পেপার লেস সেবা সিস্টেম
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Login;
