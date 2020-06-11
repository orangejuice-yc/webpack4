import React, { Component } from 'react'
import { Modal, message, Icon, notification } from 'antd';
import TopTags from './TopTags/index'
import RightTags from '../../../components/public/RightTags/index'
import style from './style.less'
import '../../../static/fonts/icon1/iconfont.js'
import Colum from '../Components/Colum' //隐藏显示列
import { connect } from 'react-redux'
import axios from "../../../api/axios"
import * as dataUtil from "../../../utils/dataUtil"
import ExtLayout from "../../../components/public/Layout/ExtLayout";
import MainContent from "../../../components/public/Layout/MainContent";
import Toolbar from "../../../components/public/Layout/Toolbar";

import {
  getPlanChangeTreeList,
  defineOrgTree,
  defineOrgUserList,
  getBaseSelectTree,
  addPlanWbsChange,
  addPlanTaskChange,
  deletePlanWbsChange,
  deletePlanTaskChange,
  cancelPlanTaskChange,
  updatePlanWbsChange,
  updatePlanTaskChange,
  getvariable,
  getTaskChangeEditAuth, getPreparedTreeList,
} from '../../../api/api';
import TipModal from "../../Components/TipModal";
let gantt = new CreateGantt();
let GanttMenu = function () {
  GanttMenu.superclass.constructor.call(this);
}
const confirm = Modal.confirm;

export class PlanPrepared extends Component {
  constructor(props) {
    super(props)
    this.state = {
      contentWidth: '',
      borderLeft: '',
      left: '',
      ganttHeight: '',
      currentData: {}, //选中行数据
      activeIndex: [],
      rightData: null,
      visible: false,
      visible2: false,
      editAuth: false,
      rightTags: [
        { icon: 'iconjibenxinxi', title: '基本信息', fielUrl: 'Plan/Change/Info' },
        { icon: 'iconiconziyuan6', title: '资源计划', fielUrl: 'Plan/Components/ResPlan' },
        { icon: 'iconjiaofuqingdan', title: '交付清单', fielUrl: 'Plan/Change/DeliveryList' },
        { icon: 'iconguanxitu', title: '逻辑关系', fielUrl: 'Plan/Change/Logic' },
        { icon: 'iconbiangengjishi', title: '变更记事', fielUrl: 'Plan/Prepared/ChangeInfo' },
        { icon: 'iconliuchengxinxi', title: '流程信息', fielUrl: 'MyProcess/ProcessInfo' }
      ],
      selectArray: [],
      selectProjectId: [],
      data: [],
      dataMap: [],
      orgTree: [],
      orgUserList: [],
      planTypeData: [],
      planLevelData: [],
      planTaskTypeData: [],
      planTaskDrtnTypeData: [],
      columState: false,
      ganttSetInfo: {},
      groupCode: 1,
      projSet: { dateFormat: 'YYYY-MM-DD', drtnUnit: 'h', timeUnit: 'h', precision: 2, moneyUnit: '¥', complete: '%' },
      menusEdit: { wbs: { "1": false }, task: { "1": false, "2": false, "3": false }, delete: { "1": false }, cancelPlan: { "1": false } },
      taskChangeReleaseAuth:false,
      taskChangeApprovalAuth:false,
    }
  }

  componentWillMount() {
    mini.extend(GanttMenu, mini.Menu, {
      _create: function () {
        GanttMenu.superclass._create.call(this);
        var menuItems = [{
          type: "menuitem",
          iconCls: "icon-myaddwbs",
          text: mini.Gantt.Add_WBS,
          name: "addwbs"
        },
        {
          type: "menuitem",
          iconCls: "icon-myaddtask",
          text: mini.Gantt.Add_Task,
          name: "addtask"
        },
        {
          type: "menuitem",
          iconCls: "icon-mydel",
          text: mini.Gantt.Remove_Text,
          name: "remove"
        },
        {
          type: "menuitem",
          iconCls: "icon-mycancel",
          text: mini.Gantt.Cancel_change,
          name: "cancelchange"
        },
        {
          type: "menuitem",
          iconCls: "icon-myrefresh",
          text: mini.Gantt.Refresh,
          name: "refresh"
        },
        {
          type: "menuitem",
          iconCls: "icon-myexpansion",
          text: mini.Gantt.Expansion,
          name: "expansion"
        },

          // {
          //   type: "menuitem",
          //   iconCls: "icon-myclumn",
          //   text: mini.Gantt.ShowOrHide_colum,
          //   name: "showOrHidecolum"
          // }
        ];
        this.setItems(menuItems);
        this.addwbs = mini.getbyName("addwbs", this);
        this.addtask = mini.getbyName("addtask", this);
        this.remove = mini.getbyName("remove", this);
        this.refresh = mini.getbyName("refresh", this);
        this.cancelchange = mini.getbyName("cancelchange", this);
        this.expansion = mini.getbyName("expansion", this);
        // this.showOrHidecolum = mini.getbyName("showOrHidecolum", this);
        this.addwbs.on("click", this.__OnAddwbs, this);
        this.addtask.on("click", this.__OnAddtask, this);
        this.remove.on("click", this.__OnRemove, this);
        this.cancelchange.on("click", this.__onCancelChange, this);
        this.refresh.on("click", this.__refresh, this);
        this.expansion.on("click", this.__OnExpansion, this);
        // this.showOrHidecolum.on("click", this.__showOrHidecolum, this);
      },
      __OnAddwbs: this.addWbs,
      __OnAddtask: this.addTask,
      __OnRemove: this.removeRow,
      __onCancelChange: this.cancelChange,
      __refresh: this.refresh,
      __OnExpansion: this.expansion,
      // __showOrHidecolum: this.showOrHidecolum
    });
  }
  // 右键展开
  expansion = () => {
    // gantt.expand(gantt.getSelected())
    gantt.expandAll();
  }
  //搜索
  search = (value) => {
    const { initData } = this.state;
    let newData = dataUtil.search(initData, [{ "key": "name", "value": value }], true);
    this.setState({ data: newData });
    this.refreshGanttList(newData)
  }

