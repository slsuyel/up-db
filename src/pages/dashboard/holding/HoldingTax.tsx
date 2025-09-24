import AddressSelectorUnion from "@/components/reusable/AddressSelectorUnion";
import Breadcrumbs from "@/components/reusable/Breadcrumbs";
import PouroLocationSelector from "@/components/reusable/PouroLocationSelector";
import { useRenewPreviousHoldingMutation } from "@/redux/api/sonod/sonodApi";
import { useAppSelector } from "@/redux/features/hooks";
import { RootState } from "@/redux/features/store";
import { message, Modal } from "antd";
import { useState } from "react";


const HoldingTax = () => {
  const isUnion = useAppSelector(
    (state: RootState) => state.siteSetting.isUnion
  );
  const token = localStorage.getItem("token");
  const [renewPreviousHolding, { isLoading }] =
    useRenewPreviousHoldingMutation();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedUnion, setSelectedUnion] = useState<string>(""); // Initialize as null

  const showModal = () => {
    setIsModalVisible(true);
  };

  const handleOk = async () => {
    try {
      if (selectedUnion) {
        const res = await renewPreviousHolding({
          token,
          union: selectedUnion.toLowerCase().replace(/\s+/g, ""),
        }).unwrap();

        if (res.isError) {
          setIsModalVisible(false);
          message.error("কিছু সমস্যা হয়েছে, দয়া করে আবার চেষ্টা করুন।");
        } else {
          message.success("পূর্বের হোল্ডিং ট্যাক্স সফলভাবে রিনিউ করা হয়েছে।");
          setIsModalVisible(false);
        }
      }
    } catch (error) {
      console.log("Error:", error);
      message.error("কিছু সমস্যা হয়েছে, দয়া করে আবার চেষ্টা করুন।");
    }
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };

  return (
    <div className="card p-3 border-0">
      <Breadcrumbs current="হোল্ডিং ট্যাক্স" />

      <div className="col-md-12 mb-3">
        {isUnion ? (
          <AddressSelectorUnion
            onUnionChange={(union) => setSelectedUnion(union ? union.name : "")}
          />
        ) : (
          <PouroLocationSelector
            onUnionChange={(union) => setSelectedUnion(union ? union.name : "")}
            showLabels={true}
          />
        )}
      </div>

      {selectedUnion && (
        <div className="d-flex justify-content-between mb-3">
          <div className="align-item-center d-flex gap-1">
            <button className="btn btn-sm btn-info" onClick={showModal}>
              <span>
                {selectedUnion} {isUnion ? "ইউনিয়নের" : "পৌরসভার "}
              </span>{" "}
              হোল্ডিং ট্যাক্স রিনিউ করুন
            </button>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      <Modal
        title="নিশ্চিত করুন"
        open={isModalVisible}
        onOk={handleOk}
        onCancel={handleCancel}
        okText="হ্যাঁ"
        cancelText="না"
        loading={isLoading}
      >
        <p className="border-top p-2">
          আপনি কি <span className=" fs-5 fw-bold">{selectedUnion}</span>{" "}
          ইউনিয়নের পূর্বের হোল্ডিং ট্যাক্স রিনিউ করতে চান?
        </p>
      </Modal>
    </div>
  );
};

export default HoldingTax;
