/* eslint-disable @typescript-eslint/no-explicit-any */

import { Form, Button, message } from "antd";
import addressFields from "./addressFields";
import attachmentForm from "./attachmentForm";

import { useEffect, useState } from "react";
import TradeLicenseForm from "./tradeLicenseForm";

import InheritanceForm from "./inheritanceForm";
import commonFields from "./commonFields";
import inheritanceList from "./inheritanceList";
import conditionalForm from "./conditionalForm";

import FormValueModal from "@/components/ui/FormValueModal";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useTradeInfoQuery } from "@/redux/api/user/userApi";
import adminEditFields from "./adminEditFields";
import { TApplicantData } from "@/types/global";
import { useSonodUpdateMutation } from "@/redux/api/sonod/sonodApi";

const ApplicationForm = ({ user }: { user?: TApplicantData }) => {
  const token = localStorage.getItem("token");
  const [sonodUpdate, { isLoading: updating }] = useSonodUpdateMutation();
  const { service } = useParams();
  const [unionName, setUnionName] = useState("uniontax");
  const { data, isLoading } = useTradeInfoQuery(unionName, {
    skip: service !== "ট্রেড লাইসেন্স",
  });

  const navigate = useNavigate();
  const location = useLocation();
  const pathname = location.pathname;
  const isDashboard = pathname.includes("dashboard");
  const [inherList, setInherList] = useState(1);
  const [userDta, setUserData] = useState();
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    const hostname = window.location.hostname;
    const union = hostname.split(".")[0];
    if (union !== "localhost") {
      setUnionName(union);
    }
  }, [navigate]);

  const onFinish = async (values: any) => {
    setUserData(values);
    if (isDashboard) {
      const res = await sonodUpdate({
        data: values,
        id: user?.id,
        token,
      }).unwrap();
      if (res.error) {
        message.error(`কোন একটা সমস্যা হয়েছে`);
      } else {
        message.success("Sonod updating  Successfully");
        console.log("Sonod updated successfully:", res.data.message);
      }
    } else {
      setModalVisible(true);
    }
  };

  const handleCancel = () => {
    setModalVisible(false);
  };
  // const successorList =
  //   (user?.successor_list && JSON.parse(user?.successor_list)) || [];


    const successorList = Array.isArray(user?.successor_list)
    ? user?.successor_list
    : (() => {
        try {
          return JSON.parse(user?.successor_list || "[]");
        } catch {
          return [];
        }
      })();



  return (
    <div className={`${!isDashboard ? "container my-3" : ""}`}>
      <Form
        layout="vertical"
        onFinish={onFinish}
        initialValues={{
          unioun_name: user?.unioun_name,
          sec_prottoyon: user?.sec_prottoyon,
          stutus: user?.stutus,
          sonod_Id: user?.sonod_Id,
          currently_paid_money: user?.currently_paid_money,
          total_amount: user?.total_amount,
          prottoyon: user?.prottoyon,
          the_amount_of_money_in_words: user?.the_amount_of_money_in_words,
          sonod_name: user?.sonod_name,
          successor_father_name: user?.successor_father_name,
          successor_mother_name: user?.successor_mother_name,
          ut_father_name: user?.ut_father_name,
          ut_mother_name: user?.ut_mother_name,
          ut_grame: user?.ut_grame,
          ut_post: user?.ut_post,
          last_years_money: user?.last_years_money ?? 0,
          ut_thana: user?.ut_thana,
          ut_district: user?.ut_district,
          ut_word: user?.ut_word,
          successor_father_alive_status: user?.successor_father_alive_status,
          successor_mother_alive_status: user?.successor_mother_alive_status,
          applicant_holding_tax_number: user?.applicant_holding_tax_number,
          applicant_national_id_number: user?.applicant_national_id_number,
          applicant_birth_certificate_number:
            user?.applicant_birth_certificate_number,
          applicant_passport_number: user?.applicant_passport_number,

          family_name: user?.family_name,
          Annual_income: user?.Annual_income,
          Annual_income_text: user?.Annual_income_text,
          Subject_to_permission: user?.Subject_to_permission,
          disabled: user?.disabled,
          The_subject_of_the_certificate: user?.The_subject_of_the_certificate,
          Name_of_the_transferred_area: user?.Name_of_the_transferred_area,
          applicant_second_name: user?.applicant_second_name,
          applicant_owner_type: user?.applicant_owner_type,
          applicant_name_of_the_organization:
            user?.applicant_name_of_the_organization,
          organization_address: user?.organization_address,
          applicant_name: user?.applicant_name,
          utname: user?.utname,
          orthoBchor: user?.orthoBchor,
          ut_religion: user?.ut_religion,
          alive_status: user?.alive_status,
          applicant_gender: user?.applicant_gender,
          applicant_marriage_status: user?.applicant_marriage_status,
          applicant_vat_id_number: user?.applicant_vat_id_number,
          applicant_tax_id_number: user?.applicant_tax_id_number,
          applicant_type_of_business: user?.applicant_type_of_business,
          applicant_type_of_businessKhat: user?.applicant_type_of_businessKhat,
          applicant_type_of_businessKhatAmount:
            user?.applicant_type_of_businessKhatAmount,
          applicant_father_name: user?.applicant_father_name,
          applicant_mother_name: user?.applicant_mother_name,
          applicant_occupation: user?.applicant_occupation,
          applicant_education: user?.applicant_education,
          applicant_religion: user?.applicant_religion,
          applicant_resident_status: user?.applicant_resident_status,
          applicant_present_village: user?.applicant_present_village,
          applicant_present_road_block_sector:
            user?.applicant_present_road_block_sector,
          applicant_present_word_number: user?.applicant_present_word_number,
          applicant_present_district: user?.applicant_present_district,
          applicant_present_Upazila: user?.applicant_present_Upazila,
          applicant_present_post_office: user?.applicant_present_post_office,
          applicant_permanent_village: user?.applicant_permanent_village,
          applicant_permanent_road_block_sector:
            user?.applicant_permanent_road_block_sector,
          applicant_permanent_word_number:
            user?.applicant_permanent_word_number,
          applicant_permanent_district: user?.applicant_permanent_district,
          applicant_permanent_Upazila: user?.applicant_permanent_Upazila,
          applicant_permanent_post_office:
            user?.applicant_permanent_post_office,
          successor_list: successorList,
          applicant_mobile: user?.applicant_mobile,
          applicant_email: user?.applicant_email,
          applicant_phone: user?.applicant_phone,
          applicant_national_id_front_attachment:
            user?.applicant_national_id_front_attachment,
          applicant_national_id_back_attachment:
            user?.applicant_national_id_back_attachment,
          applicant_birth_certificate_attachment:
            user?.applicant_birth_certificate_attachment,
        }}
      >
        <div
          className="panel-heading"
          style={{
            fontWeight: "bold",
            fontSize: "20px",
            background: "rgb(21, 149, 19)",
            textAlign: "center",
            color: "white",
          }}
        >
          {service || "Form Title"}
        </div>
        <div className="form-pannel">
          <div className="row">
            {adminEditFields()}
            {service == "উত্তরাধিকারী সনদ" && InheritanceForm(service)}
            {service == "ওয়ারিশান সনদ" && InheritanceForm(service)}
            {service == "ওয়ারিশান সনদ" && InheritanceForm(service)}
            {service == "বিবিধ প্রত্যয়নপত্র" && InheritanceForm(service)}
            {service == "একই নামের প্রত্যয়ন" && InheritanceForm(service)}
            <div className="col-md-12">
              <div className="app-heading">আবেদনকারীর তথ্য</div>
            </div>
            {commonFields()}
            {service === "ট্রেড লাইসেন্স" && (
              <TradeLicenseForm data={data} isLoading={isLoading} />
            )}{" "}
            {/* Corrected JSX component call */}
            {conditionalForm(service)}
          </div>
          {addressFields()}
          {attachmentForm()}

          {service === "ওয়ারিশান সনদ" &&
            inheritanceList(inherList, setInherList)}

          {service === "উত্তরাধিকারী সনদ" &&
            inheritanceList(inherList, setInherList)}

          <div style={{ textAlign: "center" }}>
            <Button
              loading={updating}
              disabled={updating}
              type="primary"
              htmlType="submit"
              size="large"
            >
              সাবমিট
            </Button>
          </div>
        </div>
      </Form>

      <FormValueModal
        visible={modalVisible}
        data={userDta}
        onCancel={handleCancel}
      />
    </div>
  );
};

export default ApplicationForm;
