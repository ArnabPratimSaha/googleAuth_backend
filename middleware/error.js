class CustomError extends Error{
    code;
    constructor(msg,code){
        super(msg);
        this.message=msg;
        this.code=code;
    }
}
const errorHandler=(err,req,res,next)=>{
    if(err instanceof Error){
        console.log(err);
        if(err instanceof CustomError){
            return res.status(err.code).json(err.message);
        }
        return res.status(500).json('Server sidded error');
    }
    return res.sendStatus(500)
}

module.exports={errorHandler,CustomError}