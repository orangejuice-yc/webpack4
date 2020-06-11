import React, { Component } from 'react'
import style from './style.less'
import { Modal, Table, Button, notification } from 'antd';
import intl from 'react-intl-universal'
import Search from '../../../../components/public/Search'
import '../../../../asserts/antd-custom.less'
import MyIcon from '../../../../components/public/TopTags/MyIcon'
import axios from "../../../../api/axios"
import * as dataUtil from "../../../../utils/dataUtil"
import PublicTable from '../../../../components/PublicTable'
import SubmitButton from "../../../../components/public/TopTags/SubmitButton"
import {
  releasePlanTask,
  cancelReleasePlanTask,
  confirmPlanTask,
  cancelConfirmPlanTask
} from "../../../../api/api"
import {
  queryImplementTaskTree
} from '../../../../api/suzhou-api';
export class PlanPreparedRelease extends Component {
  constructor(props) {
    super(props)
    this.state = {
      initDone: false,
      columns: [],
      data: [],
      initData: [],
      currentData: [],
      activeIndex: []
    }
  }

  //注册 父组件即可调用子组件方法
  onRef = (ref) => {
    this.table = ref
  }

  status = () => {
    const { releaseType } = this.props;
    let status = [];
    switch (releaseType) {
      case "direct":
        status = ["EDIT", "CONFIRM"];
        break;
      case "abolish":
        status = ["RELEASE"];
        break;
      case "confirm":
        status = ["EDIT"];
        break;
      case "cancelConfirm":
        status = ["CONFIRM"];
        break;
    }
    return status;
  }

  getAuth = (status) => {
    if (status) {
      const { releaseType } = this.props;
      if (releaseType == 'direct' && (status == 'EDIT' || status == 'CONFIRM')) {
        return true
      }
      if (releaseType == 'abolish' && status == 'RELEASE') {
        return true
      }
      if (releaseType == 'confirm' && status == 'EDIT') {
        return true
      }
      if (releaseType == 'cancelConfirm' && status == 'CONFIRM') {
        return true
      }
    } else {
      return false
    }
  }


  setClassName = (record, index) => {
    //判断索引相等时添加行的高亮样式
    return record.id === this.state.activeIndex ? 'tableActivty' : "";
  }

  getDataList = (callBack) => {
    const { releaseType } = this.props;
    let status = [];
    switch (releaseType) {
      case "direct":
        status = ["EDIT", "CONFIRM"];
        break;
      case "abolish":
        status = ["RELEASE"];
        break;
      case "confirm":
        status = ["EDIT"];
        break;
      case "cancelConfirm":
        status = ["CONFIRM"];
        break;
    }
    let searchParams = {
      custom01: this.props.year,
      custom02: this.props.month,
      custom09:("confirm" == releaseType || "cancelConfirm" == releaseType ? 'Y' : null),//只显示WBS
      planType: this.props.menuCode,
      status: status,
      fuzzySearch: false,
      children: false
    }
    // 将查询条件拼接到URL上，作为参数
    let url = dataUtil.spliceUrlParams(queryImplementTaskTree, { ...searchParams });
    // 查询计划编制
    axios.post(url, { defineIds: this.props.defineIds }, false, null, false).then(res => {
      callBack(res.data.data || [])
    })
  }

  componentDidMount() {

  }

  handleSubmit = () => {
    const { releaseType } = this.props
    switch (releaseType) {
      case "direct":
        this.putReleasePlanTask();
        break;
      case "abolish":
        this.putCancelReleasePlanTask();
        break;
      case "confirm":
        this.putConfirmPlanTask();
        break;
      case "cancelConfirm":
        this.putCancelConfirmPlanTask();
        break;
    }
  }

  // 确认直接发布计划
  putReleasePlanTask = () => {

    const { handleCancel, projectId } = this.props
    const { activeIndex } = this.state
    if (!activeIndex || activeIndex.length == 0) {
      notification.warning({
        placement: 'bottomRight',
        bottom: 50,
        duration: 2,
        message: '未勾选数据',
        description: '请勾选数据再操作'
      });
      return;
    }
    let url = dataUtil.spliceUrlParams(releasePlanTask(projectId || -1), { "startContent": "项目【" + this.props.selectProjectName + "】" });
    axios.put(url, [...activeIndex], true).then(res => {
      this.props.getPreparedTreeList()
      handleCancel()
    })
  }

  // 确认取消发布计划
  putCancelReleasePlanTask = () => {
    const { handleCancel, projectId } = this.props
    const { activeIndex } = this.state

    if (!activeIndex || activeIndex.length == 0) {
      notification.warning({
        placement: 'bottomRight',
        bottom: 50,
        duration: 2,
        message: '未勾选数据',
        description: '请勾选数据再操作'
      });
      return;
    }
    let url = dataUtil.spliceUrlParams(cancelReleasePlanTask(projectId || -1), { "startContent": "项目【" + this.props.selectProjectName + "】" });
    axios.put(url, [...activeIndex], true).then(res => {
      this.props.getPreparedTreeList()
      handleCancel()
    })
  }


