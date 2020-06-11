import React, {Component} from 'react'
import {Form, Row, Col, Input, Button, Select, DatePicker, Switch, InputNumber, TreeSelect} from 'antd';
import intl from 'react-intl-universal'
import moment from 'moment';
import style from './style.less'
import LabelFormLayout from "../../../../components/public/Layout/Labels/Form/LabelFormLayout"
import LabelFormButton from "../../../../components/public/Layout/Labels/Form/LabelFormButton"
import {
  defineOrgTree,
  defineOrgUserList,
  getBaseSelectTree,
  getPlanWbsChangeInfo,
  getPlanTaskChangeInfo,
  caculateWorkHour,
  calendarList
} from "../../../../api/api"
import axios from '../../../../api/axios';
import * as dataUtil from "../../../../utils/dataUtil"

const {TextArea} = Input;
const {Option} = Select

export class PlanChangeInfo extends Component {
  constructor(props) {
    super(props)
    this.state = {
      initDone: false,
      info: {},
      orgTree: [],
      orgUserList: [],
      projSet: {dateFormat: 'YYYY-MM-DD', drtnUnit: 'h', timeUnit: 'h', precision: 2, moneyUnit: '¥'},
      _workTime: {},
      runnDone: true, //是否计算完成
    }
  }

  //开始计算
  startCaculate = () => {
    this.setState({runnDone: false}) //标识计算开始
  }

  //计划日期工期计算(开始(修改)+工期=完成，完成(修改)-开始=工期，工期(修改)+开始=完成）
  caculateStartOrEndOrDrtn = (opeType, calendarId) => {
    let param = {
      calendarId: calendarId || this.props.form.getFieldValue("newCalendarId"),
      startTime: dataUtil.Dates().formatTimeString(this.props.form.getFieldValue("newPlanStartTime")),
      endTime: dataUtil.Dates().formatTimeString(this.props.form.getFieldValue("newPlanEndTime")),
      drtn: dataUtil.WorkTimes().toHour(this.props.form.getFieldValue("newPlanDrtn"), this.state.projSet.drtnUnit, this.state._workTime.calendar),
      opeType: opeType
    }
    if (param.calendarId && (param.startTime || param.endTime || param.drtn)) {
      axios.post(caculateWorkHour, param).then(res => {
        const data = res.data.data || {};
        const workTime = {...this.state._workTime, calendar: data.calendar, newPlanStartTime: data.startTime, newPlanEndTime: data.endTime, newPlanDrtn: data.drtn, newPlanQty: data.drtn};
        this.props.form.setFieldsValue({["newPlanStartTime"]: dataUtil.Dates().formatTimeMonent(workTime.newPlanStartTime)});
        this.props.form.setFieldsValue({["newPlanEndTime"]: dataUtil.Dates().formatTimeMonent(workTime.newPlanEndTime)});
        this.props.form.setFieldsValue({["newPlanDrtn"]: dataUtil.WorkTimes().hourTo(workTime.newPlanDrtn, this.state.projSet.drtnUnit, workTime.calendar)});
        this.props.form.setFieldsValue({["newPlanQty"]: dataUtil.WorkTimes().hourTo(workTime.newPlanQty, this.state.projSet.timeUnit, workTime.calendar)});
        this.setState({_workTime: workTime, runnDone: true}) //标识计算完成
      })
    }
  }

  //开始(修改)+工期=完成
  caculateByStartTime = (status) => {
    if (status) {
      return; //只有关闭时才调用
    }
    const dateStart = dataUtil.Dates().formatTimeString(this.props.form.getFieldValue("newPlanStartTime"));
    if (dateStart && this.state._workTime.newPlanStartTime != dateStart) {
      this.caculateStartOrEndOrDrtn("StartTime");
    }
  }

  //完成(修改)-开始=工期
  caculateByEndTime = () => {
    if (status) {
      return; //只有关闭时才调用
    }
    const dateEnd = dataUtil.Dates().formatTimeString(this.props.form.getFieldValue("newPlanEndTime"));
    if (dateEnd && this.state._workTime.newPlanEndTime != dateEnd) {
      this.caculateStartOrEndOrDrtn("EndTime");
    }
  }

