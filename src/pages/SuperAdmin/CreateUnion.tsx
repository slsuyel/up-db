/* eslint-disable @typescript-eslint/no-explicit-any */
import { TDistrict, TUpazila } from "@/types/global";
import { TDivision } from "@/types/global";
import { TUnion } from "@/types/global";
import { ChangeEvent, useEffect, useState } from "react";
import { Form, Input, Button } from "antd";
import Breadcrumbs from "@/components/reusable/Breadcrumbs";

const CreateUnion = () => {
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
      .then((data: TDivision[]) => {
        setDivisions(data);
        // if (user?.division_name) {
        //   const userDivision = data.find((d) => d?.name === user.division_name);
        //   if (userDivision) {
        //     setSelectedDivision(userDivision);
        //   }
        // }
      })
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
          //   if (user?.district_name) {
          //     const userDistrict = filteredDistricts.find(
          //       (d) => d?.name === user.district_name
          //     );
          //     if (userDistrict) {
          //       setSelectedDistrict(userDistrict);
          //     }
          //   }
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
          //   if (user?.upazila_name) {
          //     const userUpazila = filteredUpazilas.find(
          //       (u) => u?.name === user.upazila_name
          //     );
          //     if (userUpazila) {
          //       setSelectedUpazila(userUpazila);
          //     }
          //   }
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
      });
    }
  }, [selectedUnion, form]);

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

  const onFinish = (values: any) => {
    console.log("Received values:", values);
  };

  return (
    <div className="bg-white p-3 rounded">
      <Breadcrumbs current="ইউনিয়ন তৈরি করুন" />
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

        {selectedDivision && (
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
        )}

        {selectedDistrict && (
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
        )}

        {selectedUpazila && (
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
        )}
      </div>

      <div>
        <Form
          className=" row "
          form={form}
          name="my_form"
          onFinish={onFinish}
          layout="vertical"
        >
          {/* Union Details */}
          <fieldset className="col-md-6">
            <legend>Union Details</legend>
            <Form.Item
              className="mb-1"
              label="Short Name English"
              name="short_name_e"
              rules={[
                { required: true, message: "Please input the short name!" },
              ]}
            >
              <Input style={{ height: 36 }} />
            </Form.Item>

            <Form.Item
              className="mb-1"
              label="U Code"
              name="u_code"
              rules={[{ required: true, message: "Please input the U Code!" }]}
            >
              <Input style={{ height: 36 }} />
            </Form.Item>

            <Form.Item
              className="mb-1"
              label="District"
              name="district"
              rules={[
                { required: true, message: "Please input the district!" },
              ]}
            >
              <Input style={{ height: 36 }} />
            </Form.Item>

            <Form.Item
              className="mb-1"
              label="Thana"
              name="thana"
              rules={[{ required: true, message: "Please input the thana!" }]}
            >
              <Input style={{ height: 36 }} />
            </Form.Item>

            <Form.Item
              className="mb-1"
              label="Payment Type"
              name="payment_type"
              rules={[
                { required: true, message: "Please input the payment type!" },
              ]}
            >
              <Input style={{ height: 36 }} />
            </Form.Item>

            <Form.Item
              className="mb-1"
              label="Default Color"
              name="defaultColor"
              rules={[
                { required: true, message: "Please input the default color!" },
              ]}
            >
              <Input style={{ height: 36 }} />
            </Form.Item>

            <Form.Item
              className="mb-1"
              label="AKPAY MER PASS KEY"
              name="AKPAY_MER_PASS_KEY"
              rules={[
                {
                  required: true,
                  message: "Please input the AKPAY MER PASS KEY!",
                },
              ]}
            >
              <Input style={{ height: 36 }} />
            </Form.Item>

            <Form.Item
              className="mb-1"
              label="AKPAY MER REG ID"
              name="AKPAY_MER_REG_ID"
              rules={[
                {
                  required: true,
                  message: "Please input the AKPAY MER REG ID!",
                },
              ]}
            >
              <Input style={{ height: 36 }} />
            </Form.Item>
          </fieldset>

          {/* Chairman Details */}
          <fieldset className="col-md-6">
            <legend>Chairman Details</legend>
            <Form.Item
              className="mb-1"
              label="Chairman Name"
              name="chairman_name"
              rules={[
                { required: true, message: "Please input the chairman name!" },
              ]}
            >
              <Input style={{ height: 36 }} />
            </Form.Item>

            <Form.Item
              className="mb-1"
              label="Chairman Email"
              name="chairman_email"
              rules={[
                { required: true, message: "Please input the chairman email!" },
              ]}
            >
              <Input style={{ height: 36 }} />
            </Form.Item>

            <Form.Item
              className="mb-1"
              label="Chairman Phone"
              name="chairman_phone"
              rules={[
                { required: true, message: "Please input the chairman phone!" },
              ]}
            >
              <Input style={{ height: 36 }} />
            </Form.Item>

            <Form.Item
              className="mb-1"
              label="Chairman Password"
              name="chairman_password"
              rules={[
                {
                  required: true,
                  message: "Please input the chairman password!",
                },
              ]}
            >
              <Input.Password style={{ height: 36 }} />
            </Form.Item>
          </fieldset>

          {/* Secretary Details */}
          <fieldset className="col-md-6">
            <legend>Secretary Details</legend>
            <Form.Item
              className="mb-1"
              label="Secretary Name"
              name="secretary_name"
            >
              <Input style={{ height: 36 }} />
            </Form.Item>

            <Form.Item
              className="mb-1"
              label="Secretary Email"
              name="secretary_email"
            >
              <Input style={{ height: 36 }} />
            </Form.Item>

            <Form.Item
              className="mb-1"
              label="Secretary Phone"
              name="secretary_phone"
            >
              <Input style={{ height: 36 }} />
            </Form.Item>

            <Form.Item
              className="mb-1"
              label="Secretary Password"
              name="secretary_password"
            >
              <Input.Password style={{ height: 36 }} />
            </Form.Item>
          </fieldset>

          {/* Submit Button */}
          <Form.Item className="mb-1">
            <Button type="primary" htmlType="submit">
              Submit
            </Button>
          </Form.Item>
        </Form>
      </div>
    </div>
  );
};

export default CreateUnion;
