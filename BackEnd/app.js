const express=require("express");
const app=express();
const dotenv=require("dotenv")
const path=require('path')
dotenv.config({path:path.join(__dirname,"config/config.env")})

const products=require("./routes/product")
const auth=require("./routes/auth")
const order=require("./routes/order")
const payment=require('./routes/payment')

const errorMiddleware=require("./middleware/error")
const cookieParser=require("cookie-parser")
const cors = require('cors');


const corsOptions = {
    origin: 'http://localhost:3000',
    // Add other CORS options as needed
  };
  
  app.use(cors(corsOptions));

app.use(express.json())
app.use(cookieParser())
app.use('/uploads',express.static(path.join(__dirname,'uploads')))
app.use("/api/v1",products)
app.use("/api/v1",auth)
app.use("/api/v1",order)
app.use("/api/v1",payment)
if(process.env.NODE_ENV==='production')
{
app.use(  express.static(path.join(__dirname,'../frontend/build')))
app.get('*',(req,res)=>{
  res.sendFile(path.resolve(__dirname,'../frontend/build/index.html'))
})
}
app.use(errorMiddleware)

module.exports=app;