import React, { useEffect, useState } from "react";
import { Table, Spinner, Pagination, Button, Card, Badge } from "react-bootstrap";
import {
  useLazyGetEkpayListQuery,
  useLazyGetMyServerAmountQuery,
} from "@/redux/api/Ekpay/EkpayApis";

import AddressSelectorUnion from "@/components/reusable/AddressSelectorUnion";
import PouroLocationSelector from "@/components/reusable/PouroLocationSelector";
import EkpayExcelUpload from "./EkpayExcelUpload";

const formatCurrency = (value: any) => {
  const n = Number(value ?? 0);
  if (Number.isNaN(n)) return "-";
  return n.toLocaleString("bn-BD", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

const formatDate = (iso?: string) => {
  if (!iso) return "-";
  try {
    return new Date(iso).toLocaleString("bn-BD");
  } catch {
    return iso;
  }
};

const getPaginationEntries = (total: number, current: number, maxVisible = 7) => {
  if (total <= maxVisible) return Array.from({ length: total }, (_, i) => i + 1);

  const pages: (number | string)[] = [];
  const left = Math.max(2, current - 1);
  const right = Math.min(total - 1, current + 1);

  pages.push(1);
  if (left > 2) pages.push("...");
  for (let p = left; p <= right; p++) pages.push(p);
  if (right < total - 1) pages.push("...");
  pages.push(total);
  return pages;
};

const EkpayPaymentReportList: React.FC = () => {
  const [isUnion] = useState<boolean>(true);
  const [selectedUnion, setSelectedUnion] = useState<string>("");

  const [page, setPage] = useState<number>(1);
  const [lastPage, setLastPage] = useState<number>(1);

  const [trigger, result] = useLazyGetEkpayListQuery();
  const { data, isFetching, isError, isLoading } = result;

  const [triggerServerAmount] = useLazyGetMyServerAmountQuery();

  // Local state
  const [localReports, setLocalReports] = useState<any[]>([]);
  const [loadingCalcIds, setLoadingCalcIds] = useState<Set<string>>(new Set());

  const reportsFromApi: any[] = data?.data?.data || [];
  const currentPageFromResponse = data?.data?.current_page || page;
  const lastPageFromResponse = data?.data?.last_page || 1;

  useEffect(() => {
    setPage(currentPageFromResponse);
    setLastPage(lastPageFromResponse);
    setLocalReports(reportsFromApi.map((r) => ({ ...r })));
  }, [data]);

  const handleSearch = () => {
    if (!selectedUnion) return;
    trigger({ unionName: selectedUnion, page: 1 });
  };

  const handlePageChange = (pageNum: number) => {
    if (!selectedUnion) return;
    setPage(pageNum);
    trigger({ unionName: selectedUnion, page: pageNum });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleCalculateServerAmount = async (id: string | number) => {
    const idStr = String(id);

    // Add loading state
    setLoadingCalcIds((prev) => new Set([...prev, idStr]));

    try {
      let payload: any;
      try {
        // @ts-ignore
        payload = await triggerServerAmount({ id }).unwrap();
      } catch {
        const raw = await triggerServerAmount({ id } as any);
        payload = raw;
      }

      const serverAmount =
        payload?.data?.server_amount ?? payload?.data?.amount ?? payload?.server_amount;

      const differenceAmount =
        payload?.data?.difference_amount ??
        payload?.data?.difference ??
        payload?.difference_amount;

      setLocalReports((prev) =>
        prev.map((row) =>
          String(row.id) === idStr
            ? {
                ...row,
                server_amount: serverAmount ?? row.server_amount,
                difference_amount: differenceAmount ?? row.difference_amount,
              }
            : row
        )
      );
    } catch (err) {
      console.error("ত্রুটি:", err);
    } finally {
      // Remove loading state
      setLoadingCalcIds((prev) => {
        const s = new Set(prev);
        s.delete(idStr);
        return s;
      });
    }
  };

  const paginationEntries = getPaginationEntries(lastPage || 1, page);

  return (
    <div className="p-4">
      {/* Pagination CSS */}
      <style>{`
        .custom-pagination .page-item .page-link {
          background: #f8f9fa !important;
          color: #333 !important;
          border-radius: 4px;
          padding: 4px 8px !important;
          font-size: 13px !important;
        }
        .custom-pagination .page-item.active .page-link {
          background: #0d6efd !important;
          color: #fff !important;
        }
      `}</style>

      <h3 className="mb-3">একপে পেমেন্ট রিপোর্ট</h3>

     

      <Card className="mb-4 shadow-sm">
        <Card.Body>
          <div className="row">
            <div className="col-md-12 mb-3">
              {isUnion ? (
                <AddressSelectorUnion
                  onUnionChange={(union) => setSelectedUnion(union?.name || "")}
                />
              ) : (
                <PouroLocationSelector
                  onUnionChange={(union) => setSelectedUnion(union?.name || "")}
                  showLabels
                />
              )}
            </div>

            <div className="col-md-6 mb-3 text-md-start">
              <Button
                onClick={handleSearch}
                disabled={!selectedUnion || isFetching}
                variant="primary"
                className="me-2"
              >
                {isFetching ? "অনুসন্ধান চলছে..." : "অনুসন্ধান করুন"}
              </Button>

              <Button
                variant="outline-secondary"
                onClick={() => {
                  setSelectedUnion("");
                  setPage(1);
                  setLastPage(1);
                  setLocalReports([]);
                }}
              >
                রিসেট করুন
              </Button>
            </div>


            <div className="col-md-6 mb-3 text-md-end">
                       <EkpayExcelUpload />
            </div>



          </div>
        </Card.Body>
      </Card>

      <Card className="shadow-sm">
        <Card.Body>
          {isLoading || isFetching ? (
            <div className="text-center my-4">
              <Spinner animation="border" />
              <div>লোড হচ্ছে...</div>
            </div>
          ) : isError ? (
            <div className="text-danger">ডেটা লোড করতে সমস্যা হয়েছে।</div>
          ) : (
            <>
              <div className="table-responsive">
                <Table striped hover bordered className="table-sm">
                  <thead className="table-dark">
                    <tr>
                      <th>আইডি</th>
                      <th>ইউনিয়ন</th>
                      <th>শুরুর তারিখ</th>
                      <th>শেষ তারিখ</th>
                      <th className="text-end">একপে টাকা</th>
                      <th className="text-end">সার্ভার টাকা</th>
                      <th className="text-end">ডিফারেন্স</th>
                      <th>হিসাব</th>
                      <th>তৈরির সময়</th>
                    </tr>
                  </thead>

                  <tbody>
                    {localReports.length === 0 ? (
                      <tr>
                        <td colSpan={9} className="text-center py-4">
                          কোন তথ্য পাওয়া যায়নি।
                        </td>
                      </tr>
                    ) : (
                      localReports.map((item) => {
                        const idStr = String(item.id);
                        const diff = Number(item.difference_amount ?? 0);
                        const isRowLoading = loadingCalcIds.has(idStr);

                        return (
                          <tr key={item.id}>
                            <td>{item.id}</td>
                            <td>{item.union}</td>
                            <td>{item.start_date}</td>
                            <td>{item.end_date}</td>
                            <td className="text-end">{formatCurrency(item.ekpay_amount)}</td>
                            <td className="text-end">{formatCurrency(item.server_amount)}</td>

                            <td className="text-end">
                              <Badge bg={diff > 0 ? "success" : diff < 0 ? "danger" : "secondary"}>
                                {formatCurrency(diff)}
                              </Badge>
                            </td>

                            <td className="text-end">
                              <Button
                                size="sm"
                                disabled={isRowLoading}
                                onClick={() => handleCalculateServerAmount(item.id)}
                              >
                                {isRowLoading ? (
                                  <>
                                    <Spinner
                                      as="span"
                                      animation="border"
                                      size="sm"
                                      className="me-1"
                                    />
                                    হিসাব হচ্ছে...
                                  </>
                                ) : (
                                  "হিসাব করুন"
                                )}
                              </Button>
                            </td>

                            <td>{formatDate(item.created_at)}</td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </Table>
              </div>

              <div className="d-flex justify-content-between align-items-center mt-3">
                <small className="text-muted">
                  পৃষ্ঠা {page} / {lastPage}
                </small>

                <Pagination className="mb-0 pagination-sm custom-pagination">
                  <Pagination.Prev
                    onClick={() => handlePageChange(page - 1)}
                    disabled={page <= 1}
                  />

                  {paginationEntries.map((entry, idx) =>
                    entry === "..." ? (
                      <Pagination.Ellipsis key={idx} disabled />
                    ) : (
                      <Pagination.Item
                        key={entry}
                        active={entry === page}
                        onClick={() => handlePageChange(Number(entry))}
                      >
                        {entry}
                      </Pagination.Item>
                    )
                  )}

                  <Pagination.Next
                    onClick={() => handlePageChange(page + 1)}
                    disabled={page >= lastPage}
                  />
                </Pagination>
              </div>
            </>
          )}
        </Card.Body>
      </Card>
    </div>
  );
};

export default EkpayPaymentReportList;
