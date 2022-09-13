/**
 *   @author : Dharminsinh Rathod (B00908277)
 */

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Form, Button } from "react-bootstrap";
import "./Login.css";
import { toast } from "react-toastify";
import axios from "axios";

import {
  SEC_Q1,
  SEC_Q2,
  SEC_Q3,
} from "../../constants";

const qaLambda =
  "https://3zg49m9lti.execute-api.us-east-1.amazonaws.com/test/verifyqa";


const initialState = {
  email: "",
  password: "",
};

const initialQA = {
  // "What is your favourite hobby?" : "",
  // "What is your father's middle name?" : "",
  // "What is your favourite cartoon?" : ""
  q1: "",
  q2: "",
  q3: "",
};

const redStar = <font color="red">*</font>;

function QA() {

  const [email, setEmail] = useState(localStorage?.getItem("email"));

  const [secQA, setSecQA] = useState(initialQA);

  const { q1, q2, q3 } = secQA;
  //   console.log(q1);

  const handleQAChange = (e) => {
    setSecQA({ ...secQA, [e.target.name]: e.target.value });
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    await axios
      .post(qaLambda, {
        email,
        q1,
        q2,
        q3,
      })
      .then((response) => {
        if (response.data === true) {
          toast.success("Security question answer matched");
          
          navigate("/cipher");
        } else {
          toast.error("Security question answer not matched");
        }
      });
  };

  const navigate = useNavigate();

  return (
    <div className="form-container">
      <center>
        <h1>Security Questions</h1>
      </center>
      <Form id={"sec2"} onSubmit={onSubmit}>
        <Form.Label
          className="text-center"
          style={{ width: "100%", color: "red" }}
        >
          Fields marked with * are mandatory!{" "}
        </Form.Label>

        <Form.Group className="mb-2" controlId="q1">
          <Form.Label>
            {SEC_Q1} {redStar}
          </Form.Label>
          <Form.Control
            onChange={handleQAChange}
            type="text"
            value={secQA.q1}
            name="q1"
            placeholder="Your answer"
          />
        </Form.Group>
        <Form.Group className="mb-2" controlId="q2">
          <Form.Label>
            {SEC_Q2} {redStar}
          </Form.Label>
          <Form.Control
            onChange={handleQAChange}
            value={secQA.q2}
            type="text"
            name="q2"
            placeholder="Your answer"
          />
        </Form.Group>
        <Form.Group className="mb-2" controlId="q3">
          <Form.Label>
            {SEC_Q3} {redStar}
          </Form.Label>
          <Form.Control
            onChange={handleQAChange}
            value={secQA.q3}
            type="text"
            name="q3"
            placeholder="Your answer"
          />
        </Form.Group>
        <center>
          <Button align="center" variant="primary" type="submit">
            Next
          </Button>
        </center>
      </Form>
    </div>
  );
}

export default QA;