  searchDatas = (params) => {
    this.setState({
      searchParams : params
    }, () => {
      this.initDatas();
    });
  }


  // 右键执行添加下级WBS
  addWbs = () => {
    if (this.state.menusEdit["wbs"]["1"]) {
      this.topTagComponent.showAddWbsFormModal('WbssTopBtn', { key: 2 })
    } else {
      notification.warning(
        {
          placement: 'bottomRight',
          bottom: 50,
          duration: 2,
          message: '提示',
          description: '没有权限操作'
        }
      )
    }
  }

  // 右键执行添加任务
  addTask = () => {
    if (this.state.menusEdit["task"]["1"] || this.state.menusEdit["task"]["2"] || this.state.menusEdit["task"]["3"]) {
      this.topTagComponent.showAddTaskFormModal('showAddTaskFormModal', { key: 1 })
    } else {
      notification.warning(
        {
          placement: 'bottomRight',
          bottom: 50,
          duration: 2,
          message: '提示',
          description: '没有权限操作'
        }
      )
    }
  }

  // 右键删除
  removeRow = () => {
    if (this.state.menusEdit["delete"]["1"]) {
      this.setState({
        visible: !this.state.visible
      })
    } else {
      notification.warning(
        {
          placement: 'bottomRight',
          bottom: 50,
          duration: 2,
          message: '提示',
          description: '没有权限操作'
        }
      )
    }
  }

  // 右键删除确认弹窗
  handleOk = () => {
    this.setState({
      visible: !this.state.visible
    })
    this.topTagComponent.delete('DeleteTopBtn')
  }

  // 取消变更
  cancelChange = () => {
    if (this.state.menusEdit["cancelEditAuth"]) {
      this.setState({
        visible2: !this.state.visible2
      })
    } else {
      notification.warning(
        {
          placement: 'bottomRight',
          bottom: 50,
          duration: 2,
          message: '提示',
          description: '没有权限操作'
        }
      )
    }
  }

  // 右键取消确认弹窗
  handleOk2 = () => {
    this.setState({
      visible2: !this.state.visible2
    })
    this.cancelPlanTaskChange()
  }

  // 右键刷新
  refresh = () => {
    this.getPlanChangeTreeList(this.state.selectArray)
  }

  // 右键隐藏/显示列
  showOrHidecolum = () => {
    this.setState({
      columState: true
    })
  }

