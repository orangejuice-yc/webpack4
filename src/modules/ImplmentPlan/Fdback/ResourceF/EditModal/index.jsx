import React, { Component } from 'react'
import style from './style.less'
import { Form, Row, Col, Input, Button, InputNumber, Select, DatePicker, Modal } from 'antd';
import SubmitButton from "../../../../../components/public/TopTags/SubmitButton"
import moment from 'moment';
import { connect } from 'react-redux'
import axios from "../../../../../api/axios"
import { caculateWorkHour, getRsrcConsumptionInfo, updateRsrcConsumption} from "../../../../../api/api"
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
        axios.get(getRsrcConsumptionInfo(this.props.record.id,this.props.feedbackId)).then(res=>{
            this.setState({info:res.data.data})
        })
    }


    handleSubmit = () => {
        this.props.form.validateFieldsAndScroll((err, values) => {
            if (!err) {

                const param = {
                    ...this.props.record,
                    taskrsrcId: this.state.info.id,
                    feedbackId: this.props.feedbackId,
                    actStartTime: dataUtil.Dates().formatTimeString(values.actStartTime),
                    actEndTime: dataUtil.Dates().formatTimeString(values.actEndTime),
                    actQty: values.actQty,
                    actUnit: values.actUnit,
                    actCost: this.state.actCost|| this.state.info.actCost,
                  }
                  axios.put(updateRsrcConsumption, param, true,null, true).then(res => {
                   this.props.refresh()
                   this.props.handleCancel()
                  })

            }
        });
    }
 //开始计算
 startCaculate = () => {
    this.setState({runnDone: false})
  }

    //计划日期工期计算(开始(修改)+工期=完成，完成(修改)-开始=工期，工期(修改)+开始=完成）
    caculateStartOrEndOrDrtn = (opeType) => {
   
        const {info}=this.state
      
        if (info.maxUnit && info.calendar.dayHrCnt) {
          let param = {
            calendarId: info.calendar.id,
            startTime: dataUtil.Dates().formatTimeString(this.props.form.getFieldValue("actStartTime")),
            endTime: dataUtil.Dates().formatTimeString(this.props.form.getFieldValue("actEndTime")),
            
            opeType: opeType
          }
          if (param.calendarId && (param.startTime || param.endTime)) {
            axios.post(caculateWorkHour, param, false, null, false).then(res => {
              const {data} = {...res.data}
            
              this.props.form.setFieldsValue({["actStartTime"]: dataUtil.Dates().formatTimeMonent(data.startTime)});
              this.props.form.setFieldsValue({["actEndTime"]: dataUtil.Dates().formatTimeMonent(data.endTime)});
              this.setState({runnDone: true})
            })
          }
        }
    }
    //开始(修改)+工期=完成
    caculateByStartTime = (status) => {
        if (status) {
            return; //只有关闭时才调用
        }
        const dateStart = dataUtil.Dates().formatTimeString(this.props.form.getFieldValue("actStartTime"));
        if (dateStart && this.state.info.actStartTime != dateStart) {
            this.caculateStartOrEndOrDrtn("StartTime");
        }
        // const dateStart = dataUtil.Dates().formatTimeString(this.props.form.getFieldValue("actStartTime"));
        // if (dateStart && this.state._workTime.planStartTime != dateStart) {
        //   this.caculateStartOrEndOrDrtn("actStartTime");
        // }
    }
    //完成(修改)-开始=工期
    caculateByEndTime = (status) => {
        if (status) {
            return; //只有关闭时才调用
        }
        const dateEnd = dataUtil.Dates().formatTimeString(this.props.form.getFieldValue("actEndTime"));
        if (dateEnd && this.state.info.actEndTime != dateEnd) {
            this.caculateStartOrEndOrDrtn("EndTime");
        }
    }
    //预算(修改)+开始=完成
    caculateByBudgetQty = (e) => {
        const { info  } = this.state;
        const actQty = dataUtil.WorkTimes().toHour(this.props.form.getFieldValue("actQty"), this.props.projSet.timeUnit, info.calendar) || 0;
        if (actQty > 0 && info.actQty != actQty) {
            //this.caculateStartOrEndOrDrtn("Drtn");
            this.caculateByBudgetUnit(e)
        }
    }

    //预算单价(修改)
    caculateByBudgetUnit = () => {
        const {  projSet} = this.props;
        const actUnit = this.props.form.getFieldValue("actUnit") || 0;
        const actQty = dataUtil.WorkTimes().toHour(this.props.form.getFieldValue("actQty"),projSet.timeUnit, this.state.info.calendar) || 0;
        let actCost=actQty * actUnit;
        this.setState({
            actCost,
            runnDone: true
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
                                    <Form.Item label="实际开始时间" {...formItemLayout}>
                                        {getFieldDecorator('actStartTime', {
                                            initialValue: dataUtil.Dates().formatDateMonent(this.state.info.actStartTime),
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
                                    <Form.Item label="实际结束时间" {...formItemLayout}>
                                        {getFieldDecorator('actEndTime', {
                                            initialValue: dataUtil.Dates().formatDateMonent(this.state.info.actEndTime),
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
                            <Row >
                                <Col span={12}>
                                    <Form.Item label="实际单价" {...formItemLayout}>
                                        {getFieldDecorator('actUnit', {
                                            initialValue: this.state.info.actUnit,
                                            rules: [{
                                                required: true,
                                                message: intl.get('wsd.i18n.message.enter') + "实际单价",
                                            }],
                                        })(
                                            <InputNumber max={999999999999} min={0} precision={projSet.precision} style={{width:"100%"}}
                                                formatter={value =>projSet.moneyUnit + `${value || 0}`}
                                                parser={value => value.replace(projSet.moneyUnit, '')}
                                                onChange={this.startCaculate}
                                                onBlur={(e) => {

                                                    this.caculateByBudgetUnit(e)

                                                }} />
                                        )}
                                    </Form.Item>
                                </Col>
                                <Col span={12}>
                                    <Form.Item label="实际用量" {...formItemLayout}>
                                        {getFieldDecorator('actQty', {
                                            initialValue: this.state.info.actQty,
                                            rules: [{
                                                required: true,
                                                message: intl.get('wsd.i18n.message.enter') + "实际用量",
                                            }],
                                        })(
                                            <InputNumber max={999999999999} min={0} precision={projSet.precision} style={{width:"100%"}}
                                                formatter={value =>projSet.timeUnit + `${value || 0}`}
                                                parser={value => value.replace(projSet.timeUnit, '')}
                                                onChange={this.startCaculate}
                                                onBlur={(e) => {

                                                    this.caculateByBudgetQty(e)

                                                }} />
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
