/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import { Link } from "react-router-dom";
import FormValueModal from "../ui/FormValueModal";
import { TApplicantData } from "@/types";
import { RootState } from "@/redux/features/store";
import { useAppSelector } from "@/redux/features/hooks";
// import { useSonodActionMutation } from "@/redux/api/sonod/sonodApi";
// import { message } from "antd";
interface SonodActionBtnProps {
  sonodName: string | undefined;
  item: TApplicantData;
  condition: string | undefined;
}
const SonodActionBtn = ({
  sonodName,
  item,
  condition,
}: SonodActionBtnProps) => {
  const user = useAppSelector((state: RootState) => state.user.user);
  const VITE_BASE_DOC_URL = import.meta.env.VITE_BASE_DOC_URL;

  const [view, setView] = useState(false);

  const handleView = () => {
    setView(true);
  };
  const handleCancel = () => {
    setView(false);
  };

  return (
    <>
      <div
        className="d-flex justify-content-center flex-wrap gap-2"
        role="group"
        aria-label="Actions"
      >
        {user?.position == "Super Admin" && (
          <Link
            to={`/dashboard/sonod/${sonodName}/action/edit/${item.id}`}
            className="btn btn-info btn-sm mr-1"
          >
            এডিট করুন
          </Link>
        )}

        <Link
          to={`${VITE_BASE_DOC_URL}/applicant/copy/download/${item.id}`}
          className="btn btn-success btn-sm mr-1"
          target="_blank"
        >
          প্রাপ্তী স্বীকারপত্র
        </Link>
        <button
          onClick={handleView}
          type="button"
          className="btn btn-info btn-sm mr-1"
        >
          আবেদনপত্র দেখুন
        </button>

        <Link
          to={`${VITE_BASE_DOC_URL}/sonod/invoice/download/${item.id}`}
          className="btn btn-info btn-sm mr-1"
          target="_blank"
        >
          রশিদ প্রিন্ট
        </Link>

        {condition == "approved" && (
          <Link
            target="_blank"
            to={`${VITE_BASE_DOC_URL}/sonod/download/${item.id}`}
            className="btn btn-success btn-sm mr-1"
          >
            সনদ
          </Link>
        )}
      </div>

      {view && (
        <FormValueModal
          onCancel={handleCancel}
          visible={view}
          key={0}
          id={item.id}
          from="dashboard"
        />
      )}
    </>
  );
};

export default SonodActionBtn;