  componentDidMount() {
    // 初始化数据
//    this.initDatas();
    let h = document.documentElement.clientHeight || document.body.clientHeight;   //浏览器高度，用于设置gantt高度作用
    let w = document.documentElement.clientWidth / 2 || document.body.clientWidth / 2; //右侧弹出框高度
    this.setState({
      contentWidth: w - 41,
      borderLeft: w,
      left: w,
      ganttHeight: h - 200
    })
    // 实例化gantt，将gantt赋值到state中，以便全局操作，获取gantt。
    gantt.setStyle("width:100%; height:100%;");
    gantt.setMultiSelect(false);
     //固定第一列
     gantt.frozenColumn(0, 0);
    /* -------------以下进行自定义列------------- */
    let columns = []
    //String => 名称
    let ganttColumn = {
      name: "name",
      header: "名称<br/>String",
      field: "name",
      width: 400,
      editor: {
        type: "textbox"
      }
    };
    columns.push(ganttColumn);

    let ganttColumn21 = {
      name: "changeType",
      header: "变更类型<br/>String",
      field: "changeType",
      editor: {
        type: "textbox"
      }
    };
    columns.push(ganttColumn21);
    //String => 责任主体
    let ganttColumn3 = {
      name: "org",
      header: "责任主体<br/>String",
      field: "orgName",
      width: 350,
      editor: {
        type: "textbox"
      }
    };
    columns.push(ganttColumn3);
    //String => 责任人
    let ganttColumn4 = {
      name: "user",
      header: "责任人<br/>String",
      field: "userName",
      width: 100,
      editor: {
        type: "textbox"
      }
    };
    columns.push(ganttColumn4);
    //Date => 计划开始时间
    let ganttColumn5 = {
      name: 'planStartTime',
      header: "计划开始时间<br/>Date",
      field: "planStartTime",
      width: 200,
      renderer: function (e) {
        var date = e.value;
        if (!date) return "";
        //return date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate();
        return date
      },
      editor: {
        type: "datepicker"
      }
    };
    columns.push(ganttColumn5);
    //Date => 计划完成时间
    let ganttColumn6 = {
      name: 'planEndTime',
      header: "计划完成时间<br/>Date",
      field: "planEndTime",
      width: 200,
      renderer: function (e) {
        var date = e.value;
        if (!date) return "";
        //return date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate();
        return date
      },
      editor: {
        type: "datepicker"
      }
    };
    columns.push(ganttColumn6);
    //String => 计划工期
    let ganttColumn7 = {
      name: "planDrtn",
      header: "计划工期<br/>String",
      field: "planDrtn",
      width: 100,
      editor: {
        type: "textbox"
      }
    };
    columns.push(ganttColumn7);
    //String => 计划工时
    // let ganttColumn8 = {
    //   name: "planQty",
    //   header: "计划工时<br/>String",
    //   field: "planQty",
    //   width: 100,
    //   editor: {
    //     type: "textbox"
    //   }
    // };
    // columns.push(ganttColumn8);
    //String => 计划类型
    let ganttColumn11 = {
      name: "planType",
      header: "计划类型<br/>String",
      field: "planType",
      width: 100,
      editor: {
        type: "textbox"
      }
    };
    columns.push(ganttColumn11);
    //String => 计划级别
    let ganttColumn12 = {
      name: "planLevel",
      header: "计划级别<br/>String",
      field: "planLevel",
      width: 100,
      editor: {
        type: "textbox"
      }
    };
    columns.push(ganttColumn12);
    //String => 作业类型
    // let ganttColumn13 = {
    //   name: "taskType",
    //   header: "作业类型<br/>String",
    //   field: "taskType",
    //   width: 80,
    //   editor: {
    //     type: "textbox"
    //   }
    // };
    // columns.push(ganttColumn13);
    // //String => 工期类型
    // let ganttColumn14 = {
    //   name: "taskDrtnType",
    //   header: "工期类型<br/>String",
    //   field: "taskDrtnType",
    //   width: 200,
    //   editor: {
    //     type: "textbox"
    //   }
    // };
    // columns.push(ganttColumn14);
    //String => 计划状态
    let ganttColumn20 = {
      name: "status",
      header: "变更状态<br/>String",
      field: "status",
      width: 100,
      editor: {
        type: "textbox"
      }
    };
    //变更次数
    columns.push(ganttColumn20);
    let ganttColumn22 = {
      name: "changeCount",
      header: "变更次数<br/>String",
      field: "changeCount",
      width: 100,
      editor: {
        type: "textbox"
      }
    };
    columns.push(ganttColumn22);

    //将列集合数组设置给甘特图
    gantt.setColumns(columns);
    gantt.setTreeColumn("name");
    /* -------------设置Column结束------------- */
    let thisObj = this;
    /* -------------自定义单元格开始------------- */
    gantt.on("drawcell", function (e) {
      let { projSet } = thisObj.state;
      var task = e.record, column = e.column, field = e.field;
      if (column.name == "name") {
        if (task.nodeType == 'project') {
          e.cellHtml = '<div title='+task.name+' ><svg class="icon" aria-hidden="true"><use xlink:href="#icon-xiangmuqun"></use></svg> ' + task.name+"</div>"
          return
        }
        let icon = dataUtil.getIcon(task.nodeType, task.taskType);
        e.cellHtml =  '<div title='+task.name+' ><svg class="icon" aria-hidden="true"><use xlink:href="#' + icon + '"></use></svg> ' + task.name+"</div>"
      }
      if (column.name == "org") e.cellHtml = task.org ? "<div title="+task.org.name ? task.org.name :'' +">"+task.org.name ? task.org.name :''+"</div>": ''
      if (column.name == "user") e.cellHtml = task.user ?"<div title="+task.user.name +">"+task.user.name+"</div>": ''
      if (column.name == "planType") e.cellHtml = task.planType ? task.planType.name : ''
      if (column.name == "planLevel") e.cellHtml = task.planLevel ? task.planLevel.name : ''
      if (column.name == "taskType") {
        switch (task.taskType) {
          case 1:
            e.cellHtml = "作业任务";
            break;
          case 2:
            e.cellHtml = "开始里程碑";
            break;
          case 3:
            e.cellHtml = "完成里程碑";
            break;
          case 4:
            e.cellHtml = "资源任务";
            break;
          default:
            e.cellHtml = "";
            break;
        }
      }
      if (task.calendar) {
        if (column.name == "planDrtn") e.cellHtml = task.planDrtn ? dataUtil.Numbers().fomat(dataUtil.WorkTimes().hourTo(task.planDrtn, projSet.drtnUnit, task.calendar)) + '天' : ''
        if (column.name == "planQty") e.cellHtml = task.planQty ? dataUtil.Numbers().fomat(dataUtil.WorkTimes().hourTo(task.planQty, projSet.timeUnit, task.calendar), { precision: projSet.precision }) + projSet.timeUnit : ''
      }
      if (column.name == "planStartTime") e.cellHtml = task.planStartTime ? dataUtil.Dates().formatTimeString(task.planStartTime, projSet.dateFormat) : ""
      if (column.name == "planEndTime") e.cellHtml = task.planEndTime ? dataUtil.Dates().formatTimeString(task.planEndTime, projSet.dateFormat) : ""
      if (column.name == "taskDrtnType") e.cellHtml = task.taskDrtnType ? task.taskDrtnType.name : ''
      if (column.name == "releaseUser") e.cellHtml = task.releaseUser ? task.releaseUser.name : ''
      if (column.name == "status") e.cellHtml = task.status ? task.status.name : ''
      if (column.name == "changeType") e.cellHtml = task.changeType ?
        task.changeType.id == "ADD" ? '<svg class="icon" style=\' font-size:30px;margin-left: 10px;margin-top: 4px; \' aria-hidden="true"><use xlink:href="#icon-xinzeng"></use></svg> ' :
          task.changeType.id == "CHG" ? '<svg class="icon" style=\' font-size:30px;margin-left: 10px;margin-top: 4px; \' aria-hidden="true"><use xlink:href="#icon-xiugai"></use></svg> ' :
            task.changeType.id == "DEL" ? '<svg class="icon" style=\' font-size:30px;margin-left: 10px;margin-top: 4px; \' aria-hidden="true"><use xlink:href="#icon-shanchu1"></use></svg> ' : "" : ""
    })
    /* -------------自定义单元格结束------------- */

    /* -------------创建右键菜单开始------------- */
    let menu = new GanttMenu()
    gantt.setContextMenu(menu)

    //监听菜单的opening事件，此事件在菜单显示前激发。可以控制菜单项的显示和可操作。
    menu.on("beforeopen", function (e) {
      let gantt = this.owner;       //PlusProject对象
      let task = gantt.getSelected();
      if (!task) {
        e.cancel = true;
        return;
      }
      //显示和可编辑所有菜单项
      this.addwbs.show();
      this.addtask.show();
      this.remove.show();
      this.refresh.show();
      this.cancelchange.show();
      // this.showOrHidecolum.show();
    });
    /* -------------创建右键菜单结束------------- */

    this.initGanttColor() //初始化横道颜色
    this.applyGanttInfo() //应用甘特图样式
    // 单击行事件
    this.onSelect();
  }

