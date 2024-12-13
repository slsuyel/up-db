import { Input } from "antd";
import { Form } from "antd";

const adminEditFields = () => {
    return (
        <div className=" row">
            <div className="col-md-3">
                {" "}
                <Form.Item
                    label="খাত"
                    name=""
                >
                    <Input style={{ height: 40 }} />
                </Form.Item>
            </div>
            <div className="col-md-3">
                {" "}
                <Form.Item
                    label="currently_paid_money"
                    name=""
                >
                    <Input style={{ height: 40 }} />
                </Form.Item>
            </div>
            <div className="col-md-3">
                {" "}
                <Form.Item
                    label="total_amount"
                    name=""
                >
                    <Input style={{ height: 40 }} />
                </Form.Item>
            </div>
            <div className="col-md-3">
                {" "}
                <Form.Item
                    label="the_amount_of_money_in_words"
                    name=""
                >
                    <Input style={{ height: 40 }} />
                </Form.Item>
            </div>
            <div className="col-md-6">
                {" "}
                <Form.Item
                    label="prottoyon"
                    name="prottoyon"
                >
                    <Input.TextArea rows={5} />
                </Form.Item>
            </div>
            <div className="col-md-6">
                {" "}
                <Form.Item
                    label="sec_prottoyon"
                    name="sec_prottoyon"
                >
                    <Input.TextArea rows={5} />
                </Form.Item>
            </div>

            <div className="col-md-3">
                {" "}
                <Form.Item
                    label="stutus"
                    name="stutus"
                >
                    <Input style={{ height: 40 }} />
                </Form.Item>
            </div>
            <div className="col-md-3">
                {" "}
                <Form.Item
                    label="sonod_Id"
                    name="sonod_Id"
                >
                    <Input style={{ height: 40 }} />
                </Form.Item>
            </div>


        </div>
    );
};

export default adminEditFields;