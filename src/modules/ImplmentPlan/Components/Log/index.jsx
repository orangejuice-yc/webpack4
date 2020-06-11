import React, { Component } from 'react'
import { Table, Progress, Badge, Button,notification } from 'antd'

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
import PlanMaterielReaction from '../Materiel' //新增物料关联
import PlanStationDetail from '../StationDetail' //查看计划站点明细
export class PlanComponentsLog extends Component {
  constructor(props) {
    super(props)
    this.state = {
      name: 'PlanComponentsLog',
      initDone: false,
      columns: [],
      data: [],
      planMaterielReactionModalVisible:false,
      planMaterielReactionModalButtonVisible:true,
      planStationDetailModalVisible:false
    }
  }


  getData = (callBack) => {
    axios.get(getfeedbacklist(this.props.data.id)).then(res => {
      if (callBack){
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

  //注册 父组件即可调用子组件方法
  onRefMateriel = (ref) => {
    this.materiel = ref
  }
  

  //table 点击行事件
  getInfo = (record, index) => {
    this.setState({
      rightData: record
    })
  }


  showFormModal = (name) => {
    const { rightData} = this.state
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

  //显示
  showPlanMaterielReactionModal = (record) => {
    if (record){
      this.setState({
        rightData: record,
        planMaterielReactionModalButtonVisible:false
      })
    }
    const { rightData} = this.state
    if (!rightData && !record) {
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
      this.setState({
        planMaterielReactionModalVisible: true
      })
      return true
    }
  }

  //显示
  showPlanStationDetail = (record) => {
    if (record){
      this.setState({
        rightData: record,
        planStationDetailModalVisible:true
      })
    }
  }

  //关闭站点明细
  handlePlanStationDetail = () => {
    this.setState({
      planStationDetailModalVisible:false
    })
  }

  //关闭
  handlePlanMaterielReactionModal = () => {
    this.setState({
      planMaterielReactionModalVisible: false,
      planMaterielReactionModalButtonVisible:true
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
        title: "完成百分比",  //"进度",
        dataIndex: 'completePct',
        key: 'completePct',
        width: 130,
        render:(text, record) => {//
          return <Progress percent={text} className={style.myProgress} strokeWidth={18} />
        },
      },
      {
        title: intl.get('wsd.i18n.plan.progressLog.actstarttime'),  //"实际开始日期",
        dataIndex: 'actStartTime',
        key: 'actStartTime',
        width: 90,
        render: (text) => dataUtil.Dates().formatDateString(text)
      },
      {
        title: intl.get('wsd.i18n.plan.progressLog.actendtime'),  //"实际完成日期",
        dataIndex: 'actEndTime',
        key: 'actEndTime',
        width: 90,
        render: (text) => dataUtil.Dates().formatDateString(text)
      },
      {
        title: "本周完成量",  //本周完成量,
        dataIndex: 'custom01',
        key: 'custom01',
        width: 90,
        render: (text, record) => {
          const {commUnitMap,data} = this.props;
          let unit = commUnitMap && commUnitMap[record.taskCustom07] ? commUnitMap[record.taskCustom07] : "";
          if (text) {
              return <span>{text.value}{unit}</span>
          } else {
              return "0"+unit
          }
        }
      },
      {
        title: "下周计划量",  //下周计划量,
        dataIndex: 'custom02',
        key: 'custom02',
        width: 90,
        render: (text, record) => {
          const {commUnitMap,data} = this.props;
          let unit = commUnitMap && commUnitMap[record.taskCustom07] ? commUnitMap[record.taskCustom07] : "";
          if (text) {
              return <span>{text.value}{unit}</span>
          } else {
              return "0"+unit
          }
        }
      },
      {
        title: '物料消耗',
        dataIndex: '',
        align: 'left',
        width: 90,
        render: (text, record) => <Button type="primary" size="small" onClick={this.showPlanMaterielReactionModal.bind(this, record)}>查看</Button>
      },
      {
        title: '完成明细',
        dataIndex: '',
        align: 'left',
        width: 90,
        render: (text, record) => <Button type="primary" size="small" onClick={this.showPlanStationDetail.bind(this, record)}>明细</Button>
      },
      {
        title: intl.get('wsd.i18n.plan.progressLog.status'),  //"状态",
        dataIndex: 'status',
        key: 'status',
        width: 80,
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
      },
      {
        title: intl.get('wsd.i18n.plan.progressLog.progressdesc'),  //"进展说明",
        dataIndex: 'remark',
        key: 'remark',
        width: 200,
        render: (text) => {
          return <span title={text}>{text}</span>
        }
      }
    ]
    return (
      <LabelTableLayout title = {this.props.title} menuCode = {this.props.menuCode}>
        {!this.props.logEdit &&
          <LabelToolbar>
            <PublicButton name={'关联物料'} title={'关联物料'} edit={this.props.editAuth} icon={'icon-fenpei'}
              afterCallBack={this.showPlanMaterielReactionModal} />
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
        {/* 查询关联物料 */}
        {this.state.planMaterielReactionModalVisible && <PlanMaterielReaction
          labelWidth = {this.props.labelWidth }
          onRef={this.onRefMateriel}
          handleCancel={this.handlePlanMaterielReactionModal}
          planMaterielReactionModalButtonVisible={this.state.planMaterielReactionModalButtonVisible}
          sectionId={this.props.sectionId}
          rightData={this.state.rightData}
          projectId={this.props.projectId}
          getData={this.getData}
          editAuth={this.props.editAuth}
        />}
        {/* 查询计划站点明细 */}
        {this.state.planStationDetailModalVisible && <PlanStationDetail
          handleCancel={this.handlePlanStationDetail}
          data={this.state.rightData}
          mainData={this.props.data}
          commUnitMap={this.props.commUnitMap}
        />}
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
