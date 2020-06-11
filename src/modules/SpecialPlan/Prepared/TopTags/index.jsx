import React, { Component } from 'react'
import { Modal, notification } from 'antd';
import Search from './Search'
import style from './style.less'
import AddTask from '../AddTask'
import AddWbs from '../AddWbs'
import BatchAddWbs from '../BatchAddWbs1'
import Release from '../Release' //下达
import Approval from '../Workflow/Approval' //发布审批
import Public from '../Public' //发布
import ImportPlanTemp from '../ImportPlanTemp' //导入计划模板
import Schedule from '../Schedule' //进度设置
import Gantt from '../Gantt' //横道设置
import SelectPlanBtn from "../../../../components/public/SelectBtn/SelectPlanBtn"
import PublicMenuButton from "../../../../components/public/TopTags/PublicMenuButton"
import PublicButton from "../../../../components/public/TopTags/PublicButton"
import TableSet from "../TableSet"
import axios from '../../../../api/axios'
import AddTemplate from "../AddTemplate"
import ViewBtn from '../../../../components/public/TopTags/ViewBtn/index'
import ComcateLogModal from "../ComcateLogModal"
import ImportXer from "../ImportXer"
import * as dataUtil from '../../../../utils/dataUtil';
import ImportExcel from "../../../Components/Window/Import/ImportExcel";

