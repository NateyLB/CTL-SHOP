const router = require("express").Router();
const Easypost = require('@easypost/api');
const easyAPI = new Easypost(process.env.EASYPOST_TEST_KEY);

router.post('/verify', (req, res) => {
    const address = new easyAPI.Address({
        verify: ['delivery'],
        street1: req.body.street1,
        street2: req.body.street2,
        city: req.body.city,
        state: req.body.state,
        zip: req.body.zip,
        country: req.body.country,
        company: req.body.company,
        phone: req.body.phone,
      });
      
      address.save().then(valid => {
          if(valid.verifications.delivery.success === true){
            res.status(200).json(valid)
          } else {
            res.status(400).json({ message: "Address not valid"})
          }
      })
})

module.exports = router