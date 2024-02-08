const express=require("express");
const { getProducts,newProduct,getSingleProduct, updateProduct ,deleteProduct, createReview,getReviews,deleteReview, getAdminProducts} = require("../controllers/productController");
const router=express.Router();
const {isAuthenticateUser,authorizeRoles}=require("../middleware/authenticate")
const multer=require('multer');
const path=require('path')

const upload=multer({storage:multer.diskStorage(
    {
        destination:function (req,file,cb){
            cb(null,path.join(__dirname,'..','uploads/product'))
        },
        filename:function(req,file,cb)
        {
            cb(null,file.originalname)
        }
    }
)})

// router.route("/products").get(isAuthenticateUser,getProducts)
router.route("/products").get(getProducts)
router.route("/product/:id").get(getSingleProduct)
router.route("/review").put(isAuthenticateUser,createReview)
router.route("/reviews").get(isAuthenticateUser,getReviews)
router.route("/reviews").delete(isAuthenticateUser,deleteReview)


router.route("/admin/products/new").post(isAuthenticateUser, authorizeRoles("admin"), upload.array('images'),newProduct)
router.route("/admin/products/:id").delete(isAuthenticateUser, authorizeRoles("admin"), upload.array('images'),deleteProduct)
router.route("/admin/products/:id").put(isAuthenticateUser, authorizeRoles("admin"), upload.array('images'),updateProduct)
router.route("/admin/products").get(isAuthenticateUser, authorizeRoles('admin'), getAdminProducts);
router.route("/admin/reviews").get(isAuthenticateUser, authorizeRoles('admin'), getReviews);
router.route('/admin/review').delete(isAuthenticateUser, authorizeRoles('admin'),deleteReview);

module.exports=router