export class PlanPreparedTopTags extends Component {
  constructor(props) {
    super(props)
    this.state = {
      wbsTitle: '',
      taskTitle: '',
      keyType: 0,
      menusEdit: { wbs: { "1": false, "2": false }, task: { "1": false, "2": false, "3": false }, delete: { "1": false } },
      addTaskModalVisible: false,  //Task弹窗visiable
      addWbsModalVisible1: false,  //Wbs弹窗visiable
      batchAddTaskModalVisible: false,
      confirmModalVisible: false, //Release弹窗visiable
      cancelConfirmModalVisible: false,
      reportedModalVisible: false, //Reported弹窗visiable
      releaseModalVisible: false, //Public弹窗 visiable
      importPTModalVisiable: false, //ImportPlanTemp 弹窗visiable
      scheduleModalVisible: false, //Schedule 弹窗visiable
      ganttModalVisible: false, //Gantt 弹窗visiable
      topSelectBtnType: 0, //头部下拉标签key值
    }
  }
  componentDidMount() {
    this.props.onRef(this);
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

  handleBatchWbsCancel = () => {
    this.setState({
      batchAddTaskModalVisible: false
    })
  }

  //Release弹窗关闭
  handleReleaseCancel = () => {
    this.setState({
      confirmModalVisible: false
    })
  }


  //Release弹窗关闭
  handleCancelConfirmCancel = () => {
    this.setState({
      cancelConfirmModalVisible: false
    })
  }

  //Release弹窗关闭
  handleReleaseCancel = () => {
    this.setState({
      confirmModalVisible: false
    })
  }

  //Reported弹窗关闭
  handleReportedCancel = () => {
    this.setState({
      reportedModalVisible: false
    })
  }

  //Public弹窗关闭
  handlePublicCancel = () => {
    this.setState({
      releaseModalVisible: false
    })
  }

  //ImportPlanTemp弹窗关闭
  handleImportPTCancel = () => {
    this.setState({
      importPTModalVisiable: false
    })
  }

  // 进度设置关闭
  handleScheduleCancel = () => {
    this.setState({
      scheduleModalVisible: false
    })
  }

  // 进度设置关闭
  handleGanttCancel = () => {
    this.setState({
      ganttModalVisible: false
    })
  }

  showToolModal = (name, e) => {

    const { rightData } = this.props
    // e.key 1进度计划 2横道设置 3导入计划模板 4导出excel计划 5导出Project计划 6保存成计划模板

    if (name == "1") {
      this.setState({
        scheduleModalVisible: true
      })
    }
    if (name == "2") {
      this.setState({
        ganttModalVisible: true
      })
    }
    if (name == "3") {
      if (this.props.rightData.nodeType != "define") {
        notification.warning(
          {
            placement: 'bottomRight',
            bottom: 50,
            duration: 2,
            message: '提示',
            description: '请选择计划定义!'
          }
        )
        return
      }
      this.setState({
        importPTModalVisiable: true,
        topSelectBtnType: e.key
      })
    }
    if (name == "4") {

      const { defineIds } = this.props;
      setTimeout(function () {
        axios.down("/api/plan/task/export/plan?defineIds=" + defineIds, {}).then((e) => {
        });
      }, 1000)
    }
    if (name == "6") {
      if (!(this.props.rightData.nodeType == "define")) {
        notification.warning(
          {
            placement: 'bottomRight',
            bottom: 50,
            duration: 2,
            message: '提示',
            description: '请选择计划定义!'
          }
        )
        return
      }else{
        this.setState({
            templateVisible: true
        })
      }
    }
    if (name == "7") {
      if (!(this.props.rightData.nodeType == "define" || this.props.rightData.nodeType == "wbs")) {
        notification.warning(
          {
            placement: 'bottomRight',
            bottom: 50,
            duration: 2,
            message: '提示',
            description: '请选择计划定义或者WBS!'
          }
        )
        return
      }
      this.setState({
        comcatelogVisable: true
      })
    }
    if (name == "8") {
      if (this.props.rightData.nodeType != "define") {
        notification.warning(
          {
            placement: 'bottomRight',
            bottom: 50,
            duration: 2,
            message: '提示',
            description: '请选择计划定义!'
          }
        )
        return
      }
      this.setState({
        importXerFile: true,
      })
    }
    if(name==9){
      const { rightData } = this.props
      if(!rightData){
        dataUtil.message("请选择数据进行操作")
      }
      else if(rightData.nodeType == 'define'){
        this.props.callBackBanner({
          menuName: '码值分配',
          url: "Plan/Prepared/CategoryCodeTab",
          id: 8848,
          defineId:rightData.id,
        }, true);
      }else{
        dataUtil.message("请选择计划定义")
      }
    }else if(name == 11){
      const { rightData } = this.props;
      if (!rightData || rightData.nodeType == 'project' || rightData.nodeType == 'task'){
        dataUtil.message("请选择计划定义或者WBS后操作!");
        return;
      }
      this.setState({showImportExcel:true});
    }
  }

  showReleaseModal = (name) => {

    if (name == "approve") {
      let { selectProjectName } = this.props;
      this.setState({
        releaseApprovalModalVisible: true,
        projectName: "[" + selectProjectName + "]"
      });

    } else {
      let releaseTitle;
      switch (name) {
        case "direct":
          releaseTitle = "直接发布";
          break;
        case "abolish":
          releaseTitle = "取消发布";
          break;
        case "confirm":
          releaseTitle = "直接确认";
          break;
        case "cancelConfirm":
          releaseTitle = "取消确认";
          break;
      }
      this.setState({
        releaseModalVisible: true,
        releaseType: name,
        releaseTitle: releaseTitle
      })
    }
  }
  showConfirmModal = (name, e) => {
    if (name == "cancel") {
      this.setState({
        cancelConfirmModalVisible: true
      })
    } else {
      this.setState({
        confirmModalVisible: true
      })
    }

  }
  // 显示添加Add 任务表单 e为点击项对象
  showAddTaskFormModal = (name, e) => {
    const { rightData } = this.props
    //e.key 1新增同级 2新增下级
    if (!rightData || rightData.nodeType == 'project') {
      notification.warning(
        {
          placement: 'bottomRight',
          bottom: 50,
          duration: 2,
          message: '所选数据不能为项目级',
          description: '请选择计划定义或WBS增加!'
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
    const { rightData } = this.props
    //e.key 1新增同级 2新增下级
    if (!rightData || rightData.nodeType == 'project') {
      notification.warning(
        {
          placement: 'bottomRight',
          bottom: 50,
          duration: 2,
          message: '所选数据不能为项目级',
          description: '请选择计划定义或WBS增加!'
        }
      )
      return
    }

    if (e.key == 1 && rightData.nodeType == 'define') {
      notification.warning(
        {
          placement: 'bottomRight',
          bottom: 50,
          duration: 2,
          message: '不允许增加同级WBS',
          description: '选择计划定义不能增加同级WBS!'
        }
      )
      return;
    }
    if (e.key == 2 && rightData.nodeType == 'task') {
      notification.warning(
        {
          placement: 'bottomRight',
          bottom: 50,
          duration: 2,
          message: '提示',
          description: '不能在任务下新增WBS!'
        }
      )
      return;
    }
    if (e.key == 5) {
      this.setState({
        wbsTitle: '批量增加WBS',
        keyType: 2,
        batchAddTaskModalVisible: true
      })
    } else {
      this.setState({
        wbsTitle: e.key == 1 ? '新增同级WBS' : '新增下级WBS',
        keyType: e.key,
        addWbsModalVisible: true
      })
    }
  }

  deleteVerifyCallBack = () => {
    const { rightData } = this.props;
    if (!rightData || !rightData.nodeType || rightData.nodeType == 'define' || rightData.nodeType == 'project') {
      dataUtil.message('请选择任务或WBS删除!');
      return false;
    }
    return true;
  }

  handleCancelTemplate = () => {
    this.setState({
      templateVisible: false
    })
};

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
      defineIds,
      rightData,
      addPlanTask,
      batchAddWbs,
      planTaskTypeData,
      planTaskDrtnTypeData,
      menusEdit
    } = this.props

    let params = new Object();
    if(rightData && rightData.nodeType == "define"){
      params = {defineId:rightData.id,planType:this.props.menuCode};
    }else if(rightData && rightData.nodeType == "wbs"){
      params = {defineId:rightData.defineId,wbsId:rightData.id,planType:this.props.menuCode};
    }
    
    return (
      <div className={style.main}>
        <div className={style.search}>
          <Search
            getViewBtn={() => { return this.state.ViewBtn; }}
            onRef={(component) => { this.setState({ SearchBtn: component }) }}
            projectId={this.props.selectProjectId}
            placeholder={"名称/代码"}
            searchName={"nameOrCode"}
            searchDatas={this.props.searchDatas}
          />
        </div>
        <div className={style.tabMenu}>
          {/*选择项目计划*/}
          <SelectPlanBtn openPlan={openPlan} type = {"2"} typeCode ='specialTask'/>

          <ViewBtn bizType="PMPR_PLAN_TASK"
            searchDatas={this.props.searchDatas}
            getSearchBtn={() => { return this.state.SearchBtn; }}
            onRef={(component) => { this.setState({ ViewBtn: component }) }}
          />
          {/*增加WBS*/}
          <PublicMenuButton title={"WBS"} afterCallBack={this.showAddWbsFormModal} icon={"icon-WBS_"}
            menus={[{ key: "1", label: "增加同级WBS", icon: "icon-xinzengtongji", edit: this.props.menusEdit["wbs"]["1"] },
            { key: "2", label: "增加下级WBS", icon: "icon-xinzengxiaji", edit: this.props.menusEdit["wbs"]["2"] },
            { key: "5", label: "批量增加WBS", icon: "icon-xinzengxiaji", edit: this.props.menusEdit["wbs"]["2"] }]}
          />

          {/*增加任务*/}
          <PublicMenuButton title={"任务"} afterCallBack={this.showAddTaskFormModal} icon={"icon-renwu-"}
            menus={[{ key: "1", label: "新增作业任务", icon: "icon-zuoye", edit: this.props.menusEdit["task"]["1"] },
            // { key: "2", label: "新增开始里程碑任务", icon: "icon-qizhi", edit: this.props.menusEdit["task"]["2"] },
            { key: "3", label: "新增完成里程碑任务", icon: "icon-qizhi", edit: this.props.menusEdit["task"]["3"] }]}
          />
          {/*删除*/}
          <PublicButton title={"删除"} edit={this.props.menusEdit["delete"]["1"]} useModel={true} verifyCallBack={this.deleteVerifyCallBack} afterCallBack={this.delete}
            icon={"icon-delete"} />
          {/*确认*/}
           <PublicMenuButton title={"确认"} afterCallBack={this.showReleaseModal} icon={"icon-iconziyuan"}
            menus={[{ key: "confirm", label: "直接确认", icon: "icon-iconziyuan", edit:  this.props.taskConfirmAuth  },
            { key: "cancelConfirm", label: "取消确认", icon: "icon-mianfeiquxiao", edit: this.props.taskCancleConfirmAuth }]}
          />
          {/*发布*/}
          <PublicMenuButton title={"发布"} afterCallBack={this.showReleaseModal} icon={"icon-fabu"}
            menus={[{ key: "direct", label: "直接发布", icon: "icon-fabu", edit: this.props.taskReleaseAuth },
             { key: "approve", label: "发布审批", icon: "icon-shenpi1", edit: this.props.taskApprovalReleaseAuth },
            { key: "abolish", label: "取消发布", icon: "icon-mianfeiquxiao", edit: this.props.taskCancleReleaseAuth }]}
          />
          {/*工具*/}
          <PublicMenuButton title={"工具"} afterCallBack={this.showToolModal} icon={"icon-gongju"}
            menus={[
              //{ key: "1", label: "进度计算", icon: "icon-chakanjindu", edit: true },
            { key: "2", label: "横道设置", icon: "icon-iconziyuan4", edit: true },
            // { key: "10", label: "导入Excel计划", icon: "icon-iconziyuan", edit: this.props.menusEdit["wbs"]["2"] },
            { key: "3", label: "导入计划模板", icon: "icon-iconziyuan", edit: this.props.menusEdit["wbs"]["2"] },
            { key: "11", label: "导入Excel计划", icon: "icon-iconziyuan2", edit: this.props.menusEdit["wbs"]["2"] },
            // { key: "8", label: "导入P6文件", icon: "icon-iconziyuan", edit: true },
            { key: "4", label: "导出Excel计划", icon: "icon-iconziyuan2", edit: true },
            //{ key: "5", label: "导出Project计划", icon: "icon-iconziyuan2", edit: true },
            { key: "6", label: "保存为计划模板", icon: "icon-save", edit: true },
           // { key: "7", label: "沟通记录", icon: "icon-check", edit: true },
            //{ key: "9", label: "码值分配", icon: "icon-bumen", edit: true }
            ]}
          />
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
          rightData={rightData}
          title={this.state.taskTitle}
          keyType={this.state.keyType}
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
          rightData={rightData}
          addPlanWbs={addPlanWbs}
          title={this.state.wbsTitle}
          keyType={this.state.keyType}
        />}

        {/*计划编制->WBS*/}
        {this.state.batchAddTaskModalVisible && <BatchAddWbs
          defineOrgTree={defineOrgTree}
          orgTree={orgTree}
          defineOrgUserList={defineOrgUserList}
          orgUserList={orgUserList}
          handleCancel={this.handleBatchWbsCancel}
          getBaseSelectTree={getBaseSelectTree} //获取下拉框字典
          planTypeData={planTypeData}
          planLevelData={planLevelData}
          batchAddWbs={batchAddWbs}
          rightData={rightData}
          title={this.state.wbsTitle}
          keyType={this.state.keyType}
        />}

        {/* 计划编制 -> 确认 */}
        {this.state.confirmModalVisible && <Release
          handleCancel={this.handleReleaseCancel}
          rightData={rightData}
          projectId={this.props.selectProjectId}
          defineIds = {this.props.defineIds }
          getPreparedTreeList={this.props.getPreparedTreeList}
        />}
        {this.state.handleCancelConfirmCancel && <Release
          handleCancel={this.handleReleaseCancel}
          rightData={rightData}
          projectId={this.props.selectProjectId}
          defineIds = {this.props.defineIds }
          getPreparedTreeList={this.props.getPreparedTreeList}
        />}

        {/* 计划编制 -> 上报 */}
        {/* <Reported modalVisible={this.state.reportedModalVisible} handleCancel={this.handleReportedCancel} /> */}
        {/* 计划编制 -> 发布 */}
        {this.state.releaseModalVisible && <Public
          selectType={this.state.topSelectBtnType}
          releaseType={this.state.releaseType}
          releaseTitle={this.state.releaseTitle}
          projectId={this.props.selectProjectId}
          defineIds = {this.props.defineIds }
          handleCancel={this.handlePublicCancel}
          getPreparedTreeList={this.props.getPreparedTreeList}
          rightData={rightData}
        />}

        {this.state.releaseApprovalModalVisible &&
          <Approval proc={{ "vars": {}, "procDefKey": "", "bizTypeCode": "plan-specialtask-release", "title": this.state.projectName + "专项项目计划发布审批" }}
            visible={true}
            projectId={this.props.selectProjectId }
            refreshData={this.props.initDatas }
            defineIds = {this.props.defineIds }
            handleCancel={() => {
              this.setState({ releaseApprovalModalVisible: false })
            }}
          />}
        {/* 计划编制 -> 导入P6文件 */}
        {this.state.importXerFile && <ImportXer handleCancel={() => this.setState({ importXerFile: false })} rightData={rightData} initDatas={this.props.initDatas} />}
        {/* 计划编制 -> 导入计划模板 */}
        {this.state.importPTModalVisiable && <ImportPlanTemp selectType={this.state.topSelectBtnType} handleCancel={this.handleImportPTCancel} rightData={rightData} initDatas={this.props.initDatas} getPreparedTreeList={this.props.getPreparedTreeList} />}
        {/* 计划编制 -> 进度设置 */}
        {this.state.scheduleModalVisible &&
          <Schedule setBaseLineTime={this.props.setBaseLineTime} selectProjectName={this.props.selectProjectName} baseLineTime={this.props.baseLineTime} initDatas={this.props.initDatas} refreshList={this.props.refreshList} handleCancel={this.handleScheduleCancel} data={this.props.data} />}
        {/* 横道设置 */}
        {this.state.ganttModalVisible && <Gantt
          ganttSetInfo={this.props.ganttSetInfo}
          setGanttColor={this.props.setGanttColor}
          saveGanttByStorage={this.props.saveGanttByStorage}
          resetGanttColor={this.props.resetGanttColor}
          handleCancel={this.handleGanttCancel}
        />}
        {
          this.state.comcatelogVisable && <ComcateLogModal
            handleCancel={() => this.setState({ comcatelogVisable: false })}
            selectProjectName={this.state.selectProjectName}
            projectId={this.props.selectProjectId}
            rightData={rightData}
            locationTask={this.props.locationTask}
          />
        }
        {this.state.tableSetVisible && <TableSet
          saveTableListColor={this.props.saveTableListColor}
          tableListColors={this.props.tableListColors}
          resetTableColor={this.props.resetTableColor}
          handleCancel={() => this.setState({ tableSetVisible: false })}
        />}

        {/*新增模板*/}
        {this.state.templateVisible && <AddTemplate handleCancel={this.handleCancelTemplate} addData={this.props.rightData} />}
        {
          this.state.showImportExcel && (
            <ImportExcel title={"导入Excel"}
                         action={"/api/plan/task/import/excel"}
                         sheets={[{ index: 0, rowStart: 5, colEnd: 8 }]}
                         params={params}
                         handleCancel={() => this.setState({ showImportExcel: false })}
                         callback={this.props.initDatas}
                         tmpl = {"/api/plan/task/import/excel/down/tmpl"}
                         customTmpl = {{url : "/api/plan/task/import/excel/custom/column/list", 
                         defaultColumns:["planLevel","code"]}}>
            </ImportExcel>
          )
        }
      </div>
    )
  }
}

export default PlanPreparedTopTags
