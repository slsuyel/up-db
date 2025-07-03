import { useState } from "react";
import { Card, message, Modal } from "antd";
import Breadcrumbs from "@/components/reusable/Breadcrumbs";
import { useRenewPreviousHoldingMutation } from "@/redux/api/sonod/sonodApi";
import AddressSelectorUnion from "@/components/reusable/AddressSelectorUnion";

const HoldingTax = () => {
  const token = localStorage.getItem('token');
  const [renewPreviousHolding, { isLoading }] = useRenewPreviousHoldingMutation();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedUnion, setSelectedUnion] = useState<string>("");
  const showModal = () => {
    setIsModalVisible(true);
  };

  const handleOk = async () => {
    try {
      const res = await renewPreviousHolding({
        token,
        union: selectedUnion.name.toLowerCase().replace(/\s+/g, "")
      }).unwrap();
      if (res.isError) {
        setIsModalVisible(false);
        message.error("কিছু সমস্যা হয়েছে, দয়া করে আবার চেষ্টা করুন।");
      } else {
        message.success("পূর্বের হোল্ডিং ট্যাক্স সফলভাবে রিনিউ করা হয়েছে।");
        setIsModalVisible(false);
      }
    } catch (error) {
      console.log("Error:", error);
      message.error("কিছু সমস্যা হয়েছে, দয়া করে আবার চেষ্টা করুন।");
    }
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };


  console.log(selectedUnion); //Panchagarh Sadar

  return (
    <div className="card p-3 border-0">
      <Breadcrumbs current="হোল্ডিং ট্যাক্স" />

      <div className="col-md-12 mb-3">
        <AddressSelectorUnion
          onUnionChange={(union) => setSelectedUnion(union ? union : "")}
        />
      </div>

      {selectedUnion && <div className="d-flex justify-content-between mb-3">
        <div className="align-item-center d-flex gap-1">
          <button
            className="btn btn-sm btn-info"
            onClick={showModal}
          >
            <span>{selectedUnion.bn_name} ইউনিয়নের</span> হোল্ডিং ট্যাক্স রিনিউ করুন
          </button>
        </div>
      </div>}

      {/* Confirmation Modal */}
      <Modal
        title="নিশ্চিত করুন"
        visible={isModalVisible}
        onOk={handleOk}
        onCancel={handleCancel}
        okText="হ্যাঁ"
        cancelText="না"
        loading={isLoading}
      >
        <p className="border-top p-2">আপনি কি <span className=" fs-5 fw-bold">{selectedUnion.bn_name} </span> ইউনিয়নের ইউনিয়নের পূর্বের হোল্ডিং ট্যাক্স রিনিউ করতে চান?</p>
      </Modal>
    </div>
  );
};

export default HoldingTax;
