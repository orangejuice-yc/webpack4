import React, { Component } from 'react'
import { Form, Row, Col, Radio, Input, Button, Checkbox, Icon, Select, DatePicker, Modal, Switch } from 'antd';
import moment from 'moment';
import style from './style.less'
import SubmitButton from "../../../../components/public/TopTags/SubmitButton"
import {deletePlanTask, planCalculate, planSimulationCalculate} from "../../../../api/api"
import axios from "../../../../api/axios"
const RadioGroup = Radio.Group;
import * as dataUtil from "../../../../utils/dataUtil"
export class PlanPreparedSchedule extends Component {
    constructor(props) {
        super(props)
        this.state = {
            info: {
                formData1: '2018-12-01',
                formData2: 1,
                formData3: '',
                formData4: 1
            }
        }
    }

    handleSubmit = (type) => {
        this.props.form.validateFieldsAndScroll((err, values) => {
            if (!err) {
                let arr = []
                if (this.props.data) {

                    let findDefine = (array) => {
                        array.forEach(item => {
                            if (item.nodeType == "define") {
                                arr.push(item.id)
                            }
                            if (item.children) {
                                findDefine(item.children)
                            }
                        })
                    }
                    findDefine(this.props.data)
                }

                let obj = {
                    defineIds: arr,
                    ...values,
                    nowTime:  dataUtil.Dates().formatTimeString(values.nowTime),
                }
                if(type=="simulate"){

                    let url = dataUtil.spliceUrlParams(planSimulationCalculate,{"startContent": "项目【"+this.props.selectProjectName+"】"});
                    axios.post(url, obj, true, null ,true).then(res => {
                        this.props.setBaseLineTime(values.nowTime);
                        this.props.refreshList(res.data.data);
                        this.props.handleCancel()
                    })
                }else{
                    let url = dataUtil.spliceUrlParams(planCalculate,{"startContent": "项目【"+this.props.selectProjectName+"】"});
                    axios.post(url, obj, true, null, true).then(res => {
                        this.props.setBaseLineTime(values.nowTime);
                        this.props.initDatas();
                        this.props.handleCancel()
                    })
                }
            }
        });
    }

    render() {
        const { getFieldDecorator } = this.props.form;
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
        return (
            <Modal className={style.main}
                title="进度计算"
                visible={true}
                width={495}
                onCancel={this.props.handleCancel}
                footer={null}
            >
                <Form onSubmit={this.handleSubmit}>
                    <Form.Item label="当前数据日期" {...formItemLayout}>
                        {getFieldDecorator('nowTime', {
                            initialValue:moment(this.props.baseLineTime ),
                            rules: [],
                        })(
                            <DatePicker style={{ width: '100%' }} />
                        )}
                    </Form.Item>
                    <Form.Item label="计算范围" {...formItemLayout}>
                        {getFieldDecorator('calculMethod1', {
                            initialValue: 1,
                            rules: [],
                        })(
                            <RadioGroup>
                                <Radio className={style.radioStyle} value={1}>视图中的所有任务</Radio>
                                <Radio className={style.radioStyle} value={2}>选择WBS下的任务</Radio>
                                <Radio className={style.radioStyle} value={3}>选择的任务的所有后续任务</Radio>
                                <Radio className={style.radioStyle} value={4}>选择的任务的所有紧前任务</Radio>
                            </RadioGroup>
                        )}
                    </Form.Item>
                    <Form.Item label="计算方式" {...formItemLayout}>
                        {getFieldDecorator('calculMethod', {
                            initialValue: 1,
                            rules: [],
                        })(
                            <RadioGroup>
                                <Radio className={style.radioStyle} value={1}>进度跨越</Radio>
                                <Radio className={style.radioStyle} value={2}>保持逻辑关系</Radio>
                            </RadioGroup>
                        )}
                    </Form.Item>
                    <Form.Item label="关键路径" {...formItemLayout}>
                        {getFieldDecorator('keyPath', {
                            initialValue: 1,
                            rules: [],
                        })(
                            <RadioGroup>
                              <Radio className={style.radioStyle} value={1}>总浮时&lt;=0</Radio>
                              <Radio className={style.radioStyle} value={2}>最长路径</Radio>
                            </RadioGroup>
                        )}
                    </Form.Item>
                </Form>
                <div style={{ padding: 25, textAlign: 'center' }}>
                    <SubmitButton key="1" onClick={this.handleSubmit.bind(this, "process")} content="进度计算" /> &nbsp; &nbsp;
                    <SubmitButton key="2" onClick={this.handleSubmit.bind(this,"simulate")} content="模拟计算" />
                </div>
            </Modal>
        )
    }
}

const PlanPreparedSchedules = Form.create()(PlanPreparedSchedule);
export default PlanPreparedSchedules
