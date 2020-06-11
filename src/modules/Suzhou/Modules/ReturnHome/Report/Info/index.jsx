import React, { Component } from 'react';
import { Form, Row, Col, Input, Button, InputNumber, Select, DatePicker, Checkbox, message } from 'antd';
import { connect } from 'react-redux';
import moment from 'moment';
import { curdCurrentData } from '../../../../../../store/curdData/action';
import {updateStorage,inspectionListNoPage} from '../../../../api/suzhou-api';
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
            inspectionCode:[],//检测编码
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
        const {projectId,sectionId} = this.props.rightData;
        axios.get(inspectionListNoPage,{params:{projectId,sectionIds:sectionId}}).then(res=>{
            this.setState({
              inspectionCode: res.data.data
            })
          })
    }
    handleSubmit = (e)=>{
        e.preventDefault();
        this.props.form.validateFieldsAndScroll((err, values) => {
            values.creatTime = values.creatTime?dataUtil.Dates().formatTimeString(values.creatTime).substr(0,10):"";
            if (!err) {
              const data = {
                ...values,
                id:this.props.rightData.id,
              };
              // 更新菜单
              axios.put(updateStorage, data, true).then(res => {
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
                            <Form.Item label={'入库编码'} {...formItemLayout}>
                                {getFieldDecorator('storageCode', {
                                initialValue: this.state.info.storageCode,
                                rules: [{ 
                                    required: true,
                                    message:'请输入入库编码',
                                }],
                                })(
                                <Input disabled />,
                                )}
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item label={'入库名称'} {...formItemLayout}>
                                {getFieldDecorator('storageName', {
                                initialValue: this.state.info.storageName,
                                rules: [{ 
                                    required: true,
                                    message:'请输入入库名称',
                                }],
                                })(
                                <Input disabled = {this.props.rightData.statusVo && this.props.rightData.statusVo.code == '0'?false:true} />,
                                )}
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item label={'仓库位置'} {...formItemLayout}>
                                {getFieldDecorator('storagePosition', {
                                    initialValue: this.state.info.storagePosition,
                                    rules: [{ 
                                        required: true,
                                        message:'请选择仓库位置',
                                    }],
                                })(
                                    <Select disabled = {this.props.rightData.statusVo && this.props.rightData.statusVo.code == '0'?false:true} >
                                        <Option key={'1'} value={'1'}>1</Option>
                                        <Option key={'12'} value={'12'}>12</Option>
                                    </Select>
                                )}
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item label={'检测编码'} {...formItemLayout}>
                                {getFieldDecorator('inspectionCode', {
                                initialValue: this.state.info.inspectionCode,
                                rules: [{ 
                                    required: true,
                                    message:'请输入检测编码',
                                }],
                                })(
                                    <Select showSearch allowClear disabled = {this.props.rightData.statusVo && this.props.rightData.statusVo.code == '0'?false:true} >
                                        {
                                            this.state.inspectionCode.length && this.state.inspectionCode.map((item,i) => {
                                                return (
                                                <Option key={item.inspectionCode} value={item.inspectionCode}>{item.inspectionCode}</Option>
                                                )
                                            })
                                        }
                                    </Select>,
                                )}
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item label={'入库日期'} {...formItemLayout}>
                                {getFieldDecorator('storageDate', {
                                initialValue: this.state.info.storageDate?dataUtil.Dates().formatDateMonent( this.state.info.storageDate):'',
                                rules: [{ 
                                    required: true,
                                    message:'请输入入库日期',
                                }],
                                })(
                                    <DatePicker style={{ width: '100%' }} disabled = {this.props.rightData.statusVo && this.props.rightData.statusVo.code == '0'?false:true} />,
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
                            <TextArea rows={2} disabled = {this.props.rightData.statusVo && this.props.rightData.statusVo.code == '0'?false:true} />,
                            )}
                        </Form.Item>
                        </Col>
                    </Row>
                </Form>
                <LabelFormButton>
                    <Button onClick={this.props.closeRightBox} style={{ width: "100px" }}>取消</Button>
                    <Button onClick={this.handleSubmit} disabled={this.props.rightData.statusVo &&this.props.rightData.statusVo.code == '0'?(this.props.permission.indexOf('INSTOCK_MATERIEL-IMPORT-JZQK')==-1?true:false):true}  style={{ width: "100px", marginLeft: "20px" }} type='primary'>保存</Button>
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