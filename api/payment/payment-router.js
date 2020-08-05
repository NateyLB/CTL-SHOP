const router = require("express").Router();
const stripe = require("stripe")(process.env.STRIPE_SECRET_TEST_KEY);

const calculateOrderAmount = items => {
    return  items.reduce((accumulator, currentValue) => accumulator + (currentValue.price * currentValue.size.quantity), 0)  * 100
  };

router.post("/create-payment-intent", async (req, res) => {
    // Create a PaymentIntent with the order amount and currency
    console.log(calculateOrderAmount(req.body))
    const paymentIntent = await stripe.paymentIntents.create({
      amount: calculateOrderAmount(req.body),
      currency: "usd"
    });
    res.send({
      clientSecret: paymentIntent.client_secret
    });
  });

module.exports = router