const products=require("../data/product.json")
const Product=require("../models/productModel")
const dotenv=require("dotenv")
const connectDatabase=require("../config/database")

dotenv.config({path:"BackEnd/config/config.env"})
connectDatabase();


const seedProduct=async ()=>
{
    try
    {
        await Product.deleteMany()
        console.log("Products Deleted");
        await Product.insertMany(products)
        console.log("Products Added");
    }
    catch(err)
    {
        console.log(err);
    }
    process.exit()
   
}
seedProduct()