import React, { Component } from 'react'
import { Form, Row, Col, Input, Button, Icon, Select, DatePicker, Switch, Slider, InputNumber, TreeSelect } from 'antd';
import intl from 'react-intl-universal'
import moment from 'moment';
import style from './style.less'
import axios from "../../../../api/axios"
import {
  getdictTree,
  getPreparedTreeList,
  getuserauthtree,
  addPlanWbs,
  defineOrgTree,
  defineOrgUserList,
  getBaseSelectTree,
  getWbsInfoById,
  getTaskInfoById,
  calendarList,
  caculateWorkHour,
  getvariable,
} from '../../../../api/api';
import * as dataUtil from "../../../../utils/dataUtil"
import LabelFormLayout from "../../../../components/public/Layout/Labels/Form/LabelFormLayout"
import LabelFormButton from "../../../../components/public/Layout/Labels/Form/LabelFormButton"

const FormItem = Form.Item;
const Option = Select.Option
const { TextArea } = Input;

export class PlanPreparedInfo extends Component {

  constructor(props) {
    super(props)
    this.state = {
      initDone: false,
      info: {
        userId: null,
      },
      orgTree: [],
      orgUserList: [],
      planTaskTypeList: [],
      projSet: { dateFormat: 'YYYY-MM-DD', drtnUnit: 'h', timeUnit: 'h', precision: 2, moneyUnit: '¥' },
      planTypeList: { value: "2", title: "专项计划" },
      _workTime: {},
      runnDone: true, //是否计算完成
    }
  }

  //获取密级
  getSecutyLevelList = () => {
    if (!this.state.secutyLevelList) {
      axios.get(getdictTree("comm.secutylevel")).then(res => {
        if (res.data.data) {
          this.setState({
            secutyLevelList: res.data.data,
          })
        }
      })
    }
  }

  //开始计算
  startCaculate = () => {
    this.setState({ runnDone: false }) //标识计算开始
  }

  //计划日期工期计算(开始(修改)+工期=完成，完成(修改)-开始=工期，工期(修改)+开始=完成）
  caculateStartOrEndOrDrtn = (opeType, calendarId) => {
    let param = {
      calendarId: calendarId || this.props.form.getFieldValue("calendarId"),
      startTime: dataUtil.Dates().formatTimeString(this.props.form.getFieldValue("planStartTime")),
      endTime: dataUtil.Dates().formatTimeString(this.props.form.getFieldValue("planEndTime")),
      drtn: dataUtil.WorkTimes().toHour(this.props.form.getFieldValue("planDrtn"), this.state.projSet.drtnUnit, this.state._workTime.calendar),
      opeType: opeType
    }
    if (param.calendarId && (param.startTime || param.endTime)) {
      axios.post(caculateWorkHour, param).then(res => {
        const data = res.data.data || {};
        const workTime = { calendar: data.calendar, planStartTime: data.startTime, planEndTime: data.endTime, planDrtn: data.drtn, planQty: data.drtn };
        this.props.form.setFieldsValue({ ["planStartTime"]: dataUtil.Dates().formatTimeMonent(workTime.planStartTime) });
        this.props.form.setFieldsValue({ ["planEndTime"]: dataUtil.Dates().formatTimeMonent(workTime.planEndTime) });
        this.props.form.setFieldsValue({ ["planDrtn"]: dataUtil.WorkTimes().hourTo(workTime.planDrtn, this.state.projSet.drtnUnit, workTime.calendar) });
        this.props.form.setFieldsValue({ ["planQty"]: dataUtil.WorkTimes().hourTo(workTime.planQty, this.state.projSet.timeUnit, workTime.calendar) });
        this.setState({ _workTime: workTime, runnDone: true }) //标识计算完成
      })
    }
  }

  //开始(修改)+工期=完成
  caculateByStartTime = (status) => {
    if (status) {
      return; //只有关闭时才调用
    }
    const dateStart = dataUtil.Dates().formatTimeString(this.props.form.getFieldValue("planStartTime"));
    if (dateStart && this.state._workTime.planStartTime != dateStart) {
      this.caculateStartOrEndOrDrtn("StartTime");
    }
  }

