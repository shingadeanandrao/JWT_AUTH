
const express = require('express');

const mongoose = require('mongoose');

const bcrypt = require('bcryptjs');

const jwt = require('jsonwebtoken');
mongoose.connect("mongodb://0.0.0.0:27017/api_dev")
.then(()=>{
    console.log("DB connected")
})
.catch((err)=>{
    console.log(err)
})



const userSchema= mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true
    },
    password:{
        type:String,
        required:true
    }

},{timestamps:true})


const userModel=mongoose.model("users",userSchema);



const app=express()

app.use(express.json())

//endpoint for user registration


app.post("/register",(req,res)=>{
     let user=req.body;

    bcrypt.genSalt(10,(err,salt)=>{

        if( !err){

            bcrypt.hash(user.password,salt,(err,hpass)=>{

                if(!err){
                        user.password=hpass

                        userModel.create(user)
                        .then((doc)=>{
                        res.status(201).send({message:"User registration successful"})
                        })
                        .catch(()=>{
                        res.status(500).send({message:"Some problem"})
                        })
                }
            })

        }
    })
     
})


// endpoint for login

app.post("/login",(req,res)=>{

    let login=req.body;
    userModel.findOne({email:login.email})
    .then((user)=>{

        if(user!==null){

            bcrypt.compare(login.password,user.password,(err,result)=>{
                console.log(login.password,user.password)
                console.log(result)
                if(result==true){

                    //generate token and send it back

                    jwt.sign({email:login.email},"andys",(err,token)=>{
                        if(!err){
                            res.send({token:token})
                        } 
                        else {
                        res.status(500).send({message:"Some issue while creating the token please try again"})
                        }
                    })
                }
                else{

                    res.status(401).send({message:"Incorrect password"})
                }
            })
        }
        else
       {
        res.status(404).send({message:"Wrong Email No User found"})
        }
        
    })
    .catch((err)=>{
        console.log(err);
        res.send({message:"Some Problem"})
    })

})


//enpoint point for getdata

app.get("/displayData",verifyToken,(req,res)=>{
    res.status(200).send({message:"I am data"})
})

function verifyToken(req,res,next){
    let token=req.headers.authorization.split(" ")[1]

    jwt.verify(token,"andys",(err,data)=>{
        if(!err){
            console.log(data)
            next()
        }
        else{
            res.status(401).send({message:"Invalid token please login again"})
        }
    })

}

app.listen(8000,()=>{
    console.log("server is up and running")
})