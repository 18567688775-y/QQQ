import mongoose from 'mongoose';
import service from './../util/service';
import moment from 'moment';


/**
 * 通过等级名称添加题目
 * @param {*} ctx 
 * @param {*} next 
 */
async function addSubjectName(ctx) {
    const { gradeName, subjectName } = ctx.request.body;
    const Grade = mongoose.model('grade');
    const grade = await Grade.findOne({ gradeName })
    console.log(grade)
    if (!grade) {
        ctx.body = service[1].returnBody(1, 1, {}, '未找到该等级')
    } else {
        const Subject = mongoose.model('subject');
        const subject = await Subject.create({ subjectName, 'gradeId': mongoose.Types.ObjectId(grade._id) })
        if (!subject) {
            ctx.body = service[1].returnBody(1, 0, {}, '添加失败')
        } else {
            const subjectAndGrade = { subject, grade }
            ctx.body = service[1].returnBody(0, 0, subjectAndGrade, '')
        }
    }
}


//获取前台用户名，题目，选择答案，是否正确来添加记录表
async function subjectNameAndAnswer(ctx) {
    const { subjectId, choiceAnswer, correct } = ctx.request.body;
    const { customer } = ctx.req;
    //查询当前题目
    const Subject = mongoose.model('subject');
    const subject = await Subject.findOne({ _id: mongoose.Types.ObjectId(subjectId) });
    if (!subject) {
        ctx.body = service[1].returnBody(1, 0, subject, '获取题目失败');
        return;
    }
    //查询记录表里有没有该用户的记录
    const RecordLogs = mongoose.model('recordLogs');
    const recordLogs = await RecordLogs.find({ userId: mongoose.Types.ObjectId(customer._id) }).sort({ startTime: -1 });
    if (!recordLogs) {
        ctx.body = service[1].returnBody(1, 0, recordLogs, '获取该用户记录失败');
        return;
    }
    //添加答题记录表
    const SubjectLogs = mongoose.model('subjectLogs');
    const subjectLogs = await SubjectLogs.create({
        userId: mongoose.Types.ObjectId(customer._id), subjectId: mongoose.Types.ObjectId(subject._id),
        choiceAnswer, correct, recordLogsId: mongoose.Types.ObjectId(recordLogs[0]._id)
    });
    if (!subjectLogs) {
        ctx.body = service[1].returnBody(1, 0, subjectLogs, '添加答题记录失败');
        return;
    }
    if (correct == 0) {
        await RecordLogs.updateOne({ _id: recordLogs[0]._id }, { correctAnswer: recordLogs[0].correctAnswer + 1 });
        console.log(recordLogs[0].correctAnswer, 'recordLogs.correctAnswer')
    } else {
        await RecordLogs.updateOne({ _id: recordLogs[0]._id }, { errorAnswer: recordLogs[0].errorAnswer + 1 });
    }
    let count = recordLogs[0].correctAnswer + recordLogs[0].errorAnswer;
    console.log(count, 'count')
    if (count == 24 && recordLogs[0].correctAnswer + 1 == 25) {
        //获取当前等级昵称
        const Grade = mongoose.model('grade');
        const grade = await Grade.findOne({ _id: customer.gradeId });
        let gradeName = grade.gradeName + 1;
        if (gradeName > 4) {
            gradeName = 4;
        }
        //获取升级以后的id
        const grade1 = await Grade.findOne({ gradeName });
        console.log(grade1._id)
        const RecordLogs = mongoose.model('recordLogs');
        const recordLogs = await RecordLogs.find({ userId: mongoose.Types.ObjectId(customer._id) }).sort({ startTime: -1 });
        const recordLogs1 = await RecordLogs.updateOne({ _id: recordLogs[0]._id }, { endTime: new Date(), currentAnswerLevel: grade.gradeName })
        if (!recordLogs1) {
            ctx.body = service[1].returnBody(1, 0, recordLogs1, '获取升级以后ID失败');
            return;
        }

        //计算时间差
        let endTime = moment(new Date());
        let secondTime = endTime.diff(moment(recordLogs[0].startTime), 'seconds');   //以秒为单位
        let second = parseInt(customer.answerDate) + secondTime;
        //更新用户表
        const User = mongoose.model('user');
        const user = await User.updateOne({ _id: customer._id }, { gradeId: grade1._id, answerSum: customer.answerSum + 1, answerDate: second })
        if (!user) {
            ctx.body = service[1].returnBody(1, 0, user, '修改user失败');
            return;
        }
    } else if (count == 24) {
        //获取当前等级昵称
        const Grade = mongoose.model('grade');
        const grade = await Grade.findOne({ _id: customer.gradeId });
        //更新recordLogs记录表
        const RecordLogs = mongoose.model('recordLogs');
        const recordLogs = await RecordLogs.find({ userId: mongoose.Types.ObjectId(customer._id) }).sort({ startTime: -1 });
        const recordLogs1 = await RecordLogs.updateOne({ _id: recordLogs[0]._id }, { endTime: new Date(), currentAnswerLevel: grade.gradeName })
        if (!recordLogs1) {
            ctx.body = service[1].returnBody(1, 0, recordLogs1, '更新recordLogs记录失败');
            return;
        }
        //计算时间差
        let endTime = moment(new Date());
        let secondTime = endTime.diff(moment(recordLogs[0].startTime), 'seconds');   //以秒为单位
        let second = parseInt(customer.answerDate) + secondTime;
        //更新用户表
        const User = mongoose.model('user');
        const user = await User.updateOne({ _id: customer._id }, { answerSum: customer.answerSum + 1, answerDate: second })
        if (!user) {
            ctx.body = service[1].returnBody(1, 0, recordLogs1, '修改user失败');
            return;
        }
    }
    ctx.body = service[1].returnBody(0, 0, subjectLogs, '')

}


/**
 * 排行榜
 * @param {*} ctx 
 */
async function ranking(ctx) {
    const User = mongoose.model('user');
    const user = await User.find({}).populate({ path: 'grade' }).sort({ gradeId: -1, answerSum: 1 });
    if (!user) {
        ctx.body = service[1].returnBody(1, 0, {}, '获取用户失败')
    }
    //循环得出每个人的答题时间
    let result = [];
    for (let u of user) {
        let secondTime = u.answerDate;
        let minuteTime = 0;       //分    
        let hourTime = 0;         //小时
        if (secondTime > 60) {    //如果秒数大于60，将秒数转换成整数
            //获取分钟，除以60取整数，得到整数分钟
            minuteTime = parseInt(secondTime / 60);
            //获取秒数，秒数取余，得到整数秒数
            secondTime = parseInt(secondTime % 60);
            //如果分钟大于60，将分钟转换成小时
            if (minuteTime > 60) {
                //获取小时，获取分钟除以60，得到整数小时
                hourTime = parseInt(minuteTime / 60);
                //获取小时后取余的分，获取分钟除以60取余的分
                minuteTime = parseInt(minuteTime % 60);
            }
        }
        result.push({ hourTime, minuteTime, secondTime, u });
    }
    ctx.body = service[1].returnBody(0, 0, result, '')

}



module.exports.register = ({ router }) => {
    router.post('/auth/addSubjectName', addSubjectName);
    router.post('/auth/subjectNameAndAnswer', subjectNameAndAnswer);
    router.post('/auth/ranking', ranking)
};