  //完成(修改)-开始=工期
  caculateByEndTime = (status) => {
    if (status) {
      return; //只有关闭时才调用
    }
    const dateEnd = dataUtil.Dates().formatTimeString(this.props.form.getFieldValue("planEndTime"));
    if (dateEnd && this.state._workTime.planEndTime != dateEnd) {
      this.caculateStartOrEndOrDrtn("EndTime");
    }
  }

  //工期(修改)+开始=完成
  caculateByPlanDrtn = (value) => {
    const planDrtn = dataUtil.WorkTimes().toHour(this.props.form.getFieldValue("planDrtn"), this.state.projSet.drtnUnit, this.state._workTime.calendar);
    if (planDrtn > 0 && this.state._workTime.planDrtn != planDrtn) {
      this.caculateStartOrEndOrDrtn("Drtn");
    }
  }

  //日历(修改)=完成-开始=工期
  caculateByCalendar = (value, option) => {
    this.startCaculate()
    this.caculateStartOrEndOrDrtn("calendarId", value);
  }

  //工时(修改)
  caculateByPlanQty = () => {
    const planQty = dataUtil.WorkTimes().toHour(this.props.form.getFieldValue("planQty"), this.state.projSet.timeUnit, this.state._workTime.calendar);
    if (this.state._workTime.planQty != planQty) {
      let _workTime = this.state._workTime;
      _workTime.planQty = planQty;
      this.setState({ _workTime: _workTime, runnDone: true });
    }
  }

  componentDidMount() {
    const { rightData } = this.props;
    if (rightData) {
      axios.get(getvariable(rightData[0].projectId)).then(res => {
        const data = res.data.data || {};
        const projSet = {
          dateFormat: (data.dateFormat || {}).id || "YYYY-MM-DD",
          drtnUnit: (data.drtnUnit || {}).id || "h",
          timeUnit: (data.timeUnit || {}).id || "h",
          precision: data.precision || 2,
          moneyUnit: (data.currency || {}).symbol || "¥",
        }
        switch (rightData[0]['nodeType']) {
          case 'wbs':
            this.getWbsInfoById(rightData[0]['id'], projSet)
            break;
          case 'task':
            this.getTaskInfoById(rightData[0]['id'], projSet)
            break;
          default:
            this.setState({
              info: rightData[0], projSet: projSet
            })
        }
      })
    }
  }

  handleSubmit = (e) => {
    const that = this
    if (this.state.runnDone) {
      e.preventDefault();
      this.props.form.validateFieldsAndScroll((err, values) => {
        if (!err) {
          const { info } = this.state
          const data = {
            ...info,
            ...values,
            orgId: values.orgId != parseInt(values.orgId) ? info.org.id : values.orgId,
            isFeedback: values.isFeedback ? 1 : 0,
            controlAccount: values.controlAccount ? 1 : 0,
            planStartTime: dataUtil.Dates().formatTimeString(values.planStartTime),
            planEndTime: dataUtil.Dates().formatTimeString(values.planEndTime),
            planDrtn: this.state._workTime.planDrtn,
            planQty: this.state._workTime.planQty,
            constraintTime: dataUtil.Dates().formatTimeString(values.constraintTime),
            secutyLevel: null,
            estWt:1
          }
          if (info.nodeType == 'wbs') {
            this.props.updatePlanWbs(data)
          }
          if (info.nodeType == 'task') {
            this.props.updatePlanTask(data)
          }
        }
      })
    } else {
      setTimeout(function () {
        that.handleSubmit(e)
      }, 100)
    }
  }

  //获取日历列表
  getCalendarList = () => {
    if (!this.state.calendarList) {
      axios.get(calendarList).then(res => {
        if (res.data.data) {
          this.setState({
            calendarList: res.data.data
          })
        }
      })
    }
  }

