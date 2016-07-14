/*
* @Author: bjliujiajun
* @Date:   2016-05-24 16:21:46
* @Last Modified by:   bjliujiajun
* @Last Modified time: 2016-07-12 19:02:26
*/

'use strict';
var React = require('react');
var ReactDOM = require('react-dom');
var classNames = require('../lib/classnames.js');

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
         this.props.showPopLayer('电话号码格式不正确');
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
      this.props.showPopLayer('验证码错误');
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
   render(){
      // 不显示，返回空
      if(!this.props.isShow){
         return <div className="popLayer vertical-middle hidden"></div>;
      }
      return (
            <div className="popLayer vertical-middle">{this.props.getPopLayerOption().title}</div>
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
   setPopLayerOption(){
      if(arguments.length === 1){
         this.setState({
            popTitle: arguments[0],
         });
      }
      else{
         throw new Error('popLayer 参数错误');
      }
   },
   getPopLayerOption(){
      return {
         title: this.state.popTitle
      }
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
   showPopLayer(title){
      this.setState({popLayershow: true});
      this.setPopLayerOption(Array.from(arguments));
      setTimeout(function(){
         this.setState({popLayershow: false});
      }.bind(this), 1000);
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
               <CaptchaButton phoneNumber={number} showPopLayer={this.showPopLayer}/>
            </div>
            <SubmitButton isSubmitAble={isSubmitAble} showPopLayer={this.showPopLayer}/>
            <PopLayer isShow={this.state.popLayershow} getPopLayerOption={this.getPopLayerOption}/>
         </form>
         );
   }
})
ReactDOM.render( <BindForm />, document.getElementById('table'));