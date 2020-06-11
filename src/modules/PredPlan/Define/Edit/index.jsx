import React, { Component } from 'react'
import style from './style.less'
import moment from 'moment'
import { Form, Row, Col, Input, Button, Icon, Select, DatePicker, Switch, Slider, InputNumber, TreeSelect } from 'antd';
import LabelFormLayout from "../../../../components/public/Layout/Labels/Form/LabelFormLayout"
import LabelFormButton from "../../../../components/public/Layout/Labels/Form/LabelFormButton"
import { connect } from 'react-redux'
import axios from '../../../../api/axios';
import {
  defineOrgTree,
  defineOrgUserList,
  defineInfo,
  getdictTree,
  defineUpdate,
  calendarList,
  caculateWorkHour,
  getvariable, planPrepa,
} from '../../../../api/api';
import { querySectionTreeList2, defineInfo_, defineUpdate_ } from '../../../../api/suzhou-api'
import * as dataUtil from "../../../../utils/dataUtil"

const FormItem = Form.Item;
const Option = Select.Option
const { TextArea } = Input;

class MenuInfo extends Component {
  constructor(props) {
    super(props)
    this.state = {
      info: {},                        //基本信息
      inputValue: 1,                      //权重
      orgTree: [],
      sectionTree: [],
      projSet: { dateFormat: 'YYYY-MM-DD', drtnUnit: 'h', timeUnit: 'h', precision: 2, moneyUnit: '¥' },
      _workTime: {},
      runnDone: true, //是否计算完成
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
        const workTime = { calendar: data.calendar, planStartTime: data.startTime, planEndTime: data.endTime, planDrtn: data.drtn };
        this.props.form.setFieldsValue({ ["planStartTime"]: dataUtil.Dates().formatTimeMonent(workTime.planStartTime) });
        this.props.form.setFieldsValue({ ["planEndTime"]: dataUtil.Dates().formatTimeMonent(workTime.planEndTime) });
        this.props.form.setFieldsValue({ ["planDrtn"]: dataUtil.WorkTimes().hourTo(workTime.planDrtn, this.state.projSet.drtnUnit, workTime.calendar) });
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

  getData = (projSet) => {
    axios.get(defineInfo_(this.props.data.id)).then(res => {
      const { data } = res.data
      const planDrtn = dataUtil.WorkTimes().hourTo(data.planDrtn, projSet.drtnUnit, data.calendar);
      this.setState({
        projSet,
        _workTime: { ...data },
        info: { ...data, planDrtn: planDrtn },
        planCode:data.planCode

      }, () => {
        // this.treeSelectChange(res.data.data.org.id)
        if (data.org && data.org.id) {
          axios.get(defineOrgUserList(data.org.id)).then(res => {
            this.setState({
              orgUserList: res.data.data
            })
          })
        }
      })
    })
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

  getProjSetInfo = (e) => {
    axios.get(getvariable(this.props.data.projectId)).then(res => {
      const data = res.data.data || {};
      const projSet = {
        dateFormat: (data.dateFormat || {}).id || "YYYY-MM-DD",
        drtnUnit: (data.drtnUnit || {}).id || "h",
        timeUnit: (data.timeUnit || {}).id || "h",
        precision: data.precision || 2,
        moneyUnit: (data.currency || {}).symbol || "¥",
      }
      this.getData(projSet);
    })
  }

  componentDidMount() {
    this.planTypeSelect();
    this.treeSelect();
    this.getProjSetInfo();
    this.sectionSelect();
    // this.setState({
    //     info: this.props.data
    // })
  }

  handleSubmit = (e) => {
    const that = this
    if (this.state.runnDone) {
      e.preventDefault();
      this.props.form.validateFieldsAndScroll((err, values) => {
        if (!err) {
          let status = this.state.info.status
          let data = {
            ...values,
            planStartTime: dataUtil.Dates().formatTimeString(values.planStartTime),
            planEndTime: dataUtil.Dates().formatTimeString(values.planEndTime),
            planDrtn: this.state._workTime.planDrtn,
            creatTime: dataUtil.Dates().formatTimeString(values.creatTime),
            calcDate: dataUtil.Dates().formatTimeString(values.calcDate),
            id: this.props.data.id,
            isMainPlan: values['isMainPlan'] ? 1 : 0,
            planCode : this.state.planCode,
            status:values['status'] ? values['status'] : status.id
          }
          let url = dataUtil.spliceUrlParams(defineUpdate_, { "startContent": "项目【" + this.props.projectName + "】" });
          axios.put(url, data, true, null, true).then(res => {
            this.props.upDate(res.data.data)
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
    });
  }

  treeSelect = () => {
    if (this.state.orgTree.length === 0) {
      axios.get(defineOrgTree(this.props.projectId), {}, null, null, false).then(res => {
        this.setState({
          orgTree: res.data.data,
        })
      })
    }
  }

  treeSelectChange = (val) => {

    if (val) {
      axios.get(defineOrgUserList(val), {}, null, null, false).then(res => {

        this.setState({
          orgUserList: res.data.data
        })
      })
    }
  }

  sectionSelect = () => {
    axios.get(querySectionTreeList2(this.props.projectId)).then(res => {
      this.setState({
        sectionTree: res.data.data
      })
    })
  }

  sectionChange = (e, y) => {
    this.props.form.setFieldsValue({ planName: y[0] + "前期计划" })
  }
  planTypeSelect = () => {
    axios.get(getdictTree('plan.define.plantype'), {}, null, null, false).then(res => {
      this.setState({
        planTypeList: [{ value: "1", title: "前期计划" }]
      })
    })
    axios.get(getdictTree('plan.project.status'), {}, null, null, false).then(res => {
      this.setState({
        statusList: res.data.data
      })
    })
  }

  render() {
    const { intl } = this.props.currentLocale;
    const {
      getFieldDecorator, getFieldsError, getFieldError, isFieldTouched
    } = this.props.form;
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
    const dateWidth = '100%'
    return (
      <LabelFormLayout title={this.props.title || "基本信息"} >
        <Form onSubmit={this.handleSubmit}>
          <Row type="flex">
            <Col span={12}>
              <Form.Item label={intl.get('wsd.i18n.plan.plandefine.planname')} {...formItemLayout}>
                {getFieldDecorator('planName', {
                  initialValue: this.state.info.planName,
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
              <Form.Item label={"所属标段"} {...formItemLayout}>
                <div className={style.list}>
                  {getFieldDecorator('section', {
                    initialValue: this.state.info.section ? this.state.info.section.id : '',
                    rules: [{
                      required: true,
                      message: intl.get('wsd.i18n.message.enter') + intl.get('wsd.i18n.plan.plandefine.section'),
                    }],
                  })(
                    <TreeSelect
		      allowClear
                      showSearch
                      treeNodeFilterProp="title"
                      dropdownStyle={{ maxHeight: 400, overflow: 'auto' }}
                      treeData={this.state.sectionTree.length == 0 ? this.state.info.section ? [{ value: this.state.info.section.id, title: this.state.info.section.name }] : [] : this.state.sectionTree}
                      placeholder="请选择"
                      treeDefaultExpandAll
                      onFocus={this.sectionSelect}
                      onChange={this.sectionChange}
                    />
                  )}
                </div>
              </Form.Item>
            </Col>
          </Row>
          <Row>
            <Col span={12}>
              <Form.Item label={intl.get('wsd.i18n.plan.plandefine.orgname')} {...formItemLayout}>
                {getFieldDecorator('orgId', {
                  initialValue: this.state.info.org ? this.state.info.org.id : '',
                  rules: [{
                    required: true,
                    message: intl.get('wsd.i18n.message.select') + intl.get('wsd.i18n.plan.plandefine.orgname'),
                  }],
                })(
                  <TreeSelect
                    allowClear
                    showSearch
                    treeNodeFilterProp="title"
                    dropdownStyle={{ maxHeight: 400, overflow: 'auto' }}
                    treeData={this.state.orgTree.length ? this.state.orgTree : (this.state.info.org && [{ value: this.state.info.org.id, title: this.state.info.org.name }])}
                    treeDefaultExpandAll
                    onFocus={this.treeSelect}
                    onChange={this.treeSelectChange}
                  />
                )}
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label={intl.get('wsd.i18n.plan.plandefine.username')} {...formItemLayout}>
                {getFieldDecorator('userId', {
                  initialValue: this.state.info.user ? this.state.info.user.id : null,
                  rules: [],
                })(
                  <Select
                    allowClear
                    showSearch
                    optionFilterProp="children"
                    filterOption={(input, option) => option.props.children[1].toLowerCase().indexOf(input.toLowerCase()) >= 0}>
                    {this.state.orgUserList ? this.state.orgUserList.map(item => {
                      return (
                        <Select.Option key={item.id} value={item.id}> {item.title} </Select.Option>
                      )
                    }) : this.state.info.user &&
                      <Select.Option key={this.state.info.user.id} value={this.state.info.user.id}> {this.state.info.user.name} </Select.Option>
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
                    required: true,
                    message: intl.get('wsd.i18n.message.select') + intl.get('wsd.i18n.plan.plandefine.planstarttime'),
                  }],
                })(
                  <DatePicker style={{ width: "100%" }} format={this.state.projSet.dateFormat}
                    showTime={{ format: 'HH:mm', defaultValue: moment('00:00:00', 'HH:mm:ss') }}
                    disabledDate={(current) => dataUtil.Dates().disabledMaxDate(current, this.props.form.getFieldValue("planEndTime"))}
                    disabledTime={(current) => dataUtil.Dates().disabledMaxDateTime(current, this.props.form.getFieldValue("planEndTime"))}
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
                    required: true,
                    message: intl.get('wsd.i18n.message.select') + intl.get('wsd.i18n.plan.plandefine.planendtime'),
                  }],
                })(
                  <DatePicker style={{ width: "100%" }} format={this.state.projSet.dateFormat}
                    showTime={{ format: 'HH:mm', defaultValue: moment('00:00:00', 'HH:mm:ss') }}
                    disabledDate={(current) => dataUtil.Dates().disabledMinDate(current, this.props.form.getFieldValue("planStartTime"))}
                    disabledTime={(current) => dataUtil.Dates().disabledMinDateTime(current, this.props.form.getFieldValue("planStartTime"))}
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
                    message: intl.get('wsd.i18n.message.select') + "日历",
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
              <Form.Item label={intl.get('wsd.i18n.plan.plandefine.plantype')} {...formItemLayout}>
                {getFieldDecorator('planType', {
                  initialValue: this.state.info.planType ? this.state.info.planType.id : '',
                  rules: [],
                })(
                  <Select onFocus={this.planTypeSelect}>
                    {this.state.planTypeList && this.state.planTypeList.map(item => {
                      return (
                        <Select.Option key={item.value} value={item.value}>{item.title}</Select.Option>
                      )
                    })}
                  </Select>
                )}
              </Form.Item>
            </Col>
          </Row>
          <Row>
            <Col span={12}>
              <Form.Item label="预计工期" {...formItemLayout}>
                {/* 预计工期 */}
                {getFieldDecorator('planDrtn', {
                  initialValue: this.state.info.planDrtn,
                  rules: [{
                    required: true,
                    message: intl.get('wsd.i18n.message.enter') + "预计工期",
                  }],
                })(
                  <InputNumber style={{ width: "100%" }} max={999999999999} min={0} precision={this.state.projSet.precision}
                    formatter={value => `${value}` + this.state.projSet.drtnUnit}
                    parser={value => value.replace(this.state.projSet.drtnUnit, '')}
                    onChange={this.startCaculate}
                    onBlur={this.caculateByPlanDrtn}
                  />
                )}
              </Form.Item>
            </Col>
            {/*<Col span={12}>
              <Form.Item label={intl.get('wsd.i18n.plan.define.isMainPlan')} {...formItemLayout}>
                {getFieldDecorator('isMainPlan', {
                  initialValue: this.state.info.isMainPlan ? true : false,
                  valuePropName: 'checked',
                  rules: [],
                })(
                  <Switch checkedChildren="开" unCheckedChildren="关" />
                )}
              </Form.Item>
            </Col>*/}
          </Row>
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
              <Form.Item label={intl.get('wsd.i18n.plan.plandefine.creator')} {...formItemLayout}>
                {getFieldDecorator('creator', {
                  initialValue: this.state.info.creator ? this.state.info.creator.name : null,
                  rules: [],
                })(
                  <Input disabled={true} />
                )}
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label={intl.get('wsd.i18n.plan.plandefine.creattime')} {...formItemLayout}>
                {getFieldDecorator('creatTime', {
                  initialValue: dataUtil.Dates().formatTimeMonent(this.state.info.creatTime),
                  rules: [],
                })(
                  <DatePicker disabled style={{ width: dateWidth }} format="YYYY-MM-DD HH:mm:ss" />
                )}
              </Form.Item>
            </Col>
          </Row>
        </Form>
        <LabelFormButton>
          <Button onClick={this.props.closeRightBox} style={{ width: "100px", marginRight: "20px" }}>取消</Button>
          <Button onClick={this.handleSubmit} style={{ width: "100px" }} type="primary">保存</Button>
        </LabelFormButton>
      </LabelFormLayout>
    )
  }
}

const MenuInfos = Form.create()(MenuInfo);
export default connect(state => ({
  currentLocale: state.localeProviderData
}))(MenuInfos);
