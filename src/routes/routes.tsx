import Login from "@/pages/auth/Login";
import MainLayout from "@/components/layouts/MainLayout";
import AdminLayout from "@/components/layouts/admin/AdminLayout";
import ErrorPage from "@/components/reusable/ErrorPage";

// import About from "@/pages/About/About";
// import CitizenCorner from "@/pages/About/CitizenCorner";
// import ApplicationForm from "@/pages/ApplicationForm/ApplicationForm";
// import Contact from "@/pages/Contact/Contact";
// import Holding from "@/pages/Holding/Holding";
// import Home from "@/pages/Home/Home";
// import Notice from "@/pages/Notice/Notice";
// import SonodSearch from "@/pages/SonodSearch/SonodSearch";
// import Tenders from "@/pages/Tenders/Tenders";
// import ResetPassword from "@/pages/auth/ResetPassword";
// import PaymentSuccessPage from "@/pages/payment/PaymentSuccessPage";

import { createBrowserRouter } from "react-router-dom";
import { adminRoutes } from "./adminRoutes";
import AuthProvider from "@/Providers/AuthProvider";

const router = createBrowserRouter([
  {
    path: "/",
    element: <MainLayout />,
    errorElement: <ErrorPage />,
    children: [
      {
        path: "/",
        element: <Login />,
      },
      // {
      //   path: "/about",
      //   element: <About />,
      // },
      // {
      //   path: "/sonod/search",
      //   element: <SonodSearch />,
      // },
      // {
      //   path: "/notice",
      //   element: <Notice />,
      // },
      // {
      //   path: "/tenders",
      //   element: <Tenders />,
      // },
      // {
      //   path: "/contact",
      //   element: <Contact />,
      // },
      // {
      //   path: "/holding/tax",
      //   element: <Holding />,
      // },
      // {
      //   path: "/citizens_corner",
      //   element: <CitizenCorner />,
      // },
      // {
      //   path: "/login",
      //   element: <Login />,
      // },
      // {
      //   path: "/reset-pass",
      //   element: <ResetPassword />,
      // },
      // {
      //   path: "/payment-success",
      //   element: <PaymentSuccessPage />,
      // },

      // {
      //   path: "/application/:service",
      //   element: <ApplicationForm />,
      // },
    ],
  },

  {
    path: "dashboard",
    element: (
      <AuthProvider>
        <AdminLayout />
      </AuthProvider>
    ),
    errorElement: <ErrorPage />,
    children: adminRoutes,
  },
]);

export default router;