  //完成(修改)-开始=工期
  caculateByPlanDrtn = () => {
    const planDrtn = this.props.form.getFieldValue("newPlanDrtn");
    if (planDrtn > 0 && this.state._workTime.newPlanDrtn != planDrtn) {
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
    const planQty = dataUtil.WorkTimes().toHour(this.props.form.getFieldValue("newPlanQty"), this.state.projSet.timeUnit, this.state._workTime.calendar);
    if (this.state._workTime.newPlanQty != planQty) {
      let _workTime = this.state._workTime;
      _workTime.newPlanQty = planQty;
      this.setState({ _workTime: _workTime, runnDone: true});
    }
  }

  componentDidMount() {
    // 初始化表单数据
    this.initFormDatas();
  }

  getTaskTypeList = () => {
    const {rightData} = this.props
    let planTaskTypeList = []
    if (rightData) {
      if(rightData[0]['taskType'] == '1' || rightData[0]['taskType'] == '4' || rightData[0]['taskType'] == 0){
        planTaskTypeList = [{value: 1, title: '作业任务'}, {value: 4, title: '资源任务'}]
      } else if(rightData[0]['taskType'] == '2'){
        planTaskTypeList = [{value: 2, title: '开始里程碑'}]
      } else if(rightData[0]['taskType'] == '3'){
        planTaskTypeList = [{value: 3, title: '完成里程碑'}]
      }
    }
    return planTaskTypeList;
  }

  initParasm = (data) => {
    let { projSet } = this.props;
    projSet = projSet || {};
    let planTaskTypeList = this.getTaskTypeList();
    const {newPlanDrtn, oldPlanDrtn, newPlanQty, oldPlanQty, newOrg} = data;
    const workTime = {...data, newPlanStartTime: data.newPlanStartTime, newPlanEndTime: data.newPlanEndTime, newPlanDrtn: data.newPlanDrtn, newPlanQty: data.newPlanQty, calendar: data.newCalendar};
    data.newPlanDrtn = dataUtil.WorkTimes().hourTo(newPlanDrtn, projSet.drtnUnit, workTime.calendar);
    data.oldPlanDrtn = dataUtil.WorkTimes().hourTo(oldPlanDrtn, projSet.drtnUnit, workTime.calendar);
    data.newPlanQty = dataUtil.WorkTimes().hourTo(newPlanQty, projSet.timeUnit, workTime.calendar);
    data.oldPlanQty = dataUtil.WorkTimes().hourTo(oldPlanQty, projSet.timeUnit, workTime.calendar);

    this.setState({
      projSet,
      planTaskTypeList,
      _workTime: workTime,
      info: {...data}
    })
    if(newOrg){
      this.defineOrgUserList(newOrg.id);
    }
  }

  /**
   * 初始化表单数据
   */
  initFormDatas = () => {

    const {rightData} = this.props;
    if(rightData.length){
      let {nodeType,changeId,id} = rightData[0];
      let bizType,bizId;
      if(changeId){
        bizType = "change";
        bizId = changeId;
      }else{
        bizType = "task";
        bizId = id;
      }
      let url;
      if(nodeType === "wbs"){
        url = getPlanWbsChangeInfo(bizType,bizId);
      }else{
        url = getPlanTaskChangeInfo(bizType,bizId);
      }
      axios.get(url,null,null,null,true).then(res => {
        const {data} = res.data;
        this.initParasm(data);
      })
    }
  }

  handleSubmit = (e) => {
    const that = this
    if(this.state.runnDone){
      e.preventDefault();
      this.props.form.validateFieldsAndScroll((err, values) => {
        if (!err) {
          const {info} = this.state;
          const data = {
            ...info,
            ...values,
            newPlanType:info.newPlanType.id,
            newWbsFeedBack: values.newWbsFeedBack ? 1 : 0,
            newControlAccount: values.newControlAccount ? 1 : 0,
            newPlanStartTime: dataUtil.Dates().formatTimeString(values['newPlanStartTime']),
            newPlanEndTime: dataUtil.Dates().formatTimeString(values['newPlanEndTime']),
            newPlanDrtn: this.state._workTime.newPlanDrtn || 0,
            newPlanQty: this.state._workTime.newPlanQty || 0,
            newTaskDrtnType:info.newTaskDrtnType ? info.newTaskDrtnType.id : '',
            oldPlanDrtn: this.state._workTime.oldPlanDrtn || 0,
            oldPlanQty: this.state._workTime.oldPlanQty || 0,
            oldOrgId: info.oldOrg ? info.oldOrg.id : '',
            oldUserId: info.oldUser ? info.oldUser.id : '',
            oldCalendarId: info.oldCalendar ? info.oldCalendar.id : '',
            oldPlanType: info.oldPlanType ? info.oldPlanType.id : '',
            oldPlanLevel: info.oldPlanLevel ? info.oldPlanLevel.id : '',
            oldTaskDrtnType: info.oldTaskDrtnType ? info.oldTaskDrtnType.id : '',
            oldWbsFeedBack: info.oldWbsFeedBack ? 1 : 0,
            oldControlAccount: info.oldControlAccount ? 1 : 0,
            oldPlanStartTime: dataUtil.Dates().formatTimeString(info.oldPlanStartTime),
            oldPlanEndTime: dataUtil.Dates().formatTimeString(info.oldPlanEndTime),
            parentType: info.parentType,
          }
          if (info.newTaskType == 0) {
            this.props.updatePlanWbs(data)
          } else {
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

  // 获取下拉框字典
  getBaseSelectTree = (typeCode) => {
    axios.get(getBaseSelectTree(typeCode)).then(res => {
      const {data} = res.data
      // 初始化字典-计划-计划类型
      if (typeCode == 'plan.define.plantype') {
        this.setState({
          planTypeList: [{value: "1", title: "前期计划"}]
        })
      }

      // 初始化字典-计划-计划级别
      if (typeCode == 'plan.task.planlevel') {
        this.setState({
          planLevelList: data
        })
      }

      // 初始化字典-项目-工期类型
      if (typeCode == 'plan.project.taskdrtntype') {
        this.setState({
          planTaskDrtnTypeList: data
        })
      }
    })
  }

  // 获取责任主体列表
  defineOrgTree = () => {
    const {rightData, orgTree} = this.props
    if (rightData) {
      axios.get(defineOrgTree(rightData[0]['projectId'] || rightData[0]['id'])).then(res => {
        const {data} = res.data
        this.setState({
          orgTree: data ? data : []
        })
      })
    }
  }

  onDefineOrgTree = () => {
    const {orgTree} = this.state
    if (!orgTree.length) {
      this.defineOrgTree()
    }
  }

  // 根据责任主体id获取责任人列表
  defineOrgUserList = (orgid) => {
    if (orgid) {
      axios.get(defineOrgUserList(orgid)).then(res => {
        this.setState({
          orgUserList: res.data.data,
          userId: null,
        })
      })
    }
  }

  changeDefineOrg = (orgid) => {
    this.props.form.setFieldsValue({newUserId: null})
    this.defineOrgUserList(orgid)
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

  render() {
    const {getFieldDecorator, getFieldsError, getFieldError, isFieldTouched} = this.props.form;
    const formItemLayout = {
      labelCol: {
        xs: {span: 24},
        sm: {span: 8},
      },
      wrapperCol: {
        xs: {span: 24},
        sm: {span: 16},
      },
    };
    const formItemLayout2 = {
      labelCol: {
        xs: {span: 24},
        sm: {span: 16},
      },
      wrapperCol: {
        xs: {span: 24},
        sm: {span: 8},
      },
    };
    const rightData = this.props.rightData[0]
    const delChange = this.state.info.changeType && this.state.info.changeType.id == 'DEL'
    const {projSet, info} = this.state;
    const {commUnit} = this.props;
    return (
      <LabelFormLayout title = {this.props.title} >
				<Form onSubmit={this.handleSubmit}>
        <Row type="flex">
              <Col span={12}>
                <h4>变更后</h4>
                <Form onSubmit={this.handleSubmit}>
                  <Form.Item label={intl.get('wsd.i18n.plan.plandefine.planname')} {...formItemLayout}>
                    {getFieldDecorator('newName', {
                      initialValue: info.newName || '',
                      rules: [{
                        required: true,
                        message: intl.get('wsd.i18n.message.enter') + intl.get('wsd.i18n.plan.plandefine.planname'),
                      }],
                    })(
                      <Input maxLength={82} disabled={delChange}/>
                    )}
                  </Form.Item>
                  <Form.Item label={intl.get('wsd.i18n.plan.plandefine.orgname')} {...formItemLayout}>
                    {getFieldDecorator('newOrgId', {
                      initialValue: info.newOrg ? info.newOrg.id : '',
                      rules: [
                        {
                          required: true,
                          message: intl.get('wsd.i18n.message.select') + intl.get('wsd.i18n.plan.plandefine.orgname'),
                        }
                      ],
                    })(
                      <TreeSelect
                      allowClear
                      showSearch     
                      treeNodeFilterProp="title"
                        dropdownStyle={{maxHeight: 400, overflow: 'auto'}}
                        treeData={this.state.orgTree.length > 0 ? this.state.orgTree : (info.newOrg && [{value: info.newOrg.id, title: info.newOrg.name}])}
                        placeholder="请选择"
                        treeDefaultExpandAll
                        disabled={delChange}
                        onChange={this.changeDefineOrg}
                        onFocus={this.onDefineOrgTree}
                      />
                    )}
                  </Form.Item>
                  <Form.Item label={intl.get('wsd.i18n.plan.plandefine.username')} {...formItemLayout}>
                    {getFieldDecorator('newUserId', {
                      initialValue: info.newUser ? info.newUser.id : '',
                      rules: [],
                    })(
                      <Select disabled={delChange}  allowClear
                      showSearch
                      optionFilterProp="children"
                      filterOption={(input, option) =>  option.props.children[1].toLowerCase().indexOf(input.toLowerCase()) >= 0}>
                        {this.state.orgUserList.length ? this.state.orgUserList.map(item => {
                          return (
                            <Option key={item.id} value={item.id}> {item.title} </Option>
                          )
                        }) : info.newUser &&
                          <Option key={info.newUser.id} value={info.newUser.id}> {info.newUser.name} </Option>
                        }
                      </Select>
                    )}
                  </Form.Item>
                  <Form.Item label="日历" {...formItemLayout}>
                    {getFieldDecorator('newCalendarId', {
                      initialValue: info.newCalendar ? info.newCalendar.id : '',
                      rules: [{
                        required: true,
                        message: intl.get('wsd.i18n.message.select') + intl.get('wsd.i18n.pre.epsInfo.calnid'),
                      }],
                    })(
                      <Select onDropdownVisibleChange={this.getCalendarList} onChange={this.caculateByCalendar} disabled={delChange}>
                        {this.state.calendarList ? this.state.calendarList.map(item => {
                          return <Option value={item.id} key={item.id}>{item.calName}</Option>
                        }) : info.newCalendar &&
                          <Option key={info.newCalendar.id} value={info.newCalendar.id}> {info.newCalendar.calName} </Option>
                        }
                      </Select>
                    )}
                  </Form.Item>

                  {(rightData.taskType != 3) && <div>
                    <Form.Item label={intl.get('wsd.i18n.plan.plandefine.planstarttime')} {...formItemLayout}>
                      {getFieldDecorator('newPlanStartTime', {
                        initialValue: dataUtil.Dates().formatTimeMonent(info.newPlanStartTime),
                        rules: [{
                          required: info.newTaskType != 3,
                          message: intl.get('wsd.i18n.message.select') + intl.get('wsd.i18n.plan.plandefine.planstarttime'),
                        }],
                      })(
                        <DatePicker style={{width: "100%"}} format={projSet.dateFormat}
                                    showTime={{format: 'HH:mm', defaultValue: moment('00:00:00', 'HH:mm:ss')}}
                                    disabledDate={(current) => dataUtil.Dates().disabledMaxDate(current, this.props.form.getFieldValue("planEndTime"))}
                                    disabledTime={(current) => dataUtil.Dates().disabledMaxDateTime(current, this.props.form.getFieldValue("planEndTime"))}
                                    disabled={delChange || info.newTaskType == 3}
                                    onChange={this.startCaculate}
                                    onOpenChange={this.caculateByStartTime}
                        />
                      )}
                    </Form.Item>
                  </div>}

                  {(rightData.taskType != 2) && <div>
                    <Form.Item label={intl.get('wsd.i18n.plan.plandefine.planendtime')} {...formItemLayout}>
                      {getFieldDecorator('newPlanEndTime', {
                        initialValue: dataUtil.Dates().formatTimeMonent(info.newPlanEndTime),
                        rules: [{
                          required: info.newTaskType != 2,
                          message: intl.get('wsd.i18n.message.select') + intl.get('wsd.i18n.plan.plandefine.planendtime'),
                        }],
                      })(
                        <DatePicker style={{width: "100%"}} format={projSet.dateFormat}
                                    showTime={{format: 'HH:mm', defaultValue: moment('00:00:00', 'HH:mm:ss')}}
                                    disabledDate={(current) => dataUtil.Dates().disabledMinDate(current, this.props.form.getFieldValue("planStartTime"))}
                                    disabledTime={(current) => dataUtil.Dates().disabledMinDateTime(current, this.props.form.getFieldValue("planStartTime"))}
                                    disabled={delChange || info.newTaskType == 2}
                                    onChange={this.startCaculate}
                                    onOpenChange={this.caculateByEndTime}
                        />
                      )}
                    </Form.Item>
                  </div>}

                  {(rightData.taskType == 0 || rightData.taskType == 1 || rightData.taskType == 4) && <div>
                    <Form.Item label="计划工期" {...formItemLayout}>
                      {getFieldDecorator('newPlanDrtn', {
                        initialValue: info.newPlanDrtn,
                        rules: [{
                          required: true,
                          message: '请输入计划工期',
                        }],
                      })(
                        <InputNumber style={{width: '100%'}} max={999999999999} min={0} precision={projSet.precision}
                                     formatter={value => `${value}` + projSet.drtnUnit}
                                     parser={value => value.replace(projSet.drtnUnit, '')}
                                     disabled={delChange || info.taskType == 2 || info.taskType == 3}
                                     onChange={this.startCaculate}
                                     onBlur={this.caculateByPlanDrtn}
                        />
                      )}
                    </Form.Item>
                  </div>}

                  <Form.Item label="计划级别" {...formItemLayout}>
                    {getFieldDecorator('newPlanLevel', {
                      initialValue: info.newPlanLevel ? info.newPlanLevel.id : '',
                      rules: [],
                    })(
                      <Select disabled={delChange} onFocus={() => {
                        !this.state.planLevelList && this.getBaseSelectTree('plan.task.planlevel')
                      }}>
                        {
                          this.state.planLevelList ? this.state.planLevelList.map((v, i) => {
                            return <Option value={v.value} key={i}>{v.title}</Option>
                          }) : info.newPlanLevel &&
                          <Option key={info.newPlanLevel.id} value={info.newPlanLevel.id}> {info.newPlanLevel.name} </Option>
                        }
                      </Select>
                    )}
                  </Form.Item>
                  {
                    rightData.nodeType == 'task' && <Form.Item label="设计总量" {...formItemLayout}>
                      {getFieldDecorator('newCustom03', {
                        initialValue: info.newCustom03,
                        rules: [],
                      })(
                        <InputNumber disabled={rightData.planType.id == "ST-IMPLMENT-TASK" ? false : true} style={{ width: '100%' }} max={999999999999} min={0} onChange={this.onCustom03Change}/>
                      )}
                    </Form.Item>
                  }
                  {
                    rightData.nodeType == 'task' && <Form.Item label="计划完成量" {...formItemLayout}>
                      {getFieldDecorator('newCustom04', {
                        initialValue: info.newCustom04,
                        rules: [],
                      })(
                        <InputNumber style={{ width: '100%' }} max={999999999999} min={0} 
                        />
                      )}
                    </Form.Item>
                  }
                  {
                    rightData.nodeType == 'task' && <Form.Item
                      label={intl.get('wsd.i18n.base.comm.unit')} {...formItemLayout}>
                      {getFieldDecorator('newCustom07', {
                        initialValue: info.newCustom07,
                        rules: [],
                      })(
                        <Select >
                          {
                            commUnit.map((v, i) => {
                              return <Option value={v.value} key={i}>{v.title}</Option>
                            })
                          }
                        </Select>
                      )}
                    </Form.Item>
                  }
                  {
                    rightData.nodeType == 'task' && <Form.Item label={intl.get('wsd.i18n.plan.subTask.custom06')} {...formItemLayout}>
                      {getFieldDecorator('newCustom06', {
                        initialValue: info.newCustom06 && info.newCustom06 =='true' ? true : false,
                        valuePropName: 'checked',
                      })(
                        <Switch checkedChildren="是" unCheckedChildren="否"/>
                      )}
                    </Form.Item>
                  }

                  <Form.Item label={intl.get('wsd.i18n.plan.plandefine.remark')} {...formItemLayout}>
                    {getFieldDecorator('newDesc', {
                      initialValue: info.newDesc,
                    })(
                      <TextArea disabled={delChange} maxLength={666}/>
                    )}
                  </Form.Item>

                  <div style={{borderTop: '1px solid #ddd', paddingTop: '10px'}}>
                    <Form.Item label="变更类型" {...formItemLayout}>
                      {getFieldDecorator('changeType', {
                        initialValue: info.changeType ? info.changeType.name : '',
                        rules: [],
                      })(
                        <Input disabled={true}/>
                      )}
                    </Form.Item>
                    <Form.Item label="发布人" {...formItemLayout}>
                      {getFieldDecorator('aprvUser', {
                        initialValue: info.aprvUser ? info.aprvUser.name : '',
                        rules: [],
                      })(
                        <Input disabled={true}/>
                      )}
                    </Form.Item>
                    <Form.Item label="创建人" {...formItemLayout}>
                      {getFieldDecorator('creator', {
                        initialValue: info.creator ? info.creator.name : '',
                        rules: [],
                      })(
                        <Input disabled={true}/>
                      )}
                    </Form.Item>
                  </div>
                </Form>
              </Col>
              <Col span={12}>
                <h4>变更前</h4>
                <Form>
                  <Form.Item label={intl.get('wsd.i18n.plan.plandefine.planname')} {...formItemLayout}>
                    {getFieldDecorator('oldName', {
                      initialValue: info.oldName,
                      rules: [{
                        message: intl.get('wsd.i18n.message.enter') + intl.get('wsd.i18n.plan.plandefine.planname'),
                      }],
                    })(
                      <Input disabled={true}/>
                    )}
                  </Form.Item>
                  <Form.Item label={intl.get('wsd.i18n.plan.plandefine.orgname')} {...formItemLayout}>
                    {getFieldDecorator('oldOrg', {
                      initialValue: info.oldOrg ? info.oldOrg.name : '',
                      rules: [],
                    })(
                      <Input disabled={true}/>
                    )}
                  </Form.Item>
                  <Form.Item label={intl.get('wsd.i18n.plan.plandefine.username')} {...formItemLayout}>
                    {getFieldDecorator('oldUser', {
                      initialValue: info.oldUser ? info.oldUser.name : '',
                      rules: [],
                    })(
                      <Input disabled={true}/>
                    )}
                  </Form.Item>
                  <Form.Item label="日历" {...formItemLayout}>
                    {getFieldDecorator('oldCalendar', {
                      initialValue: info.oldCalendar ? info.oldCalendar.calName : '',
                      rules: [{
                        message: intl.get('wsd.i18n.message.enter') + intl.get('wsd.i18n.pre.epsInfo.calnid'),
                      }],
                    })(
                      <Input disabled={true}/>
                    )}
                  </Form.Item>

                  {(rightData.taskType != 3) && <div>
                    <Form.Item label={intl.get('wsd.i18n.plan.plandefine.planstarttime')} {...formItemLayout}>
                      {getFieldDecorator('oldPlanStartTime', {
                        initialValue: info.oldPlanStartTime ? dataUtil.Dates().formatTimeMonent(info.oldPlanStartTime) : null,
                        rules: [],
                      })(
                        <DatePicker style={{width: "100%"}} format={projSet.dateFormat} disabled={true}/>
                      )}
                    </Form.Item>
                  </div>}

                  {(rightData.taskType != 2) && <div>
                    <Form.Item label={intl.get('wsd.i18n.plan.plandefine.planendtime')} {...formItemLayout}>
                      {getFieldDecorator('oldPlanEndTime', {
                        initialValue: info.oldPlanEndTime ? dataUtil.Dates().formatTimeMonent(info.oldPlanEndTime) : null,
                        rules: [],
                      })(
                        <DatePicker style={{width: "100%"}} format={projSet.dateFormat} disabled={true}/>
                      )}
                    </Form.Item>
                  </div>}

                  {(rightData.taskType == 0 || rightData.taskType == 1 || rightData.taskType == 4) && <div>
                    <Form.Item label="计划工期" {...formItemLayout}>
                      {getFieldDecorator('oldPlanDrtn', {
                        initialValue: info.oldPlanDrtn,
                        rules: [],
                      })(
                        <InputNumber style={{width: '100%'}} max={999999999999} min={0} precision={projSet.precision}
                                     formatter={value => `${value}` + projSet.drtnUnit}
                                     parser={value => value.replace(projSet.drtnUnit, '')}
                                     disabled={true}/>
                      )}
                    </Form.Item>
                  </div>}

                  <Form.Item label="计划级别" {...formItemLayout}>
                    {getFieldDecorator('oldPlanLevel', {
                      initialValue: info.oldPlanLevel ? info.oldPlanLevel.name : '',
                      rules: [],
                    })(
                      <Input disabled={true}/>
                    )}
                  </Form.Item>

                  {
                    rightData.nodeType == 'task' && <Form.Item label="设计总量" {...formItemLayout}>
                      {getFieldDecorator('oldCustom03', {
                        initialValue: info.oldCustom03,
                        rules: [],
                      })(
                        <InputNumber disabled={true} style={{ width: '100%' }} max={999999999999} min={0} onChange={this.onCustom03Change}/>
                      )}
                    </Form.Item>
                  }
                  {
                    rightData.nodeType == 'task' && <Form.Item label="计划完成量" {...formItemLayout}>
                      {getFieldDecorator('oldCustom04', {
                        initialValue: info.oldCustom04,
                        rules: [],
                      })(
                        <InputNumber disabled={true} style={{ width: '100%' }} max={999999999999} min={0} 
                        />
                      )}
                    </Form.Item>
                  }
                  {
                    rightData.nodeType == 'task' && <Form.Item
                      label={intl.get('wsd.i18n.base.comm.unit')} {...formItemLayout}>
                      {getFieldDecorator('oldCustom07', {
                        initialValue: info.oldCustom07,
                        rules: [],
                      })(
                        <Select disabled={true}>
                          {
                            commUnit.map((v, i) => {
                              return <Option value={v.value} key={i}>{v.title}</Option>
                            })
                          }
                        </Select>
                      )}
                    </Form.Item>
                  }
                  {
                    rightData.nodeType == 'task' && <Form.Item label={intl.get('wsd.i18n.plan.subTask.custom06')} {...formItemLayout}>
                      {getFieldDecorator('oldCustom06', {
                        initialValue: info.oldCustom06 && info.oldCustom06 =='true' ? true : false,
                        valuePropName: 'checked',
                      })(
                        <Switch disabled={true} checkedChildren="是" unCheckedChildren="否"/>
                      )}
                    </Form.Item>
                  }

                  <Form.Item label={intl.get('wsd.i18n.plan.plandefine.remark')} {...formItemLayout}>
                    {getFieldDecorator('oldDesc', {
                      initialValue: info.oldDesc,
                    })(
                      <TextArea disabled={true}/>
                    )}
                  </Form.Item>

                  <div style={{borderTop: '1px solid #ddd', paddingTop: '10px'}}>
                    <Form.Item label="变更状态" {...formItemLayout}>
                      {getFieldDecorator('status', {
                        initialValue: info.status ? info.status.name : '',
                        rules: [],
                      })(
                        <Input disabled={true}/>
                      )}
                    </Form.Item>
                    <Form.Item label="发布日期" {...formItemLayout}>
                      {getFieldDecorator('aprvTime', {
                        initialValue: info.aprvTime,
                        rules: [],
                      })(
                        <Input disabled={true}/>
                      )}
                    </Form.Item>
                    <Form.Item label="创建日期" {...formItemLayout}>
                      {getFieldDecorator('creatTime', {
                        initialValue: info.creatTime ? info.creatTime.substr(0, 10) : null,
                        rules: [],
                      })(
                        <Input format={projSet.dateFormat} disabled={true}/>
                      )}
                    </Form.Item>
                  </div>
                </Form>
              </Col>
            </Row>
			
				</Form>
				<LabelFormButton>
        <Button onClick={this.props.closeRightBox} style={{width: "100px", marginRight: "20px"}}>取消</Button>
                <Button disabled={!this.props.editAuth } onClick={this.handleSubmit} style={{width: "100px"}} type="primary">保存</Button>
				</LabelFormButton>
			</LabelFormLayout>
     
    )
  }
}

const PlanChangeInfos = Form.create()(PlanChangeInfo)
export default PlanChangeInfos
