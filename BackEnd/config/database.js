const mongoose=require("mongoose")

const connectDatabase=()=>
{
    mongoose.connect(process.env.DB_LOCAL_URL
      ).then((con)=>
        {
            console.log(`Database Connected Successfully`);
        })
}
module.exports=connectDatabase;