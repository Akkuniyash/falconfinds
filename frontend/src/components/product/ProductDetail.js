import React, { Fragment,useEffect,useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { createReview, getProduct } from '../../actions/productAction';
import {useParams} from 'react-router-dom'
import Loader from '../layoutes/Loader';
import {Carousel} from 'react-bootstrap'
import MetaData from '../layoutes/MetaData';
import { addCartItem } from '../../actions/cartAction';
import { toast } from "react-toastify";
import { Modal } from 'react-bootstrap';
import { clearReviewSubmitted,clearError,clearProduct } from '../../slices/productSlice';
import ProductReview from './ProductReview';



const ProductDetail = () => {
   const {products={},loading,isReviewSubmitted,error}= useSelector((state)=>state.productState);
    const dispatch=useDispatch();
    const {id}=useParams()
    const[quantity,setQuantity]=useState(1);
    const [show, setShow] = useState(false);
    const {user}=useSelector(state=>state.authState)

    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);
    const [rating,setRating]=useState(1)
    const [comment,setComment]=useState("")

    const increaseQty=()=>
    {
        const count=document.querySelector('.count')
        if(products.stock ===0 || count.valueAsNumber >= products.stock)
        {
            return
        }
        const qty=count.valueAsNumber+1;
        setQuantity(qty);
    }
    const decreaseQty=()=>
    {
        const count=document.querySelector('.count')
        if(count.valueAsNumber ===1)
        {
            return
        }
        const qty=count.valueAsNumber-1;
        setQuantity(qty);
    }
    const reviewHandler=()=>
    {
        const formData=new FormData();
        formData.append('rating',rating)
        formData.append('comment',comment)
        formData.append('productId',id)
        dispatch(createReview(formData))
    }
    useEffect(()=>
    {
        if(isReviewSubmitted)
        {
            handleClose()
            toast("Review Submitted Successfully",{
                type:'success',
                position:toast.POSITION.BOTTOM_CENTER,
                onOpen:()=>dispatch(clearReviewSubmitted())
            })
            
        }
        if(error)
        {
            toast(error,{
                type:"error",
                position:toast.POSITION.BOTTOM_CENTER,
                onOpen:()=>{dispatch(clearError())}
            })
            return
        }
        if(!products._id || isReviewSubmitted)
        {

            dispatch(getProduct(id))
        }
        return ()=>
        {
            dispatch(clearProduct())
        }
    },[dispatch,id,isReviewSubmitted,error])
  return (
   <Fragment>
    {loading ? <Loader/> :
    <Fragment>
        <MetaData title={products.name}/>
     <div className="row f-flex justify-content-around">
    <div className="col-12 col-lg-5 img-fluid" id="product_image">
        <Carousel pause="hover">
            {products.images && products.images.map(image=>
          <Carousel.Item key={image._id}>
    <img className="d-block w-100" src={image.image} alt={products.name} height="500" width="500" />

          </Carousel.Item>
        )}
        </Carousel>
    </div>

    <div className="col-12 col-lg-5 mt-5">
        <h3>{products.name}</h3>
        <p id="product_id">Product {products._id}</p>

        <hr />

        <div className="rating-outer">
            <div className="rating-inner"  style={{ width: `${(products.rating / 5) * 100}%` }}></div>
        </div>
        <span id="no_of_reviews">({products.numOfReviews} Reviews)</span>

        <hr />

        <p id="product_price">${products.price}</p>
        <div className="stockCounter d-inline">
            <span className="btn btn-danger minus" onClick={decreaseQty}>-</span>

            <input type="number" className="form-control count d-inline" value={quantity} readOnly />

            <span className="btn btn-primary plus" onClick={increaseQty}>+</span>
        </div>
        <button type="button" id="cart_btn" 
                     disabled={products.stock===0?true:false} 
                     onClick={()=>{
                        dispatch(addCartItem(products._id, quantity))
                        toast('Cart Item Added!',{
                            type: 'success',
                            position: toast.POSITION.BOTTOM_CENTER
                        })
                    }}
                     className="btn btn-primary d-inline ml-4"
                     >Add to Cart</button>

        <hr />

        <p>Status: <span className={products.stock >0 ? 'greenColor':'redColor'} id="stock_status">{products.stock >0 ? 'In Stock':'Out Of Stock'}</span></p>

        <hr />

        <h4 className="mt-2">Description:</h4>
        <p>{products.description}</p>
        <hr />
        <p id="product_seller mb-3">Sold by: <strong>{products.seller}</strong></p>
        
        <button onClick={handleShow} id="review_btn" type="button" className="btn btn-primary mt-4" data-toggle="modal" data-target="#ratingModal">
                    Submit Your Review
        </button>
        
        <div className="row mt-2 mb-5">
            <div className="rating w-50">
                <Modal show={show} onHide={handleClose} animation={false}>
        <Modal.Header closeButton>
          <Modal.Title>Submit Review</Modal.Title>
        </Modal.Header>
        <Modal.Body>
            
        <ul className="stars" >
            {
                [1,2,3,4,5].map(star=>(

                    <li 
                    value={star}
                    onClick={()=>setRating(star)}
                    className={`star ${star<=rating?'orange':''}`}
                    onMouseOver={(e)=>e.target.classList.add('yellow')}
                    onMouseOut={(e)=>e.target.classList.remove('yellow')}
                    ><i className="fa fa-star"></i></li>
                ))

            }
        </ul>

        <textarea onChange={(e)=>setComment(e.target.value)} name="review" id="review" className="form-control mt-3">

        </textarea>
        {user ?
        <button disabled={loading} onClick={reviewHandler} aria-label='close' className='brn my-3 float-right review-btn px-4 text-white'>
            Submit
        </button>:
        <div className='alert alert-danger mt-5'>Login To Post Review</div>
         }
      
        </Modal.Body>
       
      </Modal>

            </div>
                
    </div>

</div>
</div>
{products.reviews && products.reviews.length>0?
<ProductReview reviews={products.reviews} />:
null

}
   </Fragment>
   }
   </Fragment>

  )
}

export default ProductDetail
