import React, { Component } from 'react'
import style from './style.less'
import { Form, Row, Col, Input, Button, Modal, Select, DatePicker, Checkbox, TreeSelect } from 'antd';
import { connect } from 'react-redux'
import axios from '../../../../../api/axios'
import { addQuestionList, getdictTree, docOrgSel, updateQuestionList, getUserByOrgId,orgTree } from '../../../../../api/api'
import * as dataUtil from "../../../../../utils/dataUtil";
const { MonthPicker, RangePicker } = DatePicker;
const FormItem = Form.Item;
const Option = Select.Option
const { TextArea } = Input;
//新增项目团队弹框
class Search extends Component {
    constructor(props) {
        super(props)
        this.state = {
            visible: true,
            addRecord: null,
            modifyRecord: null,
            data: null,
            orgList: [],
            info: {
            }
        }
    }


    componentDidMount() {


    }
    //获取责任主体
    getOrgList = () => {
        if (this.state.orgList.length == 0) {
            axios.get(orgTree).then(res => {
                if (res.data.data) {
                    this.setState({
                        orgList: res.data.data
                    }, () => {
                        this.props.form.set
                    })
                }
            })
        }
    }
    //
    selectUser = (id) => {
        this.props.form.setFieldsValue({ uesrId: null })
        this.getUser(id)
    }
    //责任人
    getUser = (id) => {
        axios.get(getUserByOrgId(id)).then(res => {
            this.setState({
                userlist: res.data.data,
                userlist1: null
            })
        })
    }
    //获取问题类型
    getQuestionTypeList = () => {
        if (!this.state.questionTypeList) {
            axios.get(getdictTree("plan.question.type")).then(res => {
                if (res.data.data) {
                    this.setState({
                        questionTypeList: res.data.data
                    })
                }
            })
        }
    }
    handleSubmit = (e) => {
        e.preventDefault();
        this.props.form.validateFieldsAndScroll((err, values) => {
            if (!err) {
                let obj = {
                    from: values.range ? dataUtil.Dates().formatTimeString(values.range[0]) : null,
                    to: values.range ? dataUtil.Dates().formatTimeString(values.range[1]) : null,
                    ...values,
                    containOrgSon: values.containOrgSon ? 1 : 0
                }
                this.props.searchList(obj)
                this.props.handleCancel()
            }
        });
    }

    render() {
        const { intl } = this.props.currentLocale;
        const {
            getFieldDecorator, getFieldsError, getFieldError, isFieldTouched,
        } = this.props.form;
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
        return (
            <div >
                <Modal className={style.main}
                    title="查找" visible={true}
                    onOk={this.handleOk} onCancel={this.props.handleCancel}
                    mask={false}
                    maskClosable={false}
                    width="600px"
                    footer={
                        <div className="modalbtn">
                            <Button key={2} onClick={() => this.props.form.resetFields()}  >重置</Button>
                            <Button key={3} onClick={this.handleSubmit} type="primary" >查找</Button>
                        </div>
                    }
                >
                    <Form onSubmit={this.handleSubmit} className={style.info}>
                        <div className={style.content}>
                            <Row type="flex">
                                <Col span={12}>
                                    <Form.Item label="提出部门" {...formItemLayout}>
                                        {getFieldDecorator('orgId', {
                                            initialValue: this.state.info.questionCreatedOrg ? this.state.info.questionCreatedOrg.id : null,

                                        })(
                                            <TreeSelect

                                                style={{ width: "100%" }}
                                                onFocus={this.getOrgList}
                                                treeData={this.state.orgList}
                                                onChange={this.selectUser}
                                                treeDefaultExpandAll

                                            />
                                        )}
                                    </Form.Item>
                                </Col>
                                <Col span={12}>
                                    <Form.Item label="提出人" {...formItemLayout}>
                                        {getFieldDecorator('uesrId', {
                                        })(
                                            <Select onDropdownVisibleChange={this.getUserData}>
                                                {this.state.userlist && this.state.userlist.map(item => {
                                                    return <Option value={item.id} key={item.id}>{item.title}</Option>
                                                })}
                                            </Select>
                                        )}
                                    </Form.Item>
                                </Col>
                                <Col span={12}>
                                    <Form.Item label="日期范围" {...formItemLayout}>
                                        {getFieldDecorator('range', {
                                            initialValue: this.state.info.content,

                                        })(
                                            <RangePicker style={{width:"300px"}}/>
                                        )}
                                    </Form.Item>
                                </Col>
                                <Col span={12}>
                                  <div style={{marginLeft:"130px",width:"220px"}}>
                                    <Form.Item label="包含子部门" {...formItemLayout}>
                                        {getFieldDecorator('containOrgSon', {
                                            initialValue: this.state.info.content,
                                            valuePropName: 'checked',

                                        })(
                                            <Checkbox style={{marginLeft:"10px"}}/>
                                        )}
                                    </Form.Item>
                                  </div>
                                </Col>
                            </Row>
                        </div>
                    </Form>
                </Modal>

            </div>
        )
    }
}
const Searchs = Form.create()(Search);
export default connect(state => ({
    currentLocale: state.localeProviderData
}))(Searchs)
