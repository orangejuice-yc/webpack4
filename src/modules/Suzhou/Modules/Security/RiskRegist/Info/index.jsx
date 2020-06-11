import React, { Component } from 'react';
import { Form, Row, Col, Input, Button, InputNumber, Select, DatePicker, Checkbox, message } from 'antd';
import { connect } from 'react-redux';
import moment from 'moment';
import { curdCurrentData } from '../../../../../../store/curdData/action';
import {updateRiskRegist,riskRegistInfo,getBaseSelectTree} from '../../../../api/suzhou-api';
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
        axios.get(riskRegistInfo(id)).then(res => {
            this.setState({
                info: res.data.data,
            });
        });
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
            values.processTime = values.processTime?dataUtil.Dates().formatTimeString(values.processTime).substr(0,10):"";
            if (!err) {
              const data = {
                ...values,
                id:this.props.rightData.id,
              };
              // 更新菜单
              axios.put(updateRiskRegist, data, true).then(res => {
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
                                <Input disabled={((this.props.rightData.statusVo &&this.props.rightData.statusVo.code == 'INIT') || (this.props.taskFlag))?false:true} />,
                                )}
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item label={'位置和范围'} {...formItemLayout}>
                                {getFieldDecorator('location', {
                                initialValue: this.state.info.location,
                                rules: [{ 
                                    required: true,
                                    message:'请输入位置和范围',
                                }],
                                })(
                                <Input disabled={((this.props.rightData.statusVo &&this.props.rightData.statusVo.code == 'INIT') || (this.props.taskFlag))?false:true} />,
                                )}
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item label={'风险等级'} {...formItemLayout}>
                                {getFieldDecorator('riskLevel', {
                                    initialValue: !this.state.info.riskLevelVo?'0':this.state.info.riskLevelVo.code.toString(),
                                    rules: [{ 
                                        required: true,
                                        message:'请选择风险等级',
                                    }],
                                })(
                                    <Select disabled={((this.props.rightData.statusVo &&this.props.rightData.statusVo.code == 'INIT') || (this.props.taskFlag))?false:true} >
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
                            <Form.Item label={'负责单位'} {...formItemLayout}>
                                {getFieldDecorator('processCompany', {
                                    initialValue: this.state.info.processCompany,
                                rules: [{ 
                                    required: true,
                                    message:'请输入负责单位',
                                }],
                                })(
                                    <Input disabled={((this.props.rightData.statusVo &&this.props.rightData.statusVo.code == 'INIT') || (this.props.taskFlag))?false:true} />,
                                )}
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item label={'实施时间'} {...formItemLayout}>
                                {getFieldDecorator('processTime', {
                                    initialValue: this.state.info.processTime?dataUtil.Dates().formatDateMonent( this.state.info.processTime):'',
                                rules: [{ 
                                    required: true,
                                    message:'请输入实施时间',
                                }],
                                })(
                                    <DatePicker style={{ width: '100%' }} disabled={((this.props.rightData.statusVo &&this.props.rightData.statusVo.code == 'INIT') || (this.props.taskFlag))?false:true} />
                                )}
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item label={'处置后风险等级'} {...formItemLayout}>
                                {getFieldDecorator('afterRiskLevel', {
                                    initialValue: !this.state.info.afterRiskLevelVo?'0':this.state.info.afterRiskLevelVo.code.toString(),
                                rules: [{ 
                                    required: true,
                                    message:'请输入处置后风险等级',
                                }],
                                })(
                                    <Select disabled={((this.props.rightData.statusVo &&this.props.rightData.statusVo.code == 'INIT') || (this.props.taskFlag))?false:true} >
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
                            <Form.Item label={'发起人'} {...formItemLayout}>
                                {getFieldDecorator('initiator', {
                                    initialValue: this.state.info.initiator,
                                rules: [],
                                })(
                                    <Input disabled/>,
                                )}
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item label={'发起时间'} {...formItemLayout}>
                                {getFieldDecorator('initiationTime', {
                                    initialValue: this.state.info.initiationTime,
                                rules: [],
                                })(
                                    <Input disabled/>,
                                )}
                            </Form.Item>
                        </Col>
                        <Col span={24}>
                            <Form.Item label={'风险描述'} {...formItemLayout1}>
                                {getFieldDecorator('riskDesc', {
                                    initialValue: this.state.info.riskDesc,
                                })(
                                <TextArea rows={2} disabled={((this.props.rightData.statusVo &&this.props.rightData.statusVo.code == 'INIT') || (this.props.taskFlag))?false:true} />,
                                )}
                            </Form.Item>
                        </Col>
                        <Col span={24}>
                            <Form.Item label={'风险处置措施'} {...formItemLayout1}>
                                {getFieldDecorator('riskResult', {
                                    initialValue: this.state.info.riskResult,
                                })(
                                <TextArea rows={2} disabled={((this.props.rightData.statusVo &&this.props.rightData.statusVo.code == 'INIT') || (this.props.taskFlag))?false:true} />,
                                )}
                            </Form.Item>
                        </Col>
                    </Row>
                </Form>
                <LabelFormButton>
                    <Button onClick={this.props.closeRightBox} style={{ width: "100px" }}>取消</Button>
                    <Button onClick={this.handleSubmit} disabled={((this.props.rightData.statusVo &&this.props.rightData.statusVo.code == 'INIT') || (this.props.taskFlag))?(this.props.permission.indexOf('RISKREGIST_EDIT-RISKREGIST')==-1?true:false):true}  style={{ width: "100px", marginLeft: "20px" }} type='primary'>保存</Button>
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