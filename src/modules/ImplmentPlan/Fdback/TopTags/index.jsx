/*
 * @Author: wihoo.wanghao 
 * @Date: 2019-01-17 11:43:11 
 * @Last Modified by: wihoo.wanghao
 * @Last Modified time: 2019-03-20 14:32:59
 */
import React, { Component } from 'react'
import ApproveList from '../Approve/index' //进展批准
import {InputNumber } from 'antd';
import style from './style.less'
import SelectPlanBtn from "../../../../components/public/SelectBtn/SelectPlanBtn"
import TreeViewTopBtn from "../../../../components/public/TopTags/TreeViewTopBtn"
import { connect } from 'react-redux'
import PublicButton from "../../../../components/public/TopTags/PublicButton";
import PublicMenuButton from "../../../../components/public/TopTags/PublicMenuButton";
import Approval from "../Workflow/Approval";
import * as dataUtil from "../../../../utils/dataUtil"
import ImportPlanTemp from "../ImportPlanTemp"
import Search from './Search'
import ViewBtn from '../../../../components/public/TopTags/ViewBtn/index'
export class PlanFdbackTopTags extends Component {
  constructor(props) {
    super(props)
    this.state = {
      showApproveVisible: false,
      showApprovalVisible: false
    }
  }
  showApprove = () => {
    const { selectArray } = this.props;
    let { selectProjectName } = this.props;
    if (!selectArray || selectArray.length == 0) {
      dataUtil.message("选择选择计划再操作!");
      return
    }
    this.setState({
      showApproveVisible: true,
      projectName: "[" + selectProjectName + "]"
    })
  }
  showApproval = () => {
    const { selectArray } = this.props;
    let { selectProjectName } = this.props;
    if (!selectArray || selectArray.length == 0) {
      dataUtil.message("选择选择计划再操作!");
      return
    }
    this.setState({
      showApprovalVisible: true,
      projectName: "[" + selectProjectName + "]"
    })
  }
  verifyCancelFeedback = () => {
    const { data } = this.props
    if (!data || data.type == "define" || data.type == "project") {
      dataUtil.message("选择已发布进展的任务或WBS操作!");
      return false;
    }
    return true;
  }
 
  showToolModal=(key)=>{
    if(key==1){
      if (!this.props.data || this.props.data.type != "define") {
        dataUtil.message("选择选择计划再操作!");
        return
      }
      this.setState({
        isShowImport: true
      })
    }
  }

    /**
   * 选择年
   */
  yearOnChange = (value) => {
    // this.setState({
    //   year: value
    // })
    this.props.yearOnChange(value);
  }
  /**
   * 选择月
   */
  monthOnChange = (value) => {
    // this.setState({
    //   month: value
    // })
    this.props.monthOnChange(value);
  }

  render() {
    return (
      <div className={style.main}>
        <div className={style.search}>
          {/*年度*/}
          {<span> 年度：<InputNumber style={{ width: "70px" }} value={this.props.year}
            formatter={value => `${value}年`} size="small" onChange={this.yearOnChange}
            parser={value => value.replace('年', '')}
            min={1976}
            max={2999}
          /></span>}

          {/*月度*/}
          {<span> &nbsp;&nbsp;月份：<InputNumber style={{ width: "60px" }} value={this.props.month}
            formatter={value => `${value}月`} size="small" onChange={this.monthOnChange}
            parser={value => value.replace('月', '')}
            min={1}
            max={12}
          /></span>}
          <Search
            getViewBtn={() => { return this.state.ViewBtn; }}
            onRef={(component) => { this.setState({ SearchBtn: component }) }}
            projectId={this.props.selectProjectId}
            placeholder={"名称"}
            searchName={"nameOrCode"}
            searchDatas={this.props.searchDatas}
          />
        </div>
        <div className={style.tabMenu}>
          <SelectPlanBtn openPlan={this.props.openPlan} type={"3"} typeCode = 'implmentFeedback'/>
          <TreeViewTopBtn onClickHandle={this.props.toggleTableView} />
          <ViewBtn bizType="PMPR_PLAN_FEEDBACK"
                   searchDatas={this.props.searchDatas}
                   getSearchBtn={() => { return this.state.SearchBtn; }}
                   onRef={(component) => { this.setState({ ViewBtn: component }) }}
          />
          {/*进展批准*/}
          <PublicButton title={"进展批准"} afterCallBack={this.showApprove} icon={"icon-fabu"} />
          {/*进展审批*/}
          <PublicButton title={"进展审批"} afterCallBack={this.showApproval} icon={"icon-shenpi1"} />
          {/*取消批准*/}
          <PublicButton title={"取消批准"} verifyCallBack={this.verifyCancelFeedback} useModel={true}
            content={"取消批准将撤回最后一次已批准反馈，且无法还原，您是否继续？"}
            afterCallBack={this.props.cancelHandle} icon={"icon-mianfeiquxiao"} />
        </div>
        {/* 进展批准 */}
        {this.state.showApproveVisible &&
          <ApproveList year={this.props.year} month={this.props.month} commUnitMap={this.state.commUnitMap} handleCancel={() => { this.setState({ showApproveVisible: false }) }} selectArray={this.props.selectArray} approvalHandle={this.props.approvalHandle} projectName={this.props.selectProjectName } />
        }
        {this.state.showApprovalVisible &&
          <Approval proc={{ "vars": {}, "procDefKey": "", "bizTypeCode": "plan-implmentfeedback-approve", "title": this.state.projectName + "进展周报反馈审批" }}
            visible={true}
            year={this.props.year} month={this.props.month}
            commUnitMap={this.state.commUnitMap}
            projectName = {this.state.selectProjectName }
            planIds={this.props.selectArray}
            handleCancel={() => { this.setState({ showApprovalVisible: false }) }}
            refreshData={this.props.refreshData}
          />}
        {
          this.state.isShowImport && <ImportPlanTemp year={this.props.year} month={this.props.month} handleCancel={() => this.setState({ isShowImport: false })} rightData={this.props.data} initDatas={this.props.refreshData} />
        }
      </div>
    )
  }
}



const mapStateToProps = state => {
  return {
    currentLocale: state.localeProviderData,
  }
};


export default connect(mapStateToProps, null)(PlanFdbackTopTags);
