"use client"

import type React from "react"
import { useState, useEffect } from "react"
import axios from "axios"
import { Alert, Button, Card, Form, Spinner, Table } from "react-bootstrap"
import "bootstrap/dist/css/bootstrap.min.css"

interface ChildKhat {
  khat_fee_id: string
  khat_id_1: string
  khat_id_2: string
  name: string
  fee: number
}

interface KhatData {
  khat_id: string
  name: string
  child_khats: ChildKhat[]
}

interface FeeSubmission {
  khat_id_1: string
  khat_id_2: string
  fee: number
}

const TradeLicenseFees: React.FC = () => {
  const [khatData, setKhatData] = useState<KhatData[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [submitting, setSubmitting] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [editedFees, setEditedFees] = useState<Record<string, number>>({})

  useEffect(() => {
    fetchTradeLicenseFees()
  }, [])

  const fetchTradeLicenseFees = async () => {
    try {
      setLoading(true)
      setError(null)
      const token = localStorage.getItem("token")
      const response = await axios.get("http://localhost:8000/api/admin/get/tradelicense/fees", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      setKhatData(response.data.data)

      console.log("Fetched trade license fees:", response.data.data)
      // Initialize editedFees with current values
      const initialFees: Record<string, number> = {}
      response.data.data.forEach((khat: KhatData) => {
        khat.child_khats.forEach((childKhat: ChildKhat) => {
          initialFees[childKhat.khat_fee_id] = childKhat.fee
        })
      })
      setEditedFees(initialFees)
    } catch (err) {
      setError("Failed to fetch trade license fees. Please try again.")
      console.error("Error fetching trade license fees:", err)
    } finally {
      setLoading(false)
    }
  }

  const handleFeeChange = (khatFeeId: string, value: string) => {
    const feeValue = value === "" ? 0 : Number.parseInt(value, 10)
    setEditedFees((prev) => ({
      ...prev,
      [khatFeeId]: feeValue,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError(null)
    setSuccess(null)

    try {
      // Prepare data for submission
      const submissionData: FeeSubmission[] = []

      khatData.forEach((khat) => {
        khat.child_khats.forEach((childKhat) => {
          submissionData.push({
            khat_id_1: childKhat.khat_id_1,
            khat_id_2: childKhat.khat_id_2,
            fee: editedFees[childKhat.khat_fee_id],
          })
        })
      })

      const token = localStorage.getItem("token")
      await axios.post("http://localhost:8000/api/admin/store/tradelicense/fees", submissionData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      setSuccess("Trade license fees updated successfully!")

      // Refresh data
      fetchTradeLicenseFees()
    } catch (err) {
      setError("Failed to update trade license fees. Please try again.")
      console.error("Error updating trade license fees:", err)
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: "300px" }}>
        <Spinner animation="border" variant="primary" />
        <span className="ms-2">Loading trade license fees...</span>
      </div>
    )
  }

  return (
    <div className="container-fluid py-4">
      <Card className="shadow-sm">
        <Card.Header className="bg-primary text-white">
          <h4 className="mb-0">Trade License Fees Management</h4>
        </Card.Header>
        <Card.Body>
          {error && <Alert variant="danger">{error}</Alert>}
          {success && <Alert variant="success">{success}</Alert>}

          <Form onSubmit={handleSubmit}>
            {khatData.map((khat) => (
              <div key={khat.khat_id} className="mb-4">
                <h5 className="border-bottom pb-2 text-primary">
                  {khat.name} ({khat.khat_id})
                </h5>

                <Table striped bordered hover responsive className="mt-3">
                  <thead className="bg-light">
                    <tr>
                      <th style={{ width: "10%" }}>Khat ID</th>
                      <th style={{ width: "50%" }}>Name</th>
                      <th style={{ width: "20%" }}>Fee (৳)</th>
                      <th style={{ width: "20%" }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {khat.child_khats.map((childKhat) => (
                      <tr key={childKhat.khat_fee_id}>
                        <td>{childKhat.khat_id_1}</td>
                        <td>{childKhat.name}</td>
                        <td>
                          <Form.Control
                            type="number"
                            min="0"
                            value={editedFees[childKhat.khat_fee_id] || 0}
                            onChange={(e) => handleFeeChange(childKhat.khat_fee_id, e.target.value)}
                            className="form-control-sm"
                          />
                        </td>
                        <td>
                          <Button
                            variant="outline-secondary"
                            size="sm"
                            onClick={() => handleFeeChange(childKhat.khat_fee_id, "0")}
                          >
                            Reset
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
            ))}

            <div className="d-flex justify-content-end mt-4">
              <Button
                variant="secondary"
                className="me-2"
                onClick={() => fetchTradeLicenseFees()}
                disabled={submitting}
              >
                Cancel
              </Button>
              <Button type="submit" variant="primary" disabled={submitting}>
                {submitting ? (
                  <>
                    <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" />
                    <span className="ms-2">Saving...</span>
                  </>
                ) : (
                  "Save Changes"
                )}
              </Button>
            </div>
          </Form>
        </Card.Body>
      </Card>
    </div>
  )
}

export default TradeLicenseFees
