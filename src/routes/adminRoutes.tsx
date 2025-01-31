import UnderConstruction from "@/components/reusable/UnderConstruction";
import Dhome from "@/pages/dashboard/Admin/Dhome";
import SearchFilter from "@/pages/dashboard/Admin/SearchFilter";
import HoldingAdd from "@/pages/dashboard/holding/HoldingAdd";
import HoldingShow from "@/pages/dashboard/holding/HoldingShow";
import HoldingTax from "@/pages/dashboard/holding/HoldingTax";
import SingleHolding from "@/pages/dashboard/holding/SingleHolding";
import PaymentFailed from "@/pages/dashboard/Report/PaymentFailed";
import SonodBaseReport from "@/pages/dashboard/Report/SonodBaseReport";

import EditSonod from "@/pages/dashboard/SonodManagement/EditSonod";
import SonodManagement from "@/pages/dashboard/SonodManagement/SonodManagement";
import UnionProfile from "@/pages/dashboard/UnionProfile";
import UnionReports from "@/pages/dashboard/UnionReports";
import UnionCreateTab from "@/pages/SuperAdmin/UnionManage/UnionCreateTab";

export const adminRoutes = [
  {
    path: "",
    element: <Dhome />,
  },
  {
    path: "reports",
    element: <UnionReports />,
  },
  {
    path: "payment-failed",
    element: <PaymentFailed />,
  },
  {
    path: "union/profile",
    element: <UnionProfile />,
  },
  {
    path: "create-union",
    element: <UnionCreateTab />,
  },
  {
    path: "up-search",
    element: <SearchFilter />,
  },
  {
    path: "sonod-base-report/:service",
    element: <SonodBaseReport />,
  },
  {
    path: "holding/tax/",
    element: <HoldingTax />,
  },
  {
    path: "/dashboard/holding/tax/list/:word",
    element: <HoldingShow />,
  },
  {
    path: "/dashboard/holding/list/add/:word",
    element: <HoldingAdd />,
  },
  {
    path: "/dashboard/holding/list/view/:id",
    element: <SingleHolding />,
  },

  {
    path: "sonod/:sonodName/:condition/:union",
    element: <SonodManagement />,
  },
  {
    path: "sonod/:service/action/edit/:id",
    element: <EditSonod />,
  },
  {
    path: "settings",
    element: <UnderConstruction />,
  },
];
