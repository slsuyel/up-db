"use client"

/* eslint-disable @typescript-eslint/no-explicit-any */

import type { TUpazila } from "@/types/global"
import { useEffect, useState } from "react"
import { Button, Form, Input, message, Modal } from "antd"

import {
  useCreateUnionByUpazilaMutation,
  useShowUnionByUpazilaMutation,
  useUpdateUnionMutation,
} from "@/redux/api/auth/authApi"
import { useAppSelector } from "@/redux/features/hooks"
import type { RootState } from "@/redux/features/store"
import { useNavigate } from "react-router-dom"
import AddressSelection from "../../../components/reusable/AddressSelection"

interface TUnionParishad {
  chairman_phone: string | null
  secretary_phone: string | null
  udc_phone: string | null
  user_phone: string | null
  id: number
  full_name: string
  short_name_e: string
  short_name_b: string
  thana: string
  district: string
  c_type: string
  c_type_en: string | null
  u_code: string
  full_name_en: string | null
  district_en: string | null
  thana_en: string | null
  upazila_name: string
  upazila_bn_name: string
  district_name: string
  district_bn_name: string
  division_name: string
  division_bn_name: string
  approved_sonod_count: number
  AKPAY_MER_REG_ID: string
  AKPAY_MER_PASS_KEY: string
}

