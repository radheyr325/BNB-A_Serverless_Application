/**
 *   @author : Dharminsinh Rathod (B00908277)
 */

import React, { useState } from "react";
import { Form, Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { CognitoUser, AuthenticationDetails } from "amazon-cognito-identity-js";
import Userpool from "../Userpool";
import { toast } from "react-toastify";
import "./Login.css";

// var AWS = require('aws-sdk/dist/aws-sdk-react-native');

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");


  const onSubmit = (event) => {
    event.preventDefault();

    const user = new CognitoUser({
      Username: email,
      Pool: Userpool,
    });

    const authDetails = new AuthenticationDetails({
      Username: email,
      Password: password,
    });

    user.authenticateUser(authDetails, {
      onSuccess: (data) => {
        console.log("onSuccess: ", data);
        toast.success("Give security quetion answers");
        localStorage.setItem("email", email);
        localStorage.setItem("profile", data.idToken.payload.profile);
        // navigate("/qa/" + email);
        navigate("/qa");
      },
      onFailure: (err) => {
        console.error("onFailure: ", err);
        toast.error(err.message);
      },
    });
  };

  const navigate = useNavigate();

  return (
    <div className="form-container">
      <center>
        <h1>Login</h1>
      </center>
      <form onSubmit={onSubmit} className="mb-2">
        <Form.Group className="mb-2" controlId="formEmail">
          <Form.Label>Email</Form.Label>
          <Form.Control
            onChange={(event) => setEmail(event.target.value)}
            type="email"
            name="email"
            value={email}
            placeholder="Enter Email"
          />
        </Form.Group>
        <Form.Group className="mb-2" controlId="formPassword">
          <Form.Label>Password</Form.Label>
          <Form.Control
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            type="password"
            name="password"
            placeholder="Enter Password"
          />
        </Form.Group>

        <br></br>
        <center>
          <Button variant="primary" type="submit">
            Next
          </Button>{" "}
          Or
          <Form.Text>
            {" "}
            <a style={{ cursor: "pointer" }} className="h6" href="/signup">
              Don't have an account? Register here.
            </a>
          </Form.Text>
        </center>
      </form>
    </div>
  );
};

export default Login;
