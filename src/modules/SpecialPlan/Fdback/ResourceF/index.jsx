/*
 * @Author: wihoo.wanghao
 * @Date: 2019-01-16 16:38:09
 * @Last Modified by: wihoo.wanghao
 * @Last Modified time: 2019-01-27 17:28:30
 */
import React, {Component} from 'react'
import LabelToolbar from '../../../../components/public/Layout/Labels/Table/LabelToolbar'
			import LabelTableLayout from '../../../../components/public/Layout/Labels/Table/LabelTableLayout'
			import LabelTable from '../../../../components/public/Layout/Labels/Table/LabelTable'
      import LabelTableItem from '../../../../components/public/Layout/Labels/Table/LabelTableItem'
      import PubTable from '../../../../components/PublicTable'
      import PublicButton from '../../../../components/public/TopTags/PublicButton';
import {Table, Progress, Form, Input, InputNumber, Popconfirm, DatePicker} from 'antd'
import style from './style.less'
import {caculateWorkHour, getTaskrsrcList, getvariable, updateRsrcConsumption} from "../../../../api/api"
import axios from '../../../../api/axios';
import {connect} from 'react-redux'
import moment from 'moment'

const data = [];
import * as dataUtil from '../../../../utils/dataUtil';
import EditModal from './EditModal';
class PlanPreparedPlanAcco extends Component {
  constructor(props) {
    super(props)
    this.state = {
      name: 'PlanPreparedPlanAcco',
      initDone: false,
      runnDone: true, //是否计算完成
      projSet: {dateFormat: 'YYYY-MM-DD', drtnUnit: 'h', timeUnit: 'h', precision: 2, moneyUnit: '¥', complete: '%'},
      columns: [],
      data,
      record: null,
      selectData: [],
      editingKey: ''
    }
  }

