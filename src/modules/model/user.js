/**
 * 用户表
 */
module.exports.mongo = (Schema) =>{
    const userSchema = new Schema({
        userName:{
            type:String,
            comment:'用户名'
        },
        password:{
            type:String,
            comment:'用户名'
        },
        answerSum:{
            type:Number,
            comment:'答题次数'
        },
        answerDate:{
            type:String,
            comment:'答题时长'
        },
        gradeId:{
            type:Schema.ObjectId,
            comment:'等级ID',
            ref:'grade'
        }

    })
    return ['user',userSchema];
}