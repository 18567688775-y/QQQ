/**
 * 题目表
 */
module.exports.mongo = (Schema) =>{
    const subjectSchema = new Schema({
        subjectName:{
            type:String,
            comment:'题目名称'
        },
        gradeId:{
            type:Schema.ObjectId,
            comment:'等级ID',
            ref:'grade'
        }
    })
    return ['subject',subjectSchema]
}