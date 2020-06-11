import React, { Component } from 'react';
import { Table, Icon, Input, Col, DatePicker, Button, Row } from 'antd';
import style from './style.less';
import MyTable from "../../../components/Table"
const InputGroup = Input.Group;
import { getMyTask } from "../../../api/api"
import PubTable from '../../../components/PublicTable'
import axios from "../../../api/axios"
import * as dataUtil from "../../../utils/dataUtil"
const Search = Input.Search;
const { RangePicker } = DatePicker;
//我的任务
export class TaskTem extends Component {
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
    const { name, planStartTime, planEndTime } = this.state
    let obj = {
      name,
      planStartTime,
      planEndTime
    }
    axios.post(getMyTask(pageSize, currentPageNum), obj).then(res => {
      callBack(res.data.data ? res.data.data : [])
      this.setState({
        data: res.data.data,
        total: res.data.total
      })
    })
  }

  //处理任务
  handleTask = (record) => {
    const { defineId, projectId, name,planDefineType } = record
    let menuCode = "PM-FEEDBACK";
    let fbType = "";
    if ("1" == planDefineType){ //前期计划
      menuCode = "ST-PRED-FEEDBACK";
      fbType = "predFeedBack";
    }else if ("2" == planDefineType){ //专项计划
      menuCode = "ST-SPECIAL-FEEDBACK";
      fbType = "specialFeedback";
    }
    else if ("3" == planDefineType){ //月度实施计划  ST-IMPLMENT-M-TASK
      menuCode = "ST-IMPLMENT-FEEDBACK";
      fbType = "implmentFeedback";
    }
    localStorage.setItem("fbbackRecord", JSON.stringify(record))
    dataUtil.CacheOpenProjectByType(fbType).addLastOpenPlan([defineId], projectId, name, () => {
      this.props.openMenuByMenuCode(menuCode, true);
    });
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
  render() {
    //搜索项目
    let findPropject = (e) => {
      this.setState({
        name: e.currentTarget.value
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
    const columns = [{
      title: '任务',
      dataIndex: 'taskName',
      key: 'taskName',
      width: '18%',
    },
    {
      title: '开始时间',
      dataIndex: 'planStartTime',
      key: 'planStartTime',
      width: '10%',
      align: 'center',
      sorter: (a, b) => a.planStartTime > b.planStartTime,
      defaultSortOrder: 'descend',
      render: text => text ? text.substr(0, 10) : null
    },
    {
      title: '完成时间',
      dataIndex: 'planEndTime',
      key: 'planEndTime',
      width: '10%',
      align: 'center',
      sortOrder: 'desc',
      sorter: (a, b) => a.node - b.node,
      render: text => text ? text.substr(0, 10) : null
    },
      {
        title: '计划名称',
        dataIndex: 'planName',
        key: 'planName',
        width: '18%',
      },
      {
        title: '项目名称',
        dataIndex: 'name',
        key: 'name',
        width: '18%',
      },
      {
        title: '进度完成',
        width: '6%',
        dataIndex: 'completePct',
        key: 'completePct',
        align: 'center',
        sortOrder: "completePct",
        sorter: (a, b) => a.completePct - b.completePct,
        sortDirections: ['descend', 'ascend'],
      },
      {
        title: '偏差',
        dataIndex: 'deviation',
        key: 'deviation',
        width: '7%',
        align: 'center',
        sorter: (a, b) => a.deviation - b.deviation,
        sortDirections: ['descend', 'ascend'],

      },
      {
        title: '反馈状态',
        dataIndex: 'feedbackStatus',
        key: 'feedbackStatus',
        width: '7%',
        align: 'center',
        render: text => text ? text.name : null,
        sortOrder: 'desc',
        sorter: (a, b) => a.node - b.node,

      },
      {
        title: '操作',
        dataIndex: 'operation',
        key: 'operation',
        width: '6%',
        align: 'center',
        render: (text, record) => <Button type="primary" size="small" onClick={this.handleTask.bind(this, record)}>处理</Button>
      }];
    return (
      <div className={style.main}>
        {/*我的任务*/}
        <div className={style.itemHeader}>
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

            <div>
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
          bordered={true}
          columns={columns}
          total={this.state.total}
          scroll={{ x: 1500, y:this.props.height-182 }}
          getRowData={this.getRowData} />
      </div>



    )
  }
}

export default TaskTem
