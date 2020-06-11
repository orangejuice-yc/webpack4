import React, { Component } from 'react'
import LabelToolbar from '../../../../components/public/Layout/Labels/Table/LabelToolbar'
import LabelTableLayout from '../../../../components/public/Layout/Labels/Table/LabelTableLayout'
import LabelTable from '../../../../components/public/Layout/Labels/Table/LabelTable'
import LabelTableItem from '../../../../components/public/Layout/Labels/Table/LabelTableItem'
import { Table, notification, Select, Spin, Progress, message } from 'antd'
import style from './style.less'

import PublicButton from "../../../../components/public/TopTags/PublicButton"
import EditMeetModal from "./EditMeetModal"
import { connect } from 'react-redux'
import { meetingActionList, meetingActionDelete } from '../../../../api/api'
import axios from '../../../../api/axios';
import LogModal from "../LogModal"
import PublicTable from '../../../../components/PublicTable'
import * as dataUtil from "../../../../utils/dataUtil"
const Option = Select.Option;
class MeetActionForm extends Component {
  constructor(props) {
    super(props)
    this.state = {

      activeIndex: null,
      rightData: null,
      selectedRowKeys: [],
      title: '',
      visible: false,
      selectDelId: [],
      data: []
    }
  }

  deleteVerifyCallBack = () => {
    if (this.state.selectedRowKeys.length == 0) {
      notification.warning(
        {
          placement: 'bottomRight',
          bottom: 50,
          duration: 1,
          message: '警告',
          description: '没有勾选数据！'
        }
      )
      return false
    } else {
      return true
    }
  }

  onClickHandle = (name) => {
    if (name == "AddTopBtn") {
      this.setState(
        { title: '新增会议行动项', visible: true, type: "add" })
    }
    if (name == "ModifyTopBtn") {
      if (!this.state.rightData) {
        notification.warning(
          {
            placement: 'bottomRight',
            bottom: 50,
            duration: 1,
            message: '警告',
            description: '没有选择数据！'
          }
        )
        return
      }
      const { rightData } = this.state
      this.setState(
        { title: '修改会议行动项', visible: true, type: "modify", selectData: rightData })
    }
    if (name == 'DeleteTopBtn') {

      if (this.state.selectedRowKeys.length == 0) {
        notification.warning(
          {
            placement: 'bottomRight',
            bottom: 50,
            duration: 1,
            message: '警告',
            description: '没有选择数据！'
          }
        )
        return
      }
      let { startContent } = this.props.extInfo || {};
      let url = dataUtil.spliceUrlParams(meetingActionDelete, { startContent });
      axios.deleted(url, { data: this.state.selectedRowKeys }, null, true).then(res => {
        this.table.getData();
      })
    }
    if (name == "FeedBackBtn") {
      //打开计划反馈模块
      this.props.openMenuByMenuCode("PM-FEEDBACK", true);
    }
  }
  handleCancel = (e) => {
    this.setState({ visible: false })
  }


  //table点击行事件
  getInfo = (record) => {
    this.setState({
      rightData: record,
    })
  };


  // 获取会议行动项目
  getMeetingAction = (callBack) => {
    let { data } = this.props;
    axios.get(meetingActionList(data.id)).then((result) => {
      let data = result.data.data;
      callBack(data ? data : [])
    })
  }
  lookLog = (id) => {
    this.setState({
      logid: id,
      isProcess: true
    })
  }
  closeLog = () => {
    this.setState({
      isProcess: false
    })
  }

  /**
     * 父组件即可调用子组件方法
     * @method
     * @description 获取用户列表、或者根据搜索值获取用户列表
     * @param {string} record  行数据
     * @return {array} 返回选中用户列表
     */
  onRef = (ref) => {
    this.table = ref
  }


  /**
* 获取复选框 选中项、选中行数据
* @method updateSuccess
* @param {string} selectedRowKeys 复选框选中项
* @param {string} selectedRows  行数据
*/
  getSelectedRowKeys = (selectedRowKeys, selectedRows) => {
    this.setState({
      selectedRows,
      selectedRowKeys
    })
  }