  componentDidMount() {
    axios.get(getvariable(this.props.data.projectId || 0)).then(res => {
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
      }, () => {
      
      })
    })
  }
  //获取列表
  getList=(callBack)=>{
    axios.get(getTaskrsrcList(this.props.data.id, this.props.data.feedbackId || 0)).then(res => {
        callBack(res.data.data)
    })
  }
  

 

  edit=()=>{
    const { record}=this.state
    if(!record){
      dataUtil.message("请选择数据进行操作！")
      return
    }
    this.setState({isEdit: true});
  }

  getInfo = (record) => {
   
    this.setState({
      record
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
//刷新
refresh=()=>{
  this.table.getData()
}
  render() {
    const {intl} = this.props.currentLocale
    const columns = [
      {
        title: intl.get("wsd.i18n.plan.feedback.rsrc.name"),//'资源名称',
        dataIndex: 'rsrcuserName',
        key: 'rsrcuserName',
        width: 120,
       
      },
      {
        title: intl.get("wsd.i18n.plan.feedback.rsrc.code"),// '资源代码',
        dataIndex: 'rsrcuserCode',
        key: 'rsrcuserCode',
        width: 120,
       
      },
      {
        title: intl.get("wsd.i18n.plan.feedback.rsrc.role"),//'资源角色',
        dataIndex: 'resourceRole',
        key: 'resourceRole',
        width: 100,
      },
      {
        title: intl.get("wsd.i18n.plan.feedback.rsrc.unit"),// '计量单位',
        dataIndex: 'unit',
        key: 'unit',
        width: 100,
        render: data => data && data.name
      },
      {
        title: "单位最大用量",//'单位最大用量(h)',
        dataIndex: 'maxUnit',
        key: 'maxUnit',
        width: 100,
        render: (text, record) => <div>{dataUtil.Numbers().fomat(text || 0, {precision: this.state.projSet.precision}) + 'h/d'}</div>
      },
      {
        title: "预算用量",
        dataIndex: 'budgetQty',
        key: 'budgetQty',
        width: 100,
        render: (text, record) =>
          <div>{dataUtil.Numbers().fomat(dataUtil.WorkTimes().hourTo(text, this.state.projSet.timeUnit, record.calendar), {precision: this.state.projSet.precision}) + this.state.projSet.timeUnit}</div>
      },
      {
        title: "预算单价",
        dataIndex: 'budgetUnit',
        key: 'budgetUnit',
        width: 100,
        render: (text, record) => <div>{this.state.projSet.moneyUnit + dataUtil.Numbers().fomat(text || 0, {
          precision: this.state.projSet.precision,
          thousandsSeparator: true
        })}/h</div>
      },
      {
        title: "预算成本",
        dataIndex: 'budgetCost',
        key: 'budgetCost',
        width: 100,
        render: (text, record) => <div>{this.state.projSet.moneyUnit + dataUtil.Numbers().fomat(text || 0, {
          precision: this.state.projSet.precision,
          thousandsSeparator: true
        })}</div>
      },
      {
        title: "计划开始时间",
        dataIndex: 'planStartTime',
        key: 'planStartTime',
        width: 120,
        render: (text, record) => dataUtil.Dates().formatTimeString(text, this.state.projSet.dateFormat)
      },
      {
        title: "计划完成时间",
        dataIndex: 'planEndTime',
        key: 'planEndTime',
        width: 120,
        render: (text, record) => dataUtil.Dates().formatTimeString(text, this.state.projSet.dateFormat)
      },
      {
        title: intl.get("wsd.i18n.plan.feedback.rsrc.actStartTime"),//'实际开始时间',
        dataIndex: 'actStartTime',
        key: 'actStartTime',
        width: 120,
        render: (text, record) => <div className="editable-row-text">{dataUtil.Dates().formatTimeString(text, this.state.projSet.dateFormat)}</div>
      },
      {
        title: intl.get("wsd.i18n.plan.feedback.rsrc.actEndTime"),// '实际结束时间',
        dataIndex: 'actEndTime',
        key: 'actEndTime',
        width: 120,
        render: (text, record) => <div className="editable-row-text">{dataUtil.Dates().formatTimeString(text, this.state.projSet.dateFormat)}</div>
      },
      {
        title: "实际用量",//'实际用量(h)',
        dataIndex: 'actQty',
        key: 'actQty',
        width: 100,
        render: (text, record) => <div className="editable-row-text">{
          dataUtil.Numbers().fomat(dataUtil.WorkTimes().hourTo(text, this.state.projSet.timeUnit, record.calendar), {precision: this.state.projSet.precision}) + this.state.projSet.timeUnit
        }</div>
      },
      {
        title: intl.get("wsd.i18n.plan.feedback.rsrc.actprice"),//'实际单价(￥)',
        dataIndex: 'actUnit',
        key: 'actUnit',
        width: 100,
        render: (text, record) => <div className="editable-row-text">{this.state.projSet.moneyUnit + dataUtil.Numbers().fomat(text || 0, {
          precision: this.state.projSet.precision,
          thousandsSeparator: true
        })}/h</div>
      },
      {
        title: intl.get("wsd.i18n.plan.feedback.rsrc.actmomeny"),//'实际成本(￥)',
        dataIndex: 'actCost',
        key: 'actCost',
        width: 100,
        align: 'right',
        render: (text, record) => <div className="editable-row-text">{this.state.projSet.moneyUnit + dataUtil.Numbers().fomat(text || 0, {
          precision: this.state.projSet.precision,
          thousandsSeparator: true
        })}</div>
      },
    ]
    let editAuth = (this.props.data && this.props.data.feedbackId && (!this.props.data.progressStatus || this.props.data.progressStatus.id == 'EDIT')) || false;
    let feedbackId = this.props.data ? this.props.data.feedbackId : 0;
    return (
      <LabelTableLayout title = {this.props.title}  menuCode = {this.props.menuCode}>
      <LabelToolbar>
        <PublicButton title={"编辑"} edit={editAuth } afterCallBack={this.edit} icon={"icon-xiugaibianji"} />
      </LabelToolbar>
      <LabelTable labelWidth = {this.props.labelWidth } contentMinWidth = {1000}>
      <PubTable onRef={this.onRef}
                        getData={this.getList}
                        pagination={false}
                        columns={columns}
                    
                        scroll={{ x: 1200, y: this.props.height - 100 }}
                        getRowData={this.getInfo} />
      </LabelTable>
      
      
      {this.state.isEdit && <EditModal  
      projSet={this.state.projSet} 
      record={this.state.record} 
      refresh={this.refresh}
      feedbackId = {feedbackId }
      handleCancel={()=>this.setState({isEdit:false})}
      data={this.props.data}
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
export default connect(mapStateToProps, null)(PlanPreparedPlanAcco);
