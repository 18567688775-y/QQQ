/**
 * 第一次获取token的方法，
 */
import jwt from './jwt';
import bcrypt from 'bcrypt';
import mongoose from 'mongoose';
import _ from 'lodash';
import service from './../util/service';

async function logout(ctx) {
  ctx.body = '登出成功';
};

// async function login(ctx, next) {
//   const {username, password, type} = ctx.request.body;
//   const Customer = mongoose.model('Customer');
//   let ip = ctx.req.headers['x-forwarded-for'] ||
//     ctx.req.connection.remoteAddress ||
//      ctx.req.socket.remoteAddress ||
//      ctx.req.connection.socket.remoteAddress;
//   const customer = await Customer.findOne({ 'username': username });
//   let customerLogs = {
//     type: type, date: new Date(), username: username, ip: ip
//   };
//   if (!customer) {
//     _.merge(customerLogs, {result: '用户名不存在'});
//     await logs.addCustomerLoginLogs(customerLogs);
//     ctx.body = service[1].returnBody(1, 0, {}, '用户名不存在');
//   } else {
//     // 判断密码是否正确
//     await bcrypt.compare(password, customer.password).then(async (res) => {
//       console.log(res)
//       if (!res) {
//         _.merge(customerLogs, {result: '密码错误'});
//         await logs.addCustomerLoginLogs(customerLogs);
//         ctx.body = service[1].returnBody(1, 0, {}, '密码错误');
//       } else {
//         // 清空密码
//         customer.password = undefined;
//         // 生成token
//         const tokenJson = await jwt.getToken(customer);
//         _.merge(customerLogs, {customer: customer._id, result: '登录成功'});
//         await logs.addCustomerLoginLogs(customerLogs);
//         ctx.body = service[1].returnBody(0, 0, tokenJson, 'ok');
//       }
//     });
//   }
// };
/**
 * 添加用户操作
 * @param {*} ctx 
 * @param {*} next 
 */
async function insertUser(ctx,next){
  const{username,password,name,phone,email} = ctx.request.body;
  const Customer = mongoose.model('Customer');
  const customer = await Customer.findOne({'username':username});
  if(!customer){
    const insertCustomer = await Customer.create({'username':username,'password':password,'name':name,'phone':phone,'email':email});
    if(!insertCustomer){
      ctx.body = service[1],returnBody(1,0,{},'添加失败');
    }else{
      ctx.body = service[1].returnBody(1,1,insertCustomer,'添加成功');
    }
  }else{
    ctx.body = service[1].returnBody(1,0,{},'用户已存在，添加失败');
  }
}
/**
 * 测试
 */
async function testinsertInfo(ctx,next){
  const {name,age} = ctx.request.body;
  const Info = mongoose.model('info');
  const info = await Info.create({'name':name,'age':age});
  if(!info){
    ctx.body = service[1].returnBody(1,0,{},'添加失败');
  }else{
    ctx.body = service[1].returnBody(1,1,info,'添加成功');
  }
}
async function testinsertClass(ctx,next){
  const {name,green} = ctx.request.body;
  const Info = mongoose.model('info');
  const info = await Info.findOne({'name':name});
  if(!info){

  }else{
    console.log(info.id)
    const Class = mongoose.model('class');
    const class1 = await Class.create({'green':green,'infoId':info.id})
    if(!class1){
      ctx.body = service[1].returnBody(1,0,{},'添加失败');
    }else{
      ctx.body = service[1].returnBody(1,0,class1,'添加成功');
    }
  }
}
async function testSelect(ctx,next){
  const {name,infoId} = ctx.request.body;
  const Info = mongoose.model('info');
  const info = await Info.findOne({'name':name});
  console.log(info.id)
  if(!info){

  }else{
    const Class = mongoose.model('class');
    const class1 = await Class.findOne({'infoId':info.id})

    if(!class1){
      console.log(class1)
    }else{
      const c = {info, class1}
      ctx.body = service[1].returnBody(1,0,c.info.name,c)
    }
  }
}
module.exports.register = ({unauth}) => {
  unauth.get('/auth/logout', logout);
  // unauth.post('/auth/login', login);
  unauth.post('/auth/insertUser',insertUser);
  unauth.post('/auth/testinsertInfo',testinsertInfo);
  unauth.post('/auth/testinsertClass',testinsertClass);
  unauth.post('/auth/testSelect',testSelect)
};