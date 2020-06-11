import React, { Component } from 'react';
import { Form, Row, Col, Input, Button, InputNumber, Select, DatePicker, Checkbox, message } from 'antd';
import { connect } from 'react-redux';
import moment from 'moment';
import { curdCurrentData } from '../../../../../../store/curdData/action';
import {updateClassification,getInfoClassification} from '../../../../api/suzhou-api';
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
        axios.get(getInfoClassification(id)).then(res => {
            this.setState({
                info: res.data.data,
            });
        });
    };
    componentDidMount() {
        this.props.data ? this.getData(this.props.data.id) : null;
        // this.setState({
        //     info:this.props.rightData
        // })
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
              axios.put(updateClassification, data, true).then(res => {
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
                            <Form.Item label={'物料编码'} {...formItemLayout}>
                                {getFieldDecorator('materialCode', {
                                initialValue: this.state.info.materialCode,
                                rules: [{ 
                                    required: true,
                                    message:'请输入物料编号',
                                }],
                                })(
                                    <Input disabled />,
                                )}
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item label={'物料名称'} {...formItemLayout}>
                                {getFieldDecorator('materialName', {
                                initialValue: this.state.info.materialName,
                                rules: [{ 
                                    required: true,
                                    message:'请输入物料名称',
                                }],
                                })(
                                    <Input disabled = {((this.props.rightData.statusVo &&this.props.rightData.statusVo.code == 'INIT') || (this.props.rightData.statusVo && this.props.rightData.statusVo.code == 'REJECT' && this.props.taskFlag))?false:true} />,
                                )}
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item label={'来源'} {...formItemLayout}>
                                {getFieldDecorator('source', {
                                    initialValue: this.state.info.source?this.state.info.source.toString():'',
                                    rules: [{ 
                                        required: true,
                                        message:'请选择来源',
                                    }],
                                })(
                                    <Select disabled = {((this.props.rightData.statusVo &&this.props.rightData.statusVo.code == 'INIT') || (this.props.rightData.statusVo && this.props.rightData.statusVo.code == 'REJECT' && this.props.taskFlag))?false:true}>
                                        <Option key={'0'} value={'0'}>甲供</Option>
                                        <Option key={'1'} value={'1'}>乙供</Option>
                                    </Select>
                                )}
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item label={'规格型号'} {...formItemLayout}>
                                {getFieldDecorator('specification', {
                                initialValue: this.state.info.specification,
                                // rules: [{ 
                                //     required: true,
                                //     message:'请输入规格型号',
                                // }],
                                })(
                                    <Input disabled = {((this.props.rightData.statusVo &&this.props.rightData.statusVo.code == 'INIT') || (this.props.rightData.statusVo && this.props.rightData.statusVo.code == 'REJECT' && this.props.taskFlag))?false:true}/>,
                                )}
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item label={'供货商'} {...formItemLayout}>
                                {getFieldDecorator('supplier', {
                                    initialValue: this.state.info.supplier,
                                    // rules: [{ 
                                    //     required: true,
                                    //     message:'请选择供货商',
                                    // }],
                                })(
                                    <Input disabled = {((this.props.rightData.statusVo &&this.props.rightData.statusVo.code == 'INIT') || (this.props.rightData.statusVo && this.props.rightData.statusVo.code == 'REJECT' && this.props.taskFlag))?false:true}/>
                                 )}
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item label={'计量单位'} {...formItemLayout}>
                                {getFieldDecorator('unit', {
                                initialValue: this.state.info.unit,
                                rules: [{ 
                                    required: true,
                                    message:'请输入计量单位',
                                }],
                                })(
                                    <Input disabled = {((this.props.rightData.statusVo &&this.props.rightData.statusVo.code == 'INIT') || (this.props.rightData.statusVo && this.props.rightData.statusVo.code == 'REJECT' && this.props.taskFlag))?false:true}/>,
                                )}
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item label={'品牌'} {...formItemLayout}>
                                {getFieldDecorator('brand', {
                                initialValue: this.state.info.brand,
                                // rules: [{ 
                                //     required: true,
                                //     message:'请输入品牌',
                                // }],
                                })(
                                    <Input disabled = {((this.props.rightData.statusVo &&this.props.rightData.statusVo.code == 'INIT') || (this.props.rightData.statusVo && this.props.rightData.statusVo.code == 'REJECT' && this.props.taskFlag))?false:true}/>,
                                )}
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item label={'合同数量'} {...formItemLayout}>
                                {getFieldDecorator('contractAmount', {
                                initialValue: this.state.info.contractAmount,
                                rules: [{ 
                                    required: true,
                                    message:'请输入合同数量',
                                }],
                                })(
                                    <Input disabled />,
                                )}
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item label={'需第三方检测'} {...formItemLayout}>
                                {getFieldDecorator('needThirdInspection', {
                                initialValue: this.state.info.needThirdInspectionVo?this.state.info.needThirdInspectionVo.code.toString():'',
                                rules: [{
                                    required: true,
                                    message: '请选择是否需第三方检测'
                                }],
                                })(
                                <Select disabled = {((this.props.rightData.statusVo &&this.props.rightData.statusVo.code == 'INIT') || (this.props.rightData.statusVo && this.props.rightData.statusVo.code == 'REJECT' && this.props.taskFlag))?false:true}>
                                    <Option key={'0'} value={'0'}>是</Option>
                                    <Option key={'1'} value={'1'}>否</Option>
                                </Select>,
                                )}
                            </Form.Item>
                        </Col>
                        <Col span={24}>
                        <Form.Item label={'备注说明'} {...formItemLayout1}>
                            {getFieldDecorator('description', {
                            initialValue: this.state.info.description,
                            rules: [],
                            })(
                                <TextArea rows={2} disabled = {((this.props.rightData.statusVo &&this.props.rightData.statusVo.code == 'INIT') || (this.props.rightData.statusVo && this.props.rightData.statusVo.code == 'REJECT' && this.props.taskFlag))?false:true}/>,
                            )}
                        </Form.Item>
                        </Col>
                    </Row>
                </Form>
                <LabelFormButton>
                    <Button onClick={this.props.closeRightBox} style={{ width: "100px" }}>取消</Button>
                    <Button onClick={this.handleSubmit} disabled = {((this.props.rightData.statusVo &&this.props.rightData.statusVo.code == 'INIT') || (this.props.rightData.statusVo && this.props.rightData.statusVo.code == 'REJECT' && this.props.taskFlag))?(this.props.permission.indexOf('SORT_MATERIEL-SORT')==-1?true:false):true} style={{ width: "100px", marginLeft: "20px" }} type='primary'>保存</Button>
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