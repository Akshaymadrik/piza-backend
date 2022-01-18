const express = require('express');
const fs = require('fs');
const jwt=require('jsonwebtoken')
const router = express.Router();
const jwtSecret="ddsfftyy677yttfff";
const userModel = require('../db/userSchema');
const productModel = require('../db/productSchema');
const orderModel = require('../db/orderSchema');
function autenticateToken(req,res,next){
    const authHeader=req.headers['authorization'];
    const token=authHeader && authHeader.split(' ')[1];
    console.log(token)
    if(token==null){
        res.json({"err":1,"msg":"Token not match"})
    }
    else {
        jwt.verify(token,jwtSecret,(err,data)=>{
            if(err){
                res.json({"err":1,"msg":"Token incorrect"})
            }
            else {
                console.log("Match")
                next();
            }
        })
    }
}
router.post("/register",(req, res)=>{
    let email = req.body.email;
    let password = req.body.password;
    let name = req.body.name;
    let mobile = req.body.mobile;
    let address = req.body.address;
    let ins = new userModel({name:name, email:email, mobile:mobile, address:address, password:password});
    ins.save((err)=>{
        if(err) {res.json({"err":"User already added"})};
        res.json({"msg":"Registered successfully"})
    })
})

router.post("/login",(req, res)=>{
    let email = req.body.email;
    let password = req.body.password;
    userModel.findOne({email:email, password: password}, (err,data)=>{
        if(err){res.json({"err":err})}
        if(data===null){
            res.json({"err":"Email or password wrong"})
        }
        else{
            let payload={
                uid:email
            }
            const token=jwt.sign(payload,jwtSecret,{expiresIn:360000})
            res.json({"msg":"Logged in successfully","token":token})
        }
    })
})
router.get("/products",autenticateToken,(req, res)=>{
    productModel.find({}, (err, products)=>{
        if(err) {
            res.json({"err":err})
        }
        else{
            res.json({"products":products});
        }
    })
})

router.get("/cart/:item/:price/:email", (req, res)=>{
    let item = req.params.item;
    let email = req.params.email;
    let price = req.params.price;
    orderModel.find({pname:item, email:email, checkout: false},(err, data)=>{
        if(err) {res.json({"err":err})}
        if(data.length===0){
            let ins_order = new orderModel({pname: item, email: email, price:price, quantity:1, checkout: false});
            ins_order.save((err)=>{
                if(err) {res.json({"err":err})};
                res.json({"msg": "Product ordered successfully"})
            })
        }
        else{
            orderModel.updateOne({pname:item},{$inc:{quantity: +1}}, (err)=>{
                if(err) throw err;
                res.json({"msg": "Product incremented successfully"})
            })
        }
    })
})

router.get("/orders/:email", (req, res)=>{
    let email = req.params.email;
    orderModel.find({email:email, checkout:false},(err, data)=>{
        if(err) {res.json({"err":err})}
        if(data.length===0){
            res.json({"msg":"Orders are not placed"})
        }
        else{
           res.json({"orders":data});
        }
    });
})

router.delete("/deleteorder/:id",(req, res)=>{
    let id = req.params.id;
    orderModel.deleteOne({_id:id}, (err)=>{
        if(err) throw err;
        res.json({msg:"Product deleted successfully"})
    })
})

router.get("/checkout/:email", (req, res)=>{
    let email = req.params.email;
    orderModel.updateMany({email:email, checkout:false},{$set:{checkout: true}}, (err)=>{
        if(err) throw err;
        res.json({"msg": "Updated successfully"})
    })
})

router.get("/allorders/:email", (req, res)=>{
    let email = req.params.email;
    orderModel.find({email:email},(err, data)=>{
        if(err) {res.json({"err":err})}
        if(data.length===0){
            res.json({"msg":"Orders are not placed"})
        }
        else{
           res.json({"orders":data});
        }
    });
})

router.get("/profile/:email", (req, res)=>{
    let email = req.params.email;
    userModel.findOne({email:email}, (err, data)=>{
        if(err) res.json({err:err})
        res.json({user:data});
    })
})
router.put('/updprofile/:id', (req, res)=>{
    let id = req.params.id;
    let name = req.body.name;
    let email = req.body.email;
    let mobile = req.body.mobile;
    let address = req.body.address;
    let password = req.body.password;
    userModel.updateOne({_id:id},{$set:{name:name, email:email, mobile:mobile, address:address, password:password}}, (err)=>{
        if(err) res.json({err:err});
        res.json({msg:"Profile updated successfully"});
    })
})
module.exports = router;