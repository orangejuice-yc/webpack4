import React, { Component } from 'react'
import style from './style.less'
import { connect } from 'react-redux'
import axios from '../../../../../../api/axios'
import * as dataUtil from "../../../../../../utils/dataUtil";
import {Form, Row, Col, Input, Select, DatePicker, Switch,InputNumber, TreeSelect,} from 'antd';
import moment from 'moment';
const {TextArea} = Input;
const {Option} = Select
import {
    getPlanBaseLineCompareInfo,
    defineOrgTree,
    defineOrgUserList,
    getBaseSelectTree,
    caculateWorkHour,
    calendarList,
    getvariable,
  } from "../../../../../../api/api"

export class PlanBaseLineCompareInfo extends Component {
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
        calendarId: calendarId || this.props.form.getFieldValue("secondCalendarId"),
        startTime: dataUtil.Dates().formatTimeString(this.props.form.getFieldValue("secondPlanStartTime")),
        endTime: dataUtil.Dates().formatTimeString(this.props.form.getFieldValue("secondPlanEndTime")),
        drtn: dataUtil.WorkTimes().toHour(this.props.form.getFieldValue("secondPlanDrtn"), this.state.projSet.drtnUnit, this.state._workTime.calendar),
        opeType: opeType
      }
      if (param.calendarId && (param.startTime || param.endTime || param.drtn)) {
        axios.post(caculateWorkHour, param).then(res => {
          const data = res.data.data || {};
          const workTime = {calendar: data.calendar, planStartTime: data.startTime, planEndTime: data.endTime, planDrtn: data.drtn, planQty: data.drtn};
          this.props.form.setFieldsValue({["secondPlanStartTime"]: dataUtil.Dates().formatTimeMonent(workTime.planStartTime)});
          this.props.form.setFieldsValue({["secondPlanEndTime"]: dataUtil.Dates().formatTimeMonent(workTime.planEndTime)});
          this.props.form.setFieldsValue({["secondPlanDrtn"]: dataUtil.WorkTimes().hourTo(workTime.planDrtn, this.state.projSet.drtnUnit, workTime.calendar)});
          this.props.form.setFieldsValue({["secondPlanQty"]: dataUtil.WorkTimes().hourTo(workTime.planQty, this.state.projSet.timeUnit, workTime.calendar)});
          this.setState({_workTime: workTime, runnDone: true}) //标识计算完成
        })
      }
    }
  
    //开始(修改)+工期=完成
    caculateByStartTime = (status) => {
      if (status) {
        return; //只有关闭时才调用
      }
      const dateStart = dataUtil.Dates().formatTimeString(this.props.form.getFieldValue("secondPlanStartTime"));
      if (dateStart && this.state._workTime.planStartTime != dateStart) {
        this.caculateStartOrEndOrDrtn("StartTime");
      }
    }
  
    //完成(修改)-开始=工期
    caculateByEndTime = () => {
      if (status) {
        return; //只有关闭时才调用
      }
      const dateEnd = dataUtil.Dates().formatTimeString(this.props.form.getFieldValue("secondPlanEndTime"));
      if (dateEnd && this.state._workTime.planEndTime != dateEnd) {
        this.caculateStartOrEndOrDrtn("EndTime");
      }
    }
  
    //完成(修改)-开始=工期
    caculateByPlanDrtn = () => {
      const planDrtn = this.props.form.getFieldValue("secondPlanDrtn");
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
      const planQty = dataUtil.WorkTimes().toHour(this.props.form.getFieldValue("secondPlanQty"), this.state.projSet.timeUnit, this.state._workTime.calendar);
      if (this.state._workTime.planQty != planQty) {
        let _workTime = this.state._workTime;
        _workTime.planQty = planQty;
        this.setState({ _workTime: _workTime, runnDone: true});
      }
    }
  
    componentDidMount() {
      const {rightData} = this.props
      let planTaskTypeList = []
      if (rightData) {
        if(rightData['taskType'] == '1' || rightData['taskType'] == '4' || rightData['taskType'] == 0){
          planTaskTypeList = [{value: 1, title: '作业任务'}, {value: 4, title: '资源任务'}]
        } else if(rightData['taskType'] == '2'){
          planTaskTypeList = [{value: 2, title: '开始里程碑'}]
        } else if(rightData['taskType'] == '3'){
          planTaskTypeList = [{value: 3, title: '完成里程碑'}]
        }
      }
      axios.get(getvariable(this.props.projectId)).then(res => {
        const data = res.data.data || {};
        const projSet = {
            dateFormat: (data.dateFormat || {}).id || "YYYY-MM-DD",
            drtnUnit: (data.drtnUnit || {}).id || "h",
            timeUnit: (data.timeUnit || {}).id || "h",
            precision: data.precision || 2,
            moneyUnit: (data.currency || {}).symbol || "¥",
          }
        this.getWbsOrTaskInfo(planTaskTypeList, projSet)
      })
    }
  
    // 根据id获取信息
    getWbsOrTaskInfo = (planTaskTypeList, projSet) => {
      const {rightData} = this.props
      if (rightData && rightData.taskType != 'plan' && rightData.taskType != 'project') {
        axios.get(getPlanBaseLineCompareInfo(this.props.rightData.id,this.props.firstBaseLine,this.props.secondBaseLine)).then(res => {
          const {data} = res.data
          let {secondPlanDrtn, firstPlanDrtn, secondPlanQty, firstPlanQty} = data;
          const workTime = {...data, planStartTime: data.secondPlanStartTime, planEndTime: data.secondPlanEndTime, planDrtn: data.secondPlanDrtn, planQty: data.secondPlanQty, calendar: data.firstCalendar ? data.firstCalendar : data.secondCalendar};
          secondPlanDrtn = dataUtil.WorkTimes().hourTo(secondPlanDrtn, projSet.drtnUnit, workTime.calendar);
          firstPlanDrtn = dataUtil.WorkTimes().hourTo(firstPlanDrtn, projSet.drtnUnit, workTime.calendar);
          secondPlanQty = dataUtil.WorkTimes().hourTo(secondPlanQty, projSet.timeUnit, workTime.calendar);
          firstPlanQty = dataUtil.WorkTimes().hourTo(firstPlanQty, projSet.timeUnit, workTime.calendar);
          this.setState({
            projSet: projSet,
            _workTime: workTime,
            planTaskTypeList: planTaskTypeList,
            info: {...data},
            secondPlanDrtn:secondPlanDrtn,
            firstPlanDrtn:firstPlanDrtn,
            secondPlanQty:secondPlanQty,
            firstPlanQty:firstPlanQty
            
          })
          if(res.data.data.secondOrg){
            this.defineOrgUserList(res.data.data.secondOrg.id);
          }
        })
      } 
    }
  
    handleSubmit = (e) => {
      const that = this
      if(this.state.runnDone){
        e.preventDefault();
        this.props.form.validateFieldsAndScroll((err, values) => {
          if (!err) {
            const {info} = this.state
            const data = {
              ...info,
              ...values,
              secondWbsFeedBack: values.secondWbsFeedBack ? 1 : 0,
              secondControlAccount: values.secondControlAccount ? 1 : 0,
              secondPlanStartTime: dataUtil.Dates().formatTimeString(values['secondPlanStartTime']),
              secondPlanEndTime: dataUtil.Dates().formatTimeString(values['secondPlanEndTime']),
              secondPlanDrtn: this.state._workTime.planDrtn || 0,
              secondPlanQty: this.state._workTime.planQty || 0,
              firstPlanDrtn: this.state._workTime.firstPlanDrtn,
              firstPlanQty: this.state._workTime.firstPlanQty,
              firstOrgId: info.firstOrg ? info.firstOrg.id : '',
              firstUserId: info.firstUser ? info.firstUser.id : '',
              firstCalendarId: info.firstCalendar ? info.firstCalendar.id : '',
              firstPlanType: info.firstPlanType ? info.firstPlanType.id : '',
              firstPlanLevel: info.firstPlanLevel ? info.firstPlanLevel.id : '',
              firstTaskDrtnType: info.firstTaskDrtnType ? info.firstTaskDrtnType.id : '',
              firstWbsFeedBack: values.firstWbsFeedBack ? 1 : 0,
              firstControlAccount: values.firstControlAccount ? 1 : 0,
              firstPlanStartTime: dataUtil.Dates().formatTimeString(values['firstPlanStartTime']),
              firstPlanEndTime: dataUtil.Dates().formatTimeString(values['firstPlanEndTime']),
              parentType: info.parentType,
            }
            if (info.secondTaskType == 0) {
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
            planTypeList: data
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
        axios.get(defineOrgTree(this.props.projectId)).then(res => {
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
        const { intl } = this.props.currentLocale;
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
      const rightData = this.props.rightData
      const delChange = this.state.info.changeType && this.state.info.changeType.id == 'DEL'
      const {projSet, info} = this.state
      return (
        <div className={style.main}>
          <h3 className={style.listTitle}>基本信息</h3>
          <div className={style.mainScorll}>
            <div className={style.content}>
              <Row type="flex">
                <Col span={12}>
                <h4>{this.props.firstBaseLineName ? this.props.firstBaseLineName : '执行计划'}</h4>
                  <Form onSubmit={this.handleSubmit}>
                    <Form.Item label={intl.get('wsd.i18n.plan.plandefine.planname')} {...formItemLayout}>
                      {getFieldDecorator('firstTaskName', {
                        initialValue: info.firstTaskName || '',
                        rules: [{
                           required: false,
                          message: intl.get('wsd.i18n.message.enter') + intl.get('wsd.i18n.plan.plandefine.planname'),
                        }],
                      })(
                        <Input maxLength={82} disabled/>
                      )}
                    </Form.Item>
                    <Form.Item label={intl.get('wsd.i18n.plan.plandefine.orgname')} {...formItemLayout}>
                      {getFieldDecorator('firstOrgId', {
                        initialValue: info.firstOrg ? info.firstOrg.id : '',
                        rules: [
                          {
                             required: false,
                            message: intl.get('wsd.i18n.message.select') + intl.get('wsd.i18n.plan.plandefine.orgname'),
                          }
                        ],
                      })(
                        <TreeSelect
                          dropdownStyle={{maxHeight: 400, overflow: 'auto'}}
                          treeData={this.state.orgTree.length > 0 ? this.state.orgTree : (info.firstOrg && [{value: info.firstOrg.id, title: info.firstOrg.name}])}
                          placehfirster="请选择"
                          treeDefaultExpandAll
                          disabled
                          onChange={this.changeDefineOrg}
                          onFocus={this.onDefineOrgTree}
                        />
                      )}
                    </Form.Item>
                    <Form.Item label={intl.get('wsd.i18n.plan.plandefine.username')} {...formItemLayout}>
                      {getFieldDecorator('firstUserId', {
                        initialValue: info.firstUser ? info.firstUser.id : '',
                        rules: [],
                      })(
                        <Select disabled >
                          {this.state.orgUserList.length ? this.state.orgUserList.map(item => {
                            return (
                              <Option key={item.id} value={item.id}> {item.title} </Option>
                            )
                          }) : info.firstUser &&
                            <Option key={info.firstUser.id} value={info.firstUser.id}> {info.firstUser.name} </Option>
                          }
                        </Select>
                      )}
                    </Form.Item>
                    <Form.Item label="日历" {...formItemLayout}>
                      {getFieldDecorator('firstCalendarId', {
                        initialValue: info.firstCalendar ? info.firstCalendar.id : '',
                        rules: [{
                           required: false,
                          message: intl.get('wsd.i18n.message.select') + intl.get('wsd.i18n.pre.epsInfo.calnid'),
                        }],
                      })(
                        <Select onDropdownVisibleChange={this.getCalendarList} onChange={this.caculateByCalendar} disabled >
                          {this.state.calendarList ? this.state.calendarList.map(item => {
                            return <Option value={item.id} key={item.id}>{item.calName}</Option>
                          }) : info.firstCalendar &&
                            <Option key={info.firstCalendar.id} value={info.firstCalendar.id}> {info.firstCalendar.calName} </Option>
                          }
                        </Select>
                      )}
                    </Form.Item>
  
                    {(rightData.taskType != 3) && <div>
                      <Form.Item label={intl.get('wsd.i18n.plan.plandefine.planstarttime')} {...formItemLayout}>
                        {getFieldDecorator('firstPlanStartTime', {
                          initialValue: dataUtil.Dates().formatTimeMonent(info.firstPlanStartTime),
                          rules: [{
                            required: false,
                            message: intl.get('wsd.i18n.message.select') + intl.get('wsd.i18n.plan.plandefine.planstarttime'),
                          }],
                        })(
                          <DatePicker style={{width: "100%"}} format={projSet.dateFormat}
                                      showTime={{format: 'HH:mm', defaultValue: moment('00:00:00', 'HH:mm:ss')}}
                                      disabledDate={(current) => dataUtil.Dates().disabledMaxDate(current, this.props.form.getFieldValue("planEndTime"))}
                                      disabledTime={(current) => dataUtil.Dates().disabledMaxDateTime(current, this.props.form.getFieldValue("planEndTime"))}
                                      disabled={true}
                                      onChangetrue={this.startCaculate}
                                      onOpenChange={this.caculateByStartTime}
                          />
                        )}
                      </Form.Item>
                    </div>}
  
                    {(rightData.taskType != 2) && <div>
                      <Form.Item label={intl.get('wsd.i18n.plan.plandefine.planendtime')} {...formItemLayout}>
                        {getFieldDecorator('firstPlanEndTime', {
                          initialValue: dataUtil.Dates().formatTimeMonent(info.firstPlanEndTime),
                          rules: [{
                            required:false,
                            message: intl.get('wsd.i18n.message.select') + intl.get('wsd.i18n.plan.plandefine.planendtime'),
                          }],
                        })(
                          <DatePicker style={{width: "100%"}} format={projSet.dateFormat}
                                      showTime={{format: 'HH:mm', defaultValue: moment('00:00:00', 'HH:mm:ss')}}
                                      disabledDate={(current) => dataUtil.Dates().disabledMinDate(current, this.props.form.getFieldValue("planStartTime"))}
                                      disabledTime={(current) => dataUtil.Dates().disabledMinDateTime(current, this.props.form.getFieldValue("planStartTime"))}
                                      disabled={true}
                                      onChange={this.startCaculate}
                                      onOpenChange={this.caculateByEndTime}
                          />
                        )}
                      </Form.Item>
                    </div>}
  
                    {(rightData.taskType == 0 || rightData.taskType == 1 || rightData.taskType == 4) && <div>
                      <Form.Item label="计划工期" {...formItemLayout}>
                        {getFieldDecorator('firstPlanDrtn', {
                          initialValue: this.state.firstPlanDrtn,
                          rules: [{
                             required: false,
                            message: '请输入计划工期',
                          }],
                        })(
                          <InputNumber style={{width: '100%'}} max={999999999999} min={0} precision={projSet.precision}
                                       formatter={value => `${value}` + projSet.drtnUnit}
                                       parser={value => value.replace(projSet.drtnUnit, '')}
                                       disabled={true}
                                       onChange={this.startCaculate}
                                       onBlur={this.caculateByPlanDrtn}
                          />
                        )}
                      </Form.Item>
                      <Form.Item label="计划工时" {...formItemLayout}>
                        {getFieldDecorator('firstPlanQty', {
                          initialValue: this.state.firstPlanQty,
                          rules: [{
                             required: false,
                            message: '请输入计划工时',
                          }],
                        })(
                          <InputNumber style={{width: '100%'}} max={999999999999} min={0} precision={projSet.precision}
                                       formatter={value => `${value}` + projSet.timeUnit}
                                       parser={value => value.replace(projSet.timeUnit, '')}
                                       disabled={true}
                                       onChange={this.startCaculate}
                                       onBlur={this.caculateByPlanQty}
                          />
                        )}
                      </Form.Item>
                    </div>}
  
                    <Form.Item label="计划类型" {...formItemLayout}>
                      {getFieldDecorator('firstPlanType', {
                        initialValue: info.firstPlanType ? info.firstPlanType.id : '',
                        rules: [],
                      })(
                        <Select disabled  onFocus={() => {
                          !this.state.planTypeList && this.getBaseSelectTree('plan.define.plantype')
                        }}>
                          {
                            this.state.planTypeList ? this.state.planTypeList.map((v, i) => {
                              return <Option value={v.value} key={i}>{v.title}</Option>
                            }) : info.firstPlanType &&
                              <Option key={info.firstPlanType.id} value={info.firstPlanType.id}> {info.firstPlanType.name} </Option>
                          }
                        </Select>
                      )}
                    </Form.Item>
                    <Form.Item label="计划级别" {...formItemLayout}>
                      {getFieldDecorator('firstPlanLevel', {
                        initialValue: info.firstPlanLevel ? info.firstPlanLevel.id : '',
                        rules: [],
                      })(
                        <Select disabled  onFocus={() => {
                          !this.state.planLevelList && this.getBaseSelectTree('plan.task.planlevel')
                        }}>
                          {
                            this.state.planLevelList ? this.state.planLevelList.map((v, i) => {
                              return <Option value={v.value} key={i}>{v.title}</Option>
                            }) : info.firstPlanLevel &&
                            <Option key={info.firstPlanLevel.id} value={info.firstPlanLevel.id}> {info.firstPlanLevel.name} </Option>
                          }
                        </Select>
                      )}
                    </Form.Item>
  
                    {(rightData.taskType == 1 || rightData.taskType == 4) && <div>
                      <Form.Item label="作业类型" {...formItemLayout}>
                        {getFieldDecorator('firstTaskType', {
                          initialValue: info.firstTaskType ? info.firstTaskType : '',
                          rules: [],
                        })(
                          <Select disabled >
                            {
                              this.state.planTaskTypeList && this.state.planTaskTypeList.map((v, i) => {
                                return <Option value={v.value} key={i}>{v.title}</Option>
                              })
                            }
                          </Select>
                        )}
                      </Form.Item>
                      <Form.Item label="工期类型" {...formItemLayout}>
                        {getFieldDecorator('firstTaskDrtnType', {
                          initialValue: info.firstTaskDrtnType ? info.firstTaskDrtnType.id : '',
                          rules: [],
                        })(
                          <Select disabled  onFocus={() => {
                            !this.state.planTaskDrtnTypeList && this.getBaseSelectTree('plan.project.taskdrtntype')
                          }}>
                            {
                              this.state.planTaskDrtnTypeList ? this.state.planTaskDrtnTypeList.map((v, i) => {
                                return <Option value={v.value} key={i}>{v.title}</Option>
                              }) : info.firstTaskDrtnType &&
                                <Option key={info.firstTaskDrtnType.id} value={info.firstTaskDrtnType.id}> {info.firstTaskDrtnType.name} </Option>
                            }
                          </Select>
                        )}
                      </Form.Item>
                    </div>}
  
                    {rightData.nodeType == 'wbs' && <Row>
                      <Col span={12}>
                        <Form.Item label={intl.get('wsd.i18n.base.planTemAddWBS.iswbsfb')} {...formItemLayout2}>
                          {getFieldDecorator('firstWbsFeedBack', {
                            initialValue: info.firstWbsFeedBack == 1 ? true : false,
                            valuePropName: 'checked',
                          })(
                            <Switch disabled  checkedChildren="开" unCheckedChildren="关"/>
                          )}
                        </Form.Item>
                      </Col>
                      <Col span={12}>
                        <Form.Item
                          label={intl.get('wsd.i18n.base.planTemAddWBS.isctrl')} {...formItemLayout2}>
                          {getFieldDecorator('firstControlAccount', {
                            initialValue: info.firstControlAccount == 1 ? true : false,
                            valuePropName: 'checked',
                          })(
                            <Switch disabled  checkedChildren="开" unCheckedChildren="关"/>
                          )}
                        </Form.Item>
                      </Col>
                    </Row>}
  
                    <Form.Item label={intl.get('wsd.i18n.plan.plandefine.remark')} {...formItemLayout}>
                      {getFieldDecorator('firstDesc', {
                        initialValue: info.firstDesc,
                      })(
                        <TextArea disabled  maxLength={666}/>
                      )}
                    </Form.Item>

                    <div style={{paddingTop: '10px'}}>
                    <Form.Item label="比较结果" {...formItemLayout}>
                      {getFieldDecorator('compareResult', {
                        initialValue : this.props.rightData.compareResult,
                        rules: [],
                      })(
                        <Input disabled={true}/>
                      )}
                    </Form.Item>
                  </div>

                  </Form>
                </Col>
                <Col span={12}>
                <h4>{this.props.secondBaseLineName ? this.props.secondBaseLineName : '执行计划'}</h4>
                  <Form>
                    <Form.Item label={intl.get('wsd.i18n.plan.plandefine.planname')} {...formItemLayout}>
                      {getFieldDecorator('secondTaskName', {
                        initialValue: info.secondTaskName,
                        rules: [{
                          message: intl.get('wsd.i18n.message.enter') + intl.get('wsd.i18n.plan.plandefine.planname'),
                        }],
                      })(
                        <Input disabled={true}/>
                      )}
                    </Form.Item>
                    <Form.Item label={intl.get('wsd.i18n.plan.plandefine.orgname')} {...formItemLayout}>
                      {getFieldDecorator('secondOrg', {
                        initialValue: info.secondOrg ? info.secondOrg.name : '',
                        rules: [],
                      })(
                        <Input disabled={true}/>
                      )}
                    </Form.Item>
                    <Form.Item label={intl.get('wsd.i18n.plan.plandefine.username')} {...formItemLayout}>
                      {getFieldDecorator('secondUser', {
                        initialValue: info.secondUser ? info.secondUser.name : '',
                        rules: [],
                      })(
                        <Input disabled={true}/>
                      )}
                    </Form.Item>
                    <Form.Item label="日历" {...formItemLayout}>
                      {getFieldDecorator('secondCalendar', {
                        initialValue: info.secondCalendar ? info.secondCalendar.calName : '',
                        rules: [{
                          message: intl.get('wsd.i18n.message.enter') + intl.get('wsd.i18n.pre.epsInfo.calnid'),
                        }],
                      })(
                        <Input disabled={true}/>
                      )}
                    </Form.Item>
  
                    {(rightData.taskType != 3) && <div>
                      <Form.Item label={intl.get('wsd.i18n.plan.plandefine.planstarttime')} {...formItemLayout}>
                        {getFieldDecorator('secondPlanStartTime', {
                          initialValue: info.secondPlanStartTime ? dataUtil.Dates().formatTimeMonent(info.secondPlanStartTime) : null,
                          rules: [],
                        })(
                          <DatePicker style={{width: "100%"}} format={projSet.dateFormat} disabled={true}/>
                        )}
                      </Form.Item>
                    </div>}
  
                    {(rightData.taskType != 2) && <div>
                      <Form.Item label={intl.get('wsd.i18n.plan.plandefine.planendtime')} {...formItemLayout}>
                        {getFieldDecorator('secondPlanEndTime', {
                          initialValue: info.secondPlanEndTime ? dataUtil.Dates().formatTimeMonent(info.secondPlanEndTime) : null,
                          rules: [],
                        })(
                          <DatePicker style={{width: "100%"}} format={projSet.dateFormat} disabled={true}/>
                        )}
                      </Form.Item>
                    </div>}
  
                    {(rightData.taskType == 0 || rightData.taskType == 1 || rightData.taskType == 4) && <div>
                      <Form.Item label="计划工期" {...formItemLayout}>
                        {getFieldDecorator('secondPlanDrtn', {
                          initialValue: this.state.secondPlanDrtn,
                          rules: [],
                        })(
                          <InputNumber style={{width: '100%'}} max={999999999999} min={0} precision={projSet.precision}
                                       formatter={value => `${value}` + projSet.drtnUnit}
                                       parser={value => value.replace(projSet.drtnUnit, '')}
                                       disabled={true}/>
                        )}
                      </Form.Item>
                      <Form.Item label="计划工时" {...formItemLayout}>
                        {getFieldDecorator('secondPlanQty', {
                          initialValue: this.state.secondPlanQty,
                          rules: [],
                        })(
                          <InputNumber style={{width: '100%'}} max={999999999999} min={0} precision={projSet.precision}
                                       formatter={value => `${value}` + projSet.timeUnit}
                                       parser={value => value.replace(projSet.timeUnit, '')}
                                       disabled={true}/>
                        )}
                      </Form.Item>
                    </div>}
  
                    <Form.Item label="计划类型" {...formItemLayout}>
                      {getFieldDecorator('secondPlanType', {
                        initialValue: info.secondPlanType ? info.secondPlanType.name : '',
                        rules: [],
                      })(
                        <Input disabled={true}/>
                      )}
                    </Form.Item>
                    <Form.Item label="计划级别" {...formItemLayout}>
                      {getFieldDecorator('secondPlanLevel', {
                        initialValue: info.secondPlanLevel ? info.secondPlanLevel.name : '',
                        rules: [],
                      })(
                        <Input disabled={true}/>
                      )}
                    </Form.Item>
  
                    {(rightData.taskType == 1 || rightData.taskType == 4) && <div>
                      <Form.Item label="作业类型" {...formItemLayout}>
                        {getFieldDecorator('secondTaskType', {
                          initialValue: info.secondTaskType,
                          rules: [],
                        })(
                          <Select disabled={true}>
                            {
                              this.state.planTaskTypeList && this.state.planTaskTypeList.map((v, i) => {
                                return <Option value={v.value} key={i}>{v.title}</Option>
                              })
                            }
                          </Select>
                        )}
                      </Form.Item>
                      <Form.Item label="工期类型" {...formItemLayout}>
                        {getFieldDecorator('secondTaskDrtnType', {
                          initialValue: info.secondTaskDrtnType ? info.secondTaskDrtnType.name : '',
                          rules: [],
                        })(
                          <Input disabled={true}/>
                        )}
                      </Form.Item>
                    </div>}
  
                    {rightData.nodeType == 'wbs' && <Row>
                      <Col span={12}>
                        <Form.Item label={intl.get('wsd.i18n.base.planTemAddWBS.iswbsfb')} {...formItemLayout2}>
                          {getFieldDecorator('secondWbsFeedBack', {
                            initialValue: info.secondWbsFeedBack == 1 ? true : false,
                            valuePropName: 'checked',
                          })(
                            <Switch checkedChildren="开" unCheckedChildren="关" disabled={true}/>
                          )}
                        </Form.Item>
                      </Col>
                      <Col span={12}>
                        <Form.Item
                          label={intl.get('wsd.i18n.base.planTemAddWBS.isctrl')} {...formItemLayout2}>
                          {getFieldDecorator('secondControlAccount', {
                            initialValue: info.secondControlAccount == 1 ? true : false,
                            valuePropName: 'checked',
                          })(
                            <Switch checkedChildren="开" unCheckedChildren="关" disabled={true}/>
                          )}
                        </Form.Item>
                      </Col>
                    </Row>}
  
                    <Form.Item label={intl.get('wsd.i18n.plan.plandefine.remark')} {...formItemLayout}>
                      {getFieldDecorator('secondDesc', {
                        initialValue: info.secondDesc,
                      })(
                        <TextArea disabled={true}/>
                      )}
                    </Form.Item>
                  </Form>
                </Col>
              </Row>
            </div>
          </div>
        </div>
      )
    }
  }
  
  const PlanBaseLineCompareInfos = Form.create()(PlanBaseLineCompareInfo)
  export default connect(state => ({
    currentLocale: state.localeProviderData
}))(PlanBaseLineCompareInfos)
  
