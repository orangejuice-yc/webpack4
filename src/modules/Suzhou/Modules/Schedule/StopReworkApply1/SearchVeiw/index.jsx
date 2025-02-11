import React, { Component } from 'react'
import style from './style.less'
import { Icon, Select, Input, DatePicker, TreeSelect, Radio, Checkbox, Button, Form, Row, Col, Popover } from 'antd'
import { connect } from 'react-redux'
import moment from "moment"
import { log } from 'util';
import * as dataUtil from "../../../../../../utils/dataUtil";
import axios from '../../../../../../api/axios';
import {getBaseSelectTree} from '../../../../api/suzhou-api';
const { TextArea } = Input;
const FormItem = Form.Item;
const { Option } = Select;
const { RangePicker} = DatePicker;
export class Search extends Component {
    constructor(props) {
        super(props)
        this.state = {
            type:null, // 类别
            status:null, //状态
            optionStatus:[], //状态
            projectName:[],//项目名称
        }
    }
    componentDidMount(){
        axios.get(getBaseSelectTree("base.flow.status")).then((res)=>{
          if(Array.isArray(res.data.data)){
            this.setState({
              optionStatus:res.data.data
            })
          }
        });
        axios.get(getBaseSelectTree("rework.projectName")).then((res)=>{
            this.setState({
              projectName:res.data.data
            })
          });
    }
    change = (e) => {
        this.setState({
            value: e.target.value
        })
    }
    click() {
        if(this.props.search){
            let data = {
                applyNum:this.input.value
            }
            this.props.search(data,'applyNum');
        }
    }
    //气泡显影
    handleClickChange = visible => {
        this.setState({
            clicked: visible,
        });
    };
    treeSelectChange = (value) => {
        this.props.form.setFieldsValue({ userId: null })
    }
    
    //保存视图
    handleSubmit = (val, e) => { 
        //   e.preventDefault();
          this.props.form.validateFieldsAndScroll((err, values) => {
            if (!err) {
                this.setState({
                    clicked: false,
                  },()=>{
                    this.props.search(values);
                });
                
            }
          })
    }
    
    render() {
        const {
            getFieldDecorator, getFieldsError, getFieldError, isFieldTouched,
        } = this.props.form;
        const formItemLayout = {
            labelCol: {
                xs: { span: 24 },
                sm: { span: 6 },
            },
            wrapperCol: {
                xs: { span: 24 },
                sm: { span: 18 },
            },
        };
        const formLayout = {
            labelCol: {
                sm: { span: 4 },
            },
            wrapperCol: {
                sm: { span: 20 },
            },
        }
        const content = (
            <Form onSubmit={this.handleSubmit} style={{ width: 380 }} className={style.formstyle}>
                <div className={style.content}>
                    <Row >
                        {/* <Col span={24}>
                            <Form.Item label="类别" {...formItemLayout}>
                                {getFieldDecorator('type', {
                                })( 
                                    <Select 
                                        // onChange={this.props.selectPeopleType}
                                        style={{width:'100%', marginRight: 10 }}
                                        allowClear
                                        size="small">
                                        <Option key='0' value='0'>停工</Option>
                                        <Option key='1' value='1'>复工</Option>
                                    </Select>
                                )}
                            </Form.Item>
                        </Col> */}
                        <Col span={24}>
                            <Form.Item label="状态" {...formItemLayout}>
                                {getFieldDecorator('status', {
                                })(
                                    <Select allowClear 
                                            onChange={this.props.selectPeopleType}
                                                style={{width:'100%', marginRight: 10 }}
                                                // defaultValue="INIT" 
                                                size="small">
                                        {
                                            this.state.optionStatus.length && this.state.optionStatus.map((item,i) => {
                                            return (
                                                <Option key={item.value} value={item.value}>{item.title}</Option>
                                            )
                                            })
                                        }
                                    </Select>
                                )}
                            </Form.Item>
                        </Col>
                        <Col span={24}>
                            <Form.Item label="项目名称" {...formItemLayout}>
                                {getFieldDecorator('projectDictCode', {
                                })(
                                    <Select allowClear 
                                                style={{width:'100%', marginRight: 10 }}
                                                // defaultValue="INIT" 
                                                size="small">
                                        {
                                            this.state.projectName.length && this.state.projectName.map((item,i) => {
                                            return (
                                                <Option key={item.value} value={item.value}>{item.title}</Option>
                                            )
                                            })
                                        }
                                    </Select>
                                )}
                            </Form.Item>
                        </Col>
                    </Row>
                    <Row>
                        <Col span={24}>
                            <Col span={12} offset={12}>
                                <div style={{ display: "flex", justifyContent: "space-between" }}>
                                    <Button style={{ width: 88 }} onClick={()=> this.props.form.resetFields()}>重置</Button>
                                    <Button type="primary" onClick={this.handleSubmit.bind(this)}>搜索</Button>
                                </div>
                            </Col>
                        </Col>
                    </Row>
                </div>
            </Form>
        )
        return (
            <div className={style.main}>
                {/* <span>
                    <Icon type="search" className={style.icon} />
                    <input type="text" placeholder={this.props.applyType=='0'?"申请编号":'编号'} ref={input => this.input = input} />
                </span>
                <span onClick={this.click.bind(this)} className={style.search}>搜索</span> */}
                <Popover placement="bottomRight" content={content} trigger="click"
                    visible={this.state.clicked}
                    onVisibleChange={this.handleClickChange}>
                    <Icon type={this.state.clicked?"align-right":"unordered-list" } style={{fontSize:16,marginLeft:5,verticalAlign: "sub"}}/>
                </Popover>
            </div>
        )
    }
}
const Searchs = Form.create()(Search);
export default connect(state => ({
    currentLocale: state.localeProviderData
}), {

    })(Searchs);
