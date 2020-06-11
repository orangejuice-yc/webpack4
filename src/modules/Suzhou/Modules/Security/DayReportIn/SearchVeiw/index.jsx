import React, { Component } from 'react'
import style from './style.less'
import { Icon, Select, Input, DatePicker, TreeSelect, Radio, Checkbox, Button, Form, Row, Col, Popover } from 'antd'
import { connect } from 'react-redux'
import moment from "moment"
import { log } from 'util';
import * as dataUtil from "../../../../../../utils/dataUtil";
import axios from '../../../../../../api/axios';
import {getBaseSelectTree,queryGrDep} from '../../../../api/suzhou-api';
const { TextArea } = Input;
const FormItem = Form.Item;
const { Option } = Select;
const { RangePicker } = DatePicker;
export class Search extends Component {
    constructor(props) {
        super(props)
        this.state = {
            orgTree: [],
            orgUserList: [],
            peoEntryType:null, //人员类型
            type:null, // 类别
            startTime:null, //开始时间
            endTime:null, //结束时间
            status:null, //状态
        }
    }
    componentDidMount(){
        
    }
    change = (e) => {
        this.setState({
            value: e.target.value
        })
    }
    // click() {
    //     if(this.props.search){
    //         let data = {
    //             searcher:this.input.value
    //         }
    //         this.props.search(data,'Code');
    //     }
    // }
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
                if(!values.searchTime || !values.searchTime.length){
                    values.xfSjStart = "";
                    values.xfSjEnd = "";
                }else{
                    values.xfSjStart =  moment(values.searchTime[0]).format('YYYY-MM-DD');
                    values.xfSjEnd =  moment(values.searchTime[1]).format('YYYY-MM-DD');
                }
                this.setState({
                    clicked: false,
                  },()=>{
                    this.props.search(values);
                });
                
            }
          })
    }
    
    render() {
        const { intl } = this.props.currentLocale
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
                        <Col span={24}>
                            <Form.Item label="时间"  {...formItemLayout}>
                                {getFieldDecorator('searchTime', {
                                })(
                                    <RangePicker
                                        style={{width:'100%'}}
                                        format="YYYY-MM-DD"
                                        placeholder={['开始时间', '结束时间']}
                                        size="small"
                                    />
                                )}
                            </Form.Item>
                        </Col>
                        <Col span={24}>
                            <Form.Item label="状态" {...formItemLayout}>
                                {getFieldDecorator('status', {
                                })(
                                    <Select allowClear 
                                            style={{width:'100%', marginRight: 10 }}
                                            size="small">
                                        <Option key={'0'} value={'0'}>未下发</Option>
                                        <Option key={'1'} value={'1'}>已下发</Option>
                                        <Option key={'2'} value={'2'}>已关闭</Option>
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
                    <input type="text" placeholder="文档编号" ref={input => this.input = input} />
                </span> */}
                <span className={style.search}>搜索</span>
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
