import React, { Component } from 'react'
import { Table, Progress, Badge, notification } from 'antd'

import style from './style.less'
import { connect } from 'react-redux'
import axios from "../../../../api/axios"
import { getfeedbacklist, deletefeedback } from "../../../../api/api"
import * as dataUtil from '../../../../utils/dataUtil';
import PublicButton from '../../../../components/public/TopTags/PublicButton';
import PublicTable from '../../../../components/PublicTable'
import LabelToolbar from '../../../../components/public/Layout/Labels/Table/LabelToolbar'
import LabelTableLayout from '../../../../components/public/Layout/Labels/Table/LabelTableLayout'
import LabelTable from '../../../../components/public/Layout/Labels/Table/LabelTable'

export class PlanComponentsLog extends Component {
  constructor(props) {
    super(props)
    this.state = {
      name: 'PlanComponentsLog',
      initDone: false,
      columns: [],
      data: []
    }
  }


  getData = (callBack) => {
    axios.get(getfeedbacklist(this.props.data.id)).then(res => {
      callBack(res.data.data ? res.data.data : [])
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
      rightData: record
    })
  }


  showFormModal = (name) => {
    const { rightData, data, activeIndex } = this.state
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
      this.props.updateSuccess({ ...res.data.data, feedbackId: null })
    })
  }
  deleteVerifyCallBack = () => {
    const { rightData, data, activeIndex } = this.state
    if (!rightData) {
      notification.warning(
        {
          placement: 'bottomRight',
          bottom: 50,
          duration: 1,
          message: '警告',
          description: '没有选择计划！'
        }
      )
      return false
    } else {
      return true
    }

  }

  render() {

    const { intl } = this.props.currentLocale
    const columns = [

      {
        title: intl.get('wsd.i18n.plan.progressLog.endtime'),  //填报日期
        dataIndex: 'deadline',
        key: 'deadline',
        render: (text) => dataUtil.Dates().formatDateString(text)
      },
      {
        title: "完成百分比",  //"进度",
        dataIndex: 'approvePct',
        key: 'approvePct',
        width: 140,
        render: text => (
          <Progress percent={text} className={style.myProgress} strokeWidth={18} />
        ),
      },
      {
        title: intl.get('wsd.i18n.plan.progressLog.actstarttime'),  //"实际开始日期",
        dataIndex: 'actStartTime',
        key: 'actStartTime',
        render: (text) => dataUtil.Dates().formatDateString(text)
      },
      {
        title: intl.get('wsd.i18n.plan.progressLog.actendtime'),  //"实际完成日期",
        dataIndex: 'actEndTime',
        key: 'actEndTime',
        render: (text) => dataUtil.Dates().formatDateString(text)
      },
      {
        title: intl.get('wsd.i18n.plan.progressLog.progressdesc'),  //"进展说明",
        dataIndex: 'remark',
        key: 'remark',
        onCell:(record)=>({
          title:record.remark
        })
      },
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
      }
    ]
    return (
      <LabelTableLayout title = {this.props.title} menuCode = {this.props.menuCode}>
        {!this.props.logEdit &&
          <LabelToolbar>
            {/*删除*/}
            <PublicButton title={"删除"} edit={this.props.editAuth} useModel={true} verifyCallBack={this.deleteVerifyCallBack}
                          afterCallBack={this.showFormModal} icon={"icon-delete"} />
          </LabelToolbar>
        }
        <LabelTable labelWidth = {this.props.labelWidth } contentMinWidth = {400}>
          <PublicTable onRef={this.onRef} getData={this.getData}
                       pagination={false} columns={columns}
                       scroll={{ x: 1800, y: this.props.height - 50 }}
                       getRowData={this.getInfo}
          />
        </LabelTable>
      </LabelTableLayout>
    )
  }
}


const mapStateToProps = state => {
  return {
    currentLocale: state.localeProviderData,
  }
};


export default connect(mapStateToProps, null)(PlanComponentsLog);
