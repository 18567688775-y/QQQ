import mongoose from 'mongoose';
import service from './../util/service';
import jwt from './jwt'
/**
 * 添加用户
 * @param {*} ctx 
 * @param {*} next 
 */
async function addUser(ctx) {
    const { userName, password, gradeId, answerSum, answerDate } = ctx.request.body;

    const User = mongoose.model('user');
    const user = await User.create({ userName, password, answerSum, answerDate, gradeId: mongoose.Types.ObjectId(gradeId) });
    if (!user) {

    } else {
        ctx.body = service[1].returnBody(0, 0, user, '');
    }
}
//登陆
async function Login(ctx) {
    const { userName, password } = ctx.request.body;
    const User = mongoose.model('user');
    const user = await User.findOne({ userName });
    if (!user) {
        ctx.body = service[0].returnBody(1,0,{},'没有该用户')
        return;
    }
    if (password == user.password) {
        const token = await jwt.getToken(user);
        ctx.body = service[1].returnBody(0, 0, token, '登陆成功')
    }
}


module.exports.register = ({ unauth }) => {
    unauth.post('/auth/addUser', addUser);
    unauth.post('/auth/Login', Login);
};