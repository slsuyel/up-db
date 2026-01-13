import { Form, Input } from "antd";

export interface TTradeKhat {
  name: string;
  khat_id: string;
  khat_fees: TKhatFee[];
}

export interface TKhatFee {
  name: null | string;
  applicant_type_of_businessKhat: string;
  applicant_type_of_businessKhatAmount: string;
  fee: string;
}

const EnglishTradeLicenseForm = () => {
  return (
    <>
      <div className="col-md-4">
        <Form.Item
          label="প্রতিষ্ঠানের নাম"
          name="applicant_name_of_the_organization"
        >
          <Input style={{ height: 40, width: "100%" }} />
        </Form.Item>
      </div>
      <div className="col-md-4">
        <Form.Item label="প্রতিষ্ঠানের ঠিকানা" name="organization_address">
          <Input style={{ height: 40, width: "100%" }} />
        </Form.Item>
      </div>

      <div className="col-md-4">
        <Form.Item label="পেশা" name="applicant_occupation">
          <Input style={{ height: 40, width: "100%" }} />
        </Form.Item>
      </div>

      <div className="col-md-4">
        <Form.Item
          label="ব্যবসার বিবরণ (ইংরেজিতে লিখুন)"
          name="applicant_type_of_business"
          rules={[
            { required: true, message: "Please enter business description" },
          ]}
        >
          <Input style={{ height: 40, width: "100%" }} />
        </Form.Item>
      </div>
    </>
  );
};

export default EnglishTradeLicenseForm;
