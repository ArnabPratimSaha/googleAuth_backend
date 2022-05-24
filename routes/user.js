const router = require('express').Router();
const passport = require('passport');
const { v4 :uuid}=require('uuid');
const { getMysqlInstance } = require('../Database/connection');
const jwt = require('jsonwebtoken');
const { CustomError } = require('../middleware/error');
const { validate } = require('../middleware/validation');


router.get('/',validate,(req,res,next)=>{
    try {
        return res.status(200).json({...req.user,accesstoken:req.accesstoken})
    } catch (error) {
        next(error);
    }
})
router.delete('/',validate,async(req,res,next)=>{
    try {
        const database=await getMysqlInstance();
        await database.query(`delete from token as t where t.token='${req.refreshtoken}'`)
        return res.sendStatus(200);
    } catch (error) {
        next(error);
    }
})

module.exports=router;