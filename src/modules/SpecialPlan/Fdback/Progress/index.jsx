import React, { Component } from 'react'
import { Modal, Form, Row, Col, Input, Button, Icon, Select, DatePicker, Slider, InputNumber, Switch } from 'antd';

import moment from 'moment'
import style from './style.less'
import axios from "../../../../api/axios"
import { getProcessfeedbacktaskInfo, getfeedbacktaskInfo, addplanfeedback, getvariable, caculateWorkHour } from '../../../../api/api';
import { connect } from 'react-redux'
import * as dataUtil from '../../../../utils/dataUtil';
import LabelFormLayout from "../../../../components/public/Layout/Labels/Form/LabelFormLayout"
import LabelFormButton from "../../../../components/public/Layout/Labels/Form/LabelFormButton"

const { TextArea } = Input;

export class PlanFdbackProgress extends Component {
  constructor(props) {
    super(props)
    this.state = {
      modalInfo: {
        title: '本期进展'
      },
      initDone: false,
      info: {},
      inputValue: 1,
      projSet: { dateFormat: 'YYYY-MM-DD', drtnUnit: 'h', timeUnit: 'h', precision: 2, moneyUnit: '¥', complete: '%' },
      _workTime: {},
      runnDone: true, //计算完成
    }
  }

  //开始计算
  startCaculate = () => {
    this.setState({ runnDone: false })
  }

  //计划日期工期计算(开始(修改)+工期=完成，完成(修改)-开始=工期，工期(修改)+开始=完成）
  caculateStartOrEndOrDrtn = (isStart, name, value) => {
    if (this.state._workTime.calendar) {
      let param = {
        calendarId: this.state._workTime.calendar.id,
        startTime: isStart ? value : null,
        endTime: isStart ? null : value,
        opeType: isStart ? "StartTime" : "EndTime"
      }
      if (param.calendarId && (param.startTime || param.endTime)) {
        axios.post(caculateWorkHour, param).then(res => {
          const workTime = { ...this.state._workTime, [name]: res.data.data[isStart ? "startTime" : "endTime"] };
          this.props.form.setFieldsValue({ [name]: dataUtil.Dates().formatTimeMonent(workTime[name]) });
          this.setState({ _workTime: workTime, runnDone: true })
        })
      }
    }
  }

  //增加开始时间
  caculateByStartTime = (status) => {
    if (status) {
      return; //只有关闭时才调用
    }
    const dateStart = dataUtil.Dates().formatTimeString(this.props.form.getFieldValue("actStartTime"));
    if (dateStart && this.state._workTime.actStartTime != dateStart) {
      this.caculateStartOrEndOrDrtn(true, "actStartTime", dateStart);
    }
  }

  //增加完成时间
  caculateByEndTime = () => {
    if (status) {
      return; //只有关闭时才调用
    }
    const dateEnd = dataUtil.Dates().formatTimeString(this.props.form.getFieldValue("actEndTime"));
    if (dateEnd && this.state._workTime.actEndTime != dateEnd) {
      this.caculateStartOrEndOrDrtn(false, "actEndTime", dateEnd);
    }
  }

  //增加截止时间
  caculateByDeadLineTime = () => {
    if (status) {
      return; //只有关闭时才调用
    }
    const dateEnd = dataUtil.Dates().formatTimeString(this.props.form.getFieldValue("deadline"));
    if (dateEnd && this.state._workTime.deadline != dateEnd) {
      this.caculateStartOrEndOrDrtn(false, "deadline", dateEnd);
    }
  }

  //增加估计时间
  caculateByEstTime = () => {
    if (status) {
      return; //只有关闭时才调用
    }
    const dateEnd = dataUtil.Dates().formatTimeString(this.props.form.getFieldValue("estimatedTime"));
    if (dateEnd && this.state._workTime.estimatedTime != dateEnd) {
      this.caculateStartOrEndOrDrtn(false, "estimatedTime", dateEnd);
    }
  }

