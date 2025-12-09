import { Tabs } from "antd";
import Breadcrumbs from "@/components/reusable/Breadcrumbs";
import CreateUnion from "./CreateUnion";
import UnionCreateByUpazila from "./UnionCreateByUpazila";

const { TabPane } = Tabs;
const UnionCreateTab = () => {
  return (
    <div className="bg-white p-3 rounded">
      <Breadcrumbs current="ইউনিয়ন তৈরি করুন" />
      <Tabs className="my-0">
        <TabPane tab="উপজেলা ভিত্তিক ইউনিয়ন তৈরি করুন" key="upazila">
          <UnionCreateByUpazila />
        </TabPane>
        <TabPane tab="ইউনিয়ন তৈরি করুন" key="union">
          <CreateUnion />
        </TabPane>
      </Tabs>
    </div>
  );
};

export default UnionCreateTab;
