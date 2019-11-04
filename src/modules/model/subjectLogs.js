/**
 * 题目记录表
 */
module.exports.mongo = (Schema) =>{
    const subjectLogsSchema = new Schema({
        userId:{
            type:Schema.ObjectId,
            comment:'用户字段',
            ref:'user'
        },
        subjectId:{
            type:Schema.ObjectId,
            comment:'题目ID',
            ref:'subject'
        },
        choiceAnswer:{
            type:String,
            comment:'选择答案'
        },
        correct:{
            type:String,
            comment:'是否正确'
        },
        recordLogsId:{
            type:Schema.ObjectId,
            comment:'记录表ID',
            ref:'recordLogs'
        }
    })
     return ['subjectLogs',subjectLogsSchema]
}