  componentDidMount() {
    axios.get(getvariable(this.props.data.projectId)).then(res => {
      const data = res.data.data || {};
      this.setState({
        projSet: {
          dateFormat: (data.dateFormat || {}).id || "YYYY-MM-DD",
          drtnUnit: (data.drtnUnit || {}).id || "h",
          timeUnit: (data.timeUnit || {}).id || "h",
          precision: data.precision || 2,
          moneyUnit: (data.currency || {}).symbol || "¥",
        }
      })
      if (/*this.props.processFlag && */this.props.data.feedbackId) {
        axios.get(getProcessfeedbacktaskInfo(this.props.data.id)).then(res => {
          if (res.data.data) {
            this.setState({ _workTime: { calendar: this.props.data.calendar } })
            if (!res.data.data.actStartTime) {
              res.data.data.actStartTime = res.data.data.planStartTime
            }
            if (!res.data.data.deadline) {
              res.data.data.deadline = this.caculateStartOrEndOrDrtn(false, "deadline", new Date().format('yyyy-MM-dd hh:mm:ss'));
            }
            if (!res.data.data.reportingTime) {
              res.data.data.reportingTime = new Date();
            }
            this.setState({
              _workTime: { ...res.data.data, calendar: this.props.data.calendar },
              info: { ...res.data.data }
            }, () => {
              const { info } = this.state
              this.setState({
                inputValue: info.completePct
              })
            })
          }
        })
      } else {
        axios.get(getfeedbacktaskInfo(this.props.data.id)).then(res => {
          if (res.data.data) {
            this.setState({ _workTime: { calendar: this.props.data.calendar } })
            if (!res.data.data.actStartTime) {
              res.data.data.actStartTime = res.data.data.planStartTime
            }
            if (!res.data.data.deadline) {
              //res.data.data.deadline = this.caculateStartOrEndOrDrtn(false, "deadline", new Date().format('yyyy-MM-dd') + " 00:00:00")
              res.data.data.deadline = new Date()
            }
            if (!res.data.data.reportingTime) {
              res.data.data.reportingTime = new Date()
            }
            this.setState({
              _workTime: { ...res.data.data, calendar: this.props.data.calendar },
              info: { ...res.data.data }
            }, () => {
              const { info } = this.state
              this.setState({
                inputValue: info.completePct
              })
            })
          }
        })
      }
    })
  }

  handleSubmit = (e) => {
    const that = this
    if (this.state.runnDone) {
      e.preventDefault()
      this.props.form.validateFieldsAndScroll((err, values) => {
        if (!err) {
          let obj = {
            ...this.state.info,
            ...values,
            planStartTime: dataUtil.Dates().formatTimeString(values.planStartTime),
            planEndTime: dataUtil.Dates().formatTimeString(values.planEndTime),
            actStartTime: dataUtil.Dates().formatTimeString(values.actStartTime),
            actEndTime: dataUtil.Dates().formatTimeString(values.actEndTime),
            reportingTime: dataUtil.Dates().formatTimeString(values.reportingTime),
            deadline: dataUtil.Dates().formatTimeString(values.deadline),
            estimatedTime: dataUtil.Dates().formatTimeString(values.estimatedTime),
            taskId: this.props.data.id,
            completePct: this.state.inputValue
          }
       
          let url = dataUtil.spliceUrlParams(addplanfeedback,{"startContent": "项目【"+ this.props.projectName +"】"});
          axios.post(url, obj, true).then(res => {
           
            this.props.updateSuccess(res.data.data)
          })
        }
      })
    } else {
      setTimeout(function () {
        that.handleSubmit(e)
      }, 100)
    }
  }

  onChange = (value) => {
    this.setState({
      inputValue: value,
    },()=>{
      if(this.state.inputValue!=100){
        this.props.form.setFieldsValue({actEndTime:null})
      }
      
    });
  }
  
