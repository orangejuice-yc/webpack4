import React, { Component } from 'react'
import { Modal, Form, Row, Col, Input, Button, Icon, Select, DatePicker, Slider, InputNumber, Switch, TreeSelect } from 'antd';
import moment from 'moment'
import style from './style.less'

import { connect } from 'react-redux'
import { curdCurrentData } from '../../../../store/curdData/action'
import '../../../../asserts/antd-custom.less'
import SubmitButton from "../../../../components/public/TopTags/SubmitButton"
import axios from '../../../../api/axios'
import {
  defineOrgTree,
  defineOrgUserList,
  getdictTree,
  defineAdd,
  getproInfo,
  tmplPlanSelect,
  calendarList,
  caculateWorkHour,
  getvariable, defineDel,
} from '../../../../api/api';
import { querySectionTreeList2, defineAdd_ } from '../../../../api/suzhou-api'
import * as dataUtil from "../../../../utils/dataUtil"
import * as util from '../../../../utils/treeArrayByIdAndType';

const Option = Select.Option
const FormItem = Form.Item;
const { TextArea } = Input;

export class PlanDefineAdd extends Component {
  constructor(props) {
    super(props)
    this.state = {
      modalInfo: {
        title: '新增计划'
      },
      info: {
        userId: null,
      },
      inputValue: 1,
      orgTree: [],
      planTypeList: [{value: "2", title: "专项计划"}],
      orgUserList: [],
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

  componentDidMount() {
    axios.get(getvariable(this.props.projectId)).then(res => {
      const data = res.data.data || {};
      const projSet = {
        dateFormat: (data.dateFormat || {}).id || "YYYY-MM-DD",
        drtnUnit: (data.drtnUnit || {}).id || "h",
        timeUnit: (data.timeUnit || {}).id || "h",
        precision: data.precision || 2,
        moneyUnit: (data.currency || {}).symbol || "¥",
      }
      axios.get(getproInfo(this.props.projectId)).then(res => {
        const proj = res.data.data;
        const workTime = { calendar: proj.calendar, planStartTime: proj.planStartTime, planEndTime: proj.planEndTime, planDrtn: proj.totalDrtn };
        const planDrtn = dataUtil.WorkTimes().hourTo(workTime.planDrtn, projSet.drtnUnit, workTime.calendar);
        this.setState({ projSet, _workTime: workTime, info: { ...res.data.data, ...workTime, planDrtn: planDrtn } })
      })
    })
    this.getCalendarList();
  }

  handleSubmit = (val) => {
    const that = this
    if (this.state.runnDone) {

      this.props.form.validateFieldsAndScroll((err, fieldsValue) => {
        if (!err) {
          const values = {
            ...fieldsValue,
            planStartTime: dataUtil.Dates().formatTimeString(fieldsValue.planStartTime),
            planEndTime: dataUtil.Dates().formatTimeString(fieldsValue.planEndTime),
            planDrtn: this.state._workTime.planDrtn,
            projectId: this.props.projectId,
            isMainPlan: fieldsValue['isMainPlan'] ? 1 : 0,
            planCode: new Date(),
            estWt: 1
          }

          let url = dataUtil.spliceUrlParams(defineAdd_, { "startContent": "项目【" + this.props.projectName + "】" });
          axios.post(url, values, true, null, true).then(res => {

            if (val == 'goOn') {
              // 清空表单项
              this.props.addData(res.data.data)
              this.props.form.resetFields()
            } else if (val == 'save') {
              // 关闭弹窗
              this.props.addData(res.data.data)
              this.props.handleCancel()
            }
          })
        }
      })
    } else {
      setTimeout(function () {
        that.handleSubmit(val, e)
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

  onChange = (value) => {
    this.setState({
      inputValue: value,
    });
  }

  treeSelect = () => {
    if (this.state.orgTree.length !== 0) {
      return;
    }
    axios.get(defineOrgTree(this.props.projectId), {}, null, null, false).then(res => {
      if (res.data.data) {
        this.setState({
          orgTree: res.data.data
        })
      }
    })
  }

  treeSelectChange = (val) => {

    this.props.form.setFieldsValue({ ["userId"]: null });
    if (val) {
      axios.get(defineOrgUserList(val), {}, null, null, false).then(res => {
        this.setState({
          orgUserList: res.data.data
        })
      })
    } else {
      this.setState({
        orgUserList: []
      })
    }
  }

  planTypeSelect = () => {
    // axios.get(getdictTree('plan.define.plantype'), {}, null, null, false).then(res => {
      this.setState({
        planTypeList: [{value: "2", title: "专项计划"}]
      })
    // })
  }

  sectionSelect = () => {
    axios.get(querySectionTreeList2(this.props.projectId)).then(res => {
      this.setState({
        sectionTree: res.data.data
      })
    })
  }

  sectionChange = (e,y) => {
      this.props.form.setFieldsValue({planName : y[0] + "专项计划"})
  }

  importTempPlanSelect = () => {
    axios.get(tmplPlanSelect).then(res => {
      this.setState({
        importTempPlanList: res.data.data
      })
    })
  }

  render() {
    const { intl } = this.props.currentLocale;
    let formData = {}
    /*
     * getFieldDecorator 用于和表单进行双向绑定
     * getFieldError 获取某个输入控件的 Error
     * getFieldsError 获取一组输入控件的 Error ，如不传入参数，则获取全部组件的 Error
     * getFieldsValue 获取一组输入控件的值，如不传入参数，则获取全部组件的值
     * isFieldTouched 判断一个输入控件是否经历过 getFieldDecorator 的值收集时机 options.trigger
     * getFieldValue 获取一个输入控件的值
     * isFieldsTouched 判断是否任一输入控件经历过 getFieldDecorator 的值收集时机 options.trigger
     */
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
      <div className={style.main}>
        <Modal className={style.formMain}
          width="850px" centered={true} title={this.state.modalInfo.title} visible={true} onCancel={this.props.handleCancel}
          mask={false}
          maskClosable={false}
          footer={<div className="modalbtn">
            {/* 保存并继续 */}
            <SubmitButton key="1" onClick={this.handleSubmit.bind(this, 'goOn')} content={intl.get('wsd.global.btn.saveandcontinue')} />
            {/* 保存 */}
            <SubmitButton key="2" type="primary" onClick={this.handleSubmit.bind(this, 'save')} content={intl.get('wsd.global.btn.preservation')} />
          </div>}>
          <Form onSubmit={this.handleSubmit}>
            <div className={style.content}>
              <Row type="flex">
                <Col span={12}>
                  <Form.Item label={intl.get('wsd.i18n.plan.plandefine.planname')} {...formItemLayout}>
                    <div className={style.list}>
                      {getFieldDecorator('planName', {
                        initialValue: formData.planName,
                        rules: [{
                          required: true,
                          message: intl.get('wsd.i18n.message.enter') + intl.get('wsd.i18n.plan.plandefine.planname'),
                        }],
                      })(
                        <Input maxLength={82} />
                      )}
                    </div>
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item label={"所属标段"} {...formItemLayout}>
                    <div className={style.list}>
                      {getFieldDecorator('section', {
                        initialValue: formData.section,
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
                          treeData={this.state.sectionTree}
                          placeholder="请选择"
                          treeDefaultExpandAll
                          onFocus={this.sectionSelect}
                          onChange={this.sectionChange}
                        />
                      )}
                    </div>
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item label={intl.get('wsd.i18n.plan.plandefine.orgname')} {...formItemLayout}>
                    <div className={style.list}>
                      {getFieldDecorator('orgId', {
                        initialValue: formData.orgId,
                        rules: [{
                          required: true,
                          message: intl.get('wsd.i18n.message.select') + intl.get('wsd.i18n.plan.plandefine.orgname'),
                        }],
                      })(
                        <TreeSelect
                          allowClear
                          showSearch     
                          treeNodeFilterProp="title"
                          dropdownStyle={{maxHeight: 400, overflow: 'auto'}}
                          treeData={this.state.orgTree}
                          placeholder="请选择"
                          treeDefaultExpandAll
                          onFocus={this.treeSelect}
                          onChange={this.treeSelectChange}
                        />
                      )}
                    </div>
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item label={intl.get('wsd.i18n.plan.plandefine.username')} {...formItemLayout}>
                    <div className={style.list}>
                      {getFieldDecorator('userId', {
                        initialValue: formData.userId,
                        rules: [],
                      })(
                        <Select
                        allowClear
                        showSearch
                        optionFilterProp="children"
                        filterOption={(input, option) =>  option.props.children[1].toLowerCase().indexOf(input.toLowerCase()) >= 0}
                        >
                          {this.state.orgUserList.map(item => {
                            return (
                              <Option key={item.id} value={item.id}> {item.title} </Option>
                            )
                          }) }
                        </Select>
                      )}
                    </div>
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item label={intl.get('wsd.i18n.plan.plandefine.planstarttime')} {...formItemLayout}>
                    <div className={style.list}>
                      {getFieldDecorator('planStartTime', {
                        initialValue: this.state.info.planStartTime ? dataUtil.Dates().formatTimeMonent(this.state.info.planStartTime) : null,
                        rules: [
                          {type: 'object', required: true, message: intl.get('wsd.i18n.message.select') + intl.get('wsd.i18n.plan.plandefine.planstarttime')}
                        ],
                      })(
                        <DatePicker style={{width: "100%"}} format={this.state.projSet.dateFormat}
                                    showTime={{format: 'HH:mm', defaultValue: moment('00:00:00', 'HH:mm:ss')}}
                                    disabledDate={(current) => dataUtil.Dates().disabledMaxDate(current, this.props.form.getFieldValue("planEndTime"))}
                                    disabledTime={(current) => dataUtil.Dates().disabledMaxDateTime(current, this.props.form.getFieldValue("planEndTime"))}
                                    onChange={this.startCaculate}
                                    onOpenChange={this.caculateByStartTime}
                        />
                      )}
                    </div>
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item label={intl.get('wsd.i18n.plan.plandefine.planendtime')} {...formItemLayout}>
                    <div className={style.list}>
                      {getFieldDecorator('planEndTime', {
                        initialValue: this.state.info.planEndTime ? dataUtil.Dates().formatTimeMonent(this.state.info.planEndTime) : null,
                        rules: [{
                          required: true, message: intl.get('wsd.i18n.message.select') + intl.get('wsd.i18n.plan.plandefine.planendtime'),
                        }],
                      })(
                        <DatePicker style={{width: "100%"}} format={this.state.projSet.dateFormat}
                                    showTime={{format: 'HH:mm', defaultValue: moment('00:00:00', 'HH:mm:ss')}}
                                    disabledDate={(current) => dataUtil.Dates().disabledMinDate(current, this.props.form.getFieldValue("planStartTime"))}
                                    disabledTime={(current) => dataUtil.Dates().disabledMinDateTime(current, this.props.form.getFieldValue("planStartTime"))}
                                    onChange={this.startCaculate}
                                    onOpenChange={this.caculateByEndTime}
                        />
                      )}
                    </div>
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item label={intl.get("wsd.i18n.pre.epsInfo.calnid")} {...formItemLayout}>
                    {getFieldDecorator('calendarId', {
                      initialValue: this.state.info.calendar ? this.state.info.calendar.id : null,
                      rules: [{
                        required: true,
                        message: intl.get('wsd.i18n.message.select') + intl.get('wsd.i18n.pre.epsInfo.calnid'),
                      }],
                    })(
                      <Select onChange={this.caculateByCalendar}>
                        {this.state.calendarList && this.state.calendarList.map(item => {
                          return <Option value={item.id} key={item.id}>{item.calName}</Option>
                        })}
                      </Select>
                    )}
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item label="预计工期" {...formItemLayout}>
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
                
                <Col span={12}>
                  <Form.Item label={intl.get('wsd.i18n.plan.plandefine.plantype')} {...formItemLayout}>
                    <div className={style.list}>
                      {getFieldDecorator('planType', {
                        initialValue: "2",
                        rules: [],
                      })(
                        <Select onFocus={this.planTypeSelect}>
                          {this.state.planTypeList ? this.state.planTypeList.map(item => {
                            return (
                              <Option key={item.value} value={item.value}>{item.title}</Option>
                            )
                          }) : null}
                        </Select>
                      )}
                    </div>
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item label={intl.get('wsd.i18n.plan.plandefine.importtemplate')} {...formItemLayout}>
                    <div className={style.list}>
                      {getFieldDecorator('planTempletType', {
                        initialValue: formData.planTempletType,
                        rules: [],
                      })(
                        <Select onFocus={this.importTempPlanSelect}>
                          {this.state.importTempPlanList ? this.state.importTempPlanList.map(item => {
                            return (
                              <Option key={item.value} value={item.value}>{item.title}</Option>
                            )
                          }) : null}
                        </Select>
                      )}
                    </div>
                  </Form.Item>
                </Col>
                {/*<Col span={12}>
                  <Form.Item label={intl.get("wsd.i18n.plan.define.isMainPlan")} {...formItemLayout}>
                    <div className={style.list}>
                      {getFieldDecorator('isMainPlan', {
                        initialValue: true,
                        valuePropName: 'checked'
                      })(
                        <Switch checkedChildren={intl.get('wsd.i18n.base.coderulde.open')} unCheckedChildren={intl.get('wsd.i18n.base.coderulde.close')} />
                      )}
                    </div>
                  </Form.Item>
                </Col>*/}
                <Col span={24}>
                  <Form.Item label={intl.get('wsd.i18n.plan.plandefine.remark')} {...formItemLayout2}>
                    <div className={style.list}>
                      {getFieldDecorator('remark', {
                        initialValue: formData.remark,
                        rules: [],
                      })(
                        <TextArea rows={4} cols={10} maxLength={666} />
                      )}
                    </div>
                  </Form.Item>
                </Col>
              </Row>
            </div>
          </Form>
        </Modal>
      </div>
    )
  }
}

const PlanDefineAdds = Form.create()(PlanDefineAdd);
export default connect(state => ({
  currentLocale: state.localeProviderData
}))(PlanDefineAdds);
