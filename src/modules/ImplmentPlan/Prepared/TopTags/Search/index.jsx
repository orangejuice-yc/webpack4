import React, { Component } from 'react'
import style from './style.less'
import { Select, DatePicker,  Radio, Checkbox, Form, Row, Col } from 'antd'
import { connect } from 'react-redux'
import moment from "moment"
import {defineOrgTree, defineOrgUserList} from "../../../../../api/api"
import axios from "../../../../../api/axios"
import * as dataUtil from "../../../../../utils/dataUtil"
import * as SearchView from "../../../../../components/public/TopTags/SearchView";
import FormTreeSelect from "../../../../../components/public/FormItem/FormTreeSelect"
import FormSelect from "../../../../../components/public/FormItem/FormSelect"
import FormInput from "../../../../../components/public/FormItem/FormInput";


export class Search extends Component {
    constructor(props) {
        super(props)
        this.state = {
            orgTree: [],
            userList: [],
            orgName : null,
            userName : null
        }
    }

    componentDidMount() {
      if (this.props.onRef) {
        this.props.onRef(this);
      }
    }

    beforeSaveView = (values) =>{
      values = values || {};
      const formData = {
        ...values,
        fuzzySearch : values.fuzzySearch == undefined || values.fuzzySearch == null || values.fuzzySearch == 1  ? true : false,
        children : values.children == undefined || values.children == undefined || values.children == 1 ? true : false,
        onlyTask : values.onlyTask == 1 ? true : false,
        planEndType : values.planEndType == "all" ? null : values.planEndType,
        startDateLimitBefore: dataUtil.Dates().formatDateString(values.startDateLimitBefore),
        startDateLimitAfter: dataUtil.Dates().formatDateString(values.startDateLimitAfter),
        endDateLimitBefore: dataUtil.Dates().formatDateString(values.endDateLimitBefore),
        endDateLimitAfter: dataUtil.Dates().formatDateString(values.endDateLimitAfter),
        userName : this.state.userName || null,
        orgName : this.state.orgName || null
      }

      return formData;
    }

    beforeLoad = (values) => {

      let {orgId,orgName,userName,planEndType} = values || {};
      if(orgId){
        this.loadUserList(orgId , (userList) => {
          this.setState({
            userList
          });
        });
      }
      let timeRangeStr = this.getTimeRangeValue(planEndType);
      this.setState({orgName, userName,timeRangeStr});
      return {...values};
    }

    /**
     * 根据完成时间类型，获取时间范围
     * @param range
     * @returns {string}
     */
    getTimeRangeValue = (range) =>{
      let timeRangeStr = "";
      if (range == "week") {
        //获取本周
        const startDate = moment().week(moment().week()).startOf('week').format('YYYY-MM-DD');
        const endDate = moment().week(moment().week()).endOf('week').format('YYYY-MM-DD');
        timeRangeStr = startDate + "至" + endDate;
      }
      else if (range == "month") {
        //获取本月
        const startDate = moment().month(moment().month()).startOf('month').format('YYYY-MM-DD');
        const endDate = moment().month(moment().month()).endOf('month').format('YYYY-MM-DD');
        timeRangeStr = startDate + "至" + endDate;
      }
      else if (range == "quarter") {
        //获取本月
        const startDate = moment().quarter(moment().quarter()).startOf('quarter').format('YYYY-MM-DD');
        const endDate = moment().quarter(moment().quarter()).endOf('quarter').format('YYYY-MM-DD');
        timeRangeStr = startDate + "至" + endDate;
      }
      else if (range == "year") {
        //获取本年
        const startDate = moment().year(moment().year()).startOf('year').format('YYYY-MM-DD');
        const endDate = moment().year(moment().year()).endOf('year').format('YYYY-MM-DD');
        timeRangeStr = startDate + "至" + endDate;
      }else{
        timeRangeStr = "";
      }
      return timeRangeStr;
    }

    //选择时间范围
    selectTimeRange = (e) => {
        let range = e.target.value
        let timeRangeStr = this.getTimeRangeValue(range);
        this.setState({timeRangeStr});
    }
    /**
     * 选择org
     *
     * @param orgId
     */
    orgOnChange = (orgId,orgName ) => {
      this.props.form.setFieldsValue({ userId: null,userName: null,orgName : orgName});
      this.setState({orgName : orgName,userName : null});
      this.loadUserList(orgId,(userList) => {
        this.setState({
          userList
        });
      })
    }