  onControl=(type,current)=>{
  
  
    //实际开始时间选择限制
    if(type=="start"){
      let end=this.props.form.getFieldValue("actEndTime")
      if(end){
        return current > end
      }
      return false
    }else if(type=="end"){
      //实际结束时间选择限制
      let start=this.props.form.getFieldValue("actStartTime")
      if(start){
        return current < start
      }
      return false
    }
    return false
  }
  render() {
    const { intl } = this.props.currentLocale
    const { getFieldDecorator, getFieldsError, getFieldError, isFieldTouched } = this.props.form
    const formItemLayout = {
      labelCol: {
        xs: { span: 24 },
        sm: { span: 8 },
      },
      wrapperCol: {
        xs: { span: 24 },
        sm: { span: 16 },
      },
    };
    const formItemLayout2 = {
      labelCol: {
        xs: { span: 24 },
        sm: { span: 4 },
      },
      wrapperCol: {
        xs: { span: 24 },
        sm: { span: 20 },
      },
    };
    return (

      <LabelFormLayout title = {this.props.title} >
        <Form onSubmit={this.handleSubmit}>
          <Row type="flex">
            <Col span={12}>
              <Form.Item label="计划开始时间" {...formItemLayout}>
                {getFieldDecorator('planStartTime', {
                  initialValue: dataUtil.Dates().formatTimeMonent(this.state.info.planStartTime),
                  rules: [],
                })(
                  <DatePicker style={{ width: '100%' }} format={this.state.projSet.dateFormat} disabled />
                )}
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="计划完成时间" {...formItemLayout}>
                {getFieldDecorator('planEndTime', {
                  initialValue: dataUtil.Dates().formatTimeMonent(this.state.info.planEndTime),
                  rules: [],
                })(
                  <DatePicker style={{ width: '100%' }} format={this.state.projSet.dateFormat} disabled />
                )}
              </Form.Item>
            </Col>
            {/* 完成里程碑不显示 */}
            {((this.props.data.type == "task" && (this.props.data.taskType != 3)) || this.props.data.type == "wbs") &&
            <Col span={12}>
              <Form.Item label="实际开始时间" {...formItemLayout}>
                {getFieldDecorator('actStartTime', {
                  initialValue: dataUtil.Dates().formatTimeMonent(this.state.info.actStartTime),
                  rules: [{
                    required: true,
                    message: intl.get('wsd.i18n.message.select') + "实际开始时间"
                  }],
                })(
                  <DatePicker style={{ width: '100%' }} format={this.state.projSet.dateFormat}  disabledDate={this.onControl.bind(this,"start")}
                              showTime={{ format: 'HH:mm', defaultValue: moment('00:00:00', 'HH:mm:ss') }}
                              onChange={this.startCaculate}
                              onOpenChange={this.caculateByStartTime} />
                )}
              </Form.Item>
            </Col>}
            {/* 开始里程碑不显示 */}
            {((this.props.data.type == "task" && (this.props.data.taskType != 2)) || this.props.data.type == "wbs") &&
            <Col span={12}>
              <Form.Item label="实际完成时间" {...formItemLayout}>
                {getFieldDecorator('actEndTime', {
                  initialValue: dataUtil.Dates().formatTimeMonent(this.state.info.actEndTime),
                  rules: [{
                    required: this.state.inputValue >= 100 ? true : false,
                    message: intl.get('wsd.i18n.message.select') + "实际完成时间",
                  }],
                })(
                  <DatePicker style={{ width: '100%' }} format={this.state.projSet.dateFormat} disabledDate={this.onControl.bind(this,"end")}
                              showTime={{ format: 'HH:mm', defaultValue: moment('00:00:00', 'HH:mm:ss') }}
                              onChange={(value) => {
                               
                                this.startCaculate()
                                value ? this.setState({ inputValue: 100 }) : this.setState({ inputValue: this.state.info.completePct || 0 },()=>{
                                  this.props.form.setFields({actEndTime:{value:null,errors:null}})
                                })
                              }}
                              onOpenChange={this.caculateByEndTime} />
                )}
              </Form.Item>
            </Col>
            }
            {/* <Col span={12}>
              <Form.Item label="报告日期" {...formItemLayout}>
                {getFieldDecorator('reportingTime', {
                  initialValue: dataUtil.Dates().formatTimeMonent(this.state.info.reportingTime),
                  rules: [],
                })(
                  <DatePicker style={{ width: '100%' }} format={this.state.projSet.dateFormat}
                              showTime={{ format: 'HH:mm' }} />
                )}
              </Form.Item>
            </Col> */}
            <Col span={12}>
              <Form.Item label="填报日期" {...formItemLayout}>
                {getFieldDecorator('deadline', {
                  initialValue: dataUtil.Dates().formatTimeMonent(this.state.info.deadline),
                  rules: [{
                    required: true,
                    message: intl.get('wsd.i18n.message.select') + "填报日期",
                  }],
                })(
                  <DatePicker style={{ width: '100%' }} format={this.state.projSet.dateFormat}
                              showTime={{ format: 'HH:mm', defaultValue: moment('00:00:00', 'HH:mm:ss') }}
                              onChange={this.startCaculate}
                              onOpenChange={this.caculateByDeadLineTime} />
                )}
              </Form.Item>
            </Col>
            {/* 里程牌只有0或100% */}
            <Col span={12}>
              <Form.Item label="申请完成%" {...formItemLayout}>
                {getFieldDecorator('completePct', {
                  initialValue: this.state.inputValue,
                  rules: [{
                    required: true,
                    message: intl.get('wsd.i18n.message.enter') + "申请完成%",
                  }],
                })(
                  <Row>
                    <Col span={16}>
                      <Slider
                        min={0}
                        max={100}
                        onChange={this.onChange}
                        value={typeof this.state.inputValue === 'number' ? this.state.inputValue : 0}
                        marks={(this.props.data.type == "task" && (this.props.data.taskType != 1 && this.props.data.taskType != 4)) ? { 0: "", 100: '' } : { 0: "", 100: '' }}
                        step={(this.props.data.type == "task" && (this.props.data.taskType != 1 && this.props.data.taskType != 4)) ? null : 1}
                      />
                    </Col>
                    <Col span={7} offset={1}>
                      <InputNumber
                        disabled={this.props.data.type == "task" && (this.props.data.taskType == 2 || this.props.data.taskType ==3)}
                        min={0}
                        max={100}
                        style={{ width: '100%' }}
                        value={this.state.inputValue}
                        formatter={value => `${value}%`}
                        parser={value => value.replace('%', '')}
                        onChange={this.onChange}
                      />
                    </Col>
                  </Row>
                )}
              </Form.Item>
            </Col>
            {/* <Col span={12}>
              <Form.Item label="估计完成" {...formItemLayout}>
                {getFieldDecorator('estimatedTime', {
                  initialValue: dataUtil.Dates().formatTimeMonent(this.state.info.estimatedTime),
                  rules: [],
                })(
                  <DatePicker style={{ width: '100%' }} format={this.state.projSet.dateFormat}
                              showTime={{ format: 'HH:mm', defaultValue: moment('00:00:00', 'HH:mm:ss') }}
                              onChange={this.startCaculate}
                              onOpenChange={this.caculateByEstTime} />
                )}
              </Form.Item>
            </Col> */}
            <Col span={24}>
              <Form.Item label="进展说明" {...formItemLayout2}>
                {getFieldDecorator('remark', {
                  initialValue: this.state.info.remark,
                  rules: [{
                    required: true,
                    message: intl.get('wsd.i18n.message.enter') + "进展说明"
                  }],
                })(
                  <TextArea span={2} />
                )}
              </Form.Item>
            </Col>
          </Row>
        </Form>
        <LabelFormButton>
          <Button onClick={this.props.closeRightBox} style={{ width: "100px", marginRight: "20px" }}>取消</Button>
          <Button onClick={this.handleSubmit} style={{ width: "100px" }} type="primary" disabled={!this.props.editAuth}>保存</Button>
        </LabelFormButton>
      </LabelFormLayout>
    )
  }
}

const PlanFdbackProgresss = Form.create()(PlanFdbackProgress);
const mapStateToProps = state => {
  return {
    currentLocale: state.localeProviderData,
  }
}

export default connect(mapStateToProps, null)(PlanFdbackProgresss);
