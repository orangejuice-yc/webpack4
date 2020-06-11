import React, { Component } from 'react';
import { Form, Row, Col, Input, Button, InputNumber, Select, DatePicker, Checkbox, message } from 'antd';
import { connect } from 'react-redux';
import moment from 'moment';
import { curdCurrentData } from '../../../../../../store/curdData/action';
import {updateRiskIndentify,riskIndentifyInfo,getBaseSelectTree} from '../../../../api/suzhou-api';
import axios from '../../../../../../api/axios';
import * as dataUtil from "../../../../../../utils/dataUtil"
import style from './style.less';
// 布局
import LabelFormLayout from "@/components/public/Layout/Labels/Form/LabelFormLayout"
import LabelFormButton from "@/components/public/Layout/Labels/Form/LabelFormButton"
const FormItem = Form.Item;
const { Option } = Select;
const { TextArea } = Input;
class SortInfo extends Component {
    constructor(props){
        super(props);
        this.state={
            info:{},
            riskLevel:[],//风险等级
        }
    }
    //获取菜单基本信息
    getData = (id) => {
        // 请求获取info数据
        // axios.get(riskIndentifyInfo(id)).then(res => {
        //     this.setState({
        //         info: res.data.data,
        //     });
        // });
        this.setState({
            info:this.props.rightData
        })
    };
    componentDidMount() {
        this.props.rightData ? this.getData(this.props.rightData.id) : null;
        axios.get(getBaseSelectTree('szxm.aqgl.riskLevel')).then(res=>{
            this.setState({
                riskLevel:res.data.data
            })
        })
    }
    handleSubmit = (e)=>{
        e.preventDefault();
        this.props.form.validateFieldsAndScroll((err, values) => {
            if (!err) {
              const data = {
                ...values,
                id:this.props.rightData.id,
              };
              // 更新菜单
              axios.put(updateRiskIndentify, data, true).then(res => {
                this.props.updateSuccess(res.data.data);
              });
      
            }
        });
    }
    render(){
        const {intl} = this.props.currentLocale;
        const {getFieldDecorator, getFieldsError, getFieldError, isFieldTouched} = this.props.form;
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
        return(
            <LabelFormLayout title={this.props.title}>
                <Form onSubmit={this.handleSubmit}>
                    <Row>
                        <Col span={12}>
                            <Form.Item label={'标段名称'} {...formItemLayout}>
                                {getFieldDecorator('sectionName', {
                                initialValue: this.state.info.sectionName,
                                rules: [{ 
                                    required: true,
                                    message:'请输入标段名称',
                                }],
                                })(
                                <Input disabled />,
                                )}
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item label={'标段号'} {...formItemLayout}>
                                {getFieldDecorator('sectionCode', {
                                initialValue: this.state.info.sectionCode,
                                rules: [{ 
                                    required: true,
                                    message:'请输入标段号',
                                }],
                                })(
                                <Input disabled />,
                                )}
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item label={'风险名称'} {...formItemLayout}>
                                {getFieldDecorator('title', {
                                    initialValue: this.state.info.title,
                                rules: [{ 
                                    required: true,
                                    message:'请输入风险名称',
                                }],
                                })(
                                <Input />,
                                )}
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item label={'发生位置'} {...formItemLayout}>
                                {getFieldDecorator('location', {
                                    initialValue: this.state.info.location,
                                rules: [{ 
                                    required: true,
                                    message:'请输入发生位置',
                                }],
                                })(
                                <Input />,
                                )}
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item label={'风险因素'} {...formItemLayout}>
                                {getFieldDecorator('riskReason', {
                                    initialValue: this.state.info.riskReason,
                                    rules: [{ 
                                        required: true,
                                        message:'请选择风险因素',
                                    }],
                                })(
                                    <Input />
                                )}
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item label={'风险损失'} {...formItemLayout}>
                                {getFieldDecorator('riskLoss', {
                                    initialValue: this.state.info.riskLoss,
                                rules: [{ 
                                    required: true,
                                    message:'请输入风险损失',
                                }],
                                })(
                                    <Input />,
                                )}
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item label={'概率'} {...formItemLayout}>
                                {getFieldDecorator('probability', {
                                    initialValue: this.state.info.probability,
                                rules: [
                                    {required: true,message: '请输入概率'},
                                    {pattern: new RegExp(/^(?:0\.\d+|[01](?:\.0)?)$/, "g"),message: '请正确输入概率'}
                                ],
                                })(
                                    <InputNumber style={{width:"100%"}} />,
                                )}
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item label={'风险等级'} {...formItemLayout}>
                                {getFieldDecorator('riskLevel', {
                                    initialValue: this.state.info.riskLevel,
                                rules: [{ 
                                    required: true,
                                    message:'请输入风险等级',
                                }],
                                })(
                                    <Select>
                                        {
                                            this.state.riskLevel.length && this.state.riskLevel.map((item,i) => {
                                                return (
                                                <Option key={item.value} value={item.value}>{item.title}</Option>
                                                )
                                            })
                                        }
                                    </Select>,
                                )}
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item label={'处理负责单位'} {...formItemLayout}>
                                {getFieldDecorator('processCompany', {
                                    initialValue: this.state.info.processCompany,
                                rules: [{ 
                                    required: true,
                                    message:'请输入处理负责单位',
                                }],
                                })(
                                    <Input/>,
                                )}
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item label={'创建人'} {...formItemLayout}>
                                {getFieldDecorator('initiator', {
                                    initialValue: this.state.info.initiator,
                                rules: [],
                                })(
                                    <Input disabled/>,
                                )}
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item label={'创建时间'} {...formItemLayout}>
                                {getFieldDecorator('initiateTime', {
                                    initialValue: this.state.info.initiateTime,
                                rules: [],
                                })(
                                    <Input disabled/>,
                                )}
                            </Form.Item>
                        </Col>
                    </Row>
                </Form>
                <LabelFormButton>
                    <Button onClick={this.props.closeRightBox} style={{ width: "100px" }}>取消</Button>
                    <Button onClick={this.handleSubmit} style={{ width: "100px", marginLeft: "20px" }} type='primary'
                        disabled={this.props.permission.indexOf('RISK_EDIT-RISK-IDENTIFY')==-1?true:false}
                        >保存</Button>
                </LabelFormButton>
            </LabelFormLayout>
        )
    }
}
const SortInfos = Form.create()(SortInfo);
export default connect(state => ({
  currentLocale: state.localeProviderData
}), {
    curdCurrentData,
  })(SortInfos);