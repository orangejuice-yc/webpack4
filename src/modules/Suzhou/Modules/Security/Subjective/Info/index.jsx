import React, { Component } from 'react';
import { Form, Row, Col, Input, Button, InputNumber, Select, DatePicker, Checkbox, message } from 'antd';
import { connect } from 'react-redux';
import moment from 'moment';
import { curdCurrentData } from '../../../../../../store/curdData/action';
import {updSubjectTemplate} from '../../../../api/suzhou-api';
import axios from '../../../../../../api/axios';
import * as dataUtil from "../../../../../../utils/dataUtil"
import style from './style.less';
import {roleList} from '@/api/api';
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
            ratersOption:[],//评分人员
        }
    }
    //获取菜单基本信息
    getData = (id) => {
        // 请求获取info数据
        // axios.get(getDangerPlanInfo(id)).then(res => {
        //     this.setState({
        //         info: res.data.data,
        //     });
        // });
    };
    componentDidMount() {
        axios.get(roleList).then(res=>{
            if(res.data.data){
                this.setState({ratersOption:res.data.data})
            }
        })
        this.props.rightData ? this.setState({info:this.props.rightData}) : null;
    }
    handleSubmit = (e)=>{
        e.preventDefault();
        this.props.form.validateFieldsAndScroll((err, values) => {
            if (!err) {
              const data = {
                ...this.props.rightData,
                ...values,
                raters:values.raters.join(),
              };
              // 更新菜单
              axios.put(updSubjectTemplate, data, true).then(res => {
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
                            <Form.Item label={'分组名称'} {...formItemLayout}>
                                {getFieldDecorator('groupTitle', {
                                initialValue: this.state.info.groupTitle,
                                rules: [{ 
                                    required: true,
                                    message:'请输入分组名称',
                                }],
                                })(
                                <Input disabled />,
                                )}
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item label={'业务模块'} {...formItemLayout}>
                                {getFieldDecorator('moduleTitle', {
                                initialValue: this.state.info.moduleTitle,
                                rules: [{ 
                                    required: true,
                                    message:'请输入业务模块',
                                }],
                                })(
                                    <Input disabled/>,
                                )}
                            </Form.Item>
                        </Col>
                        <Col span={24}>
                            <Form.Item label={'评分人员'} {...formItemLayout1}>
                                {getFieldDecorator('raters', {
                                initialValue:this.state.info.rolesVo?this.state.info.rolesVo.map((item)=>{
                                    return item.id
                                }):[],
                                rules: [{ 
                                    required: true,
                                    message:'请输入评分人员',
                                }],
                                })(
                                        <Select mode="multiple" disabled={this.props.permission.indexOf('SUBJECTIVE_EDIT_SUBJECTTEMPLATE')==-1?true:false}>
                                            {
                                            this.state.ratersOption.length && this.state.ratersOption.map((item,i) => {
                                                return (
                                                <Option key={item.id} value={item.id}>{item.roleName}</Option>
                                                )
                                            })
                                            }
                                        </Select>,                                
                                        // <Input disabled={((this.props.rightData.statusVo &&this.props.rightData.statusVo.code == 'INIT') || (this.props.taskFlag))?false:true} />,
                                )}
                            </Form.Item>
                        </Col>
                    </Row>
                </Form>
                <LabelFormButton>
                    <Button onClick={this.props.closeRightBox} style={{ width: "100px" }}>取消</Button>
                    <Button onClick={this.handleSubmit} style={{ width: "100px", marginLeft: "20px" }} type='primary' disabled={this.props.permission.indexOf('SUBJECTIVE_EDIT_SUBJECTTEMPLATE')==-1?true:false}>保存</Button>
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