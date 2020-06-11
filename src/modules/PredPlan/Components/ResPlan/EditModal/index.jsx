import React, { Component } from 'react'
import style from './style.less'
import { Form, Row, Col, Input, Button, InputNumber, Select, DatePicker, Modal, Checkbox } from 'antd';
import SubmitButton from "../../../../../components/public/TopTags/SubmitButton"
import moment from 'moment';
import { connect } from 'react-redux'
import axios from "../../../../../api/axios"
import { caculateWorkHour, updatePlanTaskrsrc, getTaskRsrcInfo } from "../../../../../api/api"
import * as dataUtil from '../../../../../utils/dataUtil';
const FormItem = Form.Item;
const Option = Select.Option;
const { TextArea } = Input;
class MenuInfo extends Component {
    constructor(props) {
        super(props)
        this.state = {
            orglist: [],
            visible: true,
            runnDone: true, //是否计算完成
            info: {

            }
        }
    }

    componentDidMount() {
        axios.get(getTaskRsrcInfo(this.props.data.id)).then(res => {
            this.setState({
                info: res.data.data
            },()=>{
            })
           
        })
    }


    handleSubmit = () => {
        this.props.form.validateFieldsAndScroll((err, values) => {
            if (!err) {
                const param = {
                    ...this.props.data,
                    id: this.props.data.id,
                    driveTaskTime: this.state.info.driveTaskTime,
                    planStartTime: dataUtil.Dates().formatTimeString(values.planStartTime),
                    planEndTime: dataUtil.Dates().formatTimeString(values.planEndTime),
                    planDrtn: this.state.planDrtn ||this.state.info.planDrtn,
                    remainDrtn: this.state.planDrtn ||this.state.info.planDrtn,
                    budgetQty: values.budgetQty,
                    remainQty: values.budgetQty,
                    budgetUnit: values.budgetUnit,
                    budgetCost: this.state.budgetCost||values.budgetQty *values.budgetUnit,
                }
                let { startContent } = this.props.extInfo || {};
                let url = dataUtil.spliceUrlParams(updatePlanTaskrsrc, { startContent });
                axios.put(url, param, true, null, true).then(res => {
                    this.props.refresh()
                    this.props.handleCancel()
                })

            }
        });
    }
    //开始计算
    startCaculate = () => {
        this.setState({ runnDone: false })
    }

