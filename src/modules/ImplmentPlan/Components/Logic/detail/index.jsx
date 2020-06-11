import React, { Component } from 'react'
import { Table, Progress, Badge, Button, notification, Modal } from 'antd'

import style from './style.less'
import { connect } from 'react-redux'
import axios from "../../../../../api/axios"
import { getfeedbacklist, deletefeedback } from "../../../../../api/api"
import * as dataUtil from '../../../../../utils/dataUtil';
import PublicButton from '../../../../../components/public/TopTags/PublicButton';
import PublicTable from '../../../../../components/PublicTable'


export class PlanComponentsLog extends Component {
  constructor(props) {
    super(props)
    this.state = {
      name: 'PlanComponentsLog',
      columns: [],
      data: [],
    }
  }

  getData = (callBack) => {
    //predTaskId/紧前 followTaskId/后继
    let taskId = this.props.data.predTaskId ? this.props.data.predTaskId : this.props.data.followTaskId;
    axios.get(getfeedbacklist(taskId)).then(res => {
      if (callBack) {
        callBack(res.data.data ? res.data.data : [])
      }
      this.setState({
        data: res.data.data
      })
    })
  }
  //注册 父组件即可调用子组件方法
  onRef = (ref) => {
    this.table = ref
  }

  //table 点击行事件
  getInfo = (record, index) => {
    this.setState({
      rightData: record,
    })
  }

  deleteVerifyCallBack = () => {
    const { rightData } = this.state
    if (!rightData) {
      notification.warning(
        {
          placement: 'bottomRight',
          bottom: 50,
          duration: 1,
          message: '警告',
          description: '没有选择记录！'
        }
      )
      return false
    } else {
      return true
    }

  }


  showFormModal = () => {
    const { rightData } = this.state
    if (!rightData) {
      notification.warning(
        {
          placement: 'bottomRight',
          bottom: 50,
          duration: 1,
          message: '警告',
          description: '没有选择反馈！'
        }
      )
      return
    } else if (rightData.status.id != 'EDIT') {
      notification.warning(
        {
          placement: 'bottomRight',
          bottom: 50,
          duration: 1,
          message: '警告',
          description: '只能删除编制中的反馈！'
        }
      )
      return
    }
    let { startContent } = this.props.extInfo || {};
    let url = dataUtil.spliceUrlParams(deletefeedback(this.state.rightData.id), { startContent });
    axios.deleted(url, null, true, null, true).then(res => {
      this.table.deleted(rightData)
      this.setState({
        rightData: null
      })
    })
  }

  render() {

    const { intl } = this.props.currentLocale
    const columns = [

      {
        title: intl.get('wsd.i18n.plan.progressLog.endtime'),  //填报日期
        dataIndex: 'deadline',
        key: 'deadline',
        width: 120,
        render: (text) => dataUtil.Dates().formatDateString(text)
      },
      {
        title: "完成%",  //"进度",
        dataIndex: 'completePct',
        key: 'completePct',
        width: 140,
        render: text => (
          <Progress percent={text} className={style.myProgress} strokeWidth={18} />
        ),
      },
      {
        title: intl.get('wsd.i18n.plan.progressLog.actstarttime'),  //"实际开始日期",
        dataIndex: 'actStartTime',
        key: 'actStartTime',
        width: 110,
        render: (text) => dataUtil.Dates().formatDateString(text)
      },
      {
        title: intl.get('wsd.i18n.plan.progressLog.actendtime'),  //"实际完成日期",
        dataIndex: 'actEndTime',
        key: 'actEndTime',
        width: 110,
        render: (text) => dataUtil.Dates().formatDateString(text)
      },
      {
        title: intl.get('wsd.i18n.plan.progressLog.progressdesc'),  //"进展说明",
        dataIndex: 'remark',
        key: 'remark',
      }/*,
      {
        title: intl.get('wsd.i18n.plan.progressLog.status'),  //"状态",
        dataIndex: 'status',
        key: 'status',
        render: (text) => {
          if (!text) {
            return
          }
          if (text.id == "EDIT") {
            //编制中
            return <Badge status="warning" text={text.name} />
          }
          if (text.id == "APPROVED") {
            //已审批
            return <Badge status="success" text={text.name} />
          }
          if (text.id == "APPROVAL") {
            //审批中
            return <Badge status="processing" text={text.name} />
          }
        }
      },*/
    ]
    return (
      <Modal className={style.main} width="800px" onCancel={this.props.handleCancel} title="进展日志" visible={true} footer={null} mask={false} maskClosable={false}>
        <div style={{ minHeight: 300 }}>
          {/*
            <div>
              <PublicButton title={"删除"} useModel={true} verifyCallBack={this.deleteVerifyCallBack}  afterCallBack={this.showFormModal} icon={"icon-delete"} />
            </div>
          */}
          <PublicTable
            onRef={this.onRef} getData={this.getData}
            pagination={false} columns={columns}
            getRowData={this.getInfo} />
        </div>
      </Modal>

    )
  }
}


const mapStateToProps = state => {
  return {
    currentLocale: state.localeProviderData,
  }
};


export default connect(mapStateToProps, null)(PlanComponentsLog);
