import React, { Component } from 'react'
import { Table, Progress, Spin, Modal, Input, Form, InputNumber, Popconfirm, notification, DatePicker, Checkbox } from 'antd'
import {connect} from 'react-redux'
import PubTable from '../../../../components/PublicTable'
import style from './style.less'
import moment from 'moment'
import * as dataUtil from '../../../../utils/dataUtil';
import axios from "../../../../api/axios"
import LabelToolbar from '../../../../components/public/Layout/Labels/Table/LabelToolbar'
import LabelTableLayout from '../../../../components/public/Layout/Labels/Table/LabelTableLayout'
import LabelTable from '../../../../components/public/Layout/Labels/Table/LabelTable'
import LabelTableItem from '../../../../components/public/Layout/Labels/Table/LabelTableItem'
import {
  getPlanTaskrsrcList,
  updatePlanTaskrsrc,
  deletePlanTaskrsrc,
  addPlanTaskrsrc, getvariable, caculateWorkHour
} from "../../../../api/api"
import Distribute from "./Distribute"
import PublicButton from "../../../../components/public/TopTags/PublicButton";
import EditModal from "./EditModal"

class PlanComponentsResPlan extends Component {
  constructor(props) {
    super(props)
    this.state = {
      runnDone: true, //是否计算完成
      distributeState: false, //分配弹窗状态
      projSet: { dateFormat: 'YYYY-MM-DD', drtnUnit: 'h', timeUnit: 'h', precision: 2, moneyUnit: '¥', complete: '%' },
      selectedRowKeys: [],
     
    }
  }
  getInfo = (record) => {
    this.setState({record})
  }



  callBackDistribute = (values) => {
    const { rightData } = this.props
    const data = values.map(v => {
      return {
        taskId: rightData[0]['id'],
        rsrcId: v.id,
        rsrcType: v.rsrcType,
        rsrcName: v.rsrcName,
        planStartTime: v.startTime,
        planEndTime: v.completeTime
      }
    })
    let { startContent } = this.props.extInfo || {};
    let url = dataUtil.spliceUrlParams(addPlanTaskrsrc, { startContent });
    axios.post(url, data, true, null, true).then(res => {
      this.table.getData()
    })
  }

  handleCancel = () => {
    this.setState({
      distributeState: false
    })
  }

  componentDidMount() {
   
    if (this.props.rightData[0].nodeType == "task" && (this.props.rightData[0].taskType == 3 || this.props.rightData[0].taskType == 2)) {
      this.setState({
        isEdit: false
      })
    } else {
      this.setState({
        isEdit: true
      })
    }
    axios.get(getvariable(this.props.rightData[0].projectId || 0)).then(res => {
      const data = res.data.data || {};
      this.setState({
        projSet: {
          dateFormat: (data.dateFormat || {}).id || "YYYY-MM-DD",
          drtnUnit: (data.drtnUnit || {}).id || "h",
          timeUnit: (data.timeUnit || {}).id || "h",
          complete: (data.complete || {}).id || "%",
          precision: data.precision || 2,
          moneyUnit: (data.currency || {}).symbol || "¥",
        }
      })
    })
  }

  // 获取资源计划列表
  getPlanTaskrsrcList = (calllBack) => {
    const { rightData } = this.props
 
      axios.get(getPlanTaskrsrcList(rightData[0]['id'])).then(res => {
        const { data } = res.data
        calllBack(data)
      })
   
  }

  deleteVerifyCallBack = () => {
    const { selectedRowKeys, data } = this.state
    if (selectedRowKeys.length == 0) {
      notification.warning({
        placement: 'bottomRight',
        bottom: 50,
        duration: 2,
        message: '未选中数据',
        description: '请选择数据进行操作'
      });
      return false;
    }
    return true;
  }

