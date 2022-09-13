/**
 *   @author : Leah Isenor (B00316891)
 */

import { Card, Button, Row, Form, Modal } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import "./Tours.css";
import { toast } from "react-toastify";

const { useState, useEffect, useRef } = require("react");
const axios = require("axios");

const Tours = () => {

    const [tours, setTours] = useState();
    const [showReviewForm, setShowReviewForm] = useState(false);
    const [showBookingForm, setShowBookingForm] = useState(false);
    const [showRecommendations, setShowRecommendations] = useState(false);
    const selectedTour = useRef({});
    const reviewText = useRef();
    const groupSize = useRef();
    const duration = useRef();
    const filtered = useRef(false);
    const navigate = useNavigate();

    const submitReview = async () => {
        try {
            var body = {
                id: selectedTour.current.id,
                review: reviewText.current.value
            }
            var response = await axios.post("https://3zg49m9lti.execute-api.us-east-1.amazonaws.com/test/reviewtour", body);
            alert(response?.data?.message)
            await new Promise(r => setTimeout(r, 1000));
            getAllTours()
            setShowReviewForm(false);
        } catch (err) {
            alert("Error occurred, review was not sent");
        }
    }

    const submitOrder = async () => {
        try {
            if (!groupSize.current.value) {
                alert("Enter group size");
                return;
            }
            const email = localStorage?.getItem("email");
            if (email) {
                var response = await axios.post("https://3zg49m9lti.execute-api.us-east-1.amazonaws.com/test/booktour", {
                    tourId: selectedTour.current.id,
                    email: email,
                    groupSize: groupSize.current.value
                });
            }
            else {
                localStorage.setItem("previousPath", "/tours");
                toast.error("Please login first");
                navigate("/login");
            }
            alert(response.data.message)
            setShowBookingForm(false);
        } catch {
            alert("Error occurred, tour was not booked")
        }
    }

    useEffect(() => {
        getAllTours();
    }, []);

    const getAllTours = async () => {
        var response = await axios.get("https://3zg49m9lti.execute-api.us-east-1.amazonaws.com/test/gettours");
        setTours(response.data)
    }

    const getRecommendations = async (e) => {
        if (!filtered.current) {
            if (!groupSize.current.value && !duration.current.value) {
                alert("Please fill in at least one field");
                return;
            }
            const params = {};
            if (groupSize.current.value) {
                params.groupSize = groupSize.current.value;
            }
            if (duration.current.value) {
                params.duration = duration.current.value;
            }
            var response = await axios.get("https://3zg49m9lti.execute-api.us-east-1.amazonaws.com/test/gettours", { params });
            setTours(response.data);
            setShowRecommendations(false);
        } else {
            getAllTours();
        }
        filtered.current = !filtered.current;
    }

    const clearRecommendations = () => {
        filtered.current = false;
        getAllTours();
    }

    const openReview = (tour) => {
        selectedTour.current = tour;
        setShowReviewForm(true);
    }

    const openBooking = (tour) => {
        selectedTour.current = tour;
        setShowBookingForm(true);
    }

    if (tours) {
        return (
            <>
                <Row className="m-auto align-self-center">
                    <h1>Tour Booking</h1>
                    {filtered.current ? <Button className="tours-btn" onClick={clearRecommendations}>{"Clear Recommendations?"}</Button> : <Button className="tours-btn" onClick={() => setShowRecommendations(true)}>{"Recommendations?"}</Button>}
                    {tours.map(tour => {
                        return (
                            <Card style={{ width: '25%' }} key={tour.id}>
                                <Card.Img src={tour.url} />
                                <Card.Body>
                                    <Card.Title>{tour.name}</Card.Title>
                                    <Card.Text>
                                        {tour.description}
                                        <br /><b>Group size:</b> {tour.min} - {tour.max}
                                        <br /><b>Price:</b> ${tour.price} per person
                                        <br /><b>Rating:</b> {tour.rating}/10
                                    </Card.Text>
                                    <Button className="tours-btn" onClick={() => openReview(tour)}>Review</Button>
                                    <Button className="tours-btn" onClick={() => openBooking(tour)}>Book</Button>
                                </Card.Body>
                            </Card>
                        )
                    })}
                </Row>
                <Modal show={showReviewForm} onHide={() => setShowReviewForm(false)} animation={false}>
                    <Modal.Header closeButton>
                        <Modal.Title>Leave a review for {selectedTour.current.name}</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <textarea ref={reviewText} rows="5" cols="53" placeholder="Enter your review"></textarea>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button className="tours-btn" onClick={submitReview}>Submit</Button>
                    </Modal.Footer>
                </Modal>
                <Modal show={showBookingForm} onHide={() => setShowBookingForm(false)} animation={false}>
                    <Modal.Header closeButton>
                        <Modal.Title>Booking for {selectedTour.current.name}</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <Form.Label>Enter group size</Form.Label>
                        <Form.Control ref={groupSize} type="number" min={selectedTour.current.min} max={selectedTour.current.max} />
                    </Modal.Body>
                    <Modal.Footer>
                        <Button className="tours-btn" onClick={submitOrder}>Book Now</Button>
                    </Modal.Footer>
                </Modal>
                <Modal show={showRecommendations} onHide={() => setShowRecommendations(false)} animation={false}>
                    <Modal.Header closeButton>
                        <Modal.Title>Tour Recommendations</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <Form.Label>How many people are in your group?</Form.Label>
                        <Form.Control ref={groupSize} type="number" min={1} />
                        <Form.Label>How many days are you visiting for?</Form.Label>
                        <Form.Control ref={duration} type="number" min={1} />
                    </Modal.Body>
                    <Modal.Footer>
                        <Button className="tours-btn" onClick={getRecommendations}>Get Recommendations</Button>
                    </Modal.Footer>
                </Modal>
            </>
        )
    }
}
export default Tours;