    //计划日期工期计算(开始(修改)+工期=完成，完成(修改)-开始=工期，工期(修改)+开始=完成）
    caculateStartOrEndOrDrtn = (opeType) => {
        const { info } = this.state
        const { projSet } = this.props
        const budgetUnit = this.props.form.getFieldValue("budgetUnit") || 0;
        if (info.maxUnit && info.calendar.dayHrCnt) {
            let param = {
                calendarId: info.calendar.id,
                startTime: dataUtil.Dates().formatTimeString(this.props.form.getFieldValue("planStartTime")),
                endTime: dataUtil.Dates().formatTimeString(this.props.form.getFieldValue("planEndTime")),
                drtn: dataUtil.WorkTimes().toHour(this.props.form.getFieldValue("budgetQty"), projSet.timeUnit, info.calendar) / info.maxUnit * info.calendar.dayHrCnt,
                opeType: opeType
            }
            if (param.calendarId && (param.startTime || param.endTime)) {
                axios.post(caculateWorkHour, param, false, null, false).then(res => {
                    const { data } = { ...res.data }
                    const budgetQty = data.drtn / info.calendar.dayHrCnt * info.maxUnit //工期（小时）/ 一天工作小时 * 每天最大小时数
                    this.props.form.setFieldsValue({ ["planStartTime"]: dataUtil.Dates().formatTimeMonent(data.startTime) });
                    this.props.form.setFieldsValue({ ["planEndTime"]: dataUtil.Dates().formatTimeMonent(data.endTime) });
                    this.props.form.setFieldsValue({ ["budgetQty"]: dataUtil.WorkTimes().hourTo(budgetQty, projSet.timeUnit, info.calendar) });

                    let planDrtn = data.drtn
                    let budgetCost = budgetQty * budgetUnit
                    this.setState({
                        planDrtn,
                        budgetCost,
                        runnDone: true
                    })
                })
            }
        }
    }
    //开始(修改)+工期=完成
    caculateByStartTime = (status) => {
        if (status) {
            return; //只有关闭时才调用
        }
        const dateStart = dataUtil.Dates().formatTimeString(this.props.form.getFieldValue("PlanStartTime"));
        if (dateStart && this.state.info.actStartTime != dateStart) {
            this.caculateStartOrEndOrDrtn("StartTime");
        }
        
    }
    //完成(修改)-开始=工期
    caculateByEndTime = (status) => {
        if (status) {
            return; //只有关闭时才调用
        }
        const dateEnd = dataUtil.Dates().formatTimeString(this.props.form.getFieldValue("planEndTime"));
        if (dateEnd && this.state.info.actEndTime != dateEnd) {
            this.caculateStartOrEndOrDrtn("EndTime");
        }
       
    }
    //预算(修改)+开始=完成
    caculateByBudgetQty = (e) => {
        const {info}=this.state
        const budgetQty = dataUtil.WorkTimes().toHour(this.props.form.getFieldValue("budgetQty"), this.props.projSet.timeUnit, info.calendar) || 0;
        if (budgetQty > 0 && info.budgetQty != budgetQty) {
          this.caculateStartOrEndOrDrtn("Drtn");
        }
    }

    //预算单价(修改)
    caculateByBudgetUnit = () => {
      
        const {info} = this.state;
        const budgetUnit = this.props.form.getFieldValue("budgetUnit") || 0;
        const budgetQty = dataUtil.WorkTimes().toHour(this.props.form.getFieldValue("budgetQty"), this.props.projSet.timeUnit, info.calendar) || 0;
      
        let budgetCost = budgetQty * budgetUnit;
        this.setState({
            budgetCost,
            runnDone: true
        })
    }


    CheckboxClick = () =>{
        let driveTaskTime = this.state.info.driveTaskTime
        let info = this.state.info
        if(driveTaskTime === 0){
            driveTaskTime = 1
        }else{
            driveTaskTime = 0
        }
        info.driveTaskTime = driveTaskTime
        this.setState({
            info
        })
    }

