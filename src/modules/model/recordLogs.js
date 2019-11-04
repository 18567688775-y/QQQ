/**
 * 记录表
 */
module.exports.mongo = (Schema) =>{
    const recordLogsSchmea = new Schema({
        userId:{
            type:Schema.ObjectId,
            comment:'用户名ID',
            ref:'user'
        },
        endTime:{
            type:Date,
            comment:'结束时间'
        },
        currentAnswerLevel:{
            type:String,
            comment:'当前答题等级'
        },
        whetheToPass:{
            type:String,
            comment:'是否通过'
        },
        noAnswer:{
            type:Number,
            comment:'未答题'
        },
        correctAnswer:{
            type:Number,
            comment:'答题正确'
        },
        errorAnswer:{
            type:Number,
            comment:'答题错误'
        },
        startTime:{
            type:Date,
            comment:'开始时间'
        }
    })
    return ['recordLogs',recordLogsSchmea]
}