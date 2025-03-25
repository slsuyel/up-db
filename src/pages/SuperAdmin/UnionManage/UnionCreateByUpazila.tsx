/* eslint-disable @typescript-eslint/no-explicit-any */

import { TDistrict, TUpazila } from "@/types/global";
import { TDivision } from "@/types/global";
import { ChangeEvent, useEffect, useState } from "react";
import { Button, Form, Input, message, Modal } from "antd";

import {
  useCreateUnionByUpazilaMutation,
  useShowUnionByUpazilaMutation,
  useUpdateUnionMutation,
} from "@/redux/api/auth/authApi";
import { useAppSelector } from "@/redux/features/hooks";
import { RootState } from "@/redux/features/store";
import { useNavigate } from "react-router-dom";

interface TUnionParishad {
  chairman_phone: string|null;
  secretary_phone: string|null;
  udc_phone: string|null;
  user_phone: string|null;
  id: number;
  full_name: string;
  short_name_e: string;
  short_name_b: string;
  thana: string;
  district: string;
  c_type: string;
  c_type_en: string | null;
  u_code: string;
  full_name_en: string | null;
  district_en: string | null;
  thana_en: string | null;
  upazila_name: string;
  upazila_bn_name: string;
  district_name: string;
  district_bn_name: string;
  division_name: string;
  division_bn_name: string;
  AKPAY_MER_REG_ID: string;
  AKPAY_MER_PASS_KEY: string;
}

