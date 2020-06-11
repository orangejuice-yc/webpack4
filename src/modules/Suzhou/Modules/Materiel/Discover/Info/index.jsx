import React, { Component } from 'react';
import { Form, Row, Col, Input, Button, InputNumber, Select, DatePicker, Checkbox, message } from 'antd';
import { connect } from 'react-redux';
import moment from 'moment';
import { curdCurrentData } from '../../../../../../store/curdData/action';
import {getInfoInspection,updateInspection} from '../../../../api/suzhou-api';
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
        }
    }
    //获取菜单基本信息
    getData = (id) => {
        // 请求获取info数据
        axios.get(getInfoInspection(id)).then(res => {
            this.setState({
                info: res.data.data,
            });
        });
    };
    componentDidMount() {
        this.props.rightData ? this.getData(this.props.rightData.id) : null;
    }
    handleSubmit = (e)=>{
        e.preventDefault();
        this.props.form.validateFieldsAndScroll((err, values) => {
            values.inspectionTime = values.inspectionTime?dataUtil.Dates().formatTimeString(values.inspectionTime).substr(0,10):"";
            if (!err) {
              const data = {
                ...values,
                id:this.props.rightData.id,
              };
              // 更新菜单
              axios.put(updateInspection, data, true).then(res => {
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
                            <Form.Item label={'检测编号'} {...formItemLayout}>
                                {getFieldDecorator('inspectionCode', {
                                initialValue: this.state.info.inspectionCode,
                                rules: [{ 
                                    required: true,
                                    message:'请输入检测编号',
                                }],
                                })(
                                <Input disabled />,
                                )}
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item label={'检测名称'} {...formItemLayout}>
                                {getFieldDecorator('inspectionName', {
                                initialValue: this.state.info.inspectionName,
                                rules: [{ 
                                    required: true,
                                    message:'请输入检测名称',
                                }],
                                })(
                                <Input disabled = {this.props.rightData.statusVo && this.props.rightData.statusVo.code == '0'?false:true} />,
                                )}
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item label={'检测日期'} {...formItemLayout}>
                                {getFieldDecorator('inspectionTime', {
                                    initialValue:dataUtil.Dates().formatDateMonent( this.state.info.inspectionTime),
                                    rules: [{ 
                                        required: true,
                                        message:'请选择检测日期',
                                    }],
                                })(
                                    <DatePicker style={{ width: '100%' }} disabled = {this.props.rightData.statusVo && this.props.rightData.statusVo.code == '0'?false:true} />, 
                                )}
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item label={'检测类型'} {...formItemLayout}>
                                {getFieldDecorator('inspectionType', {
                                initialValue: this.state.info.inspectionTypeVo?this.state.info.inspectionTypeVo.code.toString():'0',
                                rules: [{ 
                                    required: true,
                                    message:'请选择检测类型',
                                }],
                                })(
                                <Select disabled = {this.props.rightData.statusVo && this.props.rightData.statusVo.code == '0'?false:true}>
                                    <Option key='0' value="0">开箱检验</Option>
                                    <Option key='1' value="1">进场报验</Option>
                                </Select>,
                                )}
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item label={'检测单位'} {...formItemLayout}>
                                {getFieldDecorator('inspectionCompany', {
                                initialValue: this.state.info.inspectionCompany,
                                rules: [{ 
                                    required: true,
                                    message:'请输入检测单位',
                                }],
                                })(
                                <Input disabled = {this.props.rightData.statusVo && this.props.rightData.statusVo.code == '0'?false:true} />,
                                )}
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item label={'检测员'} {...formItemLayout}>
                                {getFieldDecorator('inspector', {
                                initialValue: this.state.info.inspector,
                                rules: [{ 
                                    required: true,
                                    message:'请输入检测员',
                                }],
                                })(
                                <Input disabled = {this.props.rightData.statusVo && this.props.rightData.statusVo.code == '0'?false:true} />,
                                )}
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item label={'取样员'} {...formItemLayout}>
                                {getFieldDecorator('sampler', {
                                initialValue: this.state.info.sampler,
                                rules: [{ 
                                    required: true,
                                    message:'请输入取样员',
                                }],
                                })(
                                <Input disabled = {this.props.rightData.statusVo && this.props.rightData.statusVo.code == '0'?false:true} />,
                                )}
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item label={'见证员'} {...formItemLayout}>
                                {getFieldDecorator('witness', {
                                initialValue: this.state.info.witness,
                                })(
                                <Input disabled = {this.props.rightData.statusVo && this.props.rightData.statusVo.code == '0'?false:true} />,
                                )}
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item label={'是否需第三方检测'} {...formItemLayout}>
                                {getFieldDecorator('needThirdInspection', {
                                initialValue: this.state.info.needThirdInspectionVo? this.state.info.needThirdInspectionVo.code.toString():'0',
                                rules: [{ 
                                    required: true,
                                    message:'请选择是否需第三方检测',
                                }],
                                })(
                                    <Select disabled = {this.props.rightData.statusVo && this.props.rightData.statusVo.code == '0'?false:true}>
                                        <Option key='0' value="0">是</Option>
                                        <Option key='1' value="1">否</Option>
                                    </Select>
                                )}
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item label={'是否通过'} {...formItemLayout}>
                                {getFieldDecorator('status', {
                                initialValue: this.state.info.statusVo? this.state.info.statusVo.code.toString():'0',
                                rules: [{ 
                                    required: true,
                                    message:'请选择是否通过',
                                }],
                                })(
                                    <Select disabled>
                                        <Option key='0' value="0">否</Option>
                                        <Option key='1' value="1">是</Option>
                                    </Select>
                                )}
                            </Form.Item>
                        </Col>
                    </Row>
                    <Row>
                        <Col span={24}>
                        <Form.Item label={'备注说明'} {...formItemLayout1}>
                            {getFieldDecorator('description', {
                            initialValue: this.state.info.description,
                            rules: [],
                            })(
                            <TextArea rows={2} disabled = {this.props.rightData.statusVo && this.props.rightData.statusVo.code == '0'?false:true}/>,
                            )}
                        </Form.Item>
                        </Col>
                    </Row>
                </Form>
                <LabelFormButton>
                    <Button onClick={this.props.closeRightBox} style={{ width: "100px" }}>取消</Button>
                    <Button onClick={this.handleSubmit} disabled={this.props.rightData.statusVo &&this.props.rightData.statusVo.code == '0'?(this.props.permission.indexOf('DISCOVER_MATERIEL-CHECK')==-1?true:false):true} style={{ width: "100px", marginLeft: "20px" }} type='primary'>保存</Button>
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