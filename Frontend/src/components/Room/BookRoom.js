/**
 *   @author : Vasu Gamdha (B00902737)
 */

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    Form,
    Button,
    Row,
    Col,
    Container,
    Table,
} from "react-bootstrap";
import DateRangePicker from "react-bootstrap-daterangepicker";
import "bootstrap-daterangepicker/daterangepicker.css";

import axios from "axios";
import { toast } from "react-toastify";
import { v4 as uuidv4 } from 'uuid';

const initialData = {
    people: "",
    checkin: "",
    checkout: "",
    room: "",
    bill: "0",
    nights: ""
};
const roomMap = {
    'single': 'S01',
    'double': 'D01',
    'triple': 'T01',
    'quad': 'Q01',
}

const bookLambda =
    "https://3zg49m9lti.execute-api.us-east-1.amazonaws.com/test/bookroom";
const checkAvailabilityLambda =
    "https://3zg49m9lti.execute-api.us-east-1.amazonaws.com/test/checkavailability";

const redStar = <font color="red">*</font>;

function BookRoom() {
    const [roomData, setRoomData] = useState(initialData);
    const [step, setStep] = useState(1);
    const [rooms, setRooms] = useState([]);
    const [refresh, setRefresh] = useState(0);

    const navigate = useNavigate();

    const differenceInDays = (d1, d2) => {
        const a = new Date(d1);
        const b = new Date(d2);
        const diff = Math.abs(b - a);
        return Math.max(1, Math.ceil(diff / (1000 * 3600 * 24)));
    }

    const calculateBill = (roomType) => {
        const { people, checkin, checkout, room, nights } = roomData;
        let bill = 0;
        rooms.forEach(item => {
            if (item.type === roomType) {
                const calculation = item.price * nights * people;
                bill = `$${item.price} price x ${nights} nights x ${people} guests = $${calculation}`;
                console.log(bill);
            }
        }
        );
        return bill;
    }

    const handleRoomData = (e) => {
        if (e.target.name === "room") {

            const bill = calculateBill(e.target.value);
            setRoomData({
                ...roomData,
                [e.target.name]: e.target.value,
                bill: bill
            });
        }
        else {
            setRoomData({ ...roomData, [e.target.name]: e.target.value });
        }

    };

    const handleDate = (event, picker) => {
        const checkin = picker.startDate._d.toLocaleDateString("en-CA");
        const checkout = picker.endDate._d.toLocaleDateString("en-CA");
        const nights = differenceInDays(checkin, checkout);
        setRoomData({
            ...roomData,
            checkin: picker.startDate._d.toLocaleDateString("en-CA"),
            checkout: picker.endDate._d.toLocaleDateString("en-CA"),
            nights: nights
        });
    };

    const checkAvailability = () => {
        axios
            .get(checkAvailabilityLambda)
            .then((res) => {
                if (res.data) {
                    setRooms(res.data.body);
                } else {
                    toast.error("Room is not available");
                }
            })
            .catch((err) => {
                toast.error("Something went wrong");
            });
    };

    useEffect(() => {
        checkAvailability();
    }, [refresh]);

    const makeRequest = () => {
        const { people, checkin, checkout, room, bill } = roomData;
        // console.log(people, checkin, checkout, room, bill);
        const orderId = uuidv4();
        const email = localStorage?.getItem("email");
        const roomId = roomMap[room];


        if (room !== "Select Room Type" && room !== "") {
            if (bill) {
                if (email) {
                    console.log("ready to book");
                    axios
                        .post(bookLambda, { orderId, email, people, checkin, checkout, roomId, bill })
                        .then((response) => {
                            console.log(response);
                            toast.success("Room booked successfully");
                            setRefresh(refresh + 1);
                            setStep(3);
                            // navigate("/");
                        })
                        .catch((error) => {
                            console.log(error);
                            toast.error("Error booking room");
                        });
                }
                else {
                    localStorage.setItem("previousPath", "/bookroom");
                    toast.error("Please login first");
                    navigate("/login");
                }
            }
            else {
                toast.error("Please select room type");
            }
        }
        else {
            toast.error("Please select room type");
        }



        // axios request to make a post request to the lambda function
        // to book a room

    };

    const handleBooking = (e) => {
        e.preventDefault();
        // console.log(roomData);
        const { people, checkin, checkout } = roomData;
        if (people && checkin && checkout) {
            // await checkAvailability();
            setStep(2);
        } else {
            toast.error("Please fill all the fields");
        }
    };

    const bookRoomForm = (
        <div className="form-container">
            <center>
                <h1>Book Room</h1>
            </center>
            <Form id={"bookroom"} onSubmit={handleBooking}>
                <Form.Label
                    className="text-center"
                    style={{ width: "100%", color: "red" }}
                >
                    Fields marked with * are mandatory!{" "}
                </Form.Label>


                <Form.Group className="mb-2" controlId="range">
                    <Form.Label>Date range {redStar}</Form.Label>
                    <DateRangePicker onApply={handleDate}>
                        <input type="text" className="form-control" />
                    </DateRangePicker>
                </Form.Group>
                <Form.Group className="mb-2" controlId="people">
                    <Form.Label>Number of guests {redStar}</Form.Label>
                    <Form.Control
                        onChange={handleRoomData}
                        value={roomData.people}
                        type="number"
                        name="people"
                    />
                </Form.Group>
                <center>
                    <Button align="center" variant="primary" type="submit">
                        Check Availability
                    </Button>
                </center>
            </Form>
        </div>
    );

    const confirmRoom = (
        <div className="form-container">
            <center>
                <h2>Confirm Booking</h2>
            </center>
            <Container className="justify-content-center">
                <Row className="mb-2" sm={12}>
                    <Col sm={3}>Check-in Date:</Col>
                    <Col> {roomData.checkin}</Col>
                </Row>
                <Row className="mb-2" sm={12}>
                    <Col sm={3}>Check-out Date:</Col>
                    <Col>{roomData.checkout}</Col>
                </Row>
                <Row className="mb-2" sm={12}>
                    <Col sm={3}>Guests:</Col>
                    <Col>{roomData.people}</Col>
                </Row>
            </Container>
            Following rooms are available for the selected dates.
            <Table responsive striped bordered hover>
                <thead>
                    <tr>
                        <th>Room Type</th>
                        <th>Available rooms</th>
                        <th>Guests count</th>
                        <th>Price</th>
                    </tr>
                </thead>
                {rooms?.map((room, i) => (
                    <tbody key={i}>
                        <tr>
                            <td>{room.type}</td>
                            <td>{room.count}</td>
                            <td>{room.people}</td>
                            <td>${room.price}</td>
                        </tr>
                    </tbody>
                ))}
            </Table>
            <Form.Group className="mb-2" controlId="room">
                <Form.Label>Room type {redStar}</Form.Label>
                <Form.Select name="room" onChange={handleRoomData}>
                    <option>Select Room Type</option>
                    {rooms?.map((room, i) => (
                        <option key={i} value={room.type}>
                            {room.type}
                        </option>
                    ))}
                </Form.Select>
            </Form.Group>
            <Container className="justify-content-center">
                <Row className="mb-2" sm={12}>
                    <Col sm={4}>You will be charged:</Col>
                    <Col> {roomData.bill}</Col>
                </Row>
            </Container>

            <center>
                <Button align="center" variant="primary" onClick={makeRequest} type="submit">
                    Confirm Booking
                </Button>
            </center>
        </div>);

    const finalBooking = (
        <div className="form-container">
            <center>
                <h2>Booking Successful</h2>
            </center>
            <Container className="justify-content-center">
                <Row className="mb-2" sm={12}>
                    <Col sm={3}>Check-in Date:</Col>
                    <Col> {roomData.checkin}</Col>
                </Row>
                <Row className="mb-2" sm={12}>
                    <Col sm={3}>Check-out Date:</Col>
                    <Col>{roomData.checkout}</Col>
                </Row>
                <Row className="mb-2" sm={12}>
                    <Col sm={3}>Guests:</Col>
                    <Col>{roomData.people}</Col>
                </Row>
                <Row className="mb-2" sm={12}>
                    <Col sm={3}>Cost:</Col>
                    <Col> {roomData.bill}</Col>
                </Row>
            </Container>
            <center>
                <Button align="center" variant="primary" onClick={() => navigate("/")}>
                    Go to Home
                </Button>
            </center>
        </div>
    );


   const display = {
     1: bookRoomForm,
     2: confirmRoom,
     3: finalBooking,
   }
 
   return <>{display[step]}</>;
}

export default BookRoom;

