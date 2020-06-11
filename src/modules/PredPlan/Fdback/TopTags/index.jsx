/*
 * @Author: wihoo.wanghao 
 * @Date: 2019-01-17 11:43:11 
 * @Last Modified by: wihoo.wanghao
 * @Last Modified time: 2019-03-20 14:32:59
 */
import React, { Component } from 'react'
import ApproveList from '../Approve/index' //进展批准
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
  render() {
    return (
      <div className={style.main}>
        <div className={style.search}>
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
          <SelectPlanBtn openPlan={this.props.openPlan} type = {"1"} typeCode ='predFeedBack'/>
          <TreeViewTopBtn onClickHandle={this.props.toggleTableView} />
          <ViewBtn bizType="PMPR_PLAN_FEEDBACK"
                   searchDatas={this.props.searchDatas}
                   getSearchBtn={() => { return this.state.SearchBtn; }}
                   onRef={(component) => { this.setState({ ViewBtn: component }) }}
          />
          {/*进展批准*/}
          <PublicButton title={"进展批准"} afterCallBack={this.showApprove} icon={"icon-fabu"} />
          {/*进展审批*/}
          { <PublicButton title={"进展审批"} afterCallBack={this.showApproval} icon={"icon-shenpi1"} /> }
          {/*取消批准*/}
          <PublicButton title={"取消批准"} verifyCallBack={this.verifyCancelFeedback} useModel={true}
            content={"取消批准将撤回最后一次已批准反馈，且无法还原，您是否继续？"}
            afterCallBack={this.props.cancelHandle} icon={"icon-mianfeiquxiao"} />
        </div>
        {/* 进展批准 */}
        {this.state.showApproveVisible &&
          <ApproveList handleCancel={() => { this.setState({ showApproveVisible: false }) }} selectArray={this.props.selectArray} approvalHandle={this.props.approvalHandle} projectName={this.props.selectProjectName } />
        }
        {this.state.showApprovalVisible &&
          <Approval proc={{ "vars": {}, "procDefKey": "", "bizTypeCode": "plan-predfeedback-approve", "title": this.state.projectName + "前期进展反馈审批" }}
            visible={true}
            projectName = {this.state.selectProjectName }
            planIds={this.props.selectArray}
            handleCancel={() => { this.setState({ showApprovalVisible: false }) }}
            refreshData={this.props.refreshData}
          />}
        {
          this.state.isShowImport && <ImportPlanTemp handleCancel={() => this.setState({ isShowImport: false })} rightData={this.props.data} initDatas={this.props.refreshData} />
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
