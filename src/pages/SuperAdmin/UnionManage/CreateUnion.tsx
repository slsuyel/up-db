/* eslint-disable @typescript-eslint/no-explicit-any */
import { TDistrict, TUpazila } from "@/types/global";
import { TDivision } from "@/types/global";
import { TUnion } from "@/types/global";
import { ChangeEvent, useEffect, useState } from "react";
import { Form, Input, Button, message } from "antd";

import { useCreateUnionMutation } from "@/redux/api/auth/authApi";
import { useAppSelector } from "@/redux/features/hooks";
import { RootState } from "@/redux/features/store";
import { useNavigate } from "react-router-dom";

interface TUnionDetails {
  short_name_e: string;
  u_code: string;
  district: string;
  thana: string;
  payment_type: string;
  defaultColor: string;
  AKPAY_MER_PASS_KEY: string;
  AKPAY_MER_REG_ID: string;
  chairman_name: string;
  chairman_email: string;
  chairman_phone: string;
  chairman_password: string;
  secretary_name: string;
  secretary_email: string;
  secretary_phone: string;
  secretary_password: string;
}

const CreateUnion = () => {
  const navigate = useNavigate();
  const user = useAppSelector((state: RootState) => state.user.user);

  useEffect(() => {
    if (user?.position !== "Super Admin") {
      navigate("/");
    }
  }, [navigate, user]);

  const [createUnion, { isLoading }] = useCreateUnionMutation();
  const [selectedUnion, setSelectedUnion] = useState<TUnion | null>(null);
  const [selectedDivision, setSelectedDivision] = useState<TDivision | null>(
    null
  );
  const [selectedDistrict, setSelectedDistrict] = useState<TDistrict | null>(
    null
  );
  const [selectedUpazila, setSelectedUpazila] = useState<TUpazila | null>(null);
  const [divisions, setDivisions] = useState<TDivision[]>([]);
  const [districts, setDistricts] = useState<TDistrict[]>([]);
  const [upazilas, setUpazilas] = useState<TUpazila[]>([]);
  const [unions, setUnions] = useState<TUnion[]>([]);
  const [form] = Form.useForm();

  useEffect(() => {
    fetch("/divisions.json")
      .then((res) => res.json())
      .then((data: TDivision[]) => setDivisions(data))
      .catch((error) => console.error("Error fetching divisions data:", error));
  }, []);

  useEffect(() => {
    if (selectedDivision) {
      fetch("/districts.json")
        .then((response) => response.json())
        .then((data: TDistrict[]) => {
          const filteredDistricts = data.filter(
            (d) => d?.division_id === selectedDivision.id
          );
          setDistricts(filteredDistricts);
        })
        .catch((error) =>
          console.error("Error fetching districts data:", error)
        );
    }
  }, [selectedDivision]);

  useEffect(() => {
    if (selectedDistrict) {
      fetch("/upazilas.json")
        .then((response) => response.json())
        .then((data: TUpazila[]) => {
          const filteredUpazilas = data.filter(
            (upazila) => upazila.district_id === selectedDistrict.id
          );
          setUpazilas(filteredUpazilas);
        })
        .catch((error) =>
          console.error("Error fetching upazilas data:", error)
        );
    }
  }, [selectedDistrict]);

  useEffect(() => {
    if (selectedUpazila) {
      fetch("/unions.json")
        .then((response) => response.json())
        .then((data: TUnion[]) => {
          const filteredUnions = data.filter(
            (union) => union.upazilla_id === selectedUpazila.id
          );
          setUnions(filteredUnions);
        })
        .catch((error) => console.error("Error fetching unions data:", error));
    }
  }, [selectedUpazila]);

  useEffect(() => {
    if (selectedUnion) {
      form.setFieldsValue({
        short_name_e: selectedUnion.name.replace(/\s+/g, "").toLowerCase(),
        u_code: "123456",
        district: selectedDistrict?.name || "",
        thana: selectedUpazila?.name || "",
        payment_type: "Prepaid",
        defaultColor: "green",
        chairman_name: "চেয়ারম্যানের নাম",
        chairman_phone: "01234567890",
        secretary_name: "সেক্রেটারির নাম",
        secretary_phone: "01234567891",
      });
    }
  }, [selectedUnion, form, selectedDistrict?.name, selectedUpazila?.name]);

  const handleDivisionChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const division = divisions.find((d) => d.id === event.target.value);
    setSelectedDivision(division || null);
    setSelectedDistrict(null);
    setSelectedUpazila(null);
    setSelectedUnion(null);
  };

  const handleDistrictChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const district = districts.find((d) => d.id === event.target.value);
    setSelectedDistrict(district || null);
    setSelectedUpazila(null);
  };

  const handleUpazilaChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const upazila = upazilas.find((u) => u.id === event.target.value);
    setSelectedUpazila(upazila || null);
  };

  const handleUnionChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const union = unions.find((u) => u.id === event.target.value);
    setSelectedUnion(union || null);
  };

  const onFinish = async (values: TUnionDetails) => {
    try {
      const res = await createUnion({
        data: values,
        token: localStorage.getItem("token"),
      }).unwrap();
      if (res.status_code === 201) {
        message.success("Union created successfully!");
      } else {
        message.error(
          `Failed to create union: ${res.message || "Unknown error"}`
        );
      }
    } catch (error: any) {
      const errorMessage =
        error?.data?.message || error?.message || "An error occurred";
      message.error(`Error: ${errorMessage}`);
    }
  };

  return (
    <>
      <div className="row mx-auto">
        <div className="col-md-2">
          <label htmlFor="division">বিভাগ নির্বাচন করুন</label>
          <select
            id="division"
            className="searchFrom form-control"
            value={selectedDivision?.id || ""}
            onChange={handleDivisionChange}
          >
            <option value="">বিভাগ নির্বাচন করুন</option>
            {divisions.map((d) => (
              <option key={d.id} value={d.id}>
                {d.bn_name}
              </option>
            ))}
          </select>
        </div>

        <div className="col-md-2">
          <label htmlFor="district">জেলা নির্বাচন করুন</label>
          <select
            id="district"
            className="searchFrom form-control"
            value={selectedDistrict?.id || ""}
            onChange={handleDistrictChange}
          >
            <option value="">জেলা নির্বাচন করুন</option>
            {districts.map((d) => (
              <option key={d.id} value={d.id}>
                {d.bn_name}
              </option>
            ))}
          </select>
        </div>

        <div className="col-md-2">
          <label htmlFor="upazila">উপজেলা নির্বাচন করুন</label>
          <select
            id="upazila"
            className="searchFrom form-control"
            value={selectedUpazila?.id || ""}
            onChange={handleUpazilaChange}
          >
            <option value="">উপজেলা নির্বাচন করুন</option>
            {upazilas.map((u) => (
              <option key={u.id} value={u.id}>
                {u.bn_name}
              </option>
            ))}
          </select>
        </div>

        <div className="col-md-2">
          <label htmlFor="union">ইউনিয়ন নির্বাচন করুন</label>
          <select
            id="union"
            className="searchFrom form-control"
            value={selectedUnion?.id || ""}
            onChange={handleUnionChange}
          >
            <option value="">ইউনিয়ন নির্বাচন করুন</option>
            {unions.map((u) => (
              <option key={u.id} value={u.id}>
                {u.bn_name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <Form
        form={form}
        name="my_form"
        onFinish={onFinish}
        layout="vertical"
        className="mt-4"
      >
        <div className="row">
          {/* Union Details */}
          <div className="col-md-6">
            <fieldset className="border p-3 rounded">
              <legend className="w-auto px-2">ইউনিয়নের বিবরণ</legend>
              <Form.Item
                className="mb-3"
                label="সংক্ষিপ্ত নাম (ইংরেজি)"
                name="short_name_e"
                rules={[
                  {
                    required: false,
                    message: "দয়া করে সংক্ষিপ্ত নাম ইনপুট করুন!",
                  },
                ]}
              >
                <Input style={{ height: 36 }} />
              </Form.Item>

              <Form.Item
                className="mb-3"
                label="ইউনিয়ন কোড"
                name="u_code"
                rules={[
                  {
                    required: false,
                    message: "দয়া করে ইউনিয়ন কোড ইনপুট করুন!",
                  },
                ]}
              >
                <Input style={{ height: 36 }} />
              </Form.Item>

              <Form.Item
                className="mb-3"
                label="জেলা"
                name="district"
                rules={[
                  { required: false, message: "দয়া করে জেলা ইনপুট করুন!" },
                ]}
              >
                <Input style={{ height: 36 }} />
              </Form.Item>

              <Form.Item
                className="mb-3"
                label="থানা"
                name="thana"
                rules={[
                  { required: false, message: "দয়া করে থানা ইনপুট করুন!" },
                ]}
              >
                <Input style={{ height: 36 }} />
              </Form.Item>

              <Form.Item
                className="mb-3"
                label="পেমেন্ট টাইপ"
                name="payment_type"
                rules={[
                  {
                    required: false,
                    message: "দয়া করে পেমেন্ট টাইপ ইনপুট করুন!",
                  },
                ]}
              >
                <Input style={{ height: 36 }} />
              </Form.Item>

              <Form.Item
                className="mb-3"
                label="ডিফল্ট রং"
                name="defaultColor"
                rules={[
                  {
                    required: false,
                    message: "দয়া করে ডিফল্ট রং ইনপুট করুন!",
                  },
                ]}
              >
                <Input style={{ height: 36 }} />
              </Form.Item>

              <Form.Item
                className="mb-3"
                label="AKPAY_MER_REG_ID"
                name="AKPAY_MER_REG_ID"
                rules={[
                  {
                    required: false,
                    message: "দয়া করে AKPAY_MER_REG_ID ইনপুট করুন!",
                  },
                ]}
              >
                <Input style={{ height: 36 }} />
              </Form.Item>
              <Form.Item
                className="mb-3"
                label="AKPAY_MER_PASS_KEY"
                name="AKPAY_MER_PASS_KEY"
                rules={[
                  {
                    required: false,
                    message: "দয়া করে AKPAY_MER_PASS_KEY কী ইনপুট করুন!",
                  },
                ]}
              >
                <Input style={{ height: 36 }} />
              </Form.Item>
            </fieldset>
          </div>

          {/* Chairman and Secretary Details */}
          <div className="col-md-6">
            <fieldset className="border p-3 rounded">
              <legend className="w-auto px-2">চেয়ারম্যানের বিবরণ</legend>
              <Form.Item
                className="mb-3"
                label="চেয়ারম্যানের নাম"
                name="chairman_name"
                rules={[
                  {
                    required: false,
                    message: "দয়া করে চেয়ারম্যানের নাম ইনপুট করুন!",
                  },
                ]}
              >
                <Input style={{ height: 36 }} />
              </Form.Item>

              <Form.Item
                className="mb-3"
                label="চেয়ারম্যানের ইমেইল"
                name="chairman_email"
                rules={[
                  {
                    required: false,
                    message: "দয়া করে চেয়ারম্যানের ইমেইল ইনপুট করুন!",
                  },
                ]}
              >
                <Input style={{ height: 36 }} />
              </Form.Item>

              <Form.Item
                className="mb-3"
                label="চেয়ারম্যানের ফোন"
                name="chairman_phone"
                rules={[
                  {
                    required: false,
                    message: "দয়া করে চেয়ারম্যানের ফোন ইনপুট করুন!",
                  },
                ]}
              >
                <Input style={{ height: 36 }} />
              </Form.Item>

              <Form.Item
                className="mb-3"
                label="চেয়ারম্যানের পাসওয়ার্ড"
                name="chairman_password"
                rules={[
                  {
                    required: false,
                    message: "দয়া করে চেয়ারম্যানের পাসওয়ার্ড ইনপুট করুন!",
                  },
                ]}
              >
                <Input.Password style={{ height: 36 }} />
              </Form.Item>
            </fieldset>

            <fieldset className="border p-3 rounded mt-4">
              <legend className="w-auto px-2">সেক্রেটারির বিবরণ</legend>
              <Form.Item
                className="mb-3"
                label="সেক্রেটারির নাম"
                name="secretary_name"
              >
                <Input style={{ height: 36 }} />
              </Form.Item>

              <Form.Item
                className="mb-3"
                label="সেক্রেটারির ইমেইল"
                name="secretary_email"
              >
                <Input style={{ height: 36 }} />
              </Form.Item>

              <Form.Item
                className="mb-3"
                label="সেক্রেটারির ফোন"
                name="secretary_phone"
              >
                <Input style={{ height: 36 }} />
              </Form.Item>

              <Form.Item
                className="mb-3"
                label="সেক্রেটারির পাসওয়ার্ড"
                name="secretary_password"
              >
                <Input.Password style={{ height: 36 }} />
              </Form.Item>
            </fieldset>
          </div>
        </div>

        {/* Submit Button */}
        <div className="row mt-4">
          <div className="col-md-12 text-center">
            <Form.Item>
              <Button
                loading={isLoading}
                disabled={isLoading}
                type="primary"
                htmlType="submit"
                size="large"
              >
                জমা দিন
              </Button>
            </Form.Item>
          </div>
        </div>
      </Form>
    </>
  );
};

export default CreateUnion;