  onSelect = () => {
    // 选中行设置选中行内容
    gantt.on('beforeselect', () => {
      $('.mini-supergrid .mini-supergrid-viewport .mini-supergrid-rowselected').addClass('tableActivty')
      this.getOnSelectTaskEditAuth();
    })
  }


  getOnSelectTaskEditAuth = () => {
    const data = gantt.getSelected();
    let taskId = this.findParentTaskId(data);
    this.getTaskEditAuth(data.defineId || 0, taskId || 0, data);
  }

  findParentTaskId = (task) => {

    if (task != null) {
      if (task.changeType && task.changeType.id == "ADD") {

        let parentItem = gantt.getParentTask(task)
        return this.findParentTaskId(parentItem);
      } else {
        return task.taskId;
      }
    }
    return null;
  }


  getTaskEditAuth = (defineId, taskId, rightData) => {

    axios.get(getTaskChangeEditAuth(taskId || 0)).then(res => {
      const { data } = res.data || {};
      // 状态
      let taskStatus = data["status"];
      let auths = data["auths"];
      let taskChangeReleaseAuth = auths && auths.indexOf("PRED-CHANGE_RELEASE");
      let taskChangeApprovalAuth = auths && auths.indexOf("PRED-CHANGE_RELEASE-APRL");

      let status = rightData.status ? rightData.status.id : null;
      /*edit 增加变更，editAuth 修改变更，cancleEdit撤销变更*/
      let addEdit = false, editAuth = false, cancelEdit = false, deleteEdit = false;

      if (rightData.changeType && rightData.changeType.id == "ADD") {
        cancelEdit = editAuth = addEdit = status == "EDIT" && auths && auths.indexOf("CHANGE_ADD_CHILDREN") > -1;
        deleteEdit = false;
      }
      else if (rightData.changeType && rightData.changeType.id == "CHG") {
        cancelEdit = editAuth = status == "EDIT" && auths && auths.indexOf("PRED-CHANGE_EDIT") > -1;
        addEdit = status == "EDIT" && auths && auths.indexOf("CHANGE_ADD_CHILDREN") > -1;
        deleteEdit = false;
      } else if (rightData.changeType && rightData.changeType.id == "DEL") {
        cancelEdit = status == "EDIT" && auths && auths.indexOf("PRED-CHANGE_EDIT") > -1;
        editAuth = false;
        addEdit = false;
        deleteEdit = false;
      } else {
        cancelEdit = false;
        addEdit = taskStatus == "RELEASE" && auths && auths.indexOf("CHANGE_ADD_CHILDREN") > -1;
        deleteEdit = editAuth = taskStatus == "RELEASE" && auths && auths.indexOf("PRED-CHANGE_EDIT") > -1;
      }
      let menusEdit = this.getEditAuth(addEdit, deleteEdit, cancelEdit, rightData);
      this.setState({
        editAuth: editAuth,
        menusEdit,
        taskChangeReleaseAuth,
        taskChangeApprovalAuth,
        rightData: [rightData],
        groupCode: rightData.nodeType == 'task' ? 2 : rightData.nodeType == 'wbs' ? 1 : -1
      });
    });
  }

  getEditAuth = (addAuth, deleteEdit, cancelEditAuth, rightData) => {

    let menusEdit = { wbs: { "1": false }, task: { "1": false, "2": false, "3": false }, delete: { "1": false }, cancelEditAuth: cancelEditAuth }
    switch (rightData.nodeType) {
      case 'project':
        break;
      case 'define':
        break;
      case 'wbs':
        if (deleteEdit) {
          menusEdit["delete"] = { "1": true };
        }
        if (addAuth) {
          menusEdit["wbs"]["1"] = true;
          menusEdit["task"] = { "1": true, "2": true, "3": true }
        }
        break;
      case 'task':
        if (deleteEdit) {
          menusEdit["delete"] = { "1": true };
        }
        break;
    }
    return menusEdit;
  }

