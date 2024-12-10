import Loader from "@/components/reusable/Loader";
import { useSingleHoldingQuery } from "@/redux/api/sonod/sonodApi";
import { usePayTaxMutation } from "@/redux/api/user/userApi";
import { useParams } from "react-router-dom";

export interface THolding {
    unioun: string;
    id: number;
    holding_no: string;
    category: string;
    maliker_name: string;
    father_or_samir_name: string;
    gramer_name: string;
    word_no: string;
    nid_no: string;
    mobile_no: string;
    griher_barsikh_mullo: string;
    jomir_vara: string;
    barsikh_vara: string;
    holding_bokeyas: HoldingBokeya[];
}

export interface HoldingBokeya {
    id: number;
    year: string;
    price: string;
    status: string;
    holdingTax_id: number;
    invoice_url: string;
    certificate_of_honor_url: string;
}

const SingleHolding = () => {
    const [payTax, { isLoading: paying }] = usePayTaxMutation()
    const token = localStorage.getItem("token");
    const { id } = useParams();

    const { data, isLoading } = useSingleHoldingQuery({
        id,
        token,
    });

    if (isLoading) {
        return <Loader />;
    }

    const handlePayTax = async (id: number) => {
        const additionalData = {
            s_uri: window.origin + "/payment-success",
            f_uri: window.origin + "/payment-failed",
            c_uri: window.origin + "/payment-cancel",
        };
        const res = await payTax({ data: additionalData, id }).unwrap()
        window.location.href = res.data;
        console.log(res.data);
    }


    const holding: THolding = data?.data;

    return (
        <div>
            <div className="card">
                <div className="card-body">
                    <div className="d-flex justify-content-between mb-3">
                        <h5 className="card-title">
                            মালিক নিজে বসবাসকারী এর হোল্ডিং ট্যাক্স
                        </h5>
                    </div>
                    <div className="row">
                        <div className="col-md-6 col-6 mt-3">
                            <b>হোল্ডিং ট্যাক্স এর ধরণ: </b>{holding.category}
                        </div>
                        <div className="col-md-6 col-6 mt-3">
                            <b>হোল্ডিং নং: </b>{holding.holding_no}
                        </div>
                        <div className="col-md-6 col-6 mt-3">
                            <b>মালিকের নাম: </b>{holding.maliker_name}
                        </div>
                        <div className="col-md-6 col-6 mt-3">
                            <b>পিতা/স্বামীর নাম: </b>{holding.father_or_samir_name}
                        </div>
                        <div className="col-md-6 col-6 mt-3">
                            <b>গ্রামের নাম: </b>{holding.gramer_name}
                        </div>
                        <div className="col-md-6 col-6 mt-3">
                            <b>ওয়াড নং: </b>{holding.word_no}
                        </div>
                        <div className="col-md-6 col-6 mt-3">
                            <b>এনআইডি নং: </b>{holding.nid_no}
                        </div>
                        <div className="col-md-6 col-6 mt-3">
                            <b>মোবাইল নং: </b>{holding.mobile_no}
                        </div>
                        <div className="col-md-12 mt-5 mb-1">
                            <h5>হোল্ডিং ট্যাক্স</h5>
                        </div>
                        <div className="col-md-6 col-6 mt-3">
                            <b>গৃহের বার্ষিক মূল্য: </b>{holding.griher_barsikh_mullo}
                        </div>
                        <div className="col-md-6 col-6 mt-3">
                            <b>জমির ভাড়া: </b>{holding.jomir_vara}
                        </div>
                        <div className="col-md-12 col-12 mt-3">
                            <table className="table">
                                <thead>
                                    <tr>
                                        <th>সাল</th> <th>বকেয়া</th> <th>অবস্থা</th> <th>রশিদ</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {holding.holding_bokeyas.map((bokeya) => (
                                        <tr key={bokeya.id}>
                                            <td>{bokeya.year}</td>
                                            <td>{bokeya.price}</td>
                                            <td>
                                                {bokeya.status === 'Unpaid' ?
                                                    <button
                                                        disabled={paying}

                                                        onClick={() => handlePayTax(bokeya.id)}
                                                        // to={`/pay/holding/tax/${bokeya.holdingTax_id}`}
                                                        className="btn btn-info"
                                                    >
                                                        পরিশোধ করুন
                                                    </button> : <button className="btn btn-success"> পরিশোধিত</button>}
                                            </td>
                                            <td>



                                                {bokeya.status == 'Paid' &&
                                                    <div className=" d-flex gap-3">
                                                        <a
                                                            target="_blank"
                                                            href={bokeya.invoice_url}
                                                            className="btn btn-info"
                                                        >
                                                            রশিদ
                                                        </a>
                                                        <a
                                                            target="_blank"
                                                            href={bokeya.certificate_of_honor_url}
                                                            className="btn btn-info"
                                                        >
                                                            সম্মাননাপত্র
                                                        </a>



                                                    </div>

                                                }
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SingleHolding;
