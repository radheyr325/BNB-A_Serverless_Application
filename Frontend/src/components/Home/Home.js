/**
 *   @author : Vasu Gamdha (B00902737)
 */

 import Card from 'react-bootstrap/Card';
import imgRoom from '../../assets/room.jpg';
import imgTour from '../../assets/tour.jpg';
import imgFood from '../../assets/food.jpg';
import Button from 'react-bootstrap/Button';
import { Container } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

function Home() {
    const navigate = useNavigate();
    return (
        <Container className='d-flex justify-content-around'>
            <Card border="primary" style={{ width: '18rem' }}>
                <Card.Img variant="top" src={imgRoom} />
                <Card.Body>
                    <Card.Title>Book a room</Card.Title>
                    <Card.Text>
                        Book a room with us and save money! We have a variety of rooms available.
                    </Card.Text>
                    <Button onClick={() => navigate("/bookroom")} variant="primary">Book</Button>
                </Card.Body>
            </Card>


            <Card border="primary" style={{ width: '18rem' }}>
                <Card.Img variant="top" src={imgTour} />
                <Card.Body>
                    <Card.Title>Explore Tours</Card.Title>
                    <Card.Text>
                        Explore our tours and see what we have to offer! Tour packages are available for groups of up to 35. 
                    </Card.Text>
                    <Button onClick={() => navigate("/tours")} variant="primary">Explore</Button>
                </Card.Body>
            </Card>


            <Card border="primary" style={{ width: '18rem' }}>
                <Card.Img variant="top" src={imgFood} />
                <Card.Body>
                    <Card.Title>Order Food</Card.Title>
                    <Card.Text>
                        A wide variety of food is available for you to order. The best quality is guaranteed!
                    </Card.Text>
                    <Button onClick={() => navigate("/menu")} variant="primary">Order</Button>
                </Card.Body>
            </Card>
        </Container>
    )
}

export default Home;