import { CognitoUserPool } from "amazon-cognito-identity-js";
import { APP_CLIENT_ID, USER_POOL_ID } from "../constants";

const poolData ={
    UserPoolId: USER_POOL_ID,
    ClientId: APP_CLIENT_ID
};

export default new CognitoUserPool(poolData);