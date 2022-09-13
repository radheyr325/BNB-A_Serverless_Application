/**
 *   @author : Vasu Gamdha (B00902737)
 */

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Form, Button } from "react-bootstrap";
import "./Signup.css";
import { toast } from "react-toastify";
import { v4 as uuidv4 } from "uuid";
import Userpool from "../Userpool";
import axios from "axios";
import {
  CognitoUserAttribute,
} from "amazon-cognito-identity-js";
import { SEC_Q1, SEC_Q2, SEC_Q3, } from "../../constants";


const registerLambda =
  "https://3zg49m9lti.execute-api.us-east-1.amazonaws.com/test/register";
const cipherStore = "https://us-central1-bnbproject-g17.cloudfunctions.net/storeKey";

//  const userPool = new CognitoUserPool(poolData);

const initialState = {
  name: "",
  email: "",
  password: "",
  confirmPassword: "",
  gender: "",
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

function Signup() {
  const [formData, setFormData] = useState(initialState);
  const [secQA, setSecQA] = useState(initialQA);
  const [step, setStep] = useState(1);
  const [cipherKey, setCipherKey] = useState(Math.floor(Math.random() * 10) + 1);

  // function to make an post API call
  const makeRequest = () => {
    var uuid = uuidv4();
    console.log(uuid);
    const { name, email, password, confirmPassword, gender } = formData;
    const { q1, q2, q3 } = secQA;

    const attributeList = [
      new CognitoUserAttribute({
        Name: "email",
        Value: email,
      }),
      new CognitoUserAttribute({
        Name: "name",
        Value: name,
      }),
      new CognitoUserAttribute({
        Name: "gender",
        Value: gender,
      }),
      new CognitoUserAttribute({
        Name: "profile",
        Value: cipherKey.toString(),
      }),
      new CognitoUserAttribute({
        Name: "custom:id",
        Value: uuid, // toString()
      }),
    ];

    Userpool.signUp(
      email,
      password,
      attributeList,
      null,
      function (err, result) {
        if (err) {
          toast.error(err.message);
          return;
        }
        var cognitoUser = result.user;

        // lambda for security questions
        axios
          .post(registerLambda, {
            uuid,
            email,
            q1,
            q2,
            q3
          })
          .then(() => {
            axios.post(cipherStore, {"email":email, "key": cipherKey}).then(() => {
              toast.success("Sign up successful");
              console.log(cognitoUser?.getUsername());
              setStep(3);
            });
          })
          .catch((err) => {
            toast.error(err.message);
          });


      }
    );
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleQAChange = (e) => {
    setSecQA({ ...secQA, [e.target.name]: e.target.value });
  };

  const handleSignup = (e) => {
    e.preventDefault();
    const { q1, q2, q3 } = secQA;
    if (q1 && q2 && q3) {
      console.log("signup");
      makeRequest();
    } else {
      toast.error("Please answer all the security questions!");
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log(formData);
    const { name, email, password, confirmPassword, gender } = formData;
    if (name && email && password && confirmPassword && gender) {
      if (password.length > 7) {
        if (password === confirmPassword) {
          setStep(2);
        } else {
          toast.error("Passwords are not same!");
        }
      } else {
        toast.error("Password must have atleast 8 characters");
      }
    } else {
      toast.error("Please fill up all the fields");
    }
  };

  const navigate = useNavigate();

  const form = (
    <div className="form-container">
      <center>
        <h1>Sign up</h1>
      </center>
      <Form id={"sec1"} onSubmit={handleSubmit}>
        <Form.Label
          className="text-center"
          style={{ width: "100%", color: "red" }}
        >
          Fields marked with * are mandatory!{" "}
        </Form.Label>

        <Form.Group className="mb-2" controlId="formLastName">
          <Form.Label>Name {redStar}</Form.Label>
          <Form.Control
            onChange={handleChange}
            type="text"
            name="name"
            placeholder="Enter Full Name"
          />
        </Form.Group>
        <Form.Group className="mb-2" controlId="formEmail">
          <Form.Label>Email {redStar}</Form.Label>
          <Form.Control
            onChange={handleChange}
            type="email"
            name="email"
            placeholder="Enter Email"
          />
        </Form.Group>
        <Form.Group className="mb-2" controlId="formPassword">
          <Form.Label>Password {redStar}</Form.Label>
          <Form.Control
            onChange={handleChange}
            type="password"
            name="password"
            placeholder="Enter Password"
          />
        </Form.Group>
        <Form.Group className="mb-2" controlId="formConfirmPassword">
          <Form.Label>Confirm Password {redStar}</Form.Label>
          <Form.Control
            onChange={handleChange}
            type="password"
            name="confirmPassword"
            placeholder="Confirm Password"
          />
        </Form.Group>
        <Form.Group className="mb-2" controlId="formGender">
          <div className="mb-3">
            <Form.Label>Gender {redStar} &nbsp;</Form.Label>
            <Form.Check
              inline
              name="gender"
              type="radio"
              id="male"
              label="Male"
              onChange={() => setFormData({ ...formData, gender: "Male" })}
              selected
            />
            <Form.Check
              inline
              name="gender"
              type="radio"
              id="female"
              label="Female"
              onChange={() => setFormData({ ...formData, gender: "Female" })}
            />
            <Form.Check
              inline
              name="gender"
              type="radio"
              id="other"
              label="Prefer Not to Say"
              onChange={() => setFormData({ ...formData, gender: "Other" })}
            />
          </div>
        </Form.Group>
        <center>
          <Button variant="primary" type="submit">
            Next...
          </Button>{" "}
          Or
          <Form.Text>
            {" "}
            <a style={{ cursor: "pointer" }} className="h6" href="/login">
              Already a user?
            </a>
          </Form.Text>
        </center>
      </Form>
    </div>
  );

  const securityQuestion = (
    <div className="form-container">
      <center>
        <h1>Security Questions</h1>
      </center>
      <Form id={"sec2"} onSubmit={handleSignup}>
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
            Next...
          </Button>
        </center>
      </Form>
    </div>
  );

  const caesarCipher = (
    // generate random key
    <div className="form-container">
      <center>
        <h2>Third-factor Authentication Details</h2>

        As a security measure, we need to verify your identity before you can
        sign in. <br />We will give you a text encrypted using <a href="https://en.wikipedia.org/wiki/Caesar_cipher" >Caesar Cipher</a>. Please
        decrypt that text using below key to verify your identity.
        <br />
        <br />
        <h5>Your key is: {cipherKey}</h5>
        <br />
        Keep it safe with you and remember it.
        <br />
        <br />
        <Button variant="primary" onClick={() => {
          navigate("/login");
        }}>
          Yes, got it!
        </Button>
      </center>
    </div>
  );

  const display = {
    1: form,
    2: securityQuestion,
    3: caesarCipher,
  }

  return <>{display[step]}</>;
}

export default Signup;