  // 获取下拉框字典
  getBaseSelectTree = (typeCode) => {
    axios.get(getBaseSelectTree(typeCode)).then(res => {
      const { data } = res.data
      if (!data) {
        return
      }
      // 初始化字典-计划-计划类型
      if (typeCode == 'plan.define.plantype') {
        this.setState({
          planTypeList: data,
        })
      }

      // 初始化字典-计划-计划级别
      if (typeCode == 'plan.task.planlevel') {
        this.setState({
          planLevelList: data,
        })
      }

      // 初始化字典-任务-作业类型
      if (typeCode == 'plan.project.tasktype') {
        this.setState({
          planTaskTypeList: data
        })
      }

      // 初始化字典-项目-工期类型
      if (typeCode == 'plan.project.taskdrtntype') {
        this.setState({
          planTaskDrtnTypeList: data,
        })
      }
    })
  }

  // 获取责任主体列表
  defineOrgTree = () => {
    const { rightData, orgTree } = this.props
    if (rightData) {
      axios.get(defineOrgTree(rightData[0]['projectId'] || rightData[0]['id'])).then(res => {
        const { data } = res.data
        this.setState({
          orgTree: data ? data : []
        })
      })
    }
  }

  onDefineOrgTree = () => {
    const { orgTree } = this.state
    if (!orgTree.length) {
      this.defineOrgTree()
    }
  }

  // 根据责任主体id获取责任人列表
  defineOrgUserList = (orgid, type) => {
    if (orgid) {
      axios.get(defineOrgUserList(orgid)).then(res => {
        const info = {
          ...this.state.info,
          user: type ? this.state.info.user : null
        }
        this.setState({
          info,
          orgUserList: res.data.data,
        })
      })
    }
  }

  changeDefineOrg = (orgid) => {
    orgid && this.defineOrgUserList(orgid)
  }

  //限制类型
  getConstraintTypeList = () => {
    if (!this.state.constraintTypeList) {
      axios.get(getdictTree('plan.constraint.type'), {}, null, null, false).then(res => {
        if (res.data.data) {
          this.setState({
            constraintTypeList: res.data.data,
          })
        }
      })
    }
  }

  // 获取WBS信息
  getWbsInfoById = (id, projSet) => {
    axios.get(getWbsInfoById(id)).then(res => {
      const { data } = res.data;
      const planDrtn = dataUtil.WorkTimes().hourTo(data.planDrtn, projSet.drtnUnit, data.calendar);
      const planQty = dataUtil.WorkTimes().hourTo(data.planQty, projSet.timeUnit, data.calendar);
      this.setState({
        projSet: projSet,
        _workTime: data,
        info: { ...data, nodeType: 'wbs', planDrtn: planDrtn, planQty: planQty },
      }, () => {
        this.defineOrgUserList(this.state.info.org.id, true)
      })
    })
  }

  // 获取任务信息
  getTaskInfoById = (id, projSet) => {
    axios.get(getTaskInfoById(id)).then(res => {
      const { data } = res.data
      let planTaskTypeList = []
      if (data.taskType == 1 || data.taskType == 4) {
        planTaskTypeList = [{ value: 1, title: '作业任务' }, { value: 4, title: '资源任务' }]
      } else if (data.taskType == 2) {
        planTaskTypeList = [{ value: 2, title: '开始里程碑' }]
      } else if (data.taskType == 3) {
        planTaskTypeList = [{ value: 3, title: '完成里程碑' }]
      }
      const planDrtn = dataUtil.WorkTimes().hourTo(data.planDrtn, projSet.drtnUnit, data.calendar);
      const planQty = dataUtil.WorkTimes().hourTo(data.planQty, projSet.timeUnit, data.calendar);
      this.setState({
        projSet: projSet,
        _workTime: data,
        planTaskTypeList: planTaskTypeList,
        info: { ...data, nodeType: 'task', planDrtn: planDrtn, planQty: planQty },
      }, () => {
        const { constraintType } = this.state.info
        this.setState({
          constraintTimeRequie: constraintType ? true : false,
        })
        this.defineOrgUserList(this.state.info.org.id, true)
      })
    })
  }

