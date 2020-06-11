import React, {Component} from 'react'
import {notification} from 'antd';
import Search from './Search'
import style from './style.less'
import AddTask from '../AddTask'
import AddWbs from '../AddWbs'
import Public from '../Public' //发布
import Approval from '../Workflow/Approval'
import PublicMenuButton from "../../../../components/public/TopTags/PublicMenuButton"
import PublicButton from "../../../../components/public/TopTags/PublicButton"
import SelectPlanBtn from "../../../../components/public/SelectBtn/SelectPlanBtn"
import * as dataUtil from "../../../../utils/dataUtil"
import ViewBtn from '../../../../components/public/TopTags/ViewBtn/index'

export class PlanChangeTopTags extends Component {
  constructor(props) {
    super(props)
    this.state = {
      taskTitle: '',
      keyType: 0,
     
      addTaskModalVisible: false,  //Task弹窗visiable
      addWbsModalVisible1: false,  //Wbs弹窗visiable
      showApproveVisible: false, //Public弹窗 visiable
      showApprovalVisible: false, // 显示审批窗口
      data: [],
      initData: []
    }
  }

  //Task弹窗关闭
  handleTaskCancel = () => {
    this.setState({
      addTaskModalVisible: false
    })
  }

  //TWbs弹窗关闭
  handleWbsCancel = () => {
    this.setState({
      addWbsModalVisible: false
    })
  }

  //Release弹窗关闭
  handleReleaseCancel = () => {
    this.setState({
      releaseModalVisible: false
    })
  }



  showReleaseModal = (name, e) => {

    let title = name == "direct" ? "批准变更" : "发布审批";
    let {selectProjectName} = this.props;
    if(name == "direct"){
      title = "批准变更";
      this.setState({showApproveVisible:true,title:title,projectName: "["+selectProjectName+"]"});
    }else{
      title = "发布审批";
      this.setState({showApprovalVisible:true,title:title,projectName: "["+selectProjectName+"]"});
    }
  }

  // 显示添加Add 任务表单 e为点击项对象
  showAddTaskFormModal = (name, e) => {
    const {rightData} = this.props
    //e.key
    if (!rightData || rightData.nodeType == 'project' || rightData.nodeType == 'define') {
      notification.warning(
        {
          placement: 'bottomRight',
          bottom: 50,
          duration: 2,
          message: '所选数据不能为项目级或计划级',
          description: '请选择WBS增加!'
        }
      )
      return
    }
    this.setState({
      taskTitle: e.key == 1 ? '新增作业任务' : e.key == 2 ? '新增开始里程碑任务' : '新增完成里程碑任务',
      keyType: e.key,
      addTaskModalVisible: true
    })
  }

  // 显示添加Add Wbs表单 e为点击项对象
  showAddWbsFormModal = (name, e) => {
    const {rightData} = this.props
    //e.key 默认增加下级
    if (!rightData || rightData.nodeType == 'project' || rightData.nodeType == 'define') {
      notification.warning(
        {
          placement: 'bottomRight',
          bottom: 50,
          duration: 2,
          message: '所选数据不能为项目级或计划级',
          description: '请选择WBS增加!'
        }
      )
      return
    }
    this.setState({
      wbsTitle: '新增WBS',
      addWbsModalVisible: true
    })
  }

  //取消变更
  canclePlanModal = () => {

    const {rightData} = this.props;
    if (!rightData || rightData.length == 0) {
      dataUtil.message("请选择数据后操作!");
      return
    }

    if (rightData.nodeType == 'project' || rightData.nodeType == 'define' || !rightData.changeId) {
      dataUtil.message("请选择变更数据后!");
      return
    }

    this.props.cancelPlanTaskChange()
  }

  deleteVerifyCallBack = () => {
    const {rightData} = this.props
    if (rightData.nodeType == 'define' || rightData.nodeType == 'project') {
      notification.warning(
        {
          placement: 'bottomRight',
          bottom: 50,
          duration: 2,
          message: '所选数据不能删除',
          description: '请选择任务或WBS删除!'
        }
      )
      return false;
    }
    return true;
  }

