import React, { Component } from 'react';
import {Modal,Form,Table,Row,Col,Input,Button,Icon,Select,DatePicker,Slider,InputNumber,message,Checkbox,TreeSelect} from 'antd';
import moment from 'moment';
import style from './style.less';
import intl from 'react-intl-universal';
import { connect } from 'react-redux';
import { curdCurrentData } from '../../../../../../store/curdData/action';
import axios from '../../../../../../api/axios';
import {getsectionId,getContractBySegCode,getContractListByCode,importWlflFromContract} from '../../../../api/suzhou-api';
const { TextArea } = Input;
const Option = Select.Option;
const TreeNode = TreeSelect.TreeNode;
import PublicButton from "../../../../../../components/public/TopTags/PublicButton";
import * as dataUtil from "../../../../../../utils/dataUtil";
import {getSelectTreeArr} from "@/modules/Suzhou/components/Util/firstLoad";
import notificationFun from '@/utils/notificationTip';
import { object } from 'prop-types';
import SelectSection from '@/modules/Suzhou/components/SelectSection';



export class Contract extends Component{
    constructor(props){
        super(props);
        this.state={
            selectSection:[], //选择标段
            currentSection:'', //默认第一个标段
            data:[],
            selectedRowKeys:[],
            selectedRow:[],
            contractOption:[],//合同编号
            loading:false,
        }
    }
    getContractCode = ()=>{
        const {projectId} = this.props;
        axios.get(getContractBySegCode,{params:{projectId,sectionId:this.state.sectionCode}}).then(res=>{
            this.setState({
                contractOption:res.data.data
            })
        })
    }
    componentDidMount(){
        const {projectId} = this.props
        axios.get(getsectionId(projectId)).then(res=>{
            getSelectTreeArr(res.data.data,{"id":"value","name":"title"});
            this.setState({
              selectSection:res.data.data,
              currentSection:!res.data.data?'':res.data.data[0].value,
              sectionCode:!res.data.data?'':res.data.data[0].code,
            },()=>{
                this.getContractCode();
            })
          })
    }
    //选择标段
    onChangeSection=(value,info)=>{
        if(value){
            this.props.form.setFieldsValue({
                'contract': ''
              })
            this.setState({
                sectionCode:info.props.code,
                currentSection:value,
                data:[],
            },()=>{
                this.getContractCode();
            })
        }else{
            this.setState({
                sectionCode:''
            })
        }
    }
    //选择合同
    selectContractCode = (val)=>{
        const {projectId} = this.props;
        const {currentSection} = this.state;
        this.setState({
            loading:true
        },()=>{
            axios.get(getContractListByCode,{params:{projectId,sectionIds:currentSection,contractCode:val}}).then(res=>{
                this.setState({
                    data:res.data.data,
                    loading:false
                })
            })
        })
        
    }
    handleSubmit = (val,e)=>{
        const {projectId} = this.props;
        const {selectedRows,selectedRowKeys,currentSection} = this.state;
        this.setState({
            loading:true
        })
        if(selectedRowKeys.length > 0){
            const data = [];
            selectedRows.map((item,i)=>{
                let obj = {
                    'projectId':projectId,
                    'sectionId':currentSection,
                    'materialName':item.listName,
                    'source':0,
                    'specification':item.listSpecification,
                    'unit':item.listUnit,
                    'contractAmount':item.listQuantity,
                    'supplier':item.listManufacturers,
                    'brand':'',
                    'needThirdInspection':'1',
                    'description':item.listPriceNo
                };
                data.push(obj);
            })
            if(data.length > 0){
                axios.post(importWlflFromContract,data,true).then(res=>{
                    this.setState({
                        loading:false
                    })
                    this.props.success();
                    this.props.handleCancel();
                })
            }
            
        }else{
            notificationFun("提示",'请选择数据')
        }
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
        let { selectedRowKeys,selectedRows} = this.state;
        const rowSelection = {
            selectedRowKeys,
            onChange: (selectedRowKeys, selectedRows) => {
              this.setState({
                selectedRowKeys,
                selectedRows
              })
            }
        };
        return(
            <div>
                <Modal className={style.main}
                width="850px"
                afterClose={this.props.form.resetFields}
                mask={false}
                maskClosable={false}
                footer={<div className="modalbtn">
                    <Button key={1} onClick={this.props.handleCancel}>取消</Button>
                    <Button key={2} onClick={this.handleSubmit.bind(this, 'save')} type="primary">确定</Button>
                </div>}
                centered={true} title={'导入'} visible={this.props.modalVisible}
                onCancel={this.props.handleCancel}>
                    <Form  className={style.mainScorll}>
                        <Row>
                            <Col span={12}>
                                <Form.Item label={'选择标段'} {...formItemLayout}>
                                    {getFieldDecorator('sectionId', {
                                    initialValue:this.state.currentSection,
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
                                        onSelect={this.onChangeSection}
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
                            <Col span={24}>
                                <Form.Item label={'合同名称'} {...formItemLayout1}>
                                    {getFieldDecorator('description', {
                                    rules: [{
                                        required: true,
                                        message: '请输入合同名称'
                                    }],
                                    })(
                                        <Select onChange={this.selectContractCode}>
                                        {
                                            this.state.contractOption.length && this.state.contractOption.map((item,i) => {
                                                return (
                                                <Option key={item.id} value={item.code}>{item.name}</Option>
                                                )
                                            })
                                        }
                                        </Select>,
                                    )}
                                </Form.Item>
                            </Col>
                        </Row>
                        </Form>
                        <Table rowKey={record => record.id}
                            defaultExpandAllRows={true}
                            pagination={false}
                            name={this.props.name}
                            columns={columns}
                            rowSelection={rowSelection}
                            dataSource={this.state.data}
                            size="small"
                            loading={this.state.loading}
                            onRow={(record, index) => {
                                return {
                                    // onClick: () => {
                                    //     this.getInfo(record, index)
                                    // },
                                    onDoubleClick: (event) => {
                                        event.currentTarget.getElementsByClassName("ant-checkbox-wrapper")[0].click();
                                    }
                                }
                                }
                            }
                        />
                </Modal>
            </div>
        )
    }
}
const Contracts = Form.create()(Contract);
export default connect(state => ({
  currentLocale: state.localeProviderData,
}))(Contracts);
const columns = [
    {
        title: '物料编码',
        dataIndex: 'listName',
    },
    {
        title: '规格型号',
        dataIndex: 'listSpecification',
    },
    {
        title: '计量单位',
        dataIndex: 'listUnit',
    },
    {
        title: '合同数量',
        dataIndex: 'listQuantity',
    },
    {
        title: '供应商',
        dataIndex: 'listManufacturers',
    },
]