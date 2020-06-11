import React, { Component } from 'react';
import { Table, Icon, Input, Col, DatePicker, Button, Row, Select } from 'antd';
import style from './style.less';
const InputGroup = Input.Group;
import axios from "../../../api/axios"
import { getMyactionList } from "../../../api/api"
const Search = Input.Search;
const Option = Select.Option
const { RangePicker } = DatePicker;
import PubTable from '../../../components/PublicTable'

import MyTable from "../../../components/Table"
import * as dataUtil from "../../../utils/dataUtil"
//我的行动项
export class MessageTem extends Component {
  constructor(props) {
    super(props);
    this.state = {
      currentPage: 1,
      pageSize: 10,
      data: []
    }
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

  getList = (currentPageNum, pageSize, callBack) => {
    const { project, planStartTime, planEndTime } = this.state
    let obj = {
      project,
      planStartTime,
      planEndTime
    }
    axios.post(getMyactionList(pageSize, currentPageNum), obj).then(res => {
      callBack(res.data.data ? res.data.data : [])

      this.setState({
        data: res.data.data,
        total: res.data.total
      })
    })
  }
  /**
         * 获取选中集合、复选框
         * @method getListData
         * @description 获取用户列表、或者根据搜索值获取用户列表
         * @param {string} record  行数据
         * @return {array} 返回选中用户列表
         */
  getRowData = (record) => {
    this.setState({
      record
    })
  };
  //处理行动项
  handleTask = (record) => {
    const { defineId, projectId, name } = record
    localStorage.setItem("fbbackRecord", JSON.stringify(record))
    dataUtil.CacheOpenProject().addLastOpenPlan([defineId], projectId, name, () => {
      this.props.openMenuByMenuCode("PM-FEEDBACK", true);
    });
  }
 
  render() {
    //搜索项目
    let findPropject = (e) => {
      this.setState({
        project: e.currentTarget.value
      }, () => {
        this.table.getData()
      })
    }
    let onChangeTime = (times) => {

      if (times.length == 0) {
        this.setState({
          planStartTime: null,
          planEndTime: null
        }, () => {
          this.table.getData()
        })
      } else {
        this.setState({
          planStartTime: times[0].format("YYYY-MM-DD"),
          planEndTime: times[1].format("YYYY-MM-DD")
        }, () => {
          this.table.getData()
        })
      }
    }
    const columns3 = [
      {
        title: '所属项目',
        dataIndex: 'projectName',
        key: 'projectName',
        width:'15%',
      }, {
        title: '标题',
        dataIndex: 'meetingTitle',
        key: 'meetingTitle',
        width:'15%',
      },
      {
        title: '所属计划',
        dataIndex: 'planName',
        key: 'planName',
        width:'15%',
      },
      {
        title: '所属wbs',
        dataIndex: 'taskName',
        key: 'taskName',
        width:'15%',
      },
      {
        title: '行动项名称',
        dataIndex: 'actionName',
        key: 'actionName',
        width:'15%',
      },
      {
        title: '计划开始时间',
        dataIndex: 'planStartTime',
        key: 'planStartTime',
        width:'9%',
        sortOrder: 'planStartTime',
        sorter: (a, b) => a.msgsendtime - b.msgsendtime,
        render: text => text ? text.substr(0, 10) : null
      },
      {
        title: '计划完成时间',
        dataIndex: 'planEndTime',
        key: 'planEndTime',
        width:'9%',
        sortOrder: 'planEndTime',
        sorter: (a, b) => a.ifanswer - b.ifanswer,
        render: text => text ? text.substr(0, 10) : null
      },
      {
        title: '操作',
        dataIndex: 'msgoperation',
        key: 'msgoperation',
        width:'7%',
        render: (text, record) => <Button type="primary" size="small" onClick={this.handleTask.bind(this, record)}>处理</Button>
      }
    ];

    return (
      <div className={style.main}>
        {/*我的消息*/}
        <div >
          <div className={style.search}>
         
            <div style={{marginRight:30}}>
              <label htmlFor="keyword">项目</label>&nbsp;&nbsp;&nbsp;
                                    <Input
                placeholder="按项目名称关键字查询"
                style={{ width: 180 }}
                size="small"
                onBlur={findPropject}
              />
            </div>

            <div >
              <label htmlFor="timeSearch">时间段</label>&nbsp;&nbsp;&nbsp;
                                    <RangePicker
                showTime
                format="YYYY-MM-DD "
                placeholder={['开始时间', '结束时间']}
                size="small"
                onChange={onChangeTime}
                style={{ width: 200 }}
              />
            </div>
          </div>
        </div>
      
        <PubTable onRef={this.onRef}
          pagination={true}
          getData={this.getList}
          rowSelection={true}
          bordered={true}
          columns={columns3}
        
          total={this.state.total}
         
          scroll={{ x: 1200, y: this.props.height-182  }}
          getRowData={this.getRowData} />
      </div>



    )
  }
}

export default MessageTem
