import React, { Component } from 'react'
import style from './style.less'
import { Modal, } from 'antd';
import { connect } from 'react-redux'
import axios from "../../../../../api/axios"
import * as dataUtil from "../../../../../utils/dataUtil"
import SubmitButton from "../../../../../components/public/TopTags/SubmitButton"
import {
  getAssignTaskTree, getAssignTaskList
} from "../../../../../api/api"
import TreeTable from "../../../../../components/PublicTable"
class CategoryCodeModal extends Component {
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

  //复选框限制
  checkboxStatus =(record) => {
    if (record.nodeType == "define" || record.nodeType=="project") {
      return true
    }
    if((record.nodeType=="task" || record.nodeType=="wbs" )&&record.isAssign==1){
        return true
    }
   
    return false
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
  getTask = (record) => {
    this.setState({
      rightdata: record
    })
  }
  //获取任务列表
  getTaskTree = (callBack) => {
    axios.get(getAssignTaskTree(this.props.defineId)).then(res => {
      callBack(res.data.data || [])
    })
  }
  /**
     @method 父组件即可调用子组件方法
     @description 父组件即可调用子组件方法
     */
  onRefR = (ref) => {
    this.tableR = ref
  }
  handleSubmit = (type) => {

    const { intl } = this.props.currentLocale
    const { selectedRowKeys } = this.state
    if (selectedRowKeys.length == 0) {
      dataUtil.message("请勾选数据进行操作！")
      return
    }
    let root = dataUtil.Table(this.props.data || []).getRootItemById(this.props.record.id);
    let classifyTypeId = root ? root.id : 0;

    axios.post(getAssignTaskList, { boCode: "task", bizIds: selectedRowKeys, classifyId: this.props.record.id, classifyTypeId },true,null,true).then(res => {
      this.props.update()
    })

  }
  render() {
    const { intl } = this.props.currentLocale
    const columns2 = [
      {
        title: intl.get('wsd.i18n.plan.feedback.name'),
        dataIndex: 'name',
        key: 'name',
        width: 140,
        render: (text, record) => dataUtil.getIconCell(record.nodeType, text, record.taskType)
      },
      {
        title: "代码",
        dataIndex: 'code',
        key: 'code',
        width: 100,
      
    },
    {
        title: "责任主体",
        dataIndex: 'org',
        key: 'org',
        width: 100,
        render: (text, record) =>text? text.name:null
    },
    {
        title: "责任人",
        dataIndex: 'user',
        key: 'user',
        width: 100,
        render: (text, record) =>text? text.name:null
    },
    {
        title: "计划开始时间",
        dataIndex: 'planStartTime',
        key: 'planStartTime',
        width: 100,
        render: (text) => dataUtil.Dates().formatDateString(text)
    },
    {
        title:"计划结束时间",
        dataIndex: 'planEndTime',
        key: 'planEndTime',
        width: 100,
        render: (text) => dataUtil.Dates().formatDateString(text)
    },
    ]
    return (
      <Modal className={style.main} width={850} centered={true} mask={false}
      maskClosable={false}
        title={"任务分配"} visible={true} onCancel={this.props.handleCancel} footer={
          <div className="modalbtn">
            <SubmitButton key="1" onClick={this.props.handleCancel} content="取消" />
            <SubmitButton key="2" type="primary" onClick={this.handleSubmit} content="保存" />
          </div>
        }>
        <div className={style.tableMain}>
          <TreeTable
            onRef={this.onRefR}
            getData={this.getTaskTree}
            columns={columns2}
            getRowData={this.getTask}
            expanderLevel={1}
            rowSelection={true}
            onChangeCheckBox={this.getSelectedRowKeys}
            checkboxStatus={this.checkboxStatus}
            useCheckBox={true}

          />
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


export default connect(mapStateToProps, null)(CategoryCodeModal);