  // 初始化数据
  initDatas = () => {
    dataUtil.CacheOpenProjectByType('predChange').getLastOpenPlan((data) => {
      const { planId, projectId, projectName } = data;
      axios.get(getvariable(projectId || 0), null, null, null, true).then(res => {
        const data = res.data.data || {};
        this.setState({
          projSet: {
            dateFormat: (data.dateFormat || {}).id || "YYYY-MM-DD",
            drtnUnit: (data.drtnUnit || {}).id || "h",
            timeUnit: (data.timeUnit || {}).id || "h",
            complete: (data.complete || {}).id || "%",
            precision: data.precision || 2,
            moneyUnit: (data.currency || {}).symbol || "¥",
            baseLineTime: data.baseLineTime
          }
        }, () => {
          this.openPlan(planId, projectId, projectName);
        });
      });
    },'predChange');
  }

  // 初始化横道颜色
  initGanttColor = () => {
    const ganttSetInfo = localStorage.getItem('ganttSetInfo')
    const defaultGanttInfo = {
      stillNeedGantt: '#40cf00', //尚需横道
      actualGantt: '#76bbfd', //实际横道
      scheduleGantt: '#27d64a', //进度横道
      aimsGantt: '#e9c84a', //目标横道
      wbsGantt: '#66659b', //WBS横道
      ganttVisiable: [4], //1显示WBS横道 2显示计划横道 3显示基线横道 4显示关键路径
      topScale: 'year', //顶层刻度
      bottomScale: 'day' //底层刻度
    }
    if (!ganttSetInfo) {
      localStorage.setItem('ganttSetInfo', JSON.stringify(defaultGanttInfo))
      this.setState({
        ganttSetInfo: defaultGanttInfo
      })
    } else {
      this.setState({
        ganttSetInfo
      })
    }
  }

  // 设定横道特定颜色
  setGanttColor = (key, value) => {
    const ganttSetInfo = typeof this.state.ganttSetInfo == 'string' ? JSON.parse(this.state.ganttSetInfo) : this.state.ganttSetInfo
    ganttSetInfo[key] = value
    this.setState({
      ganttSetInfo
    })
  }

  // 将甘特图设置保存指localStorage
  saveGanttByStorage = () => {
    // 设置横道时间刻度
    gantt.setTopTimeScale('year') //"year/halfyear/quarter/month/week/day/hour"
    gantt.setBottomTimeScale('month')
    localStorage.setItem('ganttSetInfo', JSON.stringify(this.state.ganttSetInfo))
  }

  //恢复甘特图默认设置
  resetGanttColor = () => {
    localStorage.removeItem('ganttSetInfo')
    this.initGanttColor()
  }

  //应用甘特图设置
  applyGanttInfo = () => {
    const { ganttSetInfo } = this.state
    gantt.on("drawitem", function (e) {
      let itemBox = e.itemBox;
      let record = e.item;
      let h = itemBox.height;
      let top = itemBox.top;
      let left = itemBox.left;
      let right = itemBox.right;
      let w = right - left;
      if (w < 0) {
        return;
      }
      if (w < 2) w = 2;
      let boxModel = jQuery.boxModel;
      let percentComplete = record.PercentComplete || 0;
      let percentWidth = parseInt(w * percentComplete / 100);
      let cls = "mini-gantt-item ";
      let html = "";
      if (record.nodeType != "task") {
        cls += "summary ";
        html = '<div id="' + record._id + '" class="' + cls + ' mini-gantt-summary" style="left:' + left + 'px;top:' + top + 'px;width:' + w + 'px;background:' + ganttSetInfo.wbsGantt + '"><div class="mini-gantt-summary-left"></div><div class="mini-gantt-summary-right"></div></div>';
      } else if (record.Milestone == 1) {
        cls += "milestone ";
        if (record.Critical == 1) cls += " mini-gantt-critical ";
        html = '<div id="' + record._id + '" class="' + cls + ' mini-gantt-milestone" style="left:' + left + 'px;top:' + top + 'px;"background:' + ganttSetInfo.stillNeedGantt + '"></div>';
      } else {
        if (record.Critical == 1) cls += " mini-gantt-critical ";
        cls += "myitem ";
        html = '<div id="' + record._id + '" class="' + cls + '" style="left:' + left + 'px;top:' + top +
          'px;height:' + (boxModel ? h - 2 : h) + 'px;width:' + (boxModel ? w - 2 : w) +
          'px;background:' + ganttSetInfo.stillNeedGantt + '"><div class="mini-gantt-percentcomplete" style="width:' + percentWidth + 'px;background:' + ganttSetInfo.actualGantt + '"></div></div>';
      }
      e.itemHtml = html;
    });
  }

  // 获取下拉框字典
  getBaseSelectTree = (typeCode) => {
    axios.get(getBaseSelectTree(typeCode)).then(res => {
      const { data } = res.data
      // 初始化字典-计划-计划类型
      if (typeCode == 'plan.define.plantype') {
        this.setState({
          planTypeData: data
        })
      }

      // 初始化字典-计划-计划级别
      if (typeCode == 'plan.task.planlevel') {
        this.setState({
          planLevelData: data
        })
      }

      // 初始化字典-任务-作业类型
      if (typeCode == 'plan.project.tasktype') {
        this.setState({
          planTaskTypeData: data
        })
      }

      // 初始化字典-项目-工期类型
      if (typeCode == 'plan.project.taskdrtntype') {
        this.setState({
          planTaskDrtnTypeData: data
        })
      }
    })
  }

