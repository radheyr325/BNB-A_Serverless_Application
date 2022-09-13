/**
 *   @author : Dharminsinh Rathod (B00908277)
 */

import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Form, Button } from "react-bootstrap";
import "./Login.css";
import { toast } from "react-toastify";
import { v4 as uuidv4 } from "uuid";
import axios from "axios";
// import Userpool from "../../Userpool";

import {
  CognitoUserPool,
  CognitoUserAttribute,
  CognitoUser,
  AuthenticationDetails,
} from "amazon-cognito-identity-js";
import {
  APP_CLIENT_ID,
  SEC_Q1,
  SEC_Q2,
  SEC_Q3,
  USER_POOL_ID,
} from "../../constants";

// https://blog.cloudthat.com/aws-cognito-service-with-react-js-application-setup/
const poolData = {
  UserPoolId: USER_POOL_ID,
  ClientId: APP_CLIENT_ID,
};
// const cors = require('cors');
// const app = require('express');
// app.use(cors());
const ciphergcp =
  "https://us-central1-bnbproject-g17.cloudfunctions.net/cipheruser";

const loggcp = "https://us-central1-bnbproject-g17.cloudfunctions.net/userLogs";

const logaws =
  "https://3zg49m9lti.execute-api.us-east-1.amazonaws.com/test/userloginhistory";

const userPool = new CognitoUserPool(poolData);
// var cors = require('cors');
const initialState = {
  email: "",
  password: "",
};

const initialQA = {
  generatedcipher: "",
  usercipher: "",
  q3: "",
};

const redStar = <font color="red">*</font>;

const random = (length = 8) => {
  let chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  let str = "";
  for (let i = 0; i < length; i++) {
    str += chars.charAt(Math.floor(Math.random() * chars.length));
  }

  return str;
};
const ciphertxt = random(4);

function Cipher() {
  const [email, setEmail] = useState(localStorage?.getItem("email"));
  const [profile, setProfile] = useState(localStorage?.getItem("profile"));

  const [secQA, setSecQA] = useState(initialQA);

  const { generatedcipher, usercipher } = secQA;
  //   console.log(generatedcipher);

  const handleQAChange = (e) => {
    setSecQA({ ...secQA, [e.target.name]: e.target.value });
  };
  let currentTimestamp = Date.now();
  let date = new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).format(currentTimestamp);

  const onSubmit = async (event) => {
    event.preventDefault();

    await axios
      .post(ciphergcp, {
        email,
        ciphertxt,
        usercipher,
      })
      .then((response) => {
        console.log(response.data.email);
        if (response.data == true) {
          toast.success("Ceaser-cipher matched");
          // navigate("/login");

          axios.post(loggcp, { email: email, time: date }).then(() => {
            toast.success("Welcome!!");
            console.log("log  done");
          });
          axios.post(logaws, { email, date }).then(() => {
            // logaws.use(cors());
            // toast.success("aws");
            console.log("aws log  done");
          });

          toast.success("Successfully logged in");
          localStorage.setItem("isLoggedIn", true);
          const nextPath = localStorage?.getItem("previousPath");
          nextPath ? navigate(nextPath) : navigate("/");
        } else {
          toast.error("Ceaser-cipher does not matched");
        }
      });
  };

  const navigate = useNavigate();

  return (
    <div className="form-container">
      <center>
        <h1>Ceaser-cipher</h1>
      </center>
      <Form id={"sec2"} onSubmit={onSubmit}>
        <Form.Label
          className="text-center"
          style={{ width: "100%", color: "red" }}
        >
          Fields marked with * are mandatory!{" "}
        </Form.Label>

        <Form.Group className="mb-2" controlId="generatedcipher">
          <Form.Label>Cipher string</Form.Label>
          <Form.Control
            // onChange={handleQAChange}
            type="text"
            value={ciphertxt}
            name="generatedcipher"
            // placeholder="Your answer"
          />
        </Form.Group>
        <Form.Group className="mb-2" controlId="usercipher">
          <Form.Label>
            Enter cipher text using the key you get while registration
          </Form.Label>
          <Form.Control
            onChange={handleQAChange}
            value={secQA.usercipher}
            type="text"
            name="usercipher"
            placeholder="Enter your answer"
          />
        </Form.Group>

        <center>
          <Button align="center" variant="primary" type="submit">
            Login
          </Button>
        </center>
      </Form>
    </div>
  );
}

export default Cipher;
