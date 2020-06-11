import React, { Component } from 'react';
import { Form, Row, Col, Input, Button, InputNumber, Select, DatePicker, Checkbox, message } from 'antd';
import { connect } from 'react-redux';
import moment from 'moment';
import { curdCurrentData } from '../../../../../../store/curdData/action';
import {updObjectTemplate} from '../../../../api/suzhou-api';
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
        // axios.get(getDangerPlanInfo(id)).then(res => {
        //     this.setState({
        //         info: res.data.data,
        //     });
        // });
    };
    componentDidMount() {
        this.props.rightData ? this.setState({info:this.props.rightData}) : null;
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
              axios.put(updObjectTemplate, data, true).then(res => {
                  const obj = {
                      ...this.props.rightData,
                      ...res.data.data
                  }
                this.props.updateSuccess(obj);
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
                                {getFieldDecorator('checkTitle', {
                                initialValue: this.state.info.checkTitle,
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
                            <Form.Item label={'标准分'} {...formItemLayout}>
                                {getFieldDecorator('maxScore', {
                                initialValue: this.state.info.maxScore,
                                rules: [{ 
                                    required: true,
                                    message:'请输入标准分',
                                }],
                                })(
                                    <InputNumber min={0} max={100} style={{width:'100%'}} disabled={this.props.permission.indexOf('OBJECTIVE_EDIT_OBJECTTEMPLATE')==-1?true:false}  />,
                                )}
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item label={'最小分值'} {...formItemLayout}>
                                {getFieldDecorator('minScore', {
                                initialValue: this.state.info.minScore,
                                rules: [{ 
                                    required: true,
                                    message:'请输入最小分值',
                                }],
                                })(
                                    <InputNumber min={0} max={100} style={{width:'100%'}} disabled={this.props.permission.indexOf('OBJECTIVE_EDIT_OBJECTTEMPLATE')==-1?true:false}  />
                                // <Input disabled={((this.props.rightData.statusVo &&this.props.rightData.statusVo.code == 'INIT') || (this.props.taskFlag))?false:true} />,
                                )}
                            </Form.Item>
                        </Col>
                    </Row>
                </Form>
                <LabelFormButton>
                    <Button onClick={this.props.closeRightBox} style={{ width: "100px" }}>取消</Button>
                    <Button onClick={this.handleSubmit} style={{ width: "100px", marginLeft: "20px" }} type='primary' disabled={this.props.permission.indexOf('OBJECTIVE_EDIT_OBJECTTEMPLATE')==-1?true:false} >保存</Button>
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