  // 删除选中甘特图行
  deleteTask = () => {
    var task = gantt.getSelected();
    if (task) {
      confirm({
        title: '删除选中项',
        okText: '确定',
        cancelText: '取消',
        content: "确定删除计划 \"" + task.name + "\" ？",
        onOk() {
          gantt.removeTask(task);
          message.success('删除成功')
        },
        onCancel() {
        },
      });
    } else {
      message.warning('请选中计划')
    }
  }

  // 获取选择计划列表
  openPlan = (selectArray, projectId, projectName) => {
    this.setState({
      selectArray: selectArray,
      selectProjectId: projectId,
      projectName: projectName
    }, () => {
      this.getPlanChangeTreeList(selectArray)
    })
  }

  /**
   * 设置甘特图
   *
   * @param data
   */
  setGanttChangeData = (data) => {

    this.setGanttData(data);

    let { Start, Finish } = data || {};
    let newStart = null, newFinish = null;
    if (Start) {
      newStart = new Date(Date.parse(Start.replace(/-/g, "/")));
    }
    if (Finish) {
      newFinish = new Date(Date.parse(Finish.replace(/-/g, "/")));
    }
    data["Start"] = newStart;
    data["Finish"] = newFinish;
  }

  setGanttData = (data) => {

    const { projSet } = this.state;

    let predecessorLinkList = data['predecessorLink'];
    let newPredecessorLinkList = new Array();
    if (predecessorLinkList) {
      for (let j = 0, len = predecessorLinkList.length; j < len; j++) {
        let predecessorLink = predecessorLinkList[j];
        let newPredecessorLink = {};
        newPredecessorLink["TaskUID"] = predecessorLink["taskUID"];
        newPredecessorLink["LinkLag"] = predecessorLink["linkLag"];
        newPredecessorLink["LagFormat"] = predecessorLink["lagFormat"];
        newPredecessorLink["Type"] = predecessorLink["type"];
        newPredecessorLink["PredecessorUID"] = predecessorLink["predecessorUID"];
        newPredecessorLinkList.push(newPredecessorLink);
      }
    }
    Object.assign(data, {
      UID: data['id'], //唯一标识
      Start: data['planStartTime'], //计划开始时间
      Finish: data['planEndTime'], //计划结束时间
      Name: data['name'], //显示文字
      planStartTime: data['planStartTime'],
      planEndTime: data['planEndTime'],
      PredecessorLink: newPredecessorLinkList,
      Summary: data['nodeType'] == 'task' ? 0 : 1,
      Milestone: data['taskType'] == 2 || data['taskType'] == 3 ? 1 : 0,
      Critical: data["critical"]
    });

  }

  // 刷新甘特图列表
  refreshGanttList = (data) => {

    const loop = (value) => {
      for (let k = 0; k < value.length; k++) {
        this.setGanttData(value[k]);
        if (value[k].children) {
          loop(value[k].children);
        }
      }
    }
    if (data){
      loop(data);
      gantt.loadTasks([...data]);
    }
    
    gantt.unmask();
    gantt.render(document.getElementById('pred-ganttCt2'));
    gantt.setRowHeight(38) //gantt.rowHeight + 25
    //gantt.setShowLinkLines(true); //设置是否显示箭头连线。
    //gantt.setAllowDragDrop(true); //设置是否允许任务行拖拽。
    // 开启只读模式
    gantt.setReadOnly(true);
    gantt.setGanttViewExpanded(false);
  }

  // 获取计划变更列表
  getPlanChangeTreeList = (defineIds) => {
    // gantt.loading();
    // 获取查询条件
    let searchParams = this.getSearchParams();
    // 将查询条件拼接到URL上，作为参数
    let url = dataUtil.spliceUrlParams(getPlanChangeTreeList,{... searchParams});
    axios.post(url, defineIds || [], null, null, true).then(res => {
      let { data } = res.data
      this.setState({
        data: data,
        initData: data
      })
      this.refreshGanttList(data)
    })
  }

  getSearchParams = () =>{

    let {searchParams} = this.state || {};
    let ret = {
      ...searchParams,
      fuzzySearch : searchParams.fuzzySearch == undefined ||  searchParams.fuzzySearch == null || searchParams.fuzzySearch == "1",
      children : searchParams.children == undefined ||  searchParams.children == null || searchParams.children == "1",
    }
    return ret;
  }


  // 获取责任主体列表
  defineOrgTree = () => {
    const rightData = this.state.rightData[0]
    if (rightData && rightData.id) {
      axios.get(defineOrgTree(rightData.projectId || rightData.id)).then(res => {
        const { data } = res.data
        this.setState({
          orgTree: data ? data : []
        })
      })
    }
  }

  // 根据责任主体id获取责任人列表
  defineOrgUserList = (orgid) => {
    if (orgid) {
      axios.get(defineOrgUserList(orgid)).then(res => {
        this.setState({
          orgUserList: res.data.data
        })
      })
    }
  }

  // 添加WBS
  addPlanWbs = (ndata) => {
    if (ndata) {
      const rightData = this.state.rightData[0];
      const parentTask = gantt.getParentTask(rightData)
      let parentId
      let parentType
      switch (rightData.nodeType) {
        case 'define':
          parentId = 0
          break;
        case 'wbs':
          parentId = rightData.id
          break;
        case 'task':
          parentId = rightData.parentId
          break;
        default:
          parentId = 0
      }
      if (rightData.changeId && rightData.changeType.id == 'ADD') {
        parentType = 'change'
      } else {
        parentType = 'task'
      }
      let url = dataUtil.spliceUrlParams(addPlanWbsChange, { "startContent": "项目【" + this.state.projectName + "】" });
      axios.post(url, { ...ndata, parentId, parentType }, true, null, true).then(res => {
        let data = res.data.data;
        this.setGanttChangeData(data);
        gantt.addTask(data, "add", rightData)
      })
    }
  }