  // 删除资源计划
  deletePlanTaskrsrc = () => {
    const { selectedRowKeys } = this.state;
    let { startContent } = this.props.extInfo || {};
    let url = dataUtil.spliceUrlParams(deletePlanTaskrsrc, { startContent });
    axios.deleted(url, { data: selectedRowKeys }, true, null, true).then(res => {
      this.table.getData()
    })
  }
  /* 获取复选框 选中项、选中行数据
  * @method updateSuccess
  * @param {string} selectedRowKeys 复选框选中项
  * @param {string} selectedRows  行数据
  */
  getSelectedRowKeys = (selectedRowKeys, selectedRows) => {
    this.setState({
      selectedRows,
      selectedRowKeys,

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
  edit = () => {
    const { record } = this.state
    if (!record) {
      dataUtil.message("请选择数据进行操作！")
      return
    }
    this.setState({ isEditkey: true });
  }
  //刷新
refresh=()=>{
  this.table.getData()
}
  render() {
    const { intl } = this.props.currentLocale
    const columns = [
      {
        title: intl.get('wsd.i18n.plan.rsrcPlan.rsrcname'),
        dataIndex: 'rsrcuserName',
        key: 'rsrcuserName',
        width: 100,
      },
      {
        title: intl.get('wsd.i18n.plan.rsrcPlan.rsrccode'),
        dataIndex: 'rsrcuserCode',
        key: 'rsrcuserCode',
        width: 100,
      },
      {
        title: "驱动任务日期",
        dataIndex: 'driveTaskTime',
        key: 'driveTaskTime',
        align: 'center',
        editable: true,
        width: 100,
        render: data => data == 1 && '√'
      },
      {
        title: intl.get('wsd.i18n.plan.rsrcPlan.unit'),
        dataIndex: 'unit',
        key: 'unit',
        align: 'center',
        width: 100,
        render: data => data && data.name
      },
      {
        title: "单位最大用量",
        dataIndex: 'maxUnit',
        key: 'maxUnit',
        align: 'right',
        width: 100,
        render: (text, record) => <div>{dataUtil.Numbers().fomat(text || 0, { precision: this.state.projSet.precision }) + 'h/d'}</div>
      },
      {
        title: "预算用量",
        dataIndex: 'budgetQty',
        key: 'budgetQty',
        align: 'right',
        width: 100,
        editable: true,
        render: (text, record) => <div className="editable-row-text">{
          dataUtil.Numbers().fomat(dataUtil.WorkTimes().hourTo(text, this.state.projSet.timeUnit, record.calendar), { precision: this.state.projSet.precision }) + this.state.projSet.timeUnit
        }</div>
      },
      {
        title: "预算单价",
        dataIndex: 'budgetUnit',
        key: 'budgetUnit',
        align: 'right',
        width: 100,
        editable: true,
        render: (text, record) => <div className="editable-row-text">{this.state.projSet.moneyUnit + dataUtil.Numbers().fomat(text || 0, { precision: this.state.projSet.precision, thousandsSeparator: true })}/h</div>
      },
      {
        title: "预算成本",
        dataIndex: 'budgetCost',
        key: 'budgetCost',
        align: 'right',
        width: 100,
        render: (text, record) => <div className="editable-row-text">{this.state.projSet.moneyUnit + dataUtil.Numbers().fomat(text || 0, { precision: this.state.projSet.precision, thousandsSeparator: true })}</div>
      },
      {
        title: "计划开始时间",
        dataIndex: 'planStartTime',
        key: 'planStartTime',
        align: 'center',
        width: 120,
        editable: true,
        render: (text, record) => <div className="editable-row-text">{dataUtil.Dates().formatTimeString(text, this.state.projSet.dateFormat)}</div>
      },
      {
        title: "计划完成时间",
        dataIndex: 'planEndTime',
        key: 'planEndTime',
        align: 'center',
        width: 120,
        editable: true,
        render: (text, record) => <div className="editable-row-text">{dataUtil.Dates().formatTimeString(text, this.state.projSet.dateFormat)}</div>
      },
      {
        title: intl.get('wsd.i18n.plan.rsrcPlan.actstarttime'),
        dataIndex: 'actStartTime',
        key: 'actStartTime',
        align: 'center',
        width: 120,
        render: (text, record) => dataUtil.Dates().formatTimeString(text, this.state.projSet.dateFormat)
      },
      {
        title: intl.get('wsd.i18n.plan.rsrcPlan.actendtime'),
        dataIndex: 'actEndTime',
        key: 'actEndTime',
        align: 'center',
        width: 120,
        render: (text, record) => dataUtil.Dates().formatTimeString(text, this.state.projSet.dateFormat)
      },
      {
        title: intl.get('wsd.i18n.plan.rsrcPlan.actamount'),
        dataIndex: 'actQty',
        key: 'actQty',
        align: 'right',
        width: 100,
        render: (text, record) => <div>{dataUtil.Numbers().fomat(dataUtil.WorkTimes().hourTo(text, this.state.projSet.timeUnit, record.calendar), { precision: this.state.projSet.precision }) + this.state.projSet.timeUnit}</div>
      },
   
      {
        title: intl.get('wsd.i18n.plan.rsrcPlan.actcost'),
        dataIndex: 'actCost',
        key: 'actCost',
        align: 'right',
        width: 100,
        render: (text, record) => <div>{this.state.projSet.moneyUnit + dataUtil.Numbers().fomat(text || 0, { precision: this.state.projSet.precision, thousandsSeparator: true })}</div>
      },

    ]


    return (
      <LabelTableLayout title={this.props.title} menuCode = {this.props.menuCode}>
        <LabelToolbar>
          {/*分配*/}
          <PublicButton name={'分配'} title={'分配'} edit={this.props.editAuth && this.state.isEdit} icon={'icon-fenpei'}
            afterCallBack={() => {
              this.setState({ distributeState: true })
            }} />
          {/*删除*/}
          <PublicButton title={"删除"} title={"删除"} edit={this.props.editAuth && this.state.isEdit} useModel={true}
            verifyCallBack={this.deleteVerifyCallBack} afterCallBack={this.deletePlanTaskrsrc} icon={"icon-delete"} />
          <PublicButton title={"编辑"}
           edit={this.props.editAuth && this.state.isEdit}
            afterCallBack={this.edit} icon={"icon-xiugaibianji"} />
        </LabelToolbar>
        <LabelTable labelWidth={this.props.labelWidth} contentMinWidth={1000}>
          <PubTable onRef={this.onRef}
            getData={this.getPlanTaskrsrcList}
            columns={columns}
            rowSelection={true}
            onChangeCheckBox={this.getSelectedRowKeys}
            useCheckBox={true}
            getRowData={this.getInfo} />
        </LabelTable>

        {this.state.distributeState &&
          <Distribute
            rightData={this.props.rightData}
            handleCancel={this.handleCancel}
            distribute={this.callBackDistribute}
          />}

        {this.state.isEditkey && <EditModal
         extInfo={this.props.extInfo} 
         projSet={this.state.projSet} 
         record={this.state.record} 
         refresh={this.refresh} 
         handleCancel={() => this.setState({ isEditkey: false })}
         data={this.state.record} />}

      </LabelTableLayout>



    )
  }
}



const mapStateToProps = state => {
  return {
    currentLocale: state.localeProviderData,
  }
};
export default connect(mapStateToProps, null)(PlanComponentsResPlan);
