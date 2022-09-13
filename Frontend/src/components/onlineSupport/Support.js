/**
 *   @author : Ali Shan (B00881685)
 */

import React from "react";
import LexChat from "react-lex-plus";

const Support = () => {

  return (
    <LexChat
      botName="BNBHelper"
      IdentityPoolId="us-east-1:995493e3-e90b-47a6-8cc2-6336cba6aa3a"
      placeholder="Type here..."
      backgroundColor="#FFFFFF"
      height="430px"
      region="us-east-1"
      headerText="Online Support!"
      headerStyle={{ backgroundColor: "#069", fontSize: "20px" }}
      greeting={
        "Hi! How can I help You?"
      }
      sessionAttributes={
        { "email": localStorage.getItem("email") || '' }
      }
    />
  )
}

export default Support;