  // 添加任务
  addPlanTask = (ndata) => {
    const rightData = this.state.rightData[0];
    const parentTask = gantt.getParentTask(rightData)
    let parentId
    let parentType
    if (rightData.nodeType == 'task') {
      parentId = parentTask.id
    } else {
      if (rightData.nodeType == 'wbs') {
        parentId = rightData.id
      } else {
        parentId = 0
      }
    }
    if (rightData.nodeType == 'wbs') {
      if (rightData.changeId && rightData.changeType.id == 'ADD') {
        parentType = 'change'
      } else {
        parentType = 'task'
      }
    } else if (rightData.nodeType == 'task') {
      parentType = rightData.parentType
    }
    let url = dataUtil.spliceUrlParams(addPlanTaskChange, { "startContent": "项目【" + this.state.projectName + "】" });
    axios.post(url, { ...ndata, parentId, parentType }, true, null, true).then(res => {
      let data = res.data.data;
      this.setGanttChangeData(data);
      if (rightData.nodeType == 'task') {
        gantt.addTask(data, "before", rightData)
      } else {
        gantt.addTask(data, "add", rightData)
      }
    })
  }

  // 删除WBS和任务
  deletePlanTask = () => {
    const { rightData } = this.state;
    if (rightData && rightData[0]['nodeType'] == 'wbs') {
      let url = dataUtil.spliceUrlParams(deletePlanWbsChange(rightData[0]['id']), { "startContent": "项目【" + this.state.projectName + "】" });
      axios.deleted(url, null, true, null, true).then(res => {
        let data = {
          ...res.data.data,
        }
        this.setGanttChangeData(data);
        let selected = gantt.getSelected();
        gantt.updateTask(selected, { ...data });
        this.getOnSelectTaskEditAuth();
      })
    }
    if (rightData && rightData[0]['nodeType'] == 'task') {
      let url = dataUtil.spliceUrlParams(deletePlanTaskChange(rightData[0]['id']), { "startContent": "项目【" + this.state.projectName + "】" });
      axios.deleted(url, null, true, null, true).then(res => {
        let data = {
          ...res.data.data,
        }
        this.setGanttChangeData(data);
        let selected = gantt.getSelected();
        gantt.updateTask(selected, { ...data });
        this.getOnSelectTaskEditAuth();
      })
    }
  }

  // 修改WBS
  updatePlanWbs = (ndata) => {
    const rightData = this.state.rightData[0];
    let url = dataUtil.spliceUrlParams(updatePlanWbsChange, { "startContent": "项目【" + this.state.projectName + "】" });
    axios.put(url, ndata, true, null, true).then(res => {
      let { data } = res.data;
      let selected = gantt.getSelected();
      this.setGanttChangeData(data);
      gantt.updateTask(selected, { ...data });
      this.getOnSelectTaskEditAuth();
    })
  }

  // 修改任务
  updatePlanTask = (ndata) => {
    const rightData = this.state.rightData[0];
    let url = dataUtil.spliceUrlParams(updatePlanTaskChange, { "startContent": "项目【" + this.state.projectName + "】" });
    axios.put(url, ndata, true, null, true).then(res => {
      let { data } = res.data;
      let selected = gantt.getSelected();
      this.setGanttChangeData(data);
      gantt.updateTask(selected, { ...data });
      this.getOnSelectTaskEditAuth();

    })
  }

  // 	取消变更
  cancelPlanTaskChange = () => {

    const { rightData } = this.state;

    if (rightData && (rightData[0]['nodeType'] == 'wbs' || rightData[0]['nodeType'] == 'task')) {
      let url = dataUtil.spliceUrlParams(cancelPlanTaskChange(rightData[0]['changeId'] ? rightData[0]['changeId'] : rightData[0]['id'], rightData[0]['changeId'] ? 'change' : 'task'), { "startContent": "项目【" + this.state.projectName + "】" });
      axios.put(url, null, true, null, true).then(res => {
        let data = {
          ...res.data.data,
        }
        let selected = gantt.getSelected();
        if (rightData[0]['changeType']['id'] == 'ADD') {
          gantt.removeTask(selected);
          this.setState({ rightData: null });
        } else {
          this.setGanttChangeData(data);
          gantt.updateTask(selected, { ...data, changeId: null, changeType: null });
          this.getOnSelectTaskEditAuth();
        }
      })
    }
  }

  // 关闭隐藏/显示列弹窗
  handlePublicCancel = () => {
    this.setState({
      columState: false
    })
  }

  // 设置显示隐藏列
  columHandle = (type, name) => {
    var column = gantt.getColumn(name);
    gantt.updateColumn(column, {
      visible: type
    });
  }

  setContentWidth = (value) => {
    let {contentWidth,showLabels} = value || {};
    let height = this.getHeight();
    gantt.setStyle("width:"+contentWidth+"px;height:"+height+"px");
    if(showLabels){
      gantt.setShowGanttView(false);
    }else{
      gantt.setShowGanttView(true);
    }
    this.setState({contentWidth});
  }