  //限制类型改变控制限制时间
  changeConstraintType = (value) => {
    if (value) {
      this.setState({
        constraintTimeRequie: true //限制时间限制时间必填
      })
      if (!this.props.form.getFieldValue("constraintTime")) { //限制时间为空
        if (value == "1" || value == "3" || value == "4") { //开始
          this.props.form.setFieldsValue({ "constraintTime": this.props.form.getFieldValue("planStartTime") });
        } else if (value == "2" || value == "5" || value == "6") { //完成
          this.props.form.setFieldsValue({ "constraintTime": this.props.form.getFieldValue("planEndTime") });
        }
      }
    } else {
      this.setState({
        constraintTimeRequie: false  //限制时间限制时间不必填
      })
      this.props.form.setFieldsValue({ "constraintTime": null });
    }
  }

  render() {
    const { rightData } = this.props;
    const { getFieldDecorator, getFieldsError, getFieldError, isFieldTouched } = this.props.form;
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
        xs: { span: 22 },
        sm: { span: 20 },
      },
    };

    return (
      <LabelFormLayout title={this.props.title} >
        <Form onSubmit={this.handleSubmit}>
          <Row type="flex">
            <Col span={12}>
              <Form.Item label={intl.get('wsd.i18n.plan.plandefine.planname')} {...formItemLayout}>
                {getFieldDecorator('taskName', {
                  initialValue: this.state.info.taskName || this.state.info.name,
                  rules: [{
                    required: true,
                    message: intl.get('wsd.i18n.message.enter') + intl.get('wsd.i18n.plan.plandefine.planname'),
                  }],
                })(
                  <Input maxLength={82} />
                )}
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label={intl.get('wsd.i18n.plan.plandefine.plancode')} {...formItemLayout}>
                {getFieldDecorator('taskCode', {
                  initialValue: this.state.info.taskCode || this.state.info.code,
                  rules: [{
                    required: true,
                    message: intl.get('wsd.i18n.message.enter') + intl.get('wsd.i18n.plan.plandefine.plancode'),
                  }],
                })(
                  <Input maxLength={33} />
                )}
              </Form.Item>
            </Col>
          </Row>
          <Row>
            <Col span={12}>
              <Form.Item label={intl.get('wsd.i18n.plan.plandefine.orgname')} {...formItemLayout}>
                {getFieldDecorator('orgId', {
                  initialValue: this.state.info.org ? this.state.info.org.name : '',
                  rules: [{
                    required: true,
                    message: intl.get('wsd.i18n.message.enter') + intl.get('wsd.i18n.plan.plandefine.orgname')
                  }],
                })(
                  <TreeSelect
                    allowClear
                    showSearch
                    treeNodeFilterProp="title"
                    dropdownStyle={{ maxHeight: 400, overflow: 'auto' }}
                    treeData={this.state.orgTree}
                    placeholder="请选择"
                    treeDefaultExpandAll
                    onChange={this.changeDefineOrg}
                    onFocus={this.onDefineOrgTree}
                  />
                )}
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label={intl.get('wsd.i18n.plan.plandefine.username')} {...formItemLayout}>
                {getFieldDecorator('userId', {
                  initialValue: this.state.info.user ? this.state.info.user.id : '',
                  rules: [],
                })(
                  <Select allowClear
                    showSearch
                    optionFilterProp="children"
                    filterOption={(input, option) => option.props.children[1].toLowerCase().indexOf(input.toLowerCase()) >= 0}>
                    {this.state.orgUserList.length ? this.state.orgUserList.map(item => {
                      return (
                        <Option key={item.id} value={item.id}> {item.title} </Option>
                      )
                    }) : this.state.info.user &&
                      <Option key={this.state.info.user.id} value={this.state.info.user.id}> {this.state.info.user.name} </Option>
                    }
                  </Select>
                )}
              </Form.Item>
            </Col>
          </Row>
          <Row>
            <Col span={12}>
              <Form.Item label={intl.get('wsd.i18n.plan.plandefine.planstarttime')} {...formItemLayout}>
                {getFieldDecorator('planStartTime', {
                  initialValue: dataUtil.Dates().formatTimeMonent(this.state.info.planStartTime),
                  rules: [{
                    required: this.state.info.taskType != 3,
                    message: intl.get('wsd.i18n.message.enter') + intl.get('wsd.i18n.plan.plandefine.planstarttime'),
                  }],
                })(
                  <DatePicker style={{ width: "100%" }} format={this.state.projSet.dateFormat}
                    showTime={{ format: 'HH:mm', defaultValue: moment('00:00:00', 'HH:mm:ss') }}
                    disabledDate={(current) => dataUtil.Dates().disabledMaxDate(current, this.props.form.getFieldValue("planEndTime"))}
                    disabledTime={(current) => dataUtil.Dates().disabledMaxDateTime(current, this.props.form.getFieldValue("planEndTime"))}
                    disabled={this.state.info.taskType == 3}
                    onChange={this.startCaculate}
                    onOpenChange={this.caculateByStartTime}
                  />
                )}
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label={intl.get('wsd.i18n.plan.plandefine.planendtime')} {...formItemLayout}>
                {getFieldDecorator('planEndTime', {
                  initialValue: dataUtil.Dates().formatTimeMonent(this.state.info.planEndTime),
                  rules: [{
                    required: this.state.info.taskType != 2,
                    message: intl.get('wsd.i18n.message.enter') + intl.get('wsd.i18n.plan.plandefine.planendtime'),
                  }],
                })(
                  <DatePicker style={{ width: "100%" }} format={this.state.projSet.dateFormat}
                    showTime={{ format: 'HH:mm', defaultValue: moment('00:00:00', 'HH:mm:ss') }}
                    disabledDate={(current) => dataUtil.Dates().disabledMinDate(current, this.props.form.getFieldValue("planStartTime"))}
                    disabledTime={(current) => dataUtil.Dates().disabledMinDateTime(current, this.props.form.getFieldValue("planStartTime"))}
                    disabled={this.state.info.taskType == 2}
                    onChange={this.startCaculate}
                    onOpenChange={this.caculateByEndTime}
                  />
                )}
              </Form.Item>
            </Col>
          </Row>
          <Row>
            <Col span={12}>
              <Form.Item label="日历" {...formItemLayout}>
                {getFieldDecorator('calendarId', {
                  initialValue: this.state.info.calendar ? this.state.info.calendar.id : null,
                  rules: [{
                    required: true,
                    message: intl.get('wsd.i18n.message.enter') + intl.get('wsd.i18n.pre.project.projectname'),
                  }],
                })(
                  <Select onDropdownVisibleChange={this.getCalendarList} onChange={this.caculateByCalendar}>
                    {this.state.calendarList ? this.state.calendarList.map(item => {
                      return <Option value={item.id} key={item.id}>{item.calName}</Option>
                    }) : this.state.info.calendar &&
                      <Option value={this.state.info.calendar.id} key={this.state.info.calendar.id}>{this.state.info.calendar.calName}</Option>
                    }
                  </Select>
                )}
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="计划工期" {...formItemLayout}>
                {getFieldDecorator('planDrtn', {
                  initialValue: this.state.info.planDrtn,
                  rules: [{
                    required: this.state.info.taskType != 2 && this.state.info.taskType != 3,
                    message: intl.get('wsd.i18n.message.enter') + intl.get('wsd.i18n.plan.plandefine.planstarttime'),
                  }],
                })(
                  <InputNumber style={{ width: '100%' }} max={999999} min={0} precision={this.state.projSet.precision}
                    formatter={value => `${value}` + this.state.projSet.drtnUnit}
                    parser={value => value.replace(this.state.projSet.drtnUnit, '')}
                    disabled={this.state.info.taskType == 2 || this.state.info.taskType == 3}
                    onChange={this.startCaculate}
                    onBlur={this.caculateByPlanDrtn}
                  />
                )}
              </Form.Item>
            </Col>
          </Row>
          <Row>
            <Col span={12}>
              <Form.Item label={intl.get('wsd.i18n.plan.plandefine.plantype')} {...formItemLayout}>
                {getFieldDecorator('planType', {
                  initialValue: this.state.info.planType ? this.state.info.planType.id : '',
                  rules: [],
                })(
                  <Select>
                    {/* {
                    planTypeData.map((v, i) => {
                      return <Option value={v.value} key={i}>{v.title}</Option>
                    })
                  } */}
                    <Option value={this.state.planTypeList.value} key={this.state.planTypeList.value}>{this.state.planTypeList.title}</Option>
                  </Select>
                )}
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="计划级别" {...formItemLayout}>
                {getFieldDecorator('planLevel', {
                  initialValue: this.state.info.planLevel ? this.state.info.planLevel.id : '',
                  rules: [],
                })(
                  <Select onFocus={() => {
                    !this.state.planLevelList && this.getBaseSelectTree('plan.task.planlevel')
                  }}>
                    {
                      this.state.planLevelList ? this.state.planLevelList.map((v, i) => {
                        return <Option value={v.value} key={i}>{v.title}</Option>
                      }) : this.state.info.planLevel &&
                        <Option value={this.state.info.planLevel.id} key={this.state.info.planLevel.id}>{this.state.info.planLevel.name}</Option>
                    }
                  </Select>
                )}
              </Form.Item>
            </Col>
          </Row>

          {/* WBS特有 */}
          {rightData[0]['nodeType'] == 'wbs' && (
            <Row>
              <Col span={12}>
                <Form.Item label={intl.get('wsd.i18n.base.planTemAddWBS.iswbsfb')} {...formItemLayout}>
                  {getFieldDecorator('isFeedback', {
                    initialValue: this.state.info.isFeedback == 1 ? true : false,
                    valuePropName: 'checked',
                  })(
                    <Switch checkedChildren="开" unCheckedChildren="关" />
                  )}
                </Form.Item>
              </Col>
            </Row>
          )}
          <Row>
            <Col span={24}>
              <Form.Item label={intl.get('wsd.i18n.plan.plandefine.remark')} {...formItemLayout2}>
                {getFieldDecorator('remark', {
                  initialValue: this.state.info.remark,
                })(
                  <TextArea maxLength={666} />
                )}
              </Form.Item>
            </Col>
          </Row>
          <Row>
            <Col span={12}>
              <Form.Item label="创建人" {...formItemLayout}>
                {getFieldDecorator('creator', {
                  initialValue: this.state.info.creator ? this.state.info.creator.name : '',
                  rules: [],
                })(
                  <Input disabled={true} />
                )}
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="创建日期" {...formItemLayout}>
                {getFieldDecorator('creatTime', {
                  initialValue: dataUtil.Dates().formatDateMonent(this.state.info.creatTime),
                  rules: [],
                })(
                  <DatePicker style={{ width: '100%' }} disabled={true} />
                )}
              </Form.Item>
            </Col>
          </Row>
          <Row>
            <Col span={12}>
              <Form.Item label="发布人" {...formItemLayout}>
                {getFieldDecorator('releaser', {
                  initialValue: this.state.info.releaseUser ? this.state.info.releaseUser.name : '',
                  rules: [],
                })(
                  <Input disabled={true} />
                )}
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="发布日期" {...formItemLayout}>
                {getFieldDecorator('releaseTime', {
                  initialValue: dataUtil.Dates().formatDateMonent(this.state.info.releaseTime),
                  rules: [],
                })(
                  <DatePicker style={{ width: '100%' }} disabled={true} />
                )}
              </Form.Item>
            </Col>
          </Row>
        </Form>
        <LabelFormButton>
          <Button onClick={this.props.closeRightBox} style={{ width: "100px", marginRight: "20px" }}>取消</Button>
          <Button disabled={!this.props.editAuth} onClick={this.handleSubmit} style={{ width: "100px" }} type="primary">保存</Button>
        </LabelFormButton>
      </LabelFormLayout>
    )
  }
}

const PlanPreparedInfos = Form.create()(PlanPreparedInfo)
export default PlanPreparedInfos