  cancleVerifyCallBack = () => {
    const {rightData} = this.props;
    if (!rightData || rightData.length == 0) {
      dataUtil.message("请选择数据后操作!");
      return false;
    }

    if (rightData.nodeType == 'project' || rightData.nodeType == 'define' || !rightData.changeId) {
      dataUtil.message("请选择变更数据后!");
      return false;
    }

    return true;
  }

  // 显示添加AddTask表单 e为点击项对象
  delete = (name, e) => {
    this.props.deletePlanTask()
  }




  render() {
    const {
      openPlan,
      defineOrgTree,
      orgTree,
      defineOrgUserList,
      orgUserList,
      getBaseSelectTree,
      planTypeData,
      planLevelData,
      addPlanWbs,
      projectIds,
      rightData,
      addPlanTask,
      planTaskTypeData,
      planTaskDrtnTypeData
    } = this.props

    // switch (rightData.nodeType) {
    //   case 'project':
    //     Object.assign(this.state.menusEdit["wbs"], {"1": false});
    //     Object.assign(this.state.menusEdit["task"], {"1": false, "2": false, "3": false});
    //     Object.assign(this.state.menusEdit["delete"], {"1": false});
    //     Object.assign(this.state.menusEdit["cancelPlan"], {"1": false});
    //     break;
    //   case 'define':
    //     Object.assign(this.state.menusEdit["wbs"], {"1": false});
    //     Object.assign(this.state.menusEdit["task"], {"1": false, "2": false, "3": false});
    //     Object.assign(this.state.menusEdit["delete"], {"1": false});
    //     Object.assign(this.state.menusEdit["cancelPlan"], {"1": false});
    //     break;
    //   case 'wbs':
    //     Object.assign(this.state.menusEdit["wbs"], {"1": true});
    //     Object.assign(this.state.menusEdit["task"], {"1": true, "2": true, "3": true});
    //     Object.assign(this.state.menusEdit["delete"], {"1": true});
    //     if (rightData.changeId) {
    //       Object.assign(this.state.menusEdit["cancelPlan"], {"1": true});
    //     } else {
    //       Object.assign(this.state.menusEdit["cancelPlan"], {"1": false});
    //     }
    //     break;
    //   case 'task':
    //     Object.assign(this.state.menusEdit["wbs"], {"1": false});
    //     if (rightData.parentId == 0) {
    //       Object.assign(this.state.menusEdit["task"], {"1": false, "2": false, "3": false});
    //     } else {
    //       Object.assign(this.state.menusEdit["task"], {"1": true, "2": true, "3": true});
    //     }
    //     Object.assign(this.state.menusEdit["delete"], {"1": true});
    //     if (rightData.changeId) {
    //       Object.assign(this.state.menusEdit["cancelPlan"], {"1": true});
    //     } else {
    //       Object.assign(this.state.menusEdit["cancelPlan"], {"1": false});
    //     }
    //     break;
    //   default:
    //     Object.assign(this.state.menusEdit["wbs"], {"1": false});
    //     Object.assign(this.state.menusEdit["task"], {"1": false, "2": false, "3": false});
    //     Object.assign(this.state.menusEdit["delete"], {"1": false});
    //     Object.assign(this.state.menusEdit["cancelPlan"], {"1": false});
    // }

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
          {/*选择项目计划 */}
          <SelectPlanBtn openPlan={openPlan} type={"1"} typeCode ='predChange'/>

          <ViewBtn bizType="PMPR_PLAN_TASK_CHANGE"
                   searchDatas={this.props.searchDatas}
                   getSearchBtn={() => { return this.state.SearchBtn; }}
                   onRef={(component) => { this.setState({ ViewBtn: component }) }}
          />
          {/*增加WBS*/}
          <PublicButton title={"WBS"} afterCallBack={this.showAddWbsFormModal} icon={"icon-WBS_"} edit={this.props.menusEdit["wbs"]["1"]}/>
          {/*增加任务*/}
          <PublicMenuButton title={"任务"} afterCallBack={this.showAddTaskFormModal} icon={"icon-renwu-"}
                            menus={[{key: "1", label: "新增作业任务", icon: "icon-zuoye", edit: this.props.menusEdit["task"]["1"]},
                              // {key: "2", label: "新增开始里程碑任务", icon: "icon-qizhi", edit: this.props.menusEdit["task"]["2"]},
                              {key: "3", label: "新增完成里程碑任务", icon: "icon-qizhi", edit: this.props.menusEdit["task"]["3"]}]}
          />
          {/*删除*/}
          <PublicButton title={"申请删除"} edit={this.props.menusEdit["delete"]["1"]} useModel={true} verifyCallBack={this.deleteVerifyCallBack} afterCallBack={this.delete}
                        icon={"icon-delete"}/>
          {/**取消变更 */}
          <PublicButton title={"取消变更"} edit={this.props.menusEdit["cancelEditAuth"]} useModel={true} content = {"确认要取消变更此项吗？"} verifyCallBack={this.cancleVerifyCallBack}
                        afterCallBack={this.canclePlanModal} icon={"icon-huanyuan"}/>
          {/*发布*/}
          {/* <PublicButton  title={"批准变更"} afterCallBack={this.showReleaseModal.bind(this,"direct")} icon={"icon-fabu"} />
          <PublicButton  title={"变更审批"} afterCallBack={this.showReleaseModal.bind(this,"approve")} icon={"icon-shenpi1"} /> */}
          <PublicMenuButton title={"发布"} afterCallBack={this.showReleaseModal} icon={"icon-fabu"}
                            menus={[{key: "direct", label: "批准变更", icon: "icon-fabu", edit: this.props.taskChangeReleaseAuth},
              {key: "approve", label: "发布审批", icon: "icon-shenpi1", edit: this.props.taskChangeApprovalAuth}]}/>
        </div>
        {/*计划编制->添加任务*/}
        {this.state.addTaskModalVisible && <AddTask
          defineOrgTree={defineOrgTree}
          orgTree={orgTree}
          defineOrgUserList={defineOrgUserList}
          orgUserList={orgUserList}
          handleCancel={this.handleTaskCancel}
          getBaseSelectTree={getBaseSelectTree} //获取下拉框字典
          planTypeData={planTypeData}
          planLevelData={planLevelData}
          planTaskTypeData={planTaskTypeData}
          planTaskDrtnTypeData={planTaskDrtnTypeData}
          addPlanTask={addPlanTask}
          projectIds={projectIds}
          rightData={rightData}
          title={this.state.taskTitle}
          keyType = {this.state.keyType}
        />}
        {/*计划编制->WBS*/}
        {this.state.addWbsModalVisible && <AddWbs
          defineOrgTree={defineOrgTree}
          orgTree={orgTree}
          defineOrgUserList={defineOrgUserList}
          orgUserList={orgUserList}
          handleCancel={this.handleWbsCancel}
          getBaseSelectTree={getBaseSelectTree} //获取下拉框字典
          planTypeData={planTypeData}
          planLevelData={planLevelData}
          addPlanWbs={addPlanWbs}
          projectIds={projectIds}
          rightData={rightData}
          title={this.state.wbsTitle}
        />}
        {/* 批准变更 */}
        {this.state.showApproveVisible && <Public
        projectName={this.props.projectName}
          projectIds={projectIds}
          selectProjectId={this.props.selectProjectId}
          handleCancel={() => { this.setState({showApproveVisible : false}) }}
          rightData={rightData}
          refreshData = {this.props.initDatas }
          getPlanChangeTreeList={this.props.getPlanChangeTreeList}
        />}

        {/* 审批变更 */}
        {this.state.showApprovalVisible &&
        <Approval
          visible = {true}
          width = {"1200px"}
          proc={{ "vars": {}, "procDefKey": "", "bizTypeCode": "plan-predchange-approve", "title": this.state.projectName+ "前期计划变更审批"}}
          projectId={this.props.selectProjectId}
          projectIds = {projectIds}
          handleCancel={() => { this.setState({showApprovalVisible : false}) }}
          refreshData = {this.props.initDatas }
        />}
      </div>
    )
  }
}

export default PlanChangeTopTags
