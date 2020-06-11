import React, { Component } from 'react'
import { Modal, Form, Row, Col, Input, Button, Icon, Select, DatePicker, Slider, InputNumber, Switch } from 'antd';

import moment from 'moment'
import style from './style.less'
import axios from "../../../../api/axios"
import {
  getProcessfeedbacktaskInfo,
  getfeedbacktaskInfo,
  getvariable,
  caculateWorkHour,
} from '../../../../api/api';
import { queryPlanTaskStepList_, getPlanTaskId_ } from '../../../../api/suzhou-api'
import { connect } from 'react-redux'
import * as dataUtil from '../../../../utils/dataUtil';
import LabelFormLayout from "../../../../components/public/Layout/Labels/Form/LabelFormLayout"
import LabelFormButton from "../../../../components/public/Layout/Labels/Form/LabelFormButton"
import PublicTable from "../../../../components/PublicTable";

const getStationFeedbacks = (taskId, feedbackId) => `api/szxm/station/detail/feedback/${taskId}/${feedbackId}/list`
const saveFeedback = `api/szxm/station/detail/feedback/add`

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
      inputValue: 0,
      projSet: { dateFormat: 'YYYY-MM-DD', drtnUnit: 'h', timeUnit: 'h', precision: 2, moneyUnit: '¥', complete: '%' },
      _workTime: {},
      runnDone: true, //计算完成
    }
  }
  //注册 父组件即可调用子组件方法
  onRef = (ref) => {
    this.table = ref
  }

  onRef2 = (ref) => {
    this.table2 = ref
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
            let { custom01, custom02, taskCustom04, taskCustom05 } = res.data.data;
            custom01 = custom01 ? custom01["value"] : 0;
            custom02 = custom02 ? custom02["value"] : 0;
            taskCustom04 = taskCustom04 ? Number(taskCustom04) : 0;
            taskCustom05 = taskCustom05 ? Number(taskCustom05) : 0;
            this.setState({
              _workTime: { ...res.data.data, calendar: this.props.data.calendar },
              info: { ...res.data.data, custom01, custom02, taskCustom04, taskCustom05 }
            }, () => {
              const { info } = this.state;
              let custom01 = info.custom01 ? info.custom01["value"] : 0;
              let taskCustom03 = info.taskCustom03 ? info.taskCustom03 : 1;
              let taskCustom05 = info.taskCustom05 ? info.taskCustom05 : 0;
              let inputValue = (info.completePct ? info.completePct : (Number(custom01)+Number(taskCustom05))/Number(taskCustom03))

              this.setState({
                inputValue: inputValue
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

            let { custom01, custom02, taskCustom04, taskCustom05 } = res.data.data;
            custom01 = custom01 ? custom01["value"] : 0;
            custom02 = custom02 ? custom02["value"] : 0;
            taskCustom04 = taskCustom04 ? Number(taskCustom04) : 0;
            taskCustom05 = taskCustom05 ? Number(taskCustom05) : 0;
            this.setState({
              _workTime: { ...res.data.data, calendar: this.props.data.calendar },
              info: { ...res.data.data, custom01, custom02, taskCustom04, taskCustom05 }
            }, () => {
              const { info } = this.state;
              let custom01 = info.custom01 ? info.custom01["value"] : 0;
              let taskCustom03 = info.taskCustom03 ? info.taskCustom03 : 1;
              let taskCustom05 = info.taskCustom05 ? info.taskCustom05 : 0;
              let inputValue = (info.completePct ? info.completePct : (Number(custom01)+Number(taskCustom05))/Number(taskCustom03))
              this.setState({
                inputValue: inputValue
              })
            })
          }
        })
      }
    })
    // this.getPlanTaskStepList()
  }

  handleSubmit = (e) => {
    const that = this
    if (this.state.runnDone) {
      e.preventDefault()
      this.props.form.validateFieldsAndScroll((err, values) => {
        if (!err) {
          let stationDetails = this.table ? this.table.findDataList() : null;
          let stepDetails = this.table2 ? this.table2.findDataList() : null;
          let { custom01, custom02 } = values;
          let custom = { custom01, custom02 };
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
            completePct: this.state.inputValue,
            stationDetails: stationDetails,
            stepDetails: stepDetails,
            custom: custom
          }

          let url = dataUtil.spliceUrlParams(saveFeedback, { "startContent": "项目【" + this.props.projectName + "】" });
          axios.post(url, obj, true).then(res => {
            let rightData = this.props.data;
            rightData["applyPct"] = this.state.inputValue;
            rightData["feedbackId"] = res.data.data.feedbackId;
            this.props.updateSuccess(rightData);
            //this.props.updateSuccess(res.data.data)
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
    let minPct = this.props.data.approvePct ? this.props.data.approvePct : 0;
    if (value >= minPct) {
      this.setState({
        inputValue: value,
      }, () => {
        if (this.state.inputValue != 100) {
          this.props.form.setFieldsValue({ actEndTime: null })
        }

      });
    }
  }


  onControl2 = (record, dataIndex, current) => {
    //实际开始时间选择限制
    if (dataIndex == "actStartTime") {
      let end = record.actEndTime ? moment(record.actEndTime) : null
      if (end) {
        return current > end
      }
      return false
    } else if (dataIndex == "actEndTime") {
      //实际结束时间选择限制
      let start = record.actStartTime ? moment(record.actStartTime) : null
      if (start) {
        return current < start
      }
      return false
    }
    return false
  }

  onControl = (type, current) => {


    //实际开始时间选择限制
    if (type == "start") {
      let end = this.props.form.getFieldValue("actEndTime")
      if (end) {
        return current > end
      }
      return false
    } else if (type == "end") {
      //实际结束时间选择限制
      let start = this.props.form.getFieldValue("actStartTime")
      if (start) {
        return current < start
      }
      return false
    }
    return false
  }

  /**
   * 获取复选框 选中项、选中行数据
   * @method updateSuccess
   * @param {string} selectedRowKeys 复选框选中项
   * @param {string} selectedRows  行数据
   */
  getSelectedRowKeys = (selectedRowKeys, selectedRows) => {
    this.setState({
      selectedRows,
      selectedRowKeys
    })
  }

  /**
   * 获取站点信息数据
   *
   */
  getStationList = (callback) => {
    let { feedbackId, id } = this.props.data;
    let searchData = {
      type : 'progress'
    };
    let getStationUrl = getStationFeedbacks(id, feedbackId || 0);
    let url = dataUtil.spliceUrlParams(getStationUrl, searchData || {});
    axios.get(url).then(res => {
      callback(res.data.data);
    })
  }

  /**
   * 获取工序列表
   */
  getPlanTaskStepList = (callback) => {
    axios.get(getPlanTaskId_(this.props.data.custom08)).then(res => {
      let relationTaskId = res.data.data
      axios.get(queryPlanTaskStepList_(relationTaskId, this.props.data.id, "feedBack")).then(res => {
        callback(res.data.data ? res.data.data : [])
        this.setState({
          stepData: res.data.data,
          relationTaskId: relationTaskId
        })
      })
    })
  }

  handleSave = (record, type, value) => {
    this.setState({ record }, () => {
      this.table.updateData(record);
      let datas = this.table.findDataList() || [];
      let acmSum = 0;
      let planSum = 0;
      for (let i = 0, len = datas.length; i < len; i++) {
        let item = datas[i];
        let { actWeekComplete, planNextweekComplete } = item;
        actWeekComplete = actWeekComplete || 0;
        planNextweekComplete = planNextweekComplete || 0;
        acmSum += actWeekComplete;
        planSum += planNextweekComplete;
      }

      this.props.form.setFieldsValue({ custom01: acmSum, custom02: planSum });
      this.custom01Change(acmSum);
    })
  }

  handleSave2 = (record, type, value) => {
    this.setState({ record }, () => {
      let { actComplete,totalDesign} = record;
      record["completePct"] = totalDesign == 0 || actComplete == 0 || totalDesign == undefined || actComplete == undefined ? '0%' : ((actComplete / totalDesign).toFixed(4)) * 100 + '%';
      if (typeof record["actStartTime"] != 'string' && record["actStartTime"] != null) {
        record["actStartTime"] = record["actStartTime"].format("YYYY-MM-DD HH:mm:ss")
      }
      if (typeof record["actEndTime"] != 'string' && record["actEndTime"] != null) {
        record["actEndTime"] = record["actEndTime"].format("YYYY-MM-DD  HH:mm:ss")
      }
      this.table2.updateData(record);
    })
  }


  custom01Change = (value) => {

    /*let { custom01, taskCustom04, taskCustom05 } = this.state.info || {};
    taskCustom04 = taskCustom04 ? Number(taskCustom04) : 0;
    taskCustom05 = taskCustom05 ? Number(taskCustom05) : 0;
    custom01 = custom01 ? Number(custom01) : 0;

    let sum = value + taskCustom05;
    let completePct = 0;
    if (sum >= taskCustom04 && taskCustom04 != 0) {
      completePct = 100;
    } else if (sum < taskCustom04 && taskCustom04 != 0) {
      completePct = sum / taskCustom04;
    }

    this.props.form.setFieldsValue({ completePct: completePct });
    this.setState({ inputValue: completePct });*/
    let taskCustom05 = this.state.info.taskCustom05;
    let taskCustom03 = this.state.info.taskCustom03;
    taskCustom05 = taskCustom05 ? taskCustom05 : 0;
    taskCustom03 = taskCustom03 ? taskCustom03 : 1;
    this.setState({
      inputValue: ((Number(value)+Number(taskCustom05))/Number(taskCustom03))*100
    })
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
    const columns = [
      {
        title: "站点或区间名称", //计划名称
        dataIndex: "station",
        key: "station",
        width: "15%",
        render: (text, record) => {
          return (text ? text.name : null)
        }
      },
      {
        title: "设计总量", //设计总量
        dataIndex: "designTotal",
        key: "designTotal",
        width: "13%"
      },
      {
        title: "计划完成量", //计划完成量
        dataIndex: "planComplete",
        key: "planComplete",
        width: "13%"
      },
      {
        title: "实际完成量", //实际完成量
        dataIndex: "actCompleteTotal",
        key: "actCompleteTotal",
        width: "14%"
      },
      {
        title: "本周计划量",
        dataIndex: "planThisweekComplete",
        key: "planThisweekComplete",
        width: "14%",
        edit: { editable: this.props.editAuth, formType: 'InputNumber', handleSave: this.handleSave }
      },
      {
        title: "本周完成量",
        dataIndex: "actWeekComplete",
        key: "actWeekComplete",
        width: "14%",
        edit: { editable: this.props.editAuth, formType: 'InputNumber', handleSave: this.handleSave, min: 0, max: 99999999 }
      },
      {
        title: "下周计划量", //下周计划量
        dataIndex: "planNextweekComplete",
        key: "planNextweekComplete",
        width: "14%",
        edit: { editable: this.props.editAuth, formType: 'InputNumber', handleSave: this.handleSave, min: 0, max: 99999999 }
      },
      {
        title: "计量单位", //计量单位
        dataIndex: "unit",
        key: "unit",
        width: "14%",
        render: () => {
          if (this.props.data) {
            let unit = this.props.data.custom07;
            unit = unit && this.props.commUnitMap && this.props.commUnitMap[unit] ? this.props.commUnitMap[unit] : '';
            return unit;
          }
          return "";
        }
      }
    ]

    const columns2 = [
      {
        title: "工序名称", //工序名称
        dataIndex: "name",
        key: "name",
        width: '15%',
        render:(text) =><div title={text}>{text}</div>
      },
      {
        title: "设计总量",
        dataIndex: "totalDesign",
        key: "totalDesign",
        width: '13%'
      },
      {
        title: "计划完成量",
        dataIndex: 'planComplete',
        key: 'planComplete',
        width: '15%',
        edit: { formType: 'InputNumber', editable: this.props.editAuth, handleSave: this.handleSave2, min: 0,max: 99999999 },
        render: (text) => text ? text : 0
      },
      {
        title: "实际完成量",
        dataIndex: 'actComplete',
        key: 'actComplete',
        width: '15%',
        edit: { formType: 'InputNumber', editable: this.props.editAuth, handleSave: this.handleSave2, min: 0,max: 99999999 },
        render: (text) => text ? text : 0
      },
      // {
      //   title: "实际开始时间",
      //   dataIndex: 'actStartTime',
      //   key: 'actStartTime',
      //   width: '15%',
      //   edit: { formType: 'date', editable: this.props.editAuth, handleSave: this.handleSave2, format: "YYYY-MM-DD", disabledDate: this.onControl2 },
      //   render: (text) => dataUtil.Dates().formatDateString(text)
      // },
      {
        title: "实际完成时间",
        dataIndex: 'actEndTime',
        key: 'actEndTime',
        width: '16%',
        edit: { formType: 'date', editable: this.props.editAuth, handleSave: this.handleSave2, format: "YYYY-MM-DD", disabledDate: this.onControl2 },
        render: (text) => text ? dataUtil.Dates().formatDateString(text):dataUtil.Dates().formatDateString(new moment())
      },
      {
        title: "完成百分比",
        dataIndex: 'completePct',
        key: 'completePct',
        width: '13%',
        render: text => text ? text : "0%"
      },
      {
        title: "权重",
        dataIndex: 'estwt',
        key: 'estwt',
        width: '8%'
      },
      {
        title: "计量单位",
        dataIndex: "unit",
        key: "unit",
        render: text => text ? text.name : '',
        width: '13%'
      },
    ]

    return (

      <LabelFormLayout title={this.props.title} >
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
                    <DatePicker style={{ width: '100%' }} format={this.state.projSet.dateFormat} disabledDate={this.onControl.bind(this, "start")}
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
                    <DatePicker style={{ width: '100%' }} format={this.state.projSet.dateFormat} disabledDate={this.onControl.bind(this, "end")}
                      showTime={{ format: 'HH:mm', defaultValue: moment('00:00:00', 'HH:mm:ss') }}
                      onChange={(value) => {

                        this.startCaculate()
                        value ? this.setState({ inputValue: 100 }) : this.setState({ inputValue: this.state.info.completePct || 0 }, () => {
                          this.props.form.setFields({ actEndTime: { value: null, errors: null } })
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
                        disabled={this.props.data.type == "task" && (this.props.data.taskType == 2 || this.props.data.taskType == 3)}
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
            <Col span={12}>
              <Form.Item label="本周完成量" {...formItemLayout}>
                {/* 预计工期 */}
                {getFieldDecorator('custom01', {
                  initialValue: this.state.info.custom01,
                  rules: [{
                    required: true,
                    message: intl.get('wsd.i18n.message.enter') + "本周完成量",
                  }],
                })(
                  <InputNumber onChange={this.custom01Change} style={{ width: "100%" }} max={999999999999} min={0}

                  />
                )}
              </Form.Item>

            </Col>
            <Col span={12}>
              <Form.Item label="下周计划量" {...formItemLayout}>
                {/* 预计工期 */}
                {getFieldDecorator('custom02', {
                  initialValue: this.state.info.custom02,
                  rules: [{
                    required: true,
                    message: intl.get('wsd.i18n.message.enter') + "本周完成量",
                  }],
                })(
                  <InputNumber style={{ width: "100%" }} max={999999999999} min={0} />
                )}
              </Form.Item>

            </Col>

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
          {this.props.isHaveStation &&
            <div className="ant-col ant-col-24">
              <div className="ant-row ant-form-item">
                <div className="ant-col ant-form-item-label ant-col-xs-24 ant-col-sm-4">
                  <label htmlFor="remark" title="完成明细">完成明细</label>
                </div>
                <div className="ant-col ant-form-item-control-wrapper ant-col-xs-24 ant-col-sm-20">
                  <PublicTable onRef={this.onRef}
                    getData={this.getStationList}
                    columns={columns}
                    useCheckBox={false}
                    pagination={false}
                    getRowData={() => { }}
                  />
                </div>
              </div>
            </div>
          }
          {this.props.isHaveStep &&
            <div className="ant-col ant-col-24">
              <div className="ant-row ant-form-item">
                <div className="ant-col ant-form-item-label ant-col-xs-24 ant-col-sm-4">
                  <label htmlFor="remark" title="工序明细">工序明细</label>
                </div>
                <div className="ant-col ant-form-item-control-wrapper ant-col-xs-24 ant-col-sm-20">
                  <PublicTable onRef={this.onRef2}
                    getData={this.getPlanTaskStepList}
                    columns={columns2}
                    useCheckBox={false}
                    pagination={false}
                    getRowData={() => { }}
                  />
                </div>
              </div>
            </div>
          }
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
