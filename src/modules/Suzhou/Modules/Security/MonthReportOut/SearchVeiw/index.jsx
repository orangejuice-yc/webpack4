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
            optionStatus:[], //流程状态
            monthOption:[
                {id:'1',value:"01"},{id:'2',value:"02"},{id:'3',value:"03"},{id:'4',value:"04"},{id:'5',value:"05"},{id:'6',value:"06"},
                {id:'7',value:"07"},{id:'8',value:"08"},{id:'9',value:"09"},{id:'10',value:"10"},{id:'11',value:"11"},{id:'12',value:"12"},
            ],//月份
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
    }
    change = (e) => {
        this.setState({
            value: e.target.value
        })
    }
    click() {
        if(this.props.search){
            let data = {
                searcher:this.input.value
            }
            this.props.search(data);
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
                values.year = values.year? moment(values.year).format('YYYY'):'';
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
                            <Form.Item label="年份"  {...formItemLayout}>
                                {getFieldDecorator('year', {
                                })(
                                    <DatePicker
                                        placeholder={'年份'}
                                        mode={'year'}
                                        format="YYYY"
                                        size="small"
                                        style={{width:'100%'}}
                                        onChange={value => this.props.form.setFieldsValue({ year: value })}
                                        onPanelChange={value => this.props.form.setFieldsValue({ year: value })}
                                    />
                                )}
                            </Form.Item>
                        </Col>
                        <Col span={24}>
                            <Form.Item label="月份"  {...formItemLayout}>
                                {getFieldDecorator('month', {
                                })(
                                    <Select allowClear 
                                            style={{width:'100%', marginRight: 10 }}
                                            size="small">
                                        {this.state.monthOption.length && this.state.monthOption.map((item,i)=>{
                                            return (
                                                <Option key={item.id} value={item.value}>{item.value}</Option>
                                            )
                                        })}
                                    </Select>
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
                            <Form.Item label="文档编号" {...formItemLayout}>
                                {getFieldDecorator('searcher', {
                                })(
                                    <Input style={{padding:'0 10px',height:'22px'}} />
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
                <span>
                    <Icon type="search" className={style.icon} />
                    <input type="text" placeholder="文档编号/单位名称" ref={input => this.input = input} />
                </span>
                <span onClick={this.click.bind(this)} className={style.search}>搜索</span>
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
