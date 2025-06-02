/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import type React from "react"
import { useEffect, useRef, useState } from "react"
import { Card, Nav, Tab, Button, Row, Col, Container } from "react-bootstrap"
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  BarController,
  LineController,
  PieController, // <-- Add this line
} from "chart.js"

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  BarController,
  LineController,
  PieController, // <-- Add this line
)

// Type definitions
interface RegionTotals {
  total_pending: string | number
  total_approved: string | number
  total_cancel: string | number
  total_payments: string | number
  total_amount: string
}

interface SonodReport {
  sonod_name: string
  pending_count: number
  approved_count: number
  cancel_count: number
}

interface PaymentReport {
  sonod_type: string
  total_payments: number
  total_amount: string
}

interface RegionData {
  totals: RegionTotals
  sonod_reports?: SonodReport[]
  payment_reports?: PaymentReport[]
}

interface DividedReportChartsProps {
  data: Record<string, RegionData>
  isLoading: boolean
  title?: string
}

const DividedReportCharts: React.FC<DividedReportChartsProps> = ({ data, isLoading, title = "বিভাগীয় রিপোর্ট চার্ট" }) => {
  const [selectedRegion, setSelectedRegion] = useState<string>("")
  const [activeTab, setActiveTab] = useState<string>("overview")

  // Chart refs
  const barChartRef = useRef<HTMLCanvasElement>(null)
  const areaChartRef = useRef<HTMLCanvasElement>(null)
  const comparisonChartRef = useRef<HTMLCanvasElement>(null)
  const lineChartRef = useRef<HTMLCanvasElement>(null)
  const pieChartRef = useRef<HTMLCanvasElement>(null)
  const detailBarChartRef = useRef<HTMLCanvasElement>(null)
  const detailAmountChartRef = useRef<HTMLCanvasElement>(null)

  // Chart instances
  const chartInstances = useRef<Record<string, ChartJS | null>>({
    barChart: null,
    areaChart: null,
    comparisonChart: null,
    lineChart: null,
    pieChart: null,
    detailBarChart: null,
    detailAmountChart: null,
  })

  // Prepare data for charts
  const regionChartData = Object.entries(data || {}).map(([regionName, regionData]) => ({
    region: regionName,
    pending: Number(regionData?.totals?.total_pending) || 0,
    approved: Number(regionData?.totals?.total_approved) || 0,
    canceled: Number(regionData?.totals?.total_cancel) || 0,
    payments: Number(regionData?.totals?.total_payments) || 0,
    amount: Number.parseFloat(regionData?.totals?.total_amount || "0"),
  }))

  // Calculate totals
  const totalPending = regionChartData.reduce((sum, item) => sum + item.pending, 0)
  const totalApproved = regionChartData.reduce((sum, item) => sum + item.approved, 0)
  const totalCanceled = regionChartData.reduce((sum, item) => sum + item.canceled, 0)
  const totalAmount = regionChartData.reduce((sum, item) => sum + item.amount, 0)

  // Chart colors
  const chartColors = {
    pending: "#fd7e14",
    approved: "#20c997",
    canceled: "#dc3545",
    payments: "#0dcaf0",
    amount: "#198754",
  }

  // Destroy chart instance
  const destroyChart = (chartKey: string) => {
    if (chartInstances.current[chartKey]) {
      chartInstances.current[chartKey]?.destroy()
      chartInstances.current[chartKey] = null
    }
  }

  // Destroy all charts
  const destroyAllCharts = () => {
    Object.keys(chartInstances.current).forEach((key) => {
      destroyChart(key)
    })
  }

  // Create bar chart for total applications
  const createBarChart = () => {
    if (!barChartRef.current) return

    destroyChart("barChart")

    const ctx = barChartRef.current.getContext("2d")
    if (!ctx) return

    chartInstances.current.barChart = new ChartJS(ctx, {
      type: "bar",
      data: {
        labels: regionChartData.map((item) => item.region),
        datasets: [
          {
            label: "অপেক্ষমাণ আবেদন",
            data: regionChartData.map((item) => item.pending),
            backgroundColor: chartColors.pending,
            borderColor: chartColors.pending,
            borderWidth: 1,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: {
            display: true,
            text: "বিভাগ অনুযায়ী মোট আবেদন",
          },
          legend: {
            display: true,
          },
        },
        scales: {
          y: {
            beginAtZero: true,
          },
        },
      },
    })
  }

  // Create area chart for revenue
  const createAreaChart = () => {
    if (!areaChartRef.current) return

    destroyChart("areaChart")

    const ctx = areaChartRef.current.getContext("2d")
    if (!ctx) return

    chartInstances.current.areaChart = new ChartJS(ctx, {
      type: "line",
      data: {
        labels: regionChartData.map((item) => item.region),
        datasets: [
          {
            label: "আদায়কৃত অর্থ",
            data: regionChartData.map((item) => item.amount),
            backgroundColor: chartColors.amount + "40",
            borderColor: chartColors.amount,
            borderWidth: 2,
            fill: true,
            tension: 0.4,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: {
            display: true,
            text: "বিভাগ অনুযায়ী আদায়কৃত অর্থ",
          },
        },
        scales: {
          y: {
            beginAtZero: true,
          },
        },
      },
    })
  }

  // Create comparison chart
  const createComparisonChart = () => {
    if (!comparisonChartRef.current) return

    destroyChart("comparisonChart")

    const ctx = comparisonChartRef.current.getContext("2d")
    if (!ctx) return

    chartInstances.current.comparisonChart = new ChartJS(ctx, {
      type: "bar",
      data: {
        labels: regionChartData.map((item) => item.region),
        datasets: [
          {
            label: "অপেক্ষমাণ",
            data: regionChartData.map((item) => item.pending),
            backgroundColor: chartColors.pending,
          },
          {
            label: "অনুমোদিত",
            data: regionChartData.map((item) => item.approved),
            backgroundColor: chartColors.approved,
          },
          {
            label: "বাতিল",
            data: regionChartData.map((item) => item.canceled),
            backgroundColor: chartColors.canceled,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: {
            display: true,
            text: "বিভাগীয় তুলনামূলক বিশ্লেষণ",
          },
        },
        scales: {
          y: {
            beginAtZero: true,
          },
        },
      },
    })
  }

  // Create line chart for payments
  const createLineChart = () => {
    if (!lineChartRef.current) return

    destroyChart("lineChart")

    const ctx = lineChartRef.current.getContext("2d")
    if (!ctx) return

    chartInstances.current.lineChart = new ChartJS(ctx, {
      type: "line",
      data: {
        labels: regionChartData.map((item) => item.region),
        datasets: [
          {
            label: "পেমেন্ট",
            data: regionChartData.map((item) => item.payments),
            borderColor: chartColors.payments,
            backgroundColor: chartColors.payments,
            borderWidth: 3,
            tension: 0.4,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: {
            display: true,
            text: "পেমেন্ট ট্রেন্ড",
          },
        },
        scales: {
          y: {
            beginAtZero: true,
          },
        },
      },
    })
  }

  // Create pie chart for status
  const createPieChart = () => {
    if (!pieChartRef.current) return

    destroyChart("pieChart")

    const ctx = pieChartRef.current.getContext("2d")
    if (!ctx) return

    chartInstances.current.pieChart = new ChartJS(ctx, {
      type: "pie",
      data: {
        labels: ["অপেক্ষমাণ", "অনুমোদিত", "বাতিল"],
        datasets: [
          {
            data: [totalPending, totalApproved, totalCanceled],
            backgroundColor: [chartColors.pending, chartColors.approved, chartColors.canceled],
            borderWidth: 2,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: {
            display: true,
            text: "আবেদনের অবস্থা বিতরণ",
          },
          legend: {
            position: "bottom",
          },
        },
      },
    }) as unknown as ChartJS<any>
  }

  // Create detailed charts for selected region
  const createDetailedCharts = () => {
    if (!selectedRegion) return

    const selectedRegionData = data[selectedRegion]
    if (!selectedRegionData?.sonod_reports) return

    const sonodChartData = selectedRegionData.sonod_reports.map((report) => {
      const paymentReport = selectedRegionData.payment_reports?.find(
        (payment) => payment.sonod_type === report.sonod_name,
      )
      return {
        sonod: report.sonod_name,
        pending: report.pending_count,
        approved: report.approved_count,
        canceled: report.cancel_count,
        amount: Number.parseFloat(paymentReport?.total_amount || "0"),
      }
    })

    // Detail bar chart
    if (detailBarChartRef.current) {
      destroyChart("detailBarChart")

      const ctx = detailBarChartRef.current.getContext("2d")
      if (ctx) {
        chartInstances.current.detailBarChart = new ChartJS(ctx, {
          type: "bar",
          data: {
            labels: sonodChartData.map((item) => item.sonod),
            datasets: [
              {
                label: "অপেক্ষমাণ",
                data: sonodChartData.map((item) => item.pending),
                backgroundColor: chartColors.pending,
              },
              {
                label: "অনুমোদিত",
                data: sonodChartData.map((item) => item.approved),
                backgroundColor: chartColors.approved,
              },
              {
                label: "বাতিল",
                data: sonodChartData.map((item) => item.canceled),
                backgroundColor: chartColors.canceled,
              },
            ],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              title: {
                display: true,
                text: `${selectedRegion} - সনদ অনুযায়ী আবেদন`,
              },
            },
            scales: {
              y: {
                beginAtZero: true,
              },
            },
          },
        })
      }
    }

    // Detail amount chart
    if (detailAmountChartRef.current) {
      destroyChart("detailAmountChart")

      const ctx = detailAmountChartRef.current.getContext("2d")
      if (ctx) {
        chartInstances.current.detailAmountChart = new ChartJS(ctx, {
          type: "bar",
          data: {
            labels: sonodChartData.map((item) => item.sonod),
            datasets: [
              {
                label: "আদায়কৃত অর্থ",
                data: sonodChartData.map((item) => item.amount),
                backgroundColor: chartColors.amount,
              },
            ],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              title: {
                display: true,
                text: `${selectedRegion} - সনদ অনুযায়ী আদায়`,
              },
            },
            scales: {
              y: {
                beginAtZero: true,
              },
            },
          },
        })
      }
    }
  }

  // Handle tab change
  const handleTabChange = (key: string | null) => {
    // Destroy all charts before changing tabs
    destroyAllCharts()
    setActiveTab(key || "overview")
  }

  // Handle region selection
  const handleRegionSelect = (region: string) => {
    // Destroy detailed charts before changing region
    destroyChart("detailBarChart")
    destroyChart("detailAmountChart")
    setSelectedRegion(region)
  }

  // Effects for creating charts
  useEffect(() => {
    // Create charts based on active tab
    if (activeTab === "overview") {
      setTimeout(() => {
        createBarChart()
        createAreaChart()
      }, 100)
    } else if (activeTab === "regional") {
      setTimeout(() => {
        createComparisonChart()
        createLineChart()
      }, 100)
    } else if (activeTab === "status") {
      setTimeout(() => {
        createPieChart()
      }, 100)
    } else if (activeTab === "detailed" && selectedRegion) {
      setTimeout(() => {
        createDetailedCharts()
      }, 100)
    }

    // Cleanup function to destroy charts when component unmounts or dependencies change
    return () => {
      destroyAllCharts()
    }
  }, [activeTab, selectedRegion, data])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      destroyAllCharts()
    }
  }, [])

  // Cleanup when data changes
  useEffect(() => {
    destroyAllCharts()
  }, [data])

  if (isLoading) {
    return (
      <Container className="d-flex justify-content-center align-items-center p-5">
        <p className="text-muted fs-5">চার্ট লোড হচ্ছে...</p>
      </Container>
    )
  }

  return (
    <Container className="mt-4">
      <div className="text-center mb-4">
        <h2 className="fw-semibold">{title}</h2>
        <p className="text-muted">বিভাগীয় ডেটার গ্রাফিক্যাল উপস্থাপনা</p>
      </div>

      <Tab.Container activeKey={activeTab} onSelect={handleTabChange}>
        <Nav variant="tabs" className="mb-4">
          <Nav.Item>
            <Nav.Link eventKey="overview">সংক্ষিপ্ত বিবরণ</Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link eventKey="regional">বিভাগীয় তুলনা</Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link eventKey="status">অবস্থা বিশ্লেষণ</Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link eventKey="detailed">বিস্তারিত বিশ্লেষণ</Nav.Link>
          </Nav.Item>
        </Nav>

        <Tab.Content>
          {/* Overview Tab */}
          <Tab.Pane eventKey="overview">
            <Row className="g-4">
              <Col md={6}>
                <Card>
                  <Card.Header>
                    <Card.Title className="mb-0">বিভাগ অনুযায়ী মোট আবেদন</Card.Title>
                    <small className="text-muted">প্রতিটি বিভাগের আবেদনের সংখ্যা</small>
                  </Card.Header>
                  <Card.Body>
                    <div style={{ height: "300px" }}>
                      <canvas ref={barChartRef}></canvas>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
              <Col md={6}>
                <Card>
                  <Card.Header>
                    <Card.Title className="mb-0">বিভাগ অনুযায়ী আদায়কৃত অর্থ</Card.Title>
                    <small className="text-muted">প্রতিটি বিভাগের আর্থিক আদায়</small>
                  </Card.Header>
                  <Card.Body>
                    <div style={{ height: "300px" }}>
                      <canvas ref={areaChartRef}></canvas>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          </Tab.Pane>

          {/* Regional Comparison Tab */}
          <Tab.Pane eventKey="regional">
            <Row className="g-4">
              <Col xs={12}>
                <Card>
                  <Card.Header>
                    <Card.Title className="mb-0">বিভাগীয় তুলনামূলক বিশ্লেষণ</Card.Title>
                    <small className="text-muted">সকল বিভাগের আবেদন ও অনুমোদনের তুলনা</small>
                  </Card.Header>
                  <Card.Body>
                    <div style={{ height: "400px" }}>
                      <canvas ref={comparisonChartRef}></canvas>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
              <Col xs={12}>
                <Card>
                  <Card.Header>
                    <Card.Title className="mb-0">পেমেন্ট ট্রেন্ড</Card.Title>
                    <small className="text-muted">বিভাগ অনুযায়ী পেমেন্টের প্রবণতা</small>
                  </Card.Header>
                  <Card.Body>
                    <div style={{ height: "300px" }}>
                      <canvas ref={lineChartRef}></canvas>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          </Tab.Pane>

          {/* Status Analysis Tab */}
          <Tab.Pane eventKey="status">
            <Row className="g-4">
              <Col md={6}>
                <Card>
                  <Card.Header>
                    <Card.Title className="mb-0">আবেদনের অবস্থা বিতরণ</Card.Title>
                    <small className="text-muted">সামগ্রিক আবেদনের অবস্থার পাই চার্ট</small>
                  </Card.Header>
                  <Card.Body>
                    <div style={{ height: "300px" }}>
                      <canvas ref={pieChartRef}></canvas>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
              <Col md={6}>
                <Card>
                  <Card.Header>
                    <Card.Title className="mb-0">সামগ্রিক পরিসংখ্যান</Card.Title>
                    <small className="text-muted">মোট সংখ্যার সারসংক্ষেপ</small>
                  </Card.Header>
                  <Card.Body>
                    <Row className="g-3">
                      <Col xs={6}>
                        <div className="p-3 text-center bg-warning bg-opacity-10 rounded">
                          <div className="fs-3 fw-bold text-warning">{totalPending}</div>
                          <small className="text-warning">অপেক্ষমাণ আবেদন</small>
                        </div>
                      </Col>
                      <Col xs={6}>
                        <div className="p-3 text-center bg-success bg-opacity-10 rounded">
                          <div className="fs-3 fw-bold text-success">{totalApproved}</div>
                          <small className="text-success">অনুমোদিত আবেদন</small>
                        </div>
                      </Col>
                      <Col xs={6}>
                        <div className="p-3 text-center bg-danger bg-opacity-10 rounded">
                          <div className="fs-3 fw-bold text-danger">{totalCanceled}</div>
                          <small className="text-danger">বাতিল আবেদন</small>
                        </div>
                      </Col>
                      <Col xs={6}>
                        <div className="p-3 text-center bg-primary bg-opacity-10 rounded">
                          <div className="fs-3 fw-bold text-primary">{totalAmount.toFixed(2)}</div>
                          <small className="text-primary">মোট আদায় (টাকা)</small>
                        </div>
                      </Col>
                    </Row>
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          </Tab.Pane>

          {/* Detailed Analysis Tab */}
          <Tab.Pane eventKey="detailed">
            <Card className="mb-4">
              <Card.Header>
                <Card.Title className="mb-0">বিস্তারিত বিশ্লেষণ</Card.Title>
                <small className="text-muted">একটি বিভাগ নির্বাচন করুন বিস্তারিত দেখার জন্য</small>
              </Card.Header>
              <Card.Body>
                <div className="d-flex flex-wrap gap-2">
                  {Object.keys(data).map((regionName) => (
                    <Button
                      key={regionName}
                      variant={selectedRegion === regionName ? "primary" : "outline-secondary"}
                      size="sm"
                      onClick={() => handleRegionSelect(regionName)}
                    >
                      {regionName}
                    </Button>
                  ))}
                </div>
              </Card.Body>
            </Card>

            {selectedRegion && data[selectedRegion]?.sonod_reports && (
              <Row className="g-4">
                <Col md={6}>
                  <Card>
                    <Card.Header>
                      <Card.Title className="mb-0">{selectedRegion} - সনদ অনুযায়ী আবেদন</Card.Title>
                      <small className="text-muted">বিভিন্ন সনদের আবেদনের সংখ্যা</small>
                    </Card.Header>
                    <Card.Body>
                      <div style={{ height: "300px" }}>
                        <canvas ref={detailBarChartRef}></canvas>
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
                <Col md={6}>
                  <Card>
                    <Card.Header>
                      <Card.Title className="mb-0">{selectedRegion} - সনদ অনুযায়ী আদায়</Card.Title>
                      <small className="text-muted">বিভিন্ন সনদের আর্থিক আদায়</small>
                    </Card.Header>
                    <Card.Body>
                      <div style={{ height: "300px" }}>
                        <canvas ref={detailAmountChartRef}></canvas>
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
              </Row>
            )}

            {!selectedRegion && (
              <Card>
                <Card.Body className="text-center py-5">
                  <p className="text-muted">বিস্তারিত চার্ট দেখতে একটি বিভাগ নির্বাচন করুন</p>
                </Card.Body>
              </Card>
            )}

            {selectedRegion && !data[selectedRegion]?.sonod_reports && (
              <Card>
                <Card.Body className="text-center py-5">
                  <p className="text-muted">নির্বাচিত বিভাগের জন্য কোন বিস্তারিত ডেটা পাওয়া যায়নি</p>
                </Card.Body>
              </Card>
            )}
          </Tab.Pane>
        </Tab.Content>
      </Tab.Container>
    </Container>
  )
}

export default DividedReportCharts
