/**
 *   @author : Ali Shan (B00881685)
 */

import React, { useState, useEffect } from "react";
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import CardMedia from '@mui/material/CardMedia';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import { Button, Grid } from '@mui/material';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import axios from "axios";
import { v4 as uuidv4 } from "uuid";
import "./Menu.css"
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";



const cartFromLocalStorage = JSON.parse(localStorage.getItem("cart") || '[]')

const Menu = () => {

  const [menuItems, setMenuItems] = useState([]);
  const [cart, setCart] = useState([]);
  const [total, setTotal] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    let oneTime = false;

    if (!oneTime) fetchMenuRequests()
    return () => { oneTime = true; }
  }, []);

  /* useEffect(() => {
        localStorage.setItem("cart",JSON.stringify(cart)) 
       
       },[cart]); */

  const fetchMenuRequests = async (event) => {
    //  event.preventDefault();

    console.log('inside fetching menu items');

    const getMenuItems = await axios('https://3zg49m9lti.execute-api.us-east-1.amazonaws.com/test/fetchmenu')
    const response = await getMenuItems.data;

    setMenuItems(response.Items);
    // console.log(menuItems);  
  }

  const handleAddCart = async (id) => {
    let i = 0;

    for (i = 0; i < menuItems.length; i++) {
      if (id === menuItems[i].id) {
        let price = menuItems[i].price;
        setCart((prevCart) => { return [...prevCart, menuItems[i]] });

        setTotal((prevTotal) => { return prevTotal + price });
      }

    }

  }

  const handleSubmitOrder = async () => {
    let i = 0;

    if (cart.length === 0) {
      console.log("Cart Empty!")
    } else {
      const email = localStorage.getItem("email");
      console.log(email)
      if (email !== null && email !== undefined) {
        for (i = 0; i < cart.length; i++) {
          let order = {
            email: email,
            id: uuidv4(),
            cuisine: cart[i].cuisine,
            foodItem: cart[i].id,
            foodName: cart[i].name,
            price: cart[i].price
          }
          const putMenuItems = await axios.post('https://3zg49m9lti.execute-api.us-east-1.amazonaws.com/test/submitorder', order)
          const response = await putMenuItems.data;
          console.log(response)
          
        }
        setCart([]);
        setTotal(0);
        alert("Order Submitted!");
      }
      else {
        localStorage.setItem("previousPath", "/menu");
        toast.error("Please login first");
        navigate("/login");
      }
    }


  }

  return (


    <Grid
      container
    // sx={{
    //   flexFlow: 'row',
    //   width: '100%',
    // }} 
    >

      {menuItems && menuItems.map((row) => (
        <Grid item justify="center" key={row.id} xs={4}>
          <Card sx={{ margin: "1em", maxWidth: "250px" }}  >
            <CardHeader titleTypographyProps={{ variant: 'h6' }}
              title={row.name}
            />
            <CardMedia
              component="img"
              className="menu-item-image"
              image={row.url}
              alt={row.name}
            />
            <CardContent>
              <Typography variant="body2" color="text.secondary" className="card-overflow-ellipsis">
                {row.description}
              </Typography>
            </CardContent>
            <CardContent>
              <Typography variant="body2" color="text.primary">
                Price: {row.price}
              </Typography>
            </CardContent>
            <CardContent>
              <Typography variant="body2" color="text.secondary">
                Cuisine: {row.cuisine}
              </Typography>
            </CardContent>
            <CardContent>
              <Button variant="outlined" onClick={() => handleAddCart(row.id)}> Add to Cart</Button>
            </CardContent>
          </Card>
        </Grid>
      ))}

      <Grid item justify="center" xs={12}>
        <TableContainer component={Paper} >
          <Table sx={{ minWidth: 400 }} aria-label="customized table">
            <TableHead>
              <TableRow>
                <TableCell align="center" >Food Item</TableCell>
                <TableCell align="center">cuisine</TableCell>
                <TableCell align="center">Price</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {cart && cart.map((row) => (
                <TableRow >
                  <TableCell component="th" scope="row" align="center">
                    {row.name}
                  </TableCell>
                  <TableCell align="center">{row.cuisine}</TableCell>
                  <TableCell align="center">{row.price}</TableCell>
                </TableRow>
              ))}
              <TableRow >
                <TableCell component="th" scope="row">
                  <b>Total</b>
                </TableCell>
                <TableCell align="center"> </TableCell>
                <TableCell align="center"><b>{total}</b></TableCell>
              </TableRow>
              <TableRow >
                <TableCell component="th" scope="row">

                </TableCell>
                <TableCell align="center"> </TableCell>
                <TableCell align="center"><Button variant="contained" onClick={() => { handleSubmitOrder() }}> Submit Order </Button></TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
      </Grid>

    </Grid>



  )

}

export default Menu;