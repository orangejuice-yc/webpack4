import React, { Component } from 'react';
import {Modal,Form,Row,Col,Input,Button,Icon,Select,DatePicker,Slider,InputNumber,message,Checkbox,TreeSelect} from 'antd';
import moment from 'moment';
import style from './style.less';
import intl from 'react-intl-universal';
import { connect } from 'react-redux';
import { curdCurrentData } from '../../../../../../store/curdData/action';
import axios from '../../../../../../api/axios';
import {getsectionId,getBaseSelectTree} from '../../../../api/suzhou-api';
const { TextArea } = Input;
const Option = Select.Option;
const TreeNode = TreeSelect.TreeNode;
import PublicButton from "../../../../../../components/public/TopTags/PublicButton";
import * as dataUtil from "../../../../../../utils/dataUtil";
import {getSelectTreeArr} from "@/modules/Suzhou/components/Util/firstLoad";
import SelectSection from '@/modules/Suzhou/components/SelectSection';

export class AddModal extends Component{
    constructor(props){
        super(props);
        this.state={
            selectSection:[], //选择标段
            keyPointOption:[], //关键节点类别
            firstSection:'',//默认第一个标段
        }
    }
    componentDidMount(){
        axios.get(getsectionId(this.props.projectId)).then(res=>{
            if(res.data.data){
                getSelectTreeArr(res.data.data,{"id":"value","name":"title"});
                this.setState({
                  selectSection:res.data.data,
                  firstSection:!res.data.data?'':res.data.data[0].value,
                  sectionCode:!res.data.data?'':res.data.data[0].code,
                })
            }
        });
        axios.get(getBaseSelectTree("szxm.aqgl.keyPointCategory")).then((res)=>{
            this.setState({
              keyPointOption:res.data.data
            })
        });
    }
    handleSubmit = (val,e)=>{
        e.preventDefault();
        this.props.form.validateFieldsAndScroll((err, values) => {
            values.acceptTime = values.acceptTime?dataUtil.Dates().formatTimeString(values.acceptTime).substr(0,10):"";
            if(!err){
                if (val == 'save') {
                    this.props.submit(values, 'save' );
                } else {
                    this.props.submit(values, 'goOn' );
                    this.props.form.resetFields();
                }
            }
        })
    }
    render(){
        const { intl } = this.props.currentLocale
        const { getFieldDecorator, getFieldsError, getFieldError, isFieldTouched } = this.props.form;
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
            <div>
                <Modal className={style.main}
                width="850px"
                afterClose={this.props.form.resetFields}
                mask={false}
                maskClosable={false}
                footer={<div className="modalbtn">
                    {/* 保存并继续 */}
                    <Button key={1} onClick={this.handleSubmit.bind(this, 'goOn')}>{intl.get('wsd.global.btn.saveandcontinue')}</Button>
                    {/* 保存 */}
                    <Button key={2} onClick={this.handleSubmit.bind(this, 'save')} type="primary">{intl.get('wsd.global.btn.preservation')}</Button>
                </div>}
                centered={true} title={'新增'} visible={this.props.modalVisible}
                onCancel={this.props.handleCancel}>
                    <Form onSubmit={this.handleSubmit} className={style.mainScorll}>
                        <Row>
                            <Col span={12}>
                                <Form.Item label={'选择标段'} {...formItemLayout}>
                                    {getFieldDecorator('sectionId', {
                                    initialValue:this.state.firstSection,
                                    rules: [{
                                        required: true,
                                        message: '请选择标段名称'
                                    }],
                                    })(
                                    <SelectSection
                                        projectId={this.props.projectId}
                                        callBack={({ sectionId ,sectionCode}) => {
                                            this.props.form.setFieldsValue({ sectionId});
                                            this.setState({sectionCode})
                                        }}
                                    />
                                    )}
                                </Form.Item>
                            </Col>
                            <Col span={12}>
                                <Form.Item label={'标段号'} {...formItemLayout}>
                                    {getFieldDecorator('sectionCode', {
                                    initialValue:this.state.sectionCode,
                                    rules: [{
                                        required: true,
                                        message: '请输入标段号'
                                    }],
                                    })(
                                    <Input disabled />,
                                    )}
                                </Form.Item>
                            </Col>
                            <Col span={12}>
                                <Form.Item label={'单位工程名称'} {...formItemLayout}>
                                    {getFieldDecorator('projectBuildName', {
                                    rules: [{
                                        required: true,
                                        message: '请输入单位工程名称'
                                    }],
                                    })(
                                    <Input />,
                                    )}
                                </Form.Item>
                            </Col>
                            <Col span={12}>
                                <Form.Item label={'关键节点类别'} {...formItemLayout}>
                                    {getFieldDecorator('keyPointCategory', {
                                    rules: [{
                                        required: true,
                                        message: '请输入关键节点类别'
                                    }],
                                    })(
                                        <Select>
                                            {
                                            this.state.keyPointOption.length && this.state.keyPointOption.map((item,i) => {
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
                                <Form.Item label={'验收时间'} {...formItemLayout}>
                                    {getFieldDecorator('acceptTime', {
                                    rules: [{
                                        required: true,
                                        message: '请选择验收时间'
                                    }],
                                    })(
                                        <DatePicker style={{ width: '100%' }} />
                                    )}
                                </Form.Item>
                            </Col>
                            <Col span={24}>
                                <Form.Item label={'自评意见'} {...formItemLayout1}>
                                    {getFieldDecorator('selfComment', {
                                    rules: [],
                                    })(
                                    <TextArea rows={2} />,
                                    )}
                                </Form.Item>
                            </Col>
                        </Row>
                    </Form>
                </Modal>
            </div>
        )
    }
}
const AddModals = Form.create()(AddModal);
export default connect(state => ({
  currentLocale: state.localeProviderData,
}))(AddModals);