  getHeight = () =>{
    //初始化css样式
    let h = document.documentElement.clientHeight || document.body.clientHeight;   //浏览器高度，用于设置组件高度
    return h - 190;
  }

  render() {

    const ganttHeight = this.getHeight()+"px";
    const { orgTree, rightData, orgUserList, planTypeData, planLevelData, selectArray, selectProjectId, planTaskTypeData, planTaskDrtnTypeData, menusEdit } = this.state
    let startContent
    if (this.state.rightData && (this.state.rightData.nodeType == "wbs" || this.state.rightData.nodeType == "task")) {
      startContent = "项目【" + this.state.projectName + "】," + (this.state.rightData.nodeType == "wbs" ? "WBS" : "任务") + "【" + (this.state.rightData ? this.state.rightData.name : null) + "】";
    }
    return (

      <ExtLayout renderWidth = {(value) => { this.setContentWidth(value); }}>
        <Toolbar>
          <TopTags
            selectProjectId={selectProjectId}
            openPlan={this.openPlan} //选择计划列表
            defineOrgTree={this.defineOrgTree} //获取责任主体列表
            orgTree={orgTree}
            projectIds={selectArray}
            selectProjectId={this.state.selectProjectId}
            selectProjectName={this.state.projectName}
            defineOrgUserList={this.defineOrgUserList} //根据责任主体id获取责任人列表
            orgUserList={orgUserList}
            rightData={rightData ? rightData[0] : {}}
            getBaseSelectTree={this.getBaseSelectTree} //获取下拉框字典
            planTypeData={planTypeData}
            planLevelData={planLevelData}
            planTaskTypeData={planTaskTypeData}
            planTaskDrtnTypeData={planTaskDrtnTypeData}
            addPlanWbs={this.addPlanWbs} //添加WBS
            addPlanTask={this.addPlanTask} //添加任务
            deletePlanTask={this.deletePlanTask} //删除任务
            cancelPlanTaskChange={this.cancelPlanTaskChange} //	取消变更
            ref={(node) => this.topTagComponent = node}
            ganttSetInfo={this.state.ganttSetInfo}
            setGanttColor={this.setGanttColor}
            saveGanttByStorage={this.saveGanttByStorage}
            resetGanttColor={this.resetGanttColor}
            search={this.search}
            searchDatas={this.searchDatas}
            initDatas={this.initDatas}
            projectName={this.state.projectName}
            menusEdit={menusEdit}
            getPlanChangeTreeList= {this.getPlanChangeTreeList}
            taskChangeReleaseAuth={this.state.taskChangeReleaseAuth}
            taskChangeApprovalAuth={this.state.taskChangeApprovalAuth}
          />
        </Toolbar>
        <MainContent contentWidth = {this.state.contentWidth} contentMinWidth = {1500}>
          <div className="miniFit" style={{ height: this.state.ganttHeight, minWidth: 'calc(100vw - 60px)' }}>
            <div ref="ganttCt2" id="pred-ganttCt2" style={{ width: '100%', height: ganttHeight }}></div>
          </div>
        </MainContent>
        <RightTags
          rightTagList={this.state.rightTags}
          rightData={rightData ? rightData : null}
          editAuth={this.state.editAuth}
          getBaseSelectTree={this.getBaseSelectTree} //获取下拉框字典
          updatePlanWbs={this.updatePlanWbs}
          updatePlanTask={this.updatePlanTask}
          menuCode={this.props.menuInfo.menuCode}
          groupCode={this.state.groupCode}
          projectId={this.state.selectProjectId}
          //用于流程信息页签
          bizType = 'ST-PRED-CHANGE'
          bizId={rightData ? rightData[0].changeId ? rightData[0].changeId : null : null}
          moduleName="change"
          openWorkFlowMenu={this.props.openWorkFlowMenu}
          extInfo={{
            startContent
          }}
          getPlanChangeTreeList= {this.getPlanChangeTreeList}
          projSet={this.state.projSet}
          isCheckWf={true}
        />

        {this.state.columState && <Colum columHandle={this.columHandle} handleCancel={this.handlePublicCancel} />}
        <Modal
          width={350}
          title="删除"
          visible={this.state.visible}
          onOk={this.handleOk}
          onCancel={this.removeRow}
          centered={true}
          mask={false} maskClosable={false}
        >
          <p style={{ textAlign: 'center', fontSize: 18, paddingTop: 10, paddingBottom: 10 }}>
            <Icon type="warning"
                  style={{
                    fontSize: 30,
                    color: '#faad14'
                  }} /> &nbsp;{this.props.deleteDesc ? this.props.deleteDesc : '确认要删除此项吗？'}
          </p>
        </Modal>
        <Modal
          width={350}
          title="取消变更"
          visible={this.state.visible2}
          onOk={this.handleOk2}
          centered={true}
          onCancel={this.cancelChange}
          mask={false} maskClosable={false}
        >
          <p style={{ textAlign: 'center', fontSize: 18, paddingTop: 10, paddingBottom: 10 }}>
            <Icon type="warning"
                  style={{
                    fontSize: 30,
                    color: '#faad14'
                  }} /> &nbsp;{this.props.deleteDesc ? this.props.deleteDesc : '确认要取消变更此项吗？'}
          </p>
        </Modal>
      </ExtLayout>
    )
  }
}

export default connect(state => ({
  currentLocale: state.localeProviderData
}))(PlanPrepared);
