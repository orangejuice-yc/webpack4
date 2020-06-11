import React, { Component } from 'react'
import { Modal, Form, Row, Col, Button, Select,notification } from 'antd';
import { connect } from 'react-redux'
import axios from '../../../../../api/axios'
import {
  defineBaselineInfo,
  getFieldBaseLineCompare,
  getPlanBaseLineCompareList,
  getvariable,
} from '../../../../../api/api';
import * as dataUtil from "../../../../../utils/dataUtil";
import MyIcon from '../../../../../components/public/TopTags/MyIcon'
import PageTable from "../../../../../components/PublicTable"
import RightTags from "../../../../../components/public/RightTags"
import ExtLayout from "../../../../../components/public/Layout/ExtLayout";
import MainContent from "../../../../../components/public/Layout/MainContent";
import Toolbar from "../../../../../components/public/Layout/Toolbar";
import PublicButton from "../../../../../components/public/TopTags/PublicButton";
import style from '../Vs/style.less';
import intl from 'react-intl-universal'


class PlanDefineBaselineCompare extends Component {
    constructor(props) {
        super(props)
        this.state = {
            formData: {},
            data: [],
            planBaseLineCompareList: [],
            groupCode: 1,
            activeIndex: '',
            projSet: { dateFormat: 'YYYY-MM-DD', drtnUnit: 'h', timeUnit: 'h', precision: 2, moneyUnit: '¥' },
        }
    }

    componentDidMount() {
        let obj = JSON.parse(localStorage.getItem("planBaseLineParam"))
        this.setState({
            defineId: obj.defineId,
            firstBaseLine: obj.firstBaseLine,
            secondBaseLine: obj.secondBaseLine,
            projectId: obj.projectId
        },()=>{
            if(this.state.data.length==0){
                this.formList.getData()
            }
            this.getBaseLineInfo(obj.firstBaseLine,obj.secondBaseLine);
        })

        axios.get(getFieldBaseLineCompare(obj.defineId), {}, null, null, false).then(res => {
            this.setState({
                planBaseLineCompareList: res.data.data
            })
        })
        axios.get(getvariable(obj.projectId)).then(res => {

            const data = res.data.data || {};
            const projSet = {
                dateFormat: (data.dateFormat || {}).id || "YYYY-MM-DD",
                drtnUnit: (data.drtnUnit || {}).id || "h",
                timeUnit: (data.timeUnit || {}).id || "h",
                precision: data.precision || 2,
                moneyUnit: (data.currency || {}).symbol || "¥",
            }
            this.setState({
                projSet
            })
        })

    }

    // 显示基线对比弹窗
    showBaselineVs = () => {
        this.setState({ isShowVs: true })
    }

    /**
   * 获取表单字段列表
   */
    getFormData = (callBack) => {
     
        const { defineId, firstBaseLine, secondBaseLine } = this.state
        if((defineId!=undefined) && (firstBaseLine!=undefined) && (secondBaseLine!=undefined)){
            axios.get(getPlanBaseLineCompareList(defineId, firstBaseLine, secondBaseLine), {}, null, null, false).then(res => {
                callBack(res.data.data)
               
            })
        }else{
            callBack([])
        }
       
    }
/**
   * 获取选中集合、复选框
   * @method getListData
   * @description 获取用户列表、或者根据搜索值获取用户列表
   * @param {string} record  行数据
   * @return {array} 返回选中用户列表
   */
  getRowData = (record) => {
    this.setState({
        rightData:record
    })
  };
    getBaseLineInfo = (firstBaseLine,secondBaseLine) =>{
        if (firstBaseLine == secondBaseLine) {
          dataUtil.message("请选择不同的基线!");
          return false
        }
        if(firstBaseLine == 0) {
          this.setState({
            firstBaseLineName: '执行计划'
          })
        }else{
          axios.get(defineBaselineInfo(firstBaseLine)).then(res => {
            this.setState({
              firstBaseLineName: res.data.data.baselineName
            })
          })
        }
        if(secondBaseLine == 0) {
          this.setState({
            secondBaseLineName: '执行计划'
          })
        }else{
          axios.get(defineBaselineInfo(secondBaseLine)).then(res => {
            this.setState({
              secondBaseLineName: res.data.data.baselineName
            })
          })
        }
    }