const UnionCreateByUpazila = () => {
  const token = localStorage.getItem("token")
  const [ekpayEditModal, setEkpayEditModal] = useState(false)
  const [selectedUnion, setSelectedUnion] = useState<TUnionParishad | null>(null)
  const navigate = useNavigate()
  const user = useAppSelector((state: RootState) => state.user?.user)

  useEffect(() => {
    if (user?.position !== "Super Admin") {
      navigate("/")
    }
  }, [navigate, user])

  const [createUnionByUpazila, { isLoading }] = useCreateUnionByUpazilaMutation()
  const [updateUnion, { isLoading: updating }] = useUpdateUnionMutation()
  const [showUnionByUpazila, { isLoading: showing, data }] = useShowUnionByUpazilaMutation()

  const [selectedUpazila, setSelectedUpazila] = useState<TUpazila | null>(null)
  const [upazilas, setUpazilas] = useState<TUpazila[]>([])

  const VITE_BASE_API_URL = import.meta.env.VITE_BASE_API_URL

  const [form] = Form.useForm()

  useEffect(() => {
    fetch("/upazilas.json")
      .then((response) => response.json())
      .then((data: TUpazila[]) => {
        setUpazilas(data)
      })
      .catch((error) => console.error("Error fetching upazilas data:", error))
  }, [])

  const HandleCreateUnions = async () => {
    try {
      const res = await createUnionByUpazila({
        id: selectedUpazila?.id,
        token: localStorage.getItem("token"),
      }).unwrap()
      console.log(res)
      if (res.status_code === 201) {
        message.success("ইউনিয়ন সফলভাবে তৈরি করা হয়েছে!")
      } else {
        message.error(`ইউনিয়ন তৈরি ব্যর্থ: ${res.message || "অজানা ত্রুটি"}`)
      }
    } catch (error: any) {
      const errorMessage = error?.data?.message || error?.message || "একটি ত্রুটি ঘটেছে"
      message.error(`ত্রুটি: ${errorMessage}`)
    }
  }

  const HandleShowUnions = async () => {
    try {
      const res = await showUnionByUpazila({
        id: selectedUpazila?.id,
        token: localStorage.getItem("token"),
      }).unwrap()
      if (res.status_code === 200) {
        message.success("ইউনিয়নগুলো সফলভাবে পাওয়া গেছে!")
      } else {
        message.error(`ডেটা পাওয়া যায়নি: ${res.message || "অজানা ত্রুটি"}`)
      }
    } catch (error: any) {
      const errorMessage = error?.data?.message || error?.message || "একটি ত্রুটি ঘটেছে"
      message.error(`ত্রুটি: ${errorMessage}`)
    }
  }

  const allUp: TUnionParishad[] = data?.data || []

  const HandleUpEkpayCreadintial = () => {
    setEkpayEditModal(true) // Open the modal
  }

  const HandleUpManage = (id: number) => {
    console.log("Manage union id:", id)
    // এখানে প্রয়োজন অনুযায়ী রিডাইরেক্ট বা অন্য লজিক যোগ করতে পারো
  }

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields()
      const res = await updateUnion({
        data: values,
        id: selectedUnion?.id,
        token,
      }).unwrap()
      console.log(res)

      if (res.status_code == 200) {
        message.success(`ইউনিয়নের তথ্য সফলভাবে আপডেট করা হয়েছে`)
        await HandleShowUnions()
      } else {
        message.error(`আপডেট ব্যর্থ: ${res.message || "অজানা ত্রুটি"}`)
      }
      setEkpayEditModal(false)
    } catch (error: any) {
      console.error("Validation Failed:", error)
      const errorMessage = error?.data?.message || error?.message || "একটি ত্রুটি ঘটেছে"
      message.error(`ত্রুটি: ${errorMessage}`)
    }
  }

  // Close the modal
  const handleCancel = () => {
    setEkpayEditModal(false)
    form.resetFields() // Reset the form fields
    setSelectedUnion(null) // Clear the selected union data
  }

  // Update form fields when selectedUnion changes
  useEffect(() => {
    if (selectedUnion) {
      form.setFieldsValue({
        AKPAY_MER_REG_ID: selectedUnion.AKPAY_MER_REG_ID,
        AKPAY_MER_PASS_KEY: selectedUnion.AKPAY_MER_PASS_KEY,
        u_code: selectedUnion.u_code,
      })
    }
  }, [selectedUnion, form])

  return (
    <>
      <div className="row">
        <div className="col-md-8">
          <AddressSelection
            onUpazilaChange={(id) => {
              const upazila = upazilas.find((u) => u.id === id)
              setSelectedUpazila(upazila || null)
            }}
          />
        </div>
        {selectedUpazila && (
          <div className="my-1 col-md-4 d-flex flex-column">
            <label htmlFor="">{selectedUpazila?.bn_name} উপজেলার ইউনিয়ন তৈরি করুন</label>
            <div>
              <Button
                className=""
                type="primary"
                danger
                loading={isLoading}
                disabled={isLoading}
                onClick={HandleCreateUnions}
              >
                ইউনিয়ন তৈরি করুন
              </Button>
            </div>
          </div>
        )}
      </div>

      <div className="my-3">
        {selectedUpazila && (
          <div className="d-flex flex-column">
            <label htmlFor="">{selectedUpazila?.bn_name} উপজেলার ইউনিয়ন দেখুন</label>
            <div className="d-flex gap-2">
              <Button type="primary" loading={showing} disabled={showing} onClick={HandleShowUnions}>
                ইউনিয়ন দেখুন
              </Button>

              <a
                className="btn btn-info btn-sm text-white"
                href={`${VITE_BASE_API_URL}/upazilas/${selectedUpazila.id}/uniouninfo/pdf`}
                target="_blank"
                rel="noopener noreferrer"
              >
                পিডিএফ ডাউনলোড করুন
              </a>
              <a
                className="btn btn-primary btn-sm text-white"
                href={`${VITE_BASE_API_URL}/upazilas/${selectedUpazila.id}/uniouninfo/excel`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <i className="fa-solid fa-file-excel"></i> এক্সেল ডাউনলোড করুন
              </a>
            </div>
          </div>
        )}
      </div>

      <div className="table-responsive">
        <table className="table table-bordered table-striped">
          <thead>
            <tr>
              <th>ইউনিয়নের নাম</th>
              <th>থানা</th>
              <th>জেলা</th>
              <th>ইউনিয়ন কোড</th>
              <th>ফোন নম্বরসমূহ</th>
              <th>ইস্যুকৃত সনদের সংখ্যা</th>
              <th>মার্চেন্ট রেজিস্ট্রেশন আইডি</th>
              <th>মার্চেন্ট পাস কী</th>
              <th colSpan={2}>অ্যাকশন</th>
            </tr>
          </thead>
          <tbody>
            {allUp.map((union) => (
              <tr key={union.id}>
                <td>{union.full_name}</td>
                <td>{union.thana}</td>
                <td>{union.district}</td>
                <td>{union.u_code}</td>
                <td>
                  {union.chairman_phone && (
                    <>
                      চেয়ারম্যান: <a href={`tel:${union.chairman_phone}`}>{union.chairman_phone}</a>
                      <br />
                    </>
                  )}
                  {union.secretary_phone && (
                    <>
                      সচিব: <a href={`tel:${union.secretary_phone}`}>{union.secretary_phone}</a>
                      <br />
                    </>
                  )}
                  {union.udc_phone && (
                    <>
                      ইউডিসি: <a href={`tel:${union.udc_phone}`}>{union.udc_phone}</a>
                      <br />
                    </>
                  )}
                  {union.user_phone && (
                    <>
                      ইউজার: <a href={`tel:${union.user_phone}`}>{union.user_phone}</a>
                    </>
                  )}
                </td>
                <td>{union.approved_sonod_count}</td>
                <td>{union.AKPAY_MER_REG_ID}</td>
                <td>{union.AKPAY_MER_PASS_KEY}</td>
                <td>
                  <button className="btn btn-primary btn-sm" onClick={() => HandleUpManage(union.id)}>
                    সম্পাদনা
                  </button>
                </td>
                <td>
                  <button
                    className="btn btn-info btn-sm"
                    onClick={() => {
                      setSelectedUnion(union)
                      HandleUpEkpayCreadintial()
                    }}
                  >
                    একপে সেটিংস
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {ekpayEditModal && (
        <Modal
          title={`${selectedUnion?.full_name} এর তথ্য আপডেট`}
          open={ekpayEditModal}
          onOk={handleSubmit}
          onCancel={handleCancel}
          footer={[
            <Button key="cancel" onClick={handleCancel}>
              বাতিল
            </Button>,
            <Button loading={updating} key="submit" type="primary" onClick={handleSubmit}>
              সংরক্ষণ করুন
            </Button>,
          ]}
        >
          <Form
            form={form}
            layout="vertical"
            initialValues={{
              AKPAY_MER_REG_ID: selectedUnion?.AKPAY_MER_REG_ID || "",
              AKPAY_MER_PASS_KEY: selectedUnion?.AKPAY_MER_PASS_KEY || "",
              u_code: selectedUnion?.u_code || "",
            }}
          >
            <Form.Item
              className="my-1"
              name="AKPAY_MER_REG_ID"
              label="একপে মার্চেন্ট রেজিস্ট্রেশন আইডি"
              rules={[
                {
                  required: false,
                  message: "মার্চেন্ট রেজিস্ট্রেশন আইডি লিখুন",
                },
              ]}
            >
              <Input placeholder="মার্চেন্ট রেজিস্ট্রেশন আইডি লিখুন" />
            </Form.Item>

            <Form.Item
              className="my-1"
              name="AKPAY_MER_PASS_KEY"
              label="একপে মার্চেন্ট পাস কী"
              rules={[
                {
                  required: false,
                  message: "মার্চেন্ট পাস কী লিখুন",
                },
              ]}
            >
              <Input placeholder="মার্চেন্ট পাস কী লিখুন" />
            </Form.Item>
            <Form.Item className="my-1" name="u_code" label="ইউনিয়ন কোড">
              <Input placeholder="ইউনিয়ন কোড লিখুন" />
            </Form.Item>
          </Form>
        </Modal>
      )}
    </>
  )
}

export default UnionCreateByUpazila
