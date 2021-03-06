require("dotenv").config();
const path = require("path");
const fs = require("fs");
const express = require("express");
const ejs = require("ejs");
const stripe = require("stripe")(process.env.STRIPE_PRIVATE_KEY);

const app = express();
const PORT = process.env.PORT || 3000;

//middlewares
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "public")));

app.get("/store", (req, res, next) => {
  fs.readFile("item.json", (error, data) => {
    if (error) {
      next(error);
    } else {
      res.render("store.ejs", {
        items: JSON.parse(data),
        stripePublicKey: process.env.STRIPE_PUBLIC_KEY,
      });
    }
  });
});

app.get("/payment-success", (req, res, next) => {
  res
    .status(200)
    .send(
      "<h1>payment successfull</h1><br /><a href='/store'>Continue Shopping</a>"
    );
});

app.get("/payment-cancel", (req, res, next) => {
  res
    .status(200)
    .send("<h1>payment canceled</h1><br /><a href='/store'>try again</a>");
});

app.post("/checkout-session", async (req, res, next) => {
  const products = req.body;
  const productDetails = [];
  const totalPrice = 0;
  fs.readFile("item.json", async (error, data) => {
    if (error) next(error);
    else {
      try {
        const items = JSON.parse(data);
        products.forEach((product) => {
          const itemsInBackend = items.music.concat(items.merch);
          const isProductFound = itemsInBackend.find(
            (item) => item.id === parseInt(product.id)
          );
          if (!isProductFound) {
            throw new Error("product not in the store");
          } else {
            const tempProduct = {
              id: isProductFound.id,
              name: isProductFound.name,
              price: isProductFound.price,
              quantity: product.quantity,
              subTotal: isProductFound.price * product.quantity,
            };
            productDetails.push(tempProduct);
          }
        });
        console.log(productDetails);
        //all the products details here
        // console.log(productDetails);
        const lineItems = productDetails.map((detail) => ({
          price_data: {
            currency: "usd",
            product_data: {
              name: detail.name,
              images: ["https://via.placeholder.com/150"],
            },
            unit_amount_decimal: detail.price,
          },
          quantity: detail.quantity,
        }));
        const session = await stripe.checkout.sessions.create({
          payment_method_types: ["card"],
          billing_address_collection: "required",
          shipping_address_collection: {
            allowed_countries: ["US", "CA"],
          },
          line_items: lineItems,
          mode: "payment",
          success_url: `https://rajstore.herokuapp.com/payment-success`,
          cancel_url: `https://rajstore.herokuapp.com/payment-cancel`,
        });
        res.json({ id: session.id });
      } catch (error) {
        next(error);
      }
    }
  });
  // const session = await stripe.checkout.sessions.create({
  //   payment_method_types: ["card"],
  //   line_items: [
  //     {
  //       price_data: {
  //         currency: "usd",
  //         unit_amount: 2000,
  //       },
  //       quantity: 1,
  //     },
  //   ],
  //   mode: "payment",
  //   success_url: `http://localhost:${PORT}/payment-success`,
  //   cancel_url: `http://localhost:${PORT}/payment-cancel`,
  // });
  // res.json({ id: session.id });
});

app.use((error, req, res, next) => {
  res.status(500).send("<h1>some error occured.go back</h1>");
});

app.listen(PORT, () => {
  console.log(`server online on port ${PORT}`);
});
