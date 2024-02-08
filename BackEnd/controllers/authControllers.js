const catchAsyncError=require("../middleware/catchAsyncError")
const User=require("../models/userModel")
const sendEmail = require("../utils/email")
const ErrorHandler = require("../utils/errorHandler")
const sendToken=require("../utils/jwt")
const crypto=require("crypto")

//Register User ->/api/v1/register

exports.registerUser=catchAsyncError(
    async(req,res,next)=>
    {
        const{name,email,password}=req.body
        let avatar;
        let BASE_URL=process.env.BACKEND_URL;
        if(process.env.NODE_ENV==='production')
        {
            BASE_URL=`${req.protocol}://${req.get('host')}`
        }
        if(req.file)
        {
            avatar=`${BASE_URL}/uploads/user/${req.file.originalname}`
        }
     const user=await User.create(
        {
            name,
            email,
            password,
            avatar
        }
     )
     const token = user.getJWTToken();

     sendToken(user,201,res)
    }
)

//Login User ->/api/v1/login

exports.loginUser=catchAsyncError(
    async (req,res,next)=>
    {
        const {email,password}=req.body

        if(!email || !password)
        {
            return next(new ErrorHandler("Please Enter Email And Password",400))
        } 
        
        const user= await User.findOne({email}).select("+password")
        
        if(!user)
        {
            return next(new ErrorHandler("Invalid Email And Password",401))
            
        }
        if(! await user.isValidPassword(password))
        {
            return next(new ErrorHandler("Invalid Email And Password",401))

        }
        sendToken(user,201,res)
       
    }
)

//Logout  User ->/api/v1/logout
// Deleting the cookie to acheive logout


exports.logoutUser=async (req,res,next)=>
{
    res.cookie(`token`,null,{
        expires:new Date(Date.now()),
        httpOnly:true
    })
    .status(200)
    .json(
        {
            success:true,
            message:"Logged Out..."
        }
    )
}

//Forgot User Password->/api/v1/password/forget
// getting a resettoken from a email


exports.forgotPassword = catchAsyncError(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    return next(new ErrorHandler("User Not Found With This Email", 404));
  }

  // Get and set reset token
  const resetToken = await user.getResetToken();
  await user.save({ validateBeforeSave: false });

  let BASE_URL = process.env.FRONTEND_URL;
  if(process.env.NODE_ENV === "production"){
      BASE_URL = `${req.protocol}://${req.get('host')}`
  }
  // Create Reset URL
  const resetUrl = `${BASE_URL}/password/reset/${resetToken}`;

  const message = `Your Password reset url is as follows\n\n${resetUrl}\n\nIf You Have Not Requested This Email, Then Ignore It`;

  try {
    await sendEmail({
      email: user.email,
      subject: "TREND CART Password Recovery",
      message: message,
    });

    res.status(200).json({
      success: true,
      message: `Email sent to ${user.email}`,
    });
  } catch (err) {
    user.resetPasswordToken = undefined;
    user.resetPasswordTokenExpire = undefined;
    await user.save({ validateBeforeSave: false });
    return next(new ErrorHandler(err.message, 500));
  }
});

//Reset User Password ->/api/v1/password/reset/:token

exports.resetPassword=catchAsyncError(async (req,res,next)=>
{
    const resetPasswordToken=crypto.createHash('sha256').update(req.params.token).digest('hex')
    const user=await User.findOne(
        {
            resetPasswordToken,
            resetPasswordTokenExpire:{
                $gt:Date.now()
            }
        }
    )
    if(!user)
    {
        return next(new ErrorHandler(
            "Password Reset Token Is Invalid",401
        ))
    }
    if(req.body.password!==req.body.confirmPassword)
    {
        return next(new ErrorHandler(
            "Password Does Not Match",401
        ))
    }
    user.password=req.body.password;
    user.resetPasswordToken=undefined
    user.resetPasswordTokenExpire=undefined
    await user.save({ validateBeforeSave: false });
    sendToken(user,201,res)
})

// Get User Profile ->/api/v1/myProfile
exports.getUserProfile=catchAsyncError(
    async (req,res,next)=>
    {
        const user=await User.findById(req.user.id)
        res.status(200).json(
            {
                success:true,
                user
            }
        )
    }
)

//Change Password  - api/v1/password/change
exports.changePassword  = catchAsyncError(async (req, res, next) => {
    const user = await User.findById(req.user.id).select('+password');
    //check old password
    if(!await user.isValidPassword(req.body.oldPassword)) {
        return next(new ErrorHandler('Old password is incorrect', 401));
    }

    //assigning new password
    user.password = req.body.password;
    await user.save();
    res.status(200).json({
        success:true,
        user
    })
 })
// Update  Profile
exports.updateProfile=catchAsyncError(
    async(req,res,next)=>
    {
       let newUserData=
        {
            name:req.body.name,
            email:req.body.email
        }
        let avatar;
        let BASE_URL=process.env.BACKEND_URL;
        if(process.env.NODE_ENV==='production')
        {
            BASE_URL=`${req.protocol}://${req.get('host')}`
        }
        if(req.file)
        {
            avatar=`${BASE_URL}/uploads/user/${req.file.originalname}`
            newUserData={...newUserData,avatar}
        }
        const user=await User.findByIdAndUpdate(req.user.id,newUserData,{
            new:true,
            runValidators:true
        })
        res.status(200).json(
            {
                success:true,
                user
            }
        )
    }
)

// Admin :Get All Users /api/v1/admin/users
exports.getAllUsers=catchAsyncError(
    async(req,res,next)=>
    {
        const users=await User.find()
        res.status(200).json(
         {
            success:true,
            users
         }
        )
    }
)
// Admin :Get Specific User
exports.getSpecificUser=catchAsyncError(
    async(req,res,next)=>
    {
        const user=await User.findById(req.params.id)
        if(!user)
        {
            return next(new ErrorHandler(`No User Found ${req.params.id}`,401))
        }
        res.status(200).json(
         {
            success:true,
            user
         }
        )
    }
)
// Admin :Update User
exports.updateUser=catchAsyncError(
    async(req,res,next)=>
    {
        const newUserData={
            name:req.body.name,
            email:req.body.email,
            role:req.body.role
        }
        const user=await User.findByIdAndUpdate(req.params.id,newUserData,{
            new:true,
            runValidators:true
        })
        if(!user)
        {
            return next(new ErrorHandler(`No User Found ${req.params.id}`,401))
        }
        res.status(200).json(
         {
            success:true,
            user
         }
        )
    }
)
// Admin :Delete User

exports.deleteUser=catchAsyncError(
    async(req,res,next)=>
    {
        const user=await User.findById(req.params.id)
        if(!user)
        {
            return next(new ErrorHandler(`User Not Found ${req.params.id}`,401))
        }
        await user.deleteOne()
        res.status(200).json(
            {
                success:true
            }
        )
    }
)

