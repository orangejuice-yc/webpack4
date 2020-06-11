import React, { Component } from 'react';
import { Form, Row, Col, Input, Button, InputNumber, Select, DatePicker, Checkbox, message } from 'antd';
import { connect } from 'react-redux';
import moment from 'moment';
import { curdCurrentData } from '../../../../../../store/curdData/action';
import {updateOutstore} from '../../../../api/suzhou-api';
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
        // axios.get(getSpecialWorker(id)).then(res => {
        //     this.setState({
        //         info: res.data.data,
        //     });
        // });
    };
    componentDidMount() {
        this.props.rightData ? this.getData(this.props.rightData.id) : null;
        this.setState({
            info:this.props.rightData
        })
    }
    handleSubmit = (e)=>{
        e.preventDefault();
        this.props.form.validateFieldsAndScroll((err, values) => {
            values.outstoreDate = values.outstoreDate?dataUtil.Dates().formatTimeString(values.outstoreDate).substr(0,10):"";
            if (!err) {
              const data = {
                ...values,
                id:this.props.rightData.id,
              };
              // 更新菜单
              axios.put(updateOutstore, data, true).then(res => {
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
                            <Form.Item label={'出库编码'} {...formItemLayout}>
                                {getFieldDecorator('outstoreCode', {
                                initialValue: this.state.info.outstoreCode,
                                rules: [{ 
                                    required: true,
                                    message:'请输入出库编码',
                                }],
                                })(
                                <Input disabled />,
                                )}
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item label={'出库名称'} {...formItemLayout}>
                                {getFieldDecorator('outstoreName', {
                                initialValue: this.state.info.outstoreName,
                                rules: [{ 
                                    required: true,
                                    message:'请输入出库名称',
                                }],
                                })(
                                <Input disabled={this.props.rightData.statusVo &&this.props.rightData.statusVo.code == '0'?false:true} />,
                                )}
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item label={'出库日期'} {...formItemLayout}>
                                {getFieldDecorator('outstoreDate', {
                                initialValue: this.state.info.outstoreDate?dataUtil.Dates().formatDateMonent( this.state.info.outstoreDate):'',
                                rules: [{ 
                                    required: true,
                                    message:'请输入出库日期',
                                }],
                                })(
                                    <DatePicker style={{ width: '100%' }} disabled={this.props.rightData.statusVo &&this.props.rightData.statusVo.code == '0'?false:true} />,
                                )}
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item label={'施工单位'} {...formItemLayout}>
                                {getFieldDecorator('sgdw', {
                                initialValue: this.state.info.sgdw,
                                rules: [],
                                })(
                                    <Input disabled />,
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
                            <TextArea rows={2} disabled={this.props.rightData.statusVo &&this.props.rightData.statusVo.code == '0'?false:true} />,
                            )}
                        </Form.Item>
                        </Col>
                    </Row>
                </Form>
                <LabelFormButton>
                    <Button onClick={this.props.closeRightBox} style={{ width: "100px" }}>取消</Button>
                    <Button onClick={this.handleSubmit} disabled={this.props.rightData.statusVo &&this.props.rightData.statusVo.code == '0'?(this.props.permission.indexOf('OUTSTOCK_MATERIEL-EXPORT')==-1?true:false):true}  style={{ width: "100px", marginLeft: "20px" }} type='primary'>保存</Button>
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