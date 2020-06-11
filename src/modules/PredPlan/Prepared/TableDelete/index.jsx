import React, { Component } from 'react'
import style from './style.less'
import { Modal, Table, Button, notification } from 'antd';
import intl from 'react-intl-universal'
import Search from '../../../../components/public/Search'
import '../../../../asserts/antd-custom.less'
import MyIcon from '../../../../components/public/TopTags/MyIcon'
import axios from "../../../../api/axios"
import * as dataUtil from "../../../../utils/dataUtil"
import TreeTable from '../../../../components/PublicTable'

//批量删除组件
export class TableDeleteRow extends Component {
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
  /**
  * 父组件即可调用子组件方法
  * @method
  */
  onRef = (ref) => {
    this.table = ref
  }


  //数据初始化
  getList = (callBack) => {
    //此处预留接口调用，初始化table数据。数据放入callBack中即可
    callBack([])
  }

  //选中行操作事件
  getRowData = () => {
  }
  search = (value) => {
    // const { initData } = this.state;
    // let newData = dataUtil.search(initData, [{ "key": "name|code", "value": value }], true);
    // this.setState({ data: newData });
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

  //删除表格数据操作
  handleSubmit=()=>{
  }
  render() {
    const columns = [
      {
        title: intl.get('wsd.i18n.plan.feedback.name'), //这块是列名称，采用国际化。
        dataIndex: 'name',
        key: 'name',
        render: (text, record) => {
          let icon = dataUtil.getIcon(record.nodeType, record.taskType);
          return <span><MyIcon type={icon} style={{ fontSize: '18px', marginRight: '8px' }} /> {text}</span>
        }
      },
      {
        title: intl.get('wsd.i18n.plan.feedback.code'),
        dataIndex: 'code',
        key: 'code',
      },
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
      <Modal className={style.main} width="850px" centered={true}
        title={this.props.releaseTitle} visible={true} onCancel={this.props.handleCancel} bodyStyle={{ padding: 0 }} footer={
          <div className="modalbtn">
            <Button key="1" onClick={this.props.handleCancel}>取消</Button>
            <Button key="2" type="primary" onClick={this.handleSubmit}>删除</Button>
          </div>
        }>
        <div className={style.tableMain}>
          <div className={style.search}>
            <Search search={this.search.bind(this)} />
          </div>

          <TreeTable onRef={this.onRef}
            useCheckBox={true}
            getData={this.getList}
            rowSelection={true}
            columns={columns}
            onChangeCheckBox={this.getSelectedRowKeys}
            scroll={{ x: 1200, y: this.props.height - 162 }}
            getRowData={this.getRowData} />

        </div>
      </Modal>
    )
  }
}


export default TableDeleteRow