    handleSubmit = () => {
      this.props.form.validateFieldsAndScroll((err, val) => {
        if (!err) {
          const firstBaseLine = val.firstBaseLine
          const secondBaseLine = val.secondBaseLine
          if(firstBaseLine == secondBaseLine){
            dataUtil.message("请选择不同的基线");
            return false
          }
          this.getBaseLineInfo(firstBaseLine,secondBaseLine);
          this.formList.getData();
        }

      })
    }

    render() {
        const columns = [
            {
                title: '名称',
                dataIndex: 'taskName',
                key: 'taskName',
                width: "15%",
                render: (text, record) => {
                    if (text) {
                        if (record.taskType == 'project') {
                            return <span><MyIcon type='icon-xiangmu' style={{ marginRight: '5px' }} />{text}</span>
                        } else if (record.taskType == 'plan') {
                            return <span> <MyIcon type='icon-jihua1' style={{ marginRight: '5px' }} />{text}</span>
                        } else if (record.taskType == 0) {
                            if (record.taskName != record.blTaskName) {
                                return <span style={{ color: 'red' }}> <MyIcon type='icon-WBS' style={{ marginRight: '5px' }} />{text}</span>
                            } else {
                                return <span> <MyIcon type='icon-WBS' style={{ marginRight: '5px' }} />{text}</span>
                            }
                        } else if (record.taskType == 1 || record.taskType == 4) {
                            if (record.taskName != record.blTaskName) {
                                return <span style={{ color: 'red' }}> <MyIcon type='icon-renwu1' style={{ marginRight: '5px' }} />{text}</span>
                            } else {
                                return <span> <MyIcon type='icon-renwu1' style={{ marginRight: '5px' }} />{text}</span>
                            }
                        } else {
                            if (record.taskName != record.blTaskName) {
                                return <span style={{ color: 'red' }}> <MyIcon type='icon-lichengbei' style={{ marginRight: '5px' }} />{text}</span>
                            } else {
                                return <span> <MyIcon type='icon-lichengbei' style={{ marginRight: '5px' }} />{text}</span>
                            }
                        }
                    } else {
                        return null
                    }
                }
            },
            {
              title: '比较结果',
              dataIndex: 'compareResult',
              key: 'compareResult',
              width: "10%",
              render: (text) => {
                if (text) {
                  return <span>{text}</span>
                } else {
                  return null
                }
              }
            },
            {
                title: '代码',
                dataIndex: 'taskCode',
                key: 'taskCode',
                width: "10%",
                render: (text, record) => {
                    if (text) {
                        if ((record.taskCode != record.blTaskCode) && record.taskType != "project" && record.taskType != "plan") {
                            return <span style={{ color: 'red' }}>{text}</span>
                        } else {
                            return <span>{text}</span>
                        }
                    } else {
                        return null
                    }
                }
            },
            {
                title: '开始时间',
                dataIndex: 'planStartTime',
                key: 'planStartTime',
                width: "10%",
                render: (text, record) => {
                    if (text) {
                        if (record.planStartTime != record.blPlanStartTime && record.taskType != "project" && record.taskType != "plan") {
                            return <span style={{ color: 'red' }}>{text ? dataUtil.Dates().formatTimeString(text, this.state.projSet.dateFormat) : ""}</span>
                        } else {
                            return <span>{text ? dataUtil.Dates().formatTimeString(text, this.state.projSet.dateFormat) : ""}</span>
                        }
                    } else {
                        return null
                    }
                }
            },
            {
                title: '完成时间',
                dataIndex: 'planEndTime',
                key: 'planEndTime',
                width: "10%",
                render: (text, record) => {
                    if (text) {
                        if (record.planEndTime != record.blPlanEndTime && record.taskType != "project" && record.taskType != "plan") {
                            return <span style={{ color: 'red' }}>{text ? dataUtil.Dates().formatTimeString(text, this.state.projSet.dateFormat) : ""}</span>
                        } else {
                            return <span>{text ? dataUtil.Dates().formatTimeString(text, this.state.projSet.dateFormat) : ""}</span>
                        }
                    } else {
                        return null
                    }
                }
            },
            {
                title: '责任主体',
                dataIndex: 'orgName',
                key: 'orgName',
                width: "10%",
                render: (text, record) => {
                    if (text) {
                        if (record.orgName != record.blOrgName && record.taskType != "project" && record.taskType != "plan") {
                            return <span style={{ color: 'red' }}>{text}</span>
                        } else {
                            return <span>{text}</span>
                        }
                    } else {
                        return null
                    }
                }
            },
            {
                title: '责任人',
                dataIndex: 'userName',
                key: 'userName',
                width: "10%",
                render: (text, record) => {
                    if (text) {
                        if (record.userName != record.blUserName && record.taskType != "project" && record.taskType != "plan") {
                            return <span style={{ color: 'red' }}>{text}</span>
                        } else {
                            return <span>{text}</span>
                        }
                    } else {
                        return null
                    }
                }
            },
            {
                title: '状态',
                dataIndex: 'status',
                key: 'status',
                width: "10%",
                render: (text) => {
                    if (text) {
                        return <span>{text}</span>
                    } else {
                        return null
                    }
                }
            },
            {
                title: '基线名称',
                dataIndex: 'blTaskName',
                key: 'blTaskName',
                width: "15%",
                render: (text, record) => {
                    if (text) {
                        if (record.taskType == 'project') {
                            return <span><MyIcon type='icon-xiangmu' style={{ marginRight: '5px' }} />{text}</span>
                        } else if (record.taskType == 'plan') {
                            return <span> <MyIcon type='icon-jihua1' style={{ marginRight: '5px' }} />{text}</span>
                        } else if (record.taskType == 0) {
                            if (record.taskName != record.blTaskName) {
                                return <span style={{ color: 'red' }}> <MyIcon type='icon-WBS' style={{ marginRight: '5px' }} />{text}</span>
                            } else {
                                return <span> <MyIcon type='icon-WBS' style={{ marginRight: '5px' }} />{text}</span>
                            }
                        } else if (record.taskType == 1 || record.taskType == 4) {
                            if (record.taskName != record.blTaskName) {
                                return <span style={{ color: 'red' }}> <MyIcon type='icon-renwu1' style={{ marginRight: '5px' }} />{text}</span>
                            } else {
                                return <span> <MyIcon type='icon-renwu1' style={{ marginRight: '5px' }} />{text}</span>
                            }
                        } else {
                            if (record.taskName != record.blTaskName) {
                                return <span style={{ color: 'red' }}> <MyIcon type='icon-lichengbei' style={{ marginRight: '5px' }} />{text}</span>
                            } else {
                                return <span> <MyIcon type='icon-lichengbei' style={{ marginRight: '5px' }} />{text}</span>
                            }
                        }
                    } else {
                        return null
                    }
                }
            },
            {
                title: '基线代码',
                dataIndex: 'blTaskCode',
                key: 'blTaskCode',
                width: "10%",
                render: (text, record) => {
                    if (text) {
                        if (record.taskCode != record.blTaskCode) {
                            return <span style={{ color: 'red' }}>{text}</span>
                        } else {
                            return <span>{text}</span>
                        }
                    } else {
                        return null
                    }
                }
            },
            {
                title: '基线开始',
                dataIndex: 'blPlanStartTime',
                key: 'blPlanStartTime',
                width: "10%",
                render: (text, record) => {
                    if (text) {
                        if (record.planStartTime != record.blPlanStartTime) {
                            return <span style={{ color: 'red' }}>{text ? dataUtil.Dates().formatTimeString(text, this.state.projSet.dateFormat) : ""}</span>
                        } else {
                            return <span>{text ? dataUtil.Dates().formatTimeString(text, this.state.projSet.dateFormat) : ""}</span>
                        }
                    } else {
                        return null
                    }
                }
            },
            {
                title: '基线完成',
                dataIndex: 'blPlanEndTime',
                key: 'blPlanEndTime',
                width: "10%",
                render: (text, record) => {
                    if (text) {
                        if (record.planEndTime != record.blPlanEndTime) {
                            return <span style={{ color: 'red' }}>{text ? dataUtil.Dates().formatTimeString(text, this.state.projSet.dateFormat) : ""}</span>
                        } else {
                            return <span>{text ? dataUtil.Dates().formatTimeString(text, this.state.projSet.dateFormat) : ""}</span>
                        }
                    } else {
                        return null
                    }
                }
            },
            {
                title: '基线责任主体',
                dataIndex: 'blOrgName',
                key: 'blOrgName',
                width: "10%",
                render: (text, record) => {
                    if (text) {
                        if (record.orgName != record.blOrgName) {
                            return <span style={{ color: 'red' }}>{text}</span>
                        } else {
                            return <span>{text}</span>
                        }
                    } else {
                        return null
                    }
                }
            },
            {
                title: '基线责任人',
                dataIndex: 'blUserName',
                key: 'blUserName',
                width: "10%",
                render: (text, record) => {
                    if (text) {
                        if (record.userName != record.blUserName) {
                            return <span style={{ color: 'red' }}>{text}</span>
                        } else {
                            return <span>{text}</span>
                        }
                    } else {
                        return null
                    }
                }
            }
        ]

        const {
            getFieldDecorator
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

        return (

          <ExtLayout renderWidth = {({contentWidth}) => { this.setState({contentWidth}) }}>
            <Toolbar>
              <Form width={"850px"} onSubmit={this.handleSubmit} style = {{height:"40px"}}>
                <div className={style.content}>
                  <Row type="flex">
                    <Col span={5}>
                      <Form.Item label={"执行计划"} {...formItemLayout}>
                        {/* 基线1 */}
                        {getFieldDecorator('firstBaseLine', {
                          initialValue: this.state.firstBaseLine,
                          rules: [{
                            required: true,
                            message: intl.get('wsd.i18n.message.select') + "执行计划",
                          }],
                        })(
                          <Select >
                            {this.state.planBaseLineCompareList.length ? this.state.planBaseLineCompareList.map(item => {
                              return (
                                <Select.Option key={item.id} value={item.id}>{item.baselineName}</Select.Option>
                              )
                            }) : null}
                          </Select>
                        )}
                      </Form.Item>
                    </Col>
                    <Col span={5}>
                      <Form.Item label={intl.get('wsd.i18n.plan.baseline.comparebaseline')} {...formItemLayout}>
                        {/* 基线2*/}
                        {getFieldDecorator('secondBaseLine', {
                          initialValue: this.state.secondBaseLine,
                          rules: [{
                            required: true,
                            message: intl.get('wsd.i18n.message.select') + " 对比基线",
                          }],
                        })(
                          <Select >
                            {this.state.planBaseLineCompareList.length ? this.state.planBaseLineCompareList.map(item => {
                              return (
                                <Select.Option key={item.id} value={item.id}>{item.baselineName}</Select.Option>
                              )
                            }) : null}
                          </Select>
                        )}
                      </Form.Item>
                    </Col>
                    <div style={{marginTop:"10px"}}>
                      <PublicButton name={'基线对比'} title={'基线对比'} icon={'icon-renwufenpei'} afterCallBack={this.handleSubmit.bind(this)}  />
                    </div>
                  </Row>
                </div>

              </Form>
            </Toolbar>
            <MainContent contentWidth = {this.state.contentWidth} contentMinWidth = {1900}>
              <PageTable onRef={ref => this.formList = ref}
                         pagination={false}
                         getData={this.getFormData}
                         columns={columns}
                         expanderLevel={2}
                         bordered={false}
                         dataSource={this.state.data}
                         loading={this.state.loading1}
                         getRowData={this.getRowData}
              />
            </MainContent>
            <RightTags rightData={this.state.rightData}
                       menuCode={'ST-BL'}
                       groupCode={this.state.groupCode}
                       firstBaseLine={this.state.firstBaseLine}
                       firstBaseLineName={this.state.firstBaseLineName}
                       secondBaseLine={this.state.secondBaseLine}
                       secondBaseLineName={this.state.secondBaseLineName}
                       projectId={this.state.projectId}
            />
          </ExtLayout>
        )
    }
}

const PlanDefineBaselineCompares = Form.create()(PlanDefineBaselineCompare);
export default connect(state => ({
    currentLocale: state.localeProviderData
}))(PlanDefineBaselineCompares)
