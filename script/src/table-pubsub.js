/*
* @Author: bjliujiajun
* @Date:   2016-05-27 17:05:14
* @Last Modified by:   bjliujiajun
* @Last Modified time: 2016-07-15 14:10:25
* 采用PubSub来完成非父子组件之间的通信
*/

'use strict';
var React = require('react');
var ReactDOM = require('react-dom');
var classNames = require('../lib/classnames.js');
var PubSub = require('../lib/pubsub.min.js');

var CaptchaButton = React.createClass({
   getInitialState(){
      return {
         abled: true,
         sended: false,
         countDown: -1
      }
   },
   handleClick(){
      if(!this.state.abled){
         return;
      }
      if(!/^\d{11}$/.test(this.props.phoneNumber)){
         PubSub.publish('popMessage', { title: '号码格式不正确' });
         return;
      }
      console.log('已向号码'+this.props.phoneNumber+'发送验证码');
      // 设置状态，禁止重复发送验证码，修改样式，设置倒计时事件
      this.setState({
         abled: false,
         sended: true,
         countDown: 5
      });
      // 开始倒计时
      var timeCount = setInterval(function(){
         if(this.state.countDown > 1){
            this.setState({ countDown: this.state.countDown - 1});
         }
         else{
            clearInterval(timeCount);
            this.setState({
               abled: true,
               sended: false,
               countDown: -1
            });
         }
      }.bind(this), 1000);
   },
   render(){
      var captchaClass = classNames({
         'send-Captcha': true,
         'disabled': this.state.sended
      });
      var text = '获取验证码';
      if(this.state.countDown != -1){
         text = '剩余' + this.state.countDown + '秒';
      }
      return (
            <button id="sendCaptcha1" className={captchaClass} type="button" onClick={this.handleClick}>{text}</button>
         );
   }
});
var SubmitButton = React.createClass({
   handleSubmit(){
      console.log('向后台发送程序');
      PubSub.publish('popMessage', { title: '验证码错误' });
   },
   render(){
      if(this.props.isSubmitAble)
         return (
               <button className="form-submitBtn" type="submit" onClick={this.handleSubmit}>验证</button>
            );
      return (
            <button className="form-submitBtn" type="submit" disabled>验证</button>
         )
   }
});
var PopLayer = React.createClass({
   getInitialState(){
      return {
         isShow: false,
         message: ''
      };
   },
   showMessage(event, data){
      if(!this.state.isShow){
         this.setState({
            isShow: true,
            message: data.title
         });
         setTimeout(function(){
            this.setState({
               isShow: false,
               message: ''
            });
         }.bind(this), 1000);
      }
   },
   componentDidMount(){
      PubSub.subscribe('popMessage', this.showMessage);
   },
   componentWillUnmount(){
      PubSub.subscribe('popMessage', this.showMessage);
   },
   render(){
      // 不显示，返回空
      if(!this.state.isShow){
         return <div className="popLayer vertical-middle hidden"></div>;
      }
      return (
            <div className="popLayer vertical-middle">{this.state.message}</div>
         )
   }
});
var BindForm = React.createClass({
   getInitialState(){
      return {
         number: '',
         captcha: '',
         popLayershow: false
      };
   },
   handlePhoneInput(event){
      this.setState({
         number: event.target.value
      });
   },
   handleCapthcaInput(event){
      this.setState({
         captcha: event.target.value
      });
   },
   handleSubmit(event){
      event.preventDefault();
   },
   render(){
      var number = this.state.number;
      var captcha = this.state.captcha;
      var isSubmitAble = /^\d{11}$/.test(this.state.number) && this.state.captcha;
      return (
         <form id="phoneEdit" name="phoneEdit" className="form" onSubmit={this.handleSubmit}>
           <div className="input-container">
               <input type="tel" name="tel1" className="form-tel" placeholder="手机号" autocomplete="off" onChange={this.handlePhoneInput}/>
            </div>
            <div className="input-container">
               <input type="text" name="Captcha1" className="form-captcha" placeholder="验证码" onChange={this.handleCapthcaInput}/>
               <CaptchaButton phoneNumber={number}/>
            </div>
            <SubmitButton isSubmitAble={isSubmitAble}/>
            <PopLayer />
         </form>
         );
   }
});
ReactDOM.render( <BindForm />, document.getElementById('table'));