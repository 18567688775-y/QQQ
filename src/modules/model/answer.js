/**
 * 答案名称表
 */
module.exports.mongo = (Schema) =>{
    const answerSchema = new Schema({
        answerName:{
            type:String,
            comment:'答案'
        },
        subjectId:{
            type:Schema.ObjectId,
            comment:'题目ID',
            ref:'subject'
        },
        isAnswer:{
            type:String,
            comment:'是否是正确答案'
        }
    })
    return ['answer',answerSchema]
}