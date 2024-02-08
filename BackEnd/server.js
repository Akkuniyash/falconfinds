const app=require("./app")
const path=require("path")
const connectDatabase = require("./config/database")


connectDatabase()
const server=app.listen(process.env.PORT,()=>
{
    console.log(`Server Listening To The Port : ${process.env.PORT} in ${process.env.NODE_ENV}`);
})
process.on("unhandledRejection", (err, promise) => {
    console.error(`Error: ${err.message}`);
    console.error(`Promise: ${promise}`);
    console.error(`Unhandled Rejection at: ${err.stack}`);
    console.error("Shutting down the server due to unhandled rejection");
  
    server.close(() => {
      process.exit(1); // Use 1 to indicate a failure exit
    });
  });
  

process.on("uncaughtException",(err)=>
{
    console.log(`Error : ${err.message}`)
    console.log(`Shuting down the server due to uncaughtexception`)
    server.close(()=>
    {
        process.exit()
    })
})
// console.log(Ram)
