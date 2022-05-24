const jwt = require('jsonwebtoken');
const { getMysqlInstance } = require('../Database/connection');
const { CustomError } = require('./error');

//this validates the user if it is in the database or not
//takes the access token and refreshes it if necessery
//required headers [id,accesstoken,refreshtoken]
//adds [user,accesstoken,refreshtoken] to req(accessed as req.user from next middleware)
const validate = async (req, res, next) => {
    try {
        if(!req.headers.accesstoken|| !req.headers.refreshtoken ||!req.headers.id)return next(new Error(404,'missing fields either [accesstoken,id,refreshtoken]'))
        const accesstoken = req.headers.accesstoken;
        var decoded = jwt.verify(accesstoken, process.env.token);
        const database=await getMysqlInstance();
        const [rows]=await database.query(`select * from user as u where u.id='${decoded.id}'`);
        if(!rows.length)return next(new CustomError('No user found',404));
        req.accesstoken = accesstoken;
        req.refreshtoken = req.headers.refreshtoken;
        req.user = rows[0];
        return next();
    } catch (error) {
        if (error instanceof jwt.TokenExpiredError) {
            //refreshing the access token
            try {
                const refreshtoken = req.headers.refreshtoken;
                const id = req.headers.id;
                const database=await getMysqlInstance();
                const [rows]=await database.query(`select * from token as t where t.uid='${id}' and t.refreshtoken='${refreshtoken}'`);
                if(!rows.length)return next(new CustomError('No user found',404));
                const [ur]=await database.query(`select * from user as u where u.id='${id}'`);
                if(!ur.length)return next(new CustomError('No user found',404));
                const user=ur[0];
                const accesstoken = jwt.sign({id:user.id},process.env.token,{ expiresIn: '1000' });
                req.user=user;
                req.accesstoken=accesstoken;
                req.refreshtoken=refreshtoken;
                return next();
            } catch (e) {
                return next(e);
            }
        }
        if (error instanceof jwt.JsonWebTokenError) {
            //security breach(user used a malformed jwt)
            try {
                return next(new CustomError('Security Breach',401));
            } catch (e) {
                return next(e);
            }
        }
        return next(error);
    }
}
module.exports = { validate };