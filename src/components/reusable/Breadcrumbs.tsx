import { Link } from "react-router-dom";
import { Breadcrumb } from "antd";
import { HomeOutlined } from "@ant-design/icons";

interface BreadcrumbProps {
  current?: string;
  page?: string;
}

const Breadcrumbs = ({ page, current }: BreadcrumbProps) => {
  const items = [
    {
      title: (
        <Link to="/dashboard">
          <HomeOutlined />
        </Link>
      ),
    },
    ...(current ? [{ title: current }] : []),
  ];

  return (
    <div className="breadcrumbs-area mb-4">
      <h3>
        {page && ` ${page} ||`} {current}
      </h3>
      <Breadcrumb items={items} />
      <br />
    </div>
  );
};

export default Breadcrumbs;
