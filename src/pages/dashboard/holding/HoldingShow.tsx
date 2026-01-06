import Breadcrumbs from "@/components/reusable/Breadcrumbs";
import Loader from "@/components/reusable/Loader";
import { useAllHoldingQuery } from "@/redux/api/sonod/sonodApi";
import { Link, useParams } from "react-router-dom";
import { useState } from "react";

export interface THolding {
  id: number;
  maliker_name: string;
  nid_no: string;
  mobile_no: string;
}

const HoldingShow = () => {
  const token = localStorage.getItem("token");
  const { word } = useParams();
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const { data, isLoading } = useAllHoldingQuery({
    word,
    token,
    search: searchTerm,
    page: currentPage,
  });

  if (isLoading) {
    return <Loader />;
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Reset to first page when a new search is performed
    setCurrentPage(1);
  };

  const holdings = data?.data?.data || [];

  return (
    <>
      <Breadcrumbs current="হোল্ডিং ট্যাক্স" />
      <div className="col-12 p-2 p-md-0">
        <div className="card shadow-sm border-0">
          <div className="card-header bg-white py-3">
            <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
              <h3 className="mb-0">হোল্ডিং ট্যাক্স</h3>
              <div>
                <Link
                  to="/holding/tax/bokeya/list?word=1&union=test"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-success"
                >
                  বকেয়া রিপোর্ট
                </Link>
              </div>
            </div>
            <form
              onSubmit={handleSearch}
              className="row g-3 my-3"
            >
              <div className="col-12 col-md-9">
                <input
                  type="text"
                  id="userdata"
                  placeholder="খুঁজুন (হোল্ডিং নং/নাম/এনআইডি/মোবাইল)"
                  className="form-control"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="col-12 col-md-3">
                <button
                  type="submit"
                  className="btn btn-info w-100"
                >
                  খুঁজুন
                </button>
              </div>
            </form>
          </div>
          <div className="card-body">
            <table className="table">
              <thead>
                <tr>
                  <th>হোল্ডিং নাম্বার</th>
                  <th>নাম</th>
                  <th>এন আইডি নাম্বার</th>
                  <th>মোবাইল নাম্বার</th>
                  <th>আরও তথ্য</th>
                </tr>
              </thead>
              <tbody>
                {holdings.length > 0 ? (
                  holdings.map((item: THolding) => (
                    <tr key={item.id}>
                      <td>{item.id}</td>
                      <td>{item.maliker_name}</td>
                      <td>{item.nid_no}</td>
                      <td>{item.mobile_no}</td>
                      <td>
                        {/* <Link
                          to={`/holding/edit/${item.id}`}
                          className="btn btn-success"
                        >
                          এডিট
                        </Link>{" "} */}
                        <Link
                          to={`/dashboard/holding/list/view/${item.id}`}
                          className="btn btn-info"
                        >
                          দেখুন
                        </Link>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="text-center">
                      কোন ডেটা পাওয়া যায়নি
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
};

export default HoldingShow;
