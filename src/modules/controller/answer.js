import mongoose from 'mongoose';
import service from './../util/service';

/**
 * 添加答案
 * @param {*} ctx 
 * @param {*} next 
 */
async function addAnswer(ctx,next){
    const {answerName} = ctx.request.body;
    const Answer = mongoose.model('answer');
    const answer = await Answer.create({answerName});
    if(!answer){
        ctx.body = service[1].returnBody(1,0,{},'添加失败');
    }else{
        ctx.body = service[1].returnBody(1,0,{},answer)
    }
}
/**
 * 通过题目名称添加答案
 * @param {*} ctx 
 * @param {*} next 
 * @param {subjectName} 题目名称
 * @param {answerName} 答案名称
 * @param {isAnswer} 是否是正确答案
 * 
 */
async function subjectNameAddAnswer(ctx){
    const {subjectName,answerName,isAnswer} = ctx.request.body;
    const Subject = mongoose.model('subject');
    const subject = await Subject.findOne({subjectName});
    if(!subject){

    }else{
        const Answer = mongoose.model('answer');
        const answer = await Answer.create({'subjectId':mongoose.Types.ObjectId(subject._id),answerName,isAnswer})
        if(!answer){

        }else{
            ctx.body = service[1].returnBody(1,0,{},answer);
        }
    }
}

module.exports.register = ({ unauth }) => {
    unauth.post('/auth/addAnswer', addAnswer);
    unauth.post('/auth/subjectNameAddAnswer',subjectNameAddAnswer);
};