  putConfirmPlanTask = () => {
    const { handleCancel, projectId } = this.props
    const { activeIndex } = this.state

    if (!activeIndex || activeIndex.length == 0) {
      notification.warning({
        placement: 'bottomRight',
        bottom: 50,
        duration: 2,
        message: '未勾选数据',
        description: '请勾选数据再操作'
      });
      return;
    }
    let url = dataUtil.spliceUrlParams(confirmPlanTask(projectId || -1), { "startContent": "项目【" + this.props.selectProjectName + "】" });
    axios.put(url, [...activeIndex], true).then(res => {
      this.props.getPreparedTreeList()
      handleCancel()
    })
  }

  // 确认取消发布计划
  putCancelConfirmPlanTask = () => {
    const { handleCancel, projectId } = this.props
    const { activeIndex } = this.state

    if (!activeIndex || activeIndex.length == 0) {
      notification.warning({
        placement: 'bottomRight',
        bottom: 50,
        duration: 2,
        message: '未勾选数据',
        description: '请勾选数据再操作'
      });
      return;
    }
    let url = dataUtil.spliceUrlParams(cancelConfirmPlanTask(projectId || -1), { "startContent": "项目【" + this.props.selectProjectName + "】" });
    axios.put(url, [...activeIndex], true).then(res => {
      this.props.getPreparedTreeList()
      handleCancel()
    })
  }

  //表格 点击行事件
  getInfo = (record, index) => {
    this.setState({
      activeIndex: record.id,
      record
    })
  }
  /**
  * 获取复选框 选中项、选中行数据
  * @method updateSuccess
  * @param {string} selectedRowKeys 复选框选中项
  * @param {string} selectedRows  行数据
  */
  getSelectedRowKeys = (activeIndex, selectedRows) => {
    this.setState({
      selectedRows,
      activeIndex
    })
  }

  search = (value) => {
    this.table.search([{ "key": "name|code", "value": value }], true, () => {
      this.setState({
        rightData: null
      });
    });
  }

  render() {
    const columns = [
      {
        title: intl.get('wsd.i18n.plan.feedback.name'),
        dataIndex: 'name',
        key: 'name',
        width: 200,
        render: (text, record) => {
          let icon = dataUtil.getIcon(record.nodeType, record.taskType);
          let year = record.custom01;
          let month = record.custom02;
          month = month ? month + "月" : "";
          let text1 = year ? "(" + year + "年" + month + ") " + text : text;
          return <span><MyIcon type={icon} style={{ fontSize: '18px', marginRight: '8px' }} /> {text1}</span>
          //let icon = dataUtil.getIcon(record.nodeType,record.taskType);
          //return <span><MyIcon type={icon} style={{ fontSize: '18px', marginRight: '8px' }} /> {text}</span>
        }
      },
      // {
      //   title: intl.get('wsd.i18n.plan.feedback.code'),
      //   dataIndex: 'code',
      //   key: 'code',
      // },
      {
        title: intl.get('wsd.i18n.plan.feedback.planstarttime'),
        dataIndex: 'planStartTime',
        key: 'planStartTime',
        render: (text) => dataUtil.Dates().formatDateString(text)
      },
      {
        title: intl.get('wsd.i18n.plan.feedback.planendtime'),
        dataIndex: 'planEndTime',
        key: 'planEndTime',
        render: (text) => dataUtil.Dates().formatDateString(text)
      },
      {
        title: intl.get('wsd.i18n.plan.feedback.iptname'),
        dataIndex: 'org',
        key: 'org',
        render: data => data ? data.name : ''
      },
      {
        title: intl.get('wsd.i18n.plan.feedback.username'),
        dataIndex: 'user',
        key: 'user',
        render: data => data ? data.name : ''
      }
    ]

    return (
      <Modal className={style.main} width={1100} centered={true} mask={false}
        maskClosable={false}
        title={this.props.releaseTitle} visible={true} onCancel={this.props.handleCancel} bodyStyle={{ padding: 0 }} footer={
          <div className="modalbtn">
            <SubmitButton key="1" onClick={this.props.handleCancel} content="取消" />
            <SubmitButton key="2" type="primary" onClick={this.handleSubmit} content="确定" />
          </div>
        }>
        <div className={style.tableMain}>
          <div className={style.search}>
            <Search search={this.search.bind(this)} />
          </div>
          <PublicTable onRef={this.onRef} getData={this.getDataList}
            selectTree={true}
            getRowData={this.getInfo}
            useCheckBox={true}
            rowSelection={true}
            onChangeCheckBox={this.getSelectedRowKeys}
            pagination={false}
            columns={columns}
            expanderLevel={10}
            checkboxStatus={record => !this.getAuth(record.status ? record.status.id : '')}
          />
        </div>
      </Modal>
    )
  }
}


export default PlanPreparedRelease
