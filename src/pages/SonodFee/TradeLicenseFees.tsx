"use client"

import type React from "react"
import { useState, useEffect } from "react"
import axios from "axios"
import { Alert, Button, Card, Form, Modal, Spinner, Table } from "react-bootstrap"
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

interface NewChildKhat {
  name: string
  fee: number
}

interface NewKhat {
  name: string
  child_khats: NewChildKhat[]
}

const TradeLicenseFees: React.FC = () => {
  const [khatData, setKhatData] = useState<KhatData[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [submitting, setSubmitting] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [editedFees, setEditedFees] = useState<Record<string, number>>({})

  // Modal state
  const [showModal, setShowModal] = useState<boolean>(false)
  const [creatingKhat, setCreatingKhat] = useState<boolean>(false)
  const [modalError, setModalError] = useState<string | null>(null)

  // New khat form state
  const [newKhats, setNewKhats] = useState<NewKhat[]>([
    {
      name: "",
      child_khats: [{ name: "", fee: 0 }],
    },
  ])

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
      setError("ট্রেড লাইসেন্স ফি তথ্য লোড করতে ব্যর্থ হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।")
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
      setSuccess("ট্রেড লাইসেন্স ফি সফলভাবে আপডেট করা হয়েছে!")

      // Refresh data
      fetchTradeLicenseFees()
    } catch (err) {
      setError("ট্রেড লাইসেন্স ফি আপডেট করতে ব্যর্থ হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।")
      console.error("Error updating trade license fees:", err)
    } finally {
      setSubmitting(false)
    }
  }

  // Modal handlers
  const handleOpenModal = () => {
    setShowModal(true)
    setModalError(null)
    setNewKhats([
      {
        name: "",
        child_khats: [{ name: "", fee: 0 }],
      },
    ])
  }

  const handleCloseModal = () => {
    setShowModal(false)
    setModalError(null)
  }

  // New khat form handlers
  const handleParentKhatNameChange = (index: number, value: string) => {
    const updatedKhats = [...newKhats]
    updatedKhats[index].name = value
    setNewKhats(updatedKhats)
  }

  const handleChildKhatNameChange = (parentIndex: number, childIndex: number, value: string) => {
    const updatedKhats = [...newKhats]
    updatedKhats[parentIndex].child_khats[childIndex].name = value
    setNewKhats(updatedKhats)
  }

  const handleChildKhatFeeChange = (parentIndex: number, childIndex: number, value: string) => {
    const updatedKhats = [...newKhats]
    updatedKhats[parentIndex].child_khats[childIndex].fee = value === "" ? 0 : Number.parseInt(value, 10)
    setNewKhats(updatedKhats)
  }

  const addChildKhat = (parentIndex: number) => {
    const updatedKhats = [...newKhats]
    updatedKhats[parentIndex].child_khats.push({ name: "", fee: 0 })
    setNewKhats(updatedKhats)
  }

  const removeChildKhat = (parentIndex: number, childIndex: number) => {
    const updatedKhats = [...newKhats]
    updatedKhats[parentIndex].child_khats.splice(childIndex, 1)
    setNewKhats(updatedKhats)
  }

  const addParentKhat = () => {
    setNewKhats([...newKhats, { name: "", child_khats: [{ name: "", fee: 0 }] }])
  }

  const removeParentKhat = (index: number) => {
    const updatedKhats = [...newKhats]
    updatedKhats.splice(index, 1)
    setNewKhats(updatedKhats)
  }

  const handleCreateKhat = async () => {
    // Validate form
    let isValid = true

    for (const khat of newKhats) {
      if (!khat.name.trim()) {
        setModalError("মূল খাতের নাম খালি রাখা যাবে না")
        isValid = false
        break
      }

      if (khat.child_khats.length === 0) {
        setModalError("প্রতিটি মূল খাতের অন্তত একটি উপ-খাত থাকতে হবে")
        isValid = false
        break
      }

      for (const childKhat of khat.child_khats) {
        if (!childKhat.name.trim()) {
          setModalError("উপ-খাতের নাম খালি রাখা যাবে না")
          isValid = false
          break
        }
      }

      if (!isValid) break
    }

    if (!isValid) return

    setCreatingKhat(true)
    setModalError(null)

    try {
      const token = localStorage.getItem("token")
      await axios.post("http://localhost:8000/api/admin/create/tradelicense/khat", newKhats, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      setSuccess("ট্রেড লাইসেন্স খাত সফলভাবে তৈরি করা হয়েছে!")
      handleCloseModal()
      fetchTradeLicenseFees()
    } catch (err) {
      setModalError("ট্রেড লাইসেন্স খাত তৈরি করতে ব্যর্থ হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।")
      console.error("Error creating trade license khats:", err)
    } finally {
      setCreatingKhat(false)
    }
  }

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: "300px" }}>
        <Spinner animation="border" variant="primary" />
        <span className="ms-2">ট্রেড লাইসেন্স ফি লোড হচ্ছে...</span>
      </div>
    )
  }

  return (
    <div className="container-fluid py-4">
      <Card className="shadow-sm">
        <Card.Header className="bg-primary text-white d-flex justify-content-between align-items-center">
          <h4 className="mb-0">ট্রেড লাইসেন্স ফি ব্যবস্থাপনা</h4>
          <Button variant="light" onClick={handleOpenModal}>
            <i className="bi bi-plus-circle me-2"></i>নতুন খাত তৈরি করুন
          </Button>
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
                      <th width="10%">খাত আইডি</th>
                      <th width="50%">খাতের নাম</th>
                      <th width="20%">ফি (৳)</th>
                      <th width="20%">অপশন</th>
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
                            রিসেট
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
                বাতিল
              </Button>
              <Button type="submit" variant="primary" disabled={submitting}>
                {submitting ? (
                  <>
                    <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" />
                    <span className="ms-2">সংরক্ষণ হচ্ছে...</span>
                  </>
                ) : (
                  "পরিবর্তন সংরক্ষণ করুন"
                )}
              </Button>
            </div>
          </Form>
        </Card.Body>
      </Card>

      {/* Create New Khat Modal */}
      <Modal show={showModal} onHide={handleCloseModal} size="lg">
        <Modal.Header closeButton className="bg-primary text-white">
          <Modal.Title>নতুন ট্রেড লাইসেন্স খাত তৈরি করুন</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {modalError && <Alert variant="danger">{modalError}</Alert>}

          <div className="mb-4">
            <div className="d-flex justify-content-end mb-3">
              <Button variant="success" size="sm" onClick={addParentKhat}>
                <i className="bi bi-plus-circle me-1"></i> আরেকটি মূল খাত যোগ করুন
              </Button>
            </div>

            {newKhats.map((khat, parentIndex) => (
              <Card key={parentIndex} className="mb-3 border-primary">
                <Card.Header className="bg-light d-flex justify-content-between align-items-center">
                  <h6 className="mb-0">মূল খাত #{parentIndex + 1}</h6>
                  {newKhats.length > 1 && (
                    <Button variant="outline-danger" size="sm" onClick={() => removeParentKhat(parentIndex)}>
                      <i className="bi bi-trash"></i>
                    </Button>
                  )}
                </Card.Header>
                <Card.Body>
                  <Form.Group className="mb-3">
                    <Form.Label>মূল খাতের নাম</Form.Label>
                    <Form.Control
                      type="text"
                      value={khat.name}
                      onChange={(e) => handleParentKhatNameChange(parentIndex, e.target.value)}
                      placeholder="মূল খাতের নাম লিখুন"
                    />
                  </Form.Group>

                  <div className="mt-4">
                    <div className="d-flex justify-content-between align-items-center mb-3">
                      <h6>উপ-খাতসমূহ</h6>
                      <Button variant="outline-primary" size="sm" onClick={() => addChildKhat(parentIndex)}>
                        <i className="bi bi-plus-circle me-1"></i> উপ-খাত যোগ করুন
                      </Button>
                    </div>

                    {khat.child_khats.map((childKhat, childIndex) => (
                      <Card key={childIndex} className="mb-2 border-light">
                        <Card.Body className="py-2">
                          <div className="d-flex gap-2">
                            <Form.Group className="flex-grow-1">
                              <Form.Control
                                type="text"
                                value={childKhat.name}
                                onChange={(e) => handleChildKhatNameChange(parentIndex, childIndex, e.target.value)}
                                placeholder="উপ-খাতের নাম"
                              />
                            </Form.Group>
                            <Form.Group style={{ width: "150px" }}>
                              <Form.Control
                                type="number"
                                min="0"
                                value={childKhat.fee}
                                onChange={(e) => handleChildKhatFeeChange(parentIndex, childIndex, e.target.value)}
                                placeholder="ফি"
                              />
                            </Form.Group>
                            {khat.child_khats.length > 1 && (
                              <Button
                                variant="outline-danger"
                                size="sm"
                                onClick={() => removeChildKhat(parentIndex, childIndex)}
                              >
                                <i className="bi bi-trash"></i>
                              </Button>
                            )}
                          </div>
                        </Card.Body>
                      </Card>
                    ))}
                  </div>
                </Card.Body>
              </Card>
            ))}
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModal}>
            বাতিল
          </Button>
          <Button variant="primary" onClick={handleCreateKhat} disabled={creatingKhat}>
            {creatingKhat ? (
              <>
                <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" />
                <span className="ms-2">তৈরি হচ্ছে...</span>
              </>
            ) : (
              "খাত তৈরি করুন"
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  )
}

export default TradeLicenseFees