  //新增
  addData = (value) => {
    this.table.add(null, value)
  }
  //修改
  updateData = (value) => {
    this.table.update(this.state.rightData, value)
  }

  render() {
    const { intl } = this.props.currentLocale
    const columns = [
      {
        title: intl.get('wsd.i18n.comu.meetingaction.actionname'),
        dataIndex: 'actionName',
        key: 'actionName',
        width:200,
      },
      {
        title: intl.get('wsd.i18n.comu.meetingaction.actioncode'),
        dataIndex: 'actionCode',
        key: 'actionCode',
        width:100,
      },
      {
        title: intl.get('wsd.i18n.comu.meetingaction.planstarttime'),
        dataIndex: 'planStartTime',
        key: 'planStartTime',
        render: (text) => dataUtil.Dates().formatDateString(text),
        width:100,
      },
      {
        title: intl.get('wsd.i18n.comu.meetingaction.planendtime'),
        dataIndex: 'planEndTime',
        key: 'planEndTime',
        width:100,
        render: (text) => dataUtil.Dates().formatDateString(text)
      },
      {
        title: intl.get('wsd.i18n.comu.meetingaction.completestatus'),
        dataIndex: 'completed',
        key: 'completed',
        width:100,
        render: (text, record) => (
          <Progress percent={text} className={style.myProgress} strokeWidth={text} />
        )
      },
      {
        title: intl.get('wsd.i18n.comu.meetingaction.progresslog'),
        dataIndex: 'progresslog',
        key: 'progresslog',
        width:100,
        render: text => <a onClick={this.lookLog.bind(this, id)} href="#">查看</a>
      },
      {
        title: intl.get('wsd.i18n.comu.meetingaction.remark'),
        dataIndex: 'remark',
        width:200,
        key: 'remark',
      },
    ];

    return (
      <LabelTableLayout title={this.props.title}>
        <LabelToolbar>
          {/*新增*/}
          <PublicButton name={'新增'} title={'新增'} icon={'icon-add'} afterCallBack={this.onClickHandle.bind(this, 'AddTopBtn')} edit={this.props.meetActionEditAuth} />
          {/*修改*/}
          <PublicButton name={'修改'} title={'修改'} icon={'icon-xiugaibianji'} afterCallBack={this.onClickHandle.bind(this, 'ModifyTopBtn')} edit={this.props.meetActionEditAuth} />
          {/*删除*/}
          <PublicButton title={"删除"} useModel={true} verifyCallBack={this.deleteVerifyCallBack} afterCallBack={this.onClickHandle.bind(this, "DeleteTopBtn")} icon={"icon-delete"} edit={this.props.meetActionEditAuth} />
          {/*反馈*/}
          <PublicButton name={'反馈'} title={'反馈'} icon={'icon-dkw_shenhetongguo'} afterCallBack={this.onClickHandle.bind(this, 'FeedBackBtn')} edit={this.props.data.status && this.props.data.status.id == "RELEASE"} />
        </LabelToolbar>
        <LabelTable labelWidth={this.props.labelWidth} contentMinWidth={1000}>
          <PublicTable istile={true} onRef={this.onRef}
            rowSelection={true}
            useCheckBox={true}
            getData={this.getMeetingAction}
            columns={columns}
            onChangeCheckBox={this.getSelectedRowKeys}
            scroll={{ x: '100%', y: this.props.height - 100 }}
            getRowData={this.getInfo}
          />
        </LabelTable>

        {this.state.visible && <EditMeetModal
          title={this.state.title}
          handleCancel={this.handleCancel}
          data={this.props.data}
          type={this.state.type}
          addData={this.addData}
          selectData={this.state.selectData}
          updateData={this.updateData}
          extInfo={this.props.extInfo}
          projectId={this.props.projectId}
        />}
        {this.state.isProcess && <LogModal handleCancel={this.closeLog} logid={this.state.logid} />}

      </LabelTableLayout>

    )
  }
}
const mapStateToProps = state => {
  return {
    currentLocale: state.localeProviderData,
  }
};


export default connect(mapStateToProps, null)(MeetActionForm);
