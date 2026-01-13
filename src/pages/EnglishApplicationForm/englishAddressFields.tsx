/* eslint-disable @typescript-eslint/no-explicit-any */
// import { useEffect, useState } from "react";
import { Form, Checkbox, Input } from "antd";
// import { TDistrict, TDivision, TUpazila } from "@/types";

// const { Option } = Select;

interface AddressFieldsProps {
  form: any; // Accept the form prop from the parent component
}
const EnglishAddressFields = ({ form }: AddressFieldsProps) => {
  const handleSameAddressChange = (e: any) => {
    if (e.target.checked) {
      form.setFieldsValue({
        applicant_permanent_village: form.getFieldValue(
          "applicant_present_village"
        ),
        applicant_permanent_post_office: form.getFieldValue(
          "applicant_present_post_office"
        ),
      });
    } else {
      form.setFieldsValue({
        applicant_permanent_village: "",
        applicant_permanent_post_office: "",
      });
    }
  };

  return (
    <>
      <div className="row">
        <div className="col-md-6">
          <div className="app-heading">বর্তমান ঠিকানা</div>

          <Form.Item></Form.Item>

          <Form.Item
            name="applicant_present_village"
            label="গ্রাম/পাড়া (Village/Neighborhood)"
          >
            <Input className="form-control" />
          </Form.Item>
        </div>

        <div className="col-md-6">
          <div className="app-heading">স্থায়ী ঠিকানা</div>

          <Form.Item name="permanent_address" valuePropName="checked">
            <Checkbox onChange={handleSameAddressChange}>
              বর্তমান ঠিকানার সাথে মিলিয়ে দিন (Match with Current Address)
            </Checkbox>
          </Form.Item>

          <Form.Item
            name="applicant_permanent_post_office"
            label="পোস্ট অফিস (Post Office)"
          >
            <Input className="form-control" />
          </Form.Item>

          <Form.Item
            name="applicant_permanent_village"
            label="গ্রাম/পাড়া (Village/Neighborhood)"
          >
            <Input className="form-control" />
          </Form.Item>
        </div>
      </div>
    </>
  );
};

export default EnglishAddressFields;