const UnionCreateByUpazila = () => {
  const token = localStorage.getItem("token");
  const [ekpayEditModal, setEkpayEditModal] = useState(false);
  const [selectedUnion, setSelectedUnion] = useState<TUnionParishad | null>(
    null
  );
  const navigate = useNavigate();
  const user = useAppSelector((state: RootState) => state.user.user);

  useEffect(() => {
    if (user?.position !== "Super Admin") {
      navigate("/");
    }
  }, [navigate, user]);

  const [createUnionByUpazila, { isLoading }] =
    useCreateUnionByUpazilaMutation();
  const [updateUnion, { isLoading: updating }] = useUpdateUnionMutation();
  const [showUnionByUpazila, { isLoading: showing, data }] =
    useShowUnionByUpazilaMutation();

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

  const [form] = Form.useForm();

  // Load last selected upazila from localStorage on component mount
  useEffect(() => {
    const lastSelectedUpazilaId = localStorage.getItem("lastSelectedUpazilaId");
    if (lastSelectedUpazilaId) {
      // Fetch upazilas and set the selected upazila
      fetch("/upazilas.json")
        .then((response) => response.json())
        .then((data: TUpazila[]) => {
          const upazila = data.find((u) => u.id === lastSelectedUpazilaId);
          if (upazila) {
            setSelectedUpazila(upazila);
            // Fetch districts and divisions to set the selected district and division
            fetch("/districts.json")
              .then((response) => response.json())
              .then((districtsData: TDistrict[]) => {
                const district = districtsData.find(
                  (d) => d.id === upazila.district_id
                );
                if (district) {
                  setSelectedDistrict(district);
                  fetch("/divisions.json")
                    .then((response) => response.json())
                    .then((divisionsData: TDivision[]) => {
                      const division = divisionsData.find(
                        (d) => d.id === district.division_id
                      );
                      if (division) {
                        setSelectedDivision(division);
                      }
                    });
                }
              });
          }
        });
    }
  }, []);

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

  const handleDivisionChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const division = divisions.find((d) => d.id === event.target.value);
    setSelectedDivision(division || null);
    setSelectedDistrict(null);
    setSelectedUpazila(null);
  };

  const handleDistrictChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const district = districts.find((d) => d.id === event.target.value);
    setSelectedDistrict(district || null);
    setSelectedUpazila(null);
  };

  const handleUpazilaChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const upazila = upazilas.find((u) => u.id === event.target.value);
    setSelectedUpazila(upazila || null);
    // Store the selected upazila ID in localStorage
    if (upazila) {
      localStorage.setItem("lastSelectedUpazilaId", upazila.id);
    }
  };

  const HandleCreateUnions = async () => {
    try {
      const res = await createUnionByUpazila({
        id: selectedUpazila?.id,
        token: localStorage.getItem("token"),
      }).unwrap();
      console.log(res);
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

  const HandleShowUnions = async () => {
    try {
      const res = await showUnionByUpazila({
        id: selectedUpazila?.id,
        token: localStorage.getItem("token"),
      }).unwrap();
      if (res.status_code === 200) {
        message.success("Union Get successfully!");
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

  const allUp: TUnionParishad[] = data?.data || [];

  const HandleUpEkpayCreadintial = () => {
    setEkpayEditModal(true); // Open the modal
  };

  const HandleUpManage = (id: number) => {
    console.log(id);
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const res = await updateUnion({
        data: values,
        id: selectedUnion?.id,
        token,
      }).unwrap();
      console.log(res);

      if (res.status_code == 200) {
        message.success(`Union information updated successfully`);
        await HandleShowUnions();
      }
      setEkpayEditModal(false);
    } catch (error) {
      console.error("Validation Failed:", error);
    }
  };

  // Close the modal
  const handleCancel = () => {
    setEkpayEditModal(false);
    form.resetFields(); // Reset the form fields
    setSelectedUnion(null); // Clear the selected union data
  };

  // Update form fields when selectedUnion changes
  useEffect(() => {
    if (selectedUnion) {
      form.setFieldsValue({
        AKPAY_MER_REG_ID: selectedUnion.AKPAY_MER_REG_ID,
        AKPAY_MER_PASS_KEY: selectedUnion.AKPAY_MER_PASS_KEY,
        u_code: selectedUnion.u_code,
      });
    }
  }, [selectedUnion, form]);

  return (
    <>
      <div className="row ">
        <div className="my-1 col-md-2">
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

        <div className="my-1 col-md-2">
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

        <div className="my-1 col-md-2">
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
        {selectedUpazila && (
          <div className="my-1 col-md-4 d-flex flex-column">
            <label htmlFor="">
              {selectedUpazila?.bn_name} উপজেলার ইউনিয়ন তৈরি করুন
            </label>
            <div>
              <Button
                className=""
                type="primary"
                danger
                loading={isLoading}
                disabled={isLoading}
                onClick={HandleCreateUnions}
              >
                Create Unions
              </Button>
            </div>
          </div>
        )}
      </div>

      <div className="my-3">
        {selectedUpazila && (
          <div className="d-flex flex-column">
            <label htmlFor="">
              {selectedUpazila?.bn_name} উপজেলার ইউনিয়ন দেখুন
            </label>
            <div className="d-flex gap-2">
              <Button
                type="primary"
                loading={showing}
                disabled={showing}
                onClick={HandleShowUnions}
              >
                Show Unions
              </Button>

              <a
                className="btn btn-info btn-sm text-white"
                href={`https://api.uniontax.gov.bd/api/upazilas/${selectedUpazila.id}/uniouninfo/pdf`}
                target="_blank"
                rel="noopener noreferrer"
              >
                Download Pdf
              </a>
              <a
                className="btn btn-primary btn-sm text-white"
                href={`https://api.uniontax.gov.bd/api/upazilas/${selectedUpazila.id}/uniouninfo/excel`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <i className="fa-solid fa-file-excel"></i> Download Exel
              </a>
            </div>
          </div>
        )}
      </div>

      <div className="table-responsive">
        <table className="table table-bordered table-striped">
          <thead>
            <tr>
              <th>Full Name</th>
              <th>Thana</th>
              <th>District</th>
              <th>Union Code</th>
              <th>Phone Numbers</th>
              <th>AKPAY_MER_REG_ID</th>
              <th>AKPAY_MER_PASS_KEY</th>
              <th colSpan={2}>Action</th>
            </tr>
          </thead>
          <tbody>
            {allUp.map((union) => (
              <tr key={union.id}>
                <td>{union.full_name}</td>
                <td>{union.thana}</td>
                <td>{union.district}</td>
                <td>{union.u_code}</td>
                <td>
                  {union.chairman_phone && (
                    <>চেয়ারম্যান: {union.chairman_phone}<br /></>
                  )}
                  {union.secretary_phone && (
                    <>সচিব: {union.secretary_phone}<br /></>
                  )}
                  {union.udc_phone && (
                    <>ইউডিসি: {union.udc_phone}<br /></>
                  )}
                  {union.user_phone && (
                    <>ইউজার: {union.user_phone}</>
                  )}


                </td>
                <td>{union.AKPAY_MER_REG_ID}</td>
                <td>{union.AKPAY_MER_PASS_KEY}</td>
                <td>
                  <button
                    className="btn btn-primary btn-sm"
                    onClick={() => HandleUpManage(union.id)}
                  >
                    Edit
                  </button>
                </td>
                <td>
                  <button
                    className="btn btn-info btn-sm"
                    onClick={() => {
                      setSelectedUnion(union);
                      HandleUpEkpayCreadintial();
                    }}
                  >
                    একপে সেটিং
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {ekpayEditModal && (
        <Modal
          title={`${selectedUnion?.full_name} এর তথ্য আপডেট`}
          open={ekpayEditModal}
          onOk={handleSubmit}
          onCancel={handleCancel}
          footer={[
            <Button key="cancel" onClick={handleCancel}>
              Cancel
            </Button>,
            <Button
              loading={updating}
              key="submit"
              type="primary"
              onClick={handleSubmit}
            >
              Submit
            </Button>,
          ]}
        >
          <Form
            form={form}
            layout="vertical"
            initialValues={{
              AKPAY_MER_REG_ID: selectedUnion?.AKPAY_MER_REG_ID || "",
              AKPAY_MER_PASS_KEY: selectedUnion?.AKPAY_MER_PASS_KEY || "",
              u_code: selectedUnion?.u_code || "",
            }}
          >
            <Form.Item
              className="my-1"
              name="AKPAY_MER_REG_ID"
              label="Merchant Registration ID"
              rules={[
                {
                  required: false,
                  message: "Please enter the Merchant Registration ID",
                },
              ]}
            >
              <Input placeholder="Enter Merchant Registration ID" />
            </Form.Item>

            <Form.Item
              className="my-1"
              name="AKPAY_MER_PASS_KEY"
              label="Merchant Pass Key"
              rules={[
                {
                  required: false,
                  message: "Please enter the Merchant Pass Key",
                },
              ]}
            >
              <Input placeholder="Enter Merchant Pass Key" />
            </Form.Item>
            <Form.Item className="my-1" name="u_code" label="Union Code">
              <Input placeholder="Enter Union Code" />
            </Form.Item>
          </Form>
        </Modal>
      )}
    </>
  );
};

export default UnionCreateByUpazila;
