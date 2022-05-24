const router = require('express').Router();
const passport = require('passport');
const { v4 :uuid}=require('uuid');
const { getMysqlInstance } = require('../Database/connection');
const jwt = require('jsonwebtoken');
const { CustomError } = require('../middleware/error');



router.get('/',passport.authenticate('google', { scope: ['profile','email'] }));

router.get('/callback',passport.authenticate('google', { failureRedirect: '/fail' }),async(req,res,next)=>{
    try {
        const email=req.user.profile.emails[0].value;
        const avatar=req.user.profile.photos[0].value;
        const name=req.user.profile.displayName;
        if(!email || !avatar) return next(new CustomError('missing email or avatar',404));
        const database=await getMysqlInstance();
        const [rows]=await database.query(`select * from user as u where u.email='${email}'`);
        if(rows.length){
            const user=rows[0];
            var accesstoken = jwt.sign({id:user.id},process.env.token,{ expiresIn: '1000' });
            var refreshtoken = jwt.sign({id:user.id},process.env.token,{ expiresIn: '100d' });
            await database.query(`insert into token(uid,refreshtoken) values('${user.id}','${refreshtoken}')`);
            return res.redirect(`${process.env.FRONTEND}/varify/${user.id}/${accesstoken}/${refreshtoken}`)
        }
        const id=uuid();
        await database.query(`insert into user(id,name,email,avatar) values('${id}','${name}','${email}','${avatar}')`);
        const at = jwt.sign({id:id},process.env.token,{ expiresIn: '1000' });
        const rt = jwt.sign({id:id},process.env.token,{ expiresIn: '100d' });
        await database.query(`insert into token(uid,refreshtoken) values('${id}','${rt}')`);
        return res.redirect(`${process.env.FRONTEND}/varify/${id}/${at}/${rt}`)
    } catch (error) {
        next(error);
    }
});

module.exports = router;