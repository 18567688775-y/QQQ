import mongoose, { mongo } from 'mongoose';
import service from './../util/service';


/**
 * 添加等级方法
 * @param {*} ctx 
 * @param {*} next 
 */
async function addGrade(ctx) {
    const { gradeName } = ctx.request.body;
    const Grade = mongoose.model('grade');
    const grade = await Grade.create({ gradeName })
    if (!grade) {

    } else {
        ctx.body = service[1].returnBody(1, 0, {}, grade)
    }
}
/**
 * 获取所有等级
 * @param {}} ctx 
 * @param {*} next 
 */
async function findGrade(ctx) {
    const Grade = mongoose.model('grade');
    const grade = await Grade.find({});
    if (!grade) {
        ctx.body = service[1].returnBody(1, 0, {}, '获取等级失败')
        return;
    }
    ctx.body = service[1].returnBody(0, 0, grade, '');
}

/**
 * 通过用户名获取当前等级，查询当前等级的所有题目答案
 * @param {*} ctx 
 */
async function subjectFindGrade(ctx) {
    const { gradeId, startAnswer } = ctx.request.body;
    const { customer } = ctx.req;
    const Grade = mongoose.model('grade');
    const grade = await Grade.findOne({ _id: mongoose.Types.ObjectId(gradeId) });
    console.log(grade)
    if (!grade) {
        ctx.body = service[1].returnBody(1, 1, {}, '没有查到当前等级的题');
        return;
    }
    //判断当前用户输入的等级
    const User = mongoose.model('user');
    const user = await User.findOne({ _id: mongoose.Types.ObjectId(customer._id) }).populate({ path: 'grade' })
    console.log(user, 'user')
    const gradeName = await Grade.findOne({ _id: user.gradeId })
    if (gradeName < grade.gradeName) {
        ctx.body = service[1].returnBody(1, 1, {}, '该用户无法答当前等级题');
        return;
    }

    //获取该用户选择等级的题目
    const Subject = mongoose.model('subject');
    const subject = await Subject.find({ 'gradeId': mongoose.Types.ObjectId(grade._id) });
    const subjectRandom = subject.sort(() => Math.random() - 0.5);      //使数组里的问题顺序打乱
    //循环判断是否答过该题
    for (let sub of subjectRandom) {
        const SubjectLogs = mongoose.model('subjectLogs');
        const subjectLogs = await SubjectLogs.findOne({ subjectId: sub._id })
        if (!subjectLogs) {
            const Answer = mongoose.model('answer');
            const answer = await Answer.find({ subjectId: sub._id }).populate({
                path: 'subjectId',
            });
            //该题查询正确答案，
            const CorrectAnswer = mongoose.model('answer');
            const correctAnswer = await CorrectAnswer.findOne({ subjectId: sub._id, isAnswer: 1 });
            if (!correctAnswer) {
                ctx.body = service[1].returnBody(1, 0, {}, '获取该题正确答案失败')
                return;
            }
            // 合并两个对象返回给前端
            const result = { answer, correctAnswer };
            ctx.body = service[1].returnBody(0, 0, result, '获取所有数据成功');
            break;
        }

    }
    //判断是否开始答题
    if (startAnswer != null) {
        const RecordLogs = mongoose.model('recordLogs');
        const recordLogs = RecordLogs.create({
            userId: mongoose.Types.ObjectId(customer._id),
            startTime: new Date(), currentAnswerLevel: grade.gradeName, errorAnswer: 0, correctAnswer: 0
        });
        if (!recordLogs) {
            ctx.body = service[1].returnBody(1, 0, {}, '记录recordLogs失败')
            return;
        }
    }
}
module.exports.register = ({ router }) => {
    router.post('/addGrade', addGrade);
    router.post('/findGrade', findGrade);
    router.post('/subjectFindGrade', subjectFindGrade);
};