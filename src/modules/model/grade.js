/**
 * 等级表
 */
module.exports.mongo = (Schema) =>{
    const gradeSchema = new Schema({
        gradeName:{
            type:Number,
            comment:'等级名称'
        }
    })
    return ['grade',gradeSchema]
}