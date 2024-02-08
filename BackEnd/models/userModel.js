const mongoose=require("mongoose")
const validator=require("validator")
const bcrypt =require("bcrypt")
const jwt=require("jsonwebtoken")
const crypto=require("crypto")
const userSchema=new mongoose.Schema(
    {
        name:
        {
            type:String,
            required:[true,"Please Enter Name"]
        },
        email:
        {
            type:String,
            required:[true,"Please Enter Email"],
            unique:true,
            validate:[validator.isEmail,"Please Enter Valid Email"]

        },
        password:
        {
            type:String,
            required:[true,"Please Enter Password"],
            maxlength:[6,"Password Cannot Exceed 6 Characters"],
            select:false

        },
        avatar:
        {
            type:String
        },
        role:
        {
            type:String,
            default:"user"
        },
        resetPasswordToken:{
            type:String,
        },
        resetPasswordTokenExpire:{
            type:Date,
        },
        createdAt:
        {
            type:Date,
            default:Date.now
        }
    }
)

userSchema.pre("save", async function (next) {
  try {
    if (!this.isModified("password") || !this.password) {
      return next();
    }

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    return next(error);
  }
});

  
  userSchema.methods.getJWTToken = function () {
    return jwt.sign({ id: this.id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWS_EXPRESS_TIME,
    });
  };
  
  userSchema.methods.isValidPassword = async function (enteredPassword) {
    // console.log("enteredPassword:", enteredPassword);
    // console.log("this.password:", this.password);
  
    return await bcrypt.compare(enteredPassword,this.password);
  };
  
  userSchema.methods.getResetToken = async function () {
    const token = crypto.randomBytes(20).toString("hex");
    this.resetPasswordToken = crypto.createHash("sha256").update(token).digest("hex");
    this.resetPasswordTokenExpire = Date.now() + 30 * 60 * 1000;
    return token;
  };
  
  const User = mongoose.model("User", userSchema);
  module.exports = User;