    render() {
        const { intl } = this.props.currentLocale
        const { projSet } = this.props
        const {
            getFieldDecorator, getFieldsError, getFieldError, isFieldTouched,
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
        const formItemLayout1 = {
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

                <Modal title={"资源编辑"} visible={true}
                    onCancel={this.props.handleCancel}
                    width="800px"
                    mask={false}
                    maskClosable={false}
                    footer={

                        <div className='modalbtn'>

                            <SubmitButton key="submit2" type="primary" onClick={this.handleSubmit} content={intl.get("wsd.global.btn.preservation")} />
                        </div>
                    }>

                    <Form onSubmit={this.handleSubmit}>
                        <div className={style.content}>
                            <Row type="flex">
                                <Col span={12}>
                                    <Form.Item label="资源名称" {...formItemLayout}>
                                        {getFieldDecorator('rsrcuserName', {
                                            initialValue: this.state.info.rsrcuserName,
                                            rules: [],
                                        })(
                                            <Input disabled />
                                        )}
                                    </Form.Item>
                                </Col>
                                <Col span={12}>
                                    <Form.Item label="资源代码" {...formItemLayout}>
                                        {getFieldDecorator('rsrcuserCode', {
                                            initialValue: this.state.info.rsrcuserCode,
                                            rules: [],
                                        })(
                                            <Input disabled />
                                        )}
                                    </Form.Item>
                                </Col>
                            </Row>
                            <Row >
                                <Col span={12}>
                                    <Form.Item label="预算单价" {...formItemLayout}>
                                        {getFieldDecorator('budgetUnit', {
                                            initialValue: this.state.info.budgetUnit,
                                            rules: [{
                                                required: true,
                                                message: intl.get('wsd.i18n.message.enter') + "预算单价",
                                            }],
                                        })(
                                            <InputNumber max={999999999999} min={0} precision={projSet.precision} style={{ width: "100%" }}
                                                formatter={value => projSet.moneyUnit + `${value || 0}`}
                                                parser={value => value.replace(projSet.moneyUnit, '')}
                                                onChange={this.startCaculate}
                                                onBlur={(e) => {

                                                    this.caculateByBudgetUnit(e)

                                                }} />
                                        )}
                                    </Form.Item>
                                </Col>
                                <Col span={12}>
                                    <Form.Item label="预算用量" {...formItemLayout}>
                                        {getFieldDecorator('budgetQty', {
                                            initialValue: this.state.info.budgetQty,
                                            rules: [{
                                                required: true,
                                                message: intl.get('wsd.i18n.message.enter') + "预算用量",
                                            }],
                                        })(
                                            <InputNumber max={999999999999} min={0} precision={projSet.precision} style={{ width: "100%" }}
                                                formatter={value => projSet.timeUnit + `${value || 0}`}
                                                parser={value => value.replace(projSet.timeUnit, '')}
                                                onChange={this.startCaculate}
                                                onBlur={(e) => {
                                                    this.caculateByBudgetQty(e)
                                                }} />
                                        )}
                                    </Form.Item>
                                </Col>
                            </Row>

                            <Row >
                                <Col span={12}>
                                    <Form.Item label="计划开始时间" {...formItemLayout}>
                                        {getFieldDecorator('planStartTime', {
                                            initialValue: dataUtil.Dates().formatDateMonent(this.state.info.planStartTime),
                                            rules: [{
                                                required: true,
                                                message: intl.get('wsd.i18n.message.select') + "实际开始时间",
                                            }],
                                        })(
                                            <DatePicker style={{ width: "100%" }} format={projSet.dateFormat}
                                                showTime={{ format: 'HH:mm', defaultValue: moment('00:00:00', 'HH:mm:ss') }}
                                                onChange={this.startCaculate}
                                                onOpenChange={(status) => {

                                                    this.caculateByStartTime(status)

                                                }} />
                                        )}
                                    </Form.Item>
                                </Col>
                                <Col span={12}>
                                    <Form.Item label="计划结束时间" {...formItemLayout}>
                                        {getFieldDecorator('planEndTime', {
                                            initialValue: dataUtil.Dates().formatDateMonent(this.state.info.planEndTime),
                                            rules: [{
                                                required: true,
                                                message: intl.get('wsd.i18n.message.select') + "实际结束时间",
                                            }],
                                        })(
                                            <DatePicker style={{ width: "100%" }} format={projSet.dateFormat}
                                                showTime={{ format: 'HH:mm', defaultValue: moment('00:00:00', 'HH:mm:ss') }}
                                                onChange={this.startCaculate}
                                                onOpenChange={(status) => {

                                                    this.caculateByEndTime(status)

                                                }} />
                                        )}
                                    </Form.Item>
                                </Col>
                            </Row>
                            <Row>
                                <Col span={12}>
                                    <Form.Item label="驱动任务日期" {...formItemLayout}>
                                        {getFieldDecorator('share', {
                                            valuePropName: 'checked',
                                            initialValue: this.state.info.driveTaskTime,
                                            rules: [],
                                        })(
                                            <Checkbox onClick={this.CheckboxClick.bind(this)}></Checkbox>,
                                        )}
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
const MenuInfos = Form.create()(MenuInfo);
const mapStateToProps = state => {
    return {
        currentLocale: state.localeProviderData,
    }
};


export default connect(mapStateToProps, null)(MenuInfos);