    loadUserList = (orgId,callback) =>{
      if(orgId){
        axios.get(defineOrgUserList(orgId)).then(res => {
          let userList = res.data.data || [];
          callback(userList);
        })
      }else{
        callback([]);
      }
    }

    nameOnBlur = (e) =>{
      this.props.setSearchText(e.target.value);
    }

    render() {

        const {
            getFieldDecorator
        } = this.props.form;
        const formItemLayout = {
            labelCol: {
                xs: { span: 24 },
                sm: { span: 4 },
            },
            wrapperCol: {
                xs: { span: 24 },
                sm: { span: 20 },
            },
        };
        let {info,projectId} = this.props;
        let orgTreeUrl = null;
        if(projectId && projectId != 0){
            orgTreeUrl = defineOrgTree(this.props.projectId || 0);
        }

        return (
          <div className={style.content}>
            <Row >
              <Col span={24}>
                <FormInput label="名称" name = "nameOrCode" value = {info.nameOrCode } onBlur = {this.nameOnBlur}
                           getFieldDecorator = {getFieldDecorator} formItemLayout = {formItemLayout}
                />
              </Col>
            </Row>
            <Row>
              <Col span={24}>
                <FormTreeSelect label = {"责任主体"} value = {info.orgId } displayValue = {this.state.orgName }
                                name = "orgId" url = {orgTreeUrl } onChange = {this.orgOnChange}
                                getFieldDecorator = {getFieldDecorator} formItemLayout = {formItemLayout}
                />
              </Col>
            </Row>
            <Row>
              <Col span={24}>
                <FormSelect label = {"责任人"} value = {info.userId } displayValue = {this.state.userName }
                            name = "userId" items = {this.state.userList || []} onChange = {(id,name) => {
                              this.setState({userName : name});
                            }}
                            getFieldDecorator = {getFieldDecorator} formItemLayout = {formItemLayout}
                />
              </Col>
            </Row>
            <Row>
              <div className="ant-col ant-form-item-label ant-col-xs-24 ant-col-sm-4">
                <label className="" title="计划开始">计划开始</label>
              </div>
              <Col span={9}>
                <Form.Item >
                  {getFieldDecorator('startDateLimitBefore', {
                    initialValue: dataUtil.Dates().formatDateMonent(info.startDateLimitBefore),
                  })(
                    <DatePicker style={{ width: "100%" }} />
                  )}
                </Form.Item>
              </Col>
              <Col span={9} offset={2}>
                <Form.Item >
                  {getFieldDecorator('startDateLimitAfter', {
                    initialValue: dataUtil.Dates().formatDateMonent(info.startDateLimitAfter),
                  })(
                    <DatePicker style={{ width: "100%" }} />
                  )}
                </Form.Item>
              </Col>
            </Row>
            <Row>
              <div className="ant-col ant-form-item-label ant-col-xs-24 ant-col-sm-4">
                <label className="" title="计划完成">计划完成</label>
              </div>
              <Col span={9}>
                <Form.Item >
                  {getFieldDecorator('endDateLimitBefore', {
                    initialValue: dataUtil.Dates().formatDateMonent(info.endDateLimitBefore),
                  })(
                    <DatePicker style={{ width: "100%" }} />
                  )}
                </Form.Item>
              </Col>
              <Col span={9} offset={2}>
                <Form.Item >
                  {getFieldDecorator('endDateLimitAfter', {
                    initialValue: dataUtil.Dates().formatDateMonent(info.endDateLimitAfter),
                  })(
                    <DatePicker style={{ width: "100%" }} />
                  )}
                </Form.Item>
              </Col>
            </Row>
            <Row type="flex">
              <Col span={24}>
                <Form.Item label="计划完成" {...formItemLayout}>
                  {getFieldDecorator('planEndType', {
                    initialValue: info.planEndType == null || info.planEndType == undefined ? "all" : info.planEndType,
                  })(
                    <Radio.Group style={{ width: '100%' }} onChange={this.selectTimeRange}>
                      <Row className={style.timeOrange}>
                        <Col span={5}><Radio value={"all"}>全部</Radio></Col>
                        <Col span={5}><Radio value={"week"}>本周</Radio></Col>
                        <Col span={5}><Radio value={"month"}>本月</Radio></Col>
                        <Col span={5}><Radio value={"quarter"}>本季</Radio></Col>
                        <Col span={4}><Radio value={"year"}>本年</Radio></Col>
                        <span className={style.timeStr}>{this.state.timeRangeStr}</span>
                      </Row>
                    </Radio.Group>
                  )}
                </Form.Item>
              </Col>
            </Row>
            <Row>
              <Col span={24}>
                <Form.Item label="空值" {...formItemLayout}>
                  {getFieldDecorator('emptyValues', {
                    initialValue: info.emptyValues,
                  })(
                    <Checkbox.Group style={{ width: '100%' }}>
                      <Row type="flex" align="middle">
                        <Col span={6}><Checkbox value={"wbs"}>WBS</Checkbox></Col>
                        <Col span={6}><Checkbox value={"delv"}>交付物</Checkbox></Col>
                        <Col span={6}><Checkbox value={"user"}>责任人</Checkbox></Col>
                        <Col span={6}><Checkbox value={"rsrc"}>资源</Checkbox></Col>
                      </Row>
                    </Checkbox.Group>
                  )}
                </Form.Item>
              </Col>
            </Row>
            <Row >
              <Col span={24}>
                <Form.Item label="反馈状态" {...formItemLayout}>
                  {getFieldDecorator('feedbackStatus', {
                    initialValue: info.feedbackStatus,
                  })(
                    <Checkbox.Group style={{ width: '100%' }}>
                      <Row type="flex" align="middle">
                        <Col span={6}><Checkbox value={0}>未开始</Checkbox></Col>
                        <Col span={6}><Checkbox value={1}>进行中</Checkbox></Col>
                        <Col span={6}><Checkbox value={2}>已完成</Checkbox></Col>
                      </Row>
                    </Checkbox.Group>
                  )}
                </Form.Item>
              </Col>
            </Row>
            <Row>
              <Col span={24}>
                <Form.Item label="计划状态" {...formItemLayout}>
                  {getFieldDecorator('planStatus', {
                    initialValue: info.planStatus,
                  })(
                    <Checkbox.Group style={{ width: '100%' }}>
                      <Row type="flex" align="middle">
                        <Col span={6}> <Checkbox value={"EDTT"}>编制中</Checkbox></Col>
                        <Col span={6}><Checkbox value={"APPROVAL"}>审批中</Checkbox></Col>
                        <Col span={6}><Checkbox value={"RELEASE"}>已发布</Checkbox></Col>
                      </Row>
                    </Checkbox.Group>
                  )}
                </Form.Item>
              </Col>
            </Row>

            <Row>
              <Col span={24}>
                <Form.Item label="只展示任务" {...formItemLayout}>
                  {getFieldDecorator('onlyTask', {
                    initialValue: info.onlyTask ? 1 : 0,
                  })(
                    <Radio.Group style={{ width: '100%' }}>
                      <Row type="flex" align="middle">
                        <Col span={6}><Radio value={1}>是</Radio></Col>
                        <Col span={6}><Radio value={0}>否</Radio></Col>
                      </Row>
                    </Radio.Group>
                  )}
                </Form.Item>
              </Col>
            </Row>

            <Row>
              <Col span={24}>
                <Form.Item label="子节点" {...formItemLayout}>
                  {getFieldDecorator('children', {
                    initialValue: info.children == undefined || info.children == null ? 0 : info.children ? 1 : 0,
                  })(
                    <Radio.Group style={{ width: '100%' }}>
                      <Row type="flex" align="middle">
                        <Col span={6}><Radio value={1}>包含</Radio></Col>
                        <Col span={6}><Radio value={0}>不包含</Radio></Col>
                      </Row>
                    </Radio.Group>
                  )}
                </Form.Item>
              </Col>
            </Row>
            <Row>
              <Col span={24}>
                <Form.Item label="模糊查询" {...formItemLayout}>
                  {getFieldDecorator('fuzzySearch', {
                    initialValue: info.fuzzySearch == undefined || info.fuzzySearch==null || info.fuzzySearch ? 1 : 0,
                  })(
                    <Radio.Group style={{ width: '100%' }} type="flex" align="middle">
                      <Row>
                        <Col span={6}><Radio value={1}>是</Radio></Col>
                        <Col span={6}><Radio value={0}>否</Radio></Col>
                      </Row>
                    </Radio.Group>
                  )}
                </Form.Item>
              </Col>
            </Row>
          </div>
        )
    }
}

const mapStateToProps = state => {
  return {
    currentLocale: state.localeProviderData,
  }
};
const  Search_ = connect(mapStateToProps, null)(Search);
export default SearchView.SearchView(Search_);
