import React, { Component } from 'react'
import { Form, Row, Col, Input, Button, Icon, Select, DatePicker, Switch, Slider, InputNumber } from 'antd';
import { connect } from 'react-redux'
import axios from '../../../../api/axios'
import * as dataUtil from '../../../../utils/dataUtil'
import LabelFormLayout from "../../../../components/public/Layout/Labels/Form/LabelFormLayout"
import LabelFormButton from "../../../../components/public/Layout/Labels/Form/LabelFormButton"
import { defineVariableInfo, getdictTree, defineVariableUpdate } from "../../../../api/api"

const FormItem = Form.Item;
const Option = Select.Option
const { TextArea } = Input;
class PlanDefineSetvar extends Component {
    constructor(props) {
        super(props)
        this.state = {
            initDone: false,                 //国际化初始化状态
            info: {},                        //基本信息
            inputValue: 1,                      //权重
            cpmtypeData: [],
            taskdrtntypeData: [],
            taskfinishtypeData: [],
        }
    }
    componentDidMount() {
        this.getData();
    }

    getData = () => {
        //获取数据
        axios.get(defineVariableInfo(this.props.data.id)).then(res => {
            this.setState({
                info: res.data.data
            })
        })
        //项目-关键路径
        axios.get(getdictTree('plan.project.cpmtype')).then(res => {
            this.setState({
                cpmtypeData: res.data.data
            })
        })
        //工期类型
        axios.get(getdictTree('plan.project.taskdrtntype')).then(res => {
            this.setState({
                taskdrtntypeData: res.data.data
            })
        })
        //任务完成%类型
        axios.get(getdictTree('plan.define.taskfinishtype')).then(res => {
            this.setState({
                taskfinishtypeData: res.data.data
            })
        })

    }

    handleSubmit = (e) => {
        e.preventDefault();
        this.props.form.validateFieldsAndScroll((err, values) => {
            if (!err) {
                var data = {
                    ...values,
                    id: this.props.data.id,
                    shareWbs: values['shareWbs'] ? 1 : 0,
                }
                let url = dataUtil.spliceUrlParams(defineVariableUpdate,{"startContent": "项目【"+ this.props.projectName +"】"});
                axios.put(url, data, true).then(res=>{
                })
            }
        });
    }
    onChange = (value) => {
        this.setState({
            inputValue: value,
        });
    }
    render() {
        const { intl } = this.props.currentLocale;
        const {
            getFieldDecorator, getFieldsError, getFieldError, isFieldTouched } = this.props.form;
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
        const formItemLayout2 = {
            labelCol: {
                xs: { span: 24 },
                sm: { span: 4 },
            },
            wrapperCol: {
                xs: { span: 22 },
                sm: { span: 20 },
            },
        };
        const dateWidth = '100%'
        return (

          <LabelFormLayout title = {this.props.title} >
            <Form onSubmit={this.handleSubmit}>
              <Row type="flex">
                <Col span={12}>
                  <Form.Item label={intl.get("wsd.i18n.plan.feedback.taskdrtntype")} {...formItemLayout}>
                    {/* 工期类型 */}
                    {getFieldDecorator('taskDrtnType', {
                      initialValue: this.state.info.taskDrtnType ? this.state.info.taskDrtnType.id : null,
                      rules: [],
                    })(
                      <Select>
                        {this.state.taskdrtntypeData.length ? this.state.taskdrtntypeData.map(item => {
                          return (
                            <Option key={item.value} value={item.value}>{item.title}</Option>
                          )
                        }) : null}

                      </Select>
                    )}
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item label={intl.get("wsd.i18n.plan.define.taskfinpcttype")} {...formItemLayout}>
                    {/* 任务完成%类型 */}
                    {getFieldDecorator('taskFinpctType', {
                      initialValue: this.state.info.taskFinpctType ? this.state.info.taskFinpctType.id : null,
                      rules: [],
                    })(
                      <Select>
                        {this.state.taskfinishtypeData.length ? this.state.taskfinishtypeData.map(item => {
                          return (
                            <Option key={item.value} value={item.value}>{item.title}</Option>
                          )
                        }) : null}

                      </Select>
                    )}
                  </Form.Item>
                </Col>
              </Row>
              <Row type="flex">
                <Col span={12}>
                  <Form.Item label={intl.get('wsd.i18n.plan.define.cpmtype')} {...formItemLayout}>
                    {/* 关键路径 */}
                    {getFieldDecorator('cpmType', {
                      initialValue: this.state.info.cpmType ? this.state.info.cpmType.id : null,
                      rules: [],
                    })(
                      <Select>
                        {this.state.cpmtypeData.length ? this.state.cpmtypeData.map(item => {
                          return (
                            <Option key={item.value} value={item.value}>{item.title}</Option>
                          )
                        }) : null}

                      </Select>
                    )}
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item label={intl.get('wsd.i18n.plan.define.sharewbs')} {...formItemLayout}>
                    {/* 启用内部共享 */}
                    {getFieldDecorator('shareWbs', {
                      initialValue: this.state.info.shareWbs ? true : false,
                      valuePropName: 'checked',
                      rules: [],
                    })(
                      <Switch checkedChildren="开" unCheckedChildren="关" />
                    )}
                  </Form.Item>
                </Col>
              </Row>
              <Row type="flex">
                <Col span={12}>
                  <Form.Item label={intl.get('wsd.i18n.plan.define.cpmfloat')} {...formItemLayout}>
                    {/* 总浮时<= */}
                    {getFieldDecorator('cpmFloat', {
                      initialValue: this.state.info.cpmFloat,
                      rules: [],
                    })(
                      <InputNumber style={{width: '100%'}} />
                    )}
                  </Form.Item>
                </Col>
              </Row>
            </Form>
            <LabelFormButton>
              <Button onClick={this.props.closeRightBox} style={{ width: "100px", marginRight: "20px" }}>取消</Button>
              <Button onClick={this.handleSubmit} style={{ width: "100px" }} type="primary">保存</Button>
            </LabelFormButton>
          </LabelFormLayout>
        )
    }
}

const PlanDefineSetvars = Form.create()(PlanDefineSetvar);
export default connect(state => ({
    currentLocale: state.localeProviderData
}))(PlanDefineSetvars);
