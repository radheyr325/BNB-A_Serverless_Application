import React, { useEffect, useState } from "react";
import {CardContent, Card, Grid, Button, Typography} from "@mui/material";
import {useNavigate, useLocation} from "react-router-dom";
import axios from "axios";

const subUrl = "https://rv3rk9f4ca.execute-api.us-east-1.amazonaws.com/message/sub";

const Message = () => {
    const [email, setEmail] = useState(localStorage?.getItem("email"));
    const [messages, setMessages] = useState([]);
    const navigate = useNavigate();

    // const email = "qin@dal.ca";
    useEffect(() => {
        const email = localStorage?.getItem("email");
        if (email) {
            setEmail(email);
        } else {
            setEmail("");
            navigate("/login");
        }
    }, [localStorage?.getItem("isLoggedIn")]);

    useEffect(() => {
        const subRequestConfig = {
            headers: {
                "x-api-key": "518MbZZTeDuNCWgzMwfu9NmCGrFY2Jc6rdEqjnr7",
            }
        };
        axios.get(subUrl, subRequestConfig)
            .then((response) => {
                console.log(response);
                setMessages(response.data);
            })
            .catch((error) => {
                console.log(error);
            });

    }, []);

    return (
        <Grid align="center" sx={{mt: 4}}>
            <Card sx={{width: "100%", maxWidth: 700, minWidth: 275, backgroundColor: "#e1f5fe"}}>
                <CardContent align="left">
                    <Typography sx={{fontSize: 30, mb: 0}} fontWeight="bold">
                        New Messages
                    </Typography>
                    {
                        messages.filter(message => message.email === email).map((m) => (
                            m.tableName === "tourOrders" ?
                                (<CardContent>
                                    <Typography sx={{fontSize: 18}} fontWeight="bold">
                                        Tour Orders:
                                    </Typography>
                                    <Typography sx={{fontSize: 18}} color="text.secondary">
                                        You book a tour with group size {m.groupSize} successfully!
                                    </Typography>
                                </CardContent>) : ((
                                    m.tableName === "roomOrders" ?
                                        (<CardContent>
                                            <Typography sx={{fontSize: 18}} fontWeight="bold">
                                                Room Orders:
                                            </Typography>
                                            <Typography sx={{fontSize: 18}} color="text.secondary">
                                                You book a room for {m.people} people from {m.checkin} to {m.checkout} successfully!
                                            </Typography>
                                        </CardContent>) : (m.tableName === "kitchenOrders" ?
                                            (<CardContent>
                                                <Typography sx={{fontSize: 18}} fontWeight="bold">
                                                    Kitchen Orders:
                                                </Typography>
                                                <Typography sx={{fontSize: 18}} color="text.secondary">
                                                    You order &#36;{m.price} {m.cuisine} {m.foodName} successfully!
                                                </Typography>
                                            </CardContent>) : (null))))
                        ))
                    }
                </CardContent>
            </Card>
        </Grid>
    );

};

export default Message;
