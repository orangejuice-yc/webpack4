import React, { Component } from 'react';
import { Table, Select, Input, Col, DatePicker, Button, Row } from 'antd';
import style from './style.less';
const InputGroup = Input.Group;
const Search = Input.Search;
const Option = Select.Option
import axios from "../../../api/axios"
import { getMywarningOverdueList, getMywarningBeginList, getMywarningCompleteList } from "../../../api/api"
const { RangePicker } = DatePicker;
import PubTable from '../../../components/PublicTable'

import MyTable from "../../../components/Table"
import * as dataUtil from "../../../utils/dataUtil"
//我的预警
class MyWarnTem extends Component {
  constructor(props) {
    super(props);
    this.state = {
      currentPage: 1,
      pageSize: 10,
      data: [],
      selectParam: 1,
      warningDays: 3
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
  //改变
  selectHandle = (value) => {
    this.setState({ selectParam: value }, () => this.table.getData())
  }

  //处理预警
  handleTask = (record) => {
    /*const { defineId, projectId, name } = record
    localStorage.setItem("fbbackRecord", JSON.stringify(record))
    dataUtil.CacheOpenProject().addLastOpenPlan([defineId], projectId, name, () => {
      this.props.openMenuByMenuCode("PM-FEEDBACK", true);
    });*/
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

  //获取数据
  getList = (currentPageNum, pageSize, callBack) => {
    const { selectParam, planStartTime, planEndTime, name, warningDays } = this.state
    let obj = {
      name,
      planStartTime,
      planEndTime,
      warningDays
    }
    if (selectParam == 1) {
      axios.post(getMywarningOverdueList(pageSize, currentPageNum), obj).then(res => {
        callBack(res.data.data ? res.data.data : [])

        this.setState({
          data: res.data.data,
          total: res.data.total
        })
      })
    }
    if (selectParam == 2) {
      axios.post(getMywarningBeginList(pageSize, currentPageNum), obj).then(res => {
        callBack(res.data.data ? res.data.data : [])

        this.setState({
          data: res.data.data,
          total: res.data.total
        })
      })
    }
    if (selectParam == 3) {
      axios.post(getMywarningCompleteList(pageSize, currentPageNum), obj).then(res => {
        callBack(res.data.data ? res.data.data : [])

        this.setState({
          data: res.data.data,
          total: res.data.total
        })
      })
    }
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
    //改变周期
    let changeWeek = (warningDays) => {
      this.setState({
        warningDays
      }, () => {
        this.table.getData()
      })
    }
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
    const columns4 = [
      {
        title: '任务',
        dataIndex: 'taskName',
        key: 'taskName',
        width: '30%',
      }, {
        title: '计划开始时间',
        dataIndex: 'planStartTime',
        key: 'planStartTime',
        width: '12%',
        align: 'center',
        render: text => text ? text.substr(0, 10) : null
      },
      {
        title: '计划完成时间',
        dataIndex: 'planEndTime',
        key: 'planEndTime',
        width: '12%',
        align: 'center',
        render: text => text ? text.substr(0, 10) : null
      },
      {
        title: '所属计划',
        dataIndex: 'planName',
        key: 'planName',
        width: '18%',
      },
      {
        title: '所属项目',
        dataIndex: 'name',
        key: 'name',
        width: '18%',
      },

      {
        title: '操作',
        dataIndex: 'operation',
        key: 'operation',
        width: '10%',
        align: 'left',
        render: (text, record) => <Button type="primary" size="small" onClick={this.handleTask.bind(this, record)}>处理</Button>
      }
    ];
    const rowSelection = {
      onChange: (selectedRowKeys, selectedRows) => {
      },
      getCheckboxProps: record => ({
        disabled: record.name === 'Disabled User', // Column configuration not to be checked
        name: record.name,
      }),
    };

    const { selectParam } = this.state
    return (
      <div className={style.main}>
        {/*我的消息*/}
        <div className={style.itemHeader}>

          <div style={{ marginRight: 30 }}>
            <div className={style.selectParamstyle}>
              <span onClick={this.selectHandle.bind(this, 1)} className={selectParam == 1 ? "my-link" : "topBtnActivity"}>超期未完成</span>&nbsp;&nbsp;&nbsp;
            <span onClick={this.selectHandle.bind(this, 2)} className={selectParam == 2 ? "my-link" : "topBtnActivity"}>即将完成</span>&nbsp;&nbsp;&nbsp;
            <span onClick={this.selectHandle.bind(this, 3)} className={selectParam == 3 ? "my-link" : "topBtnActivity"}>即将开始</span>&nbsp;&nbsp;&nbsp;
          </div>
          </div>
          <div style={{ marginRight: 30 }}>
            <label htmlFor="keyword">项目</label>&nbsp;&nbsp;&nbsp;
                                    <Input
              placeholder="按项目名称关键字查询"
              style={{ width: 180 }}
              size="small"
              onBlur={findPropject}
            />
          </div>

          <div style={{ marginRight: 30 }}>
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
          <div>
            <label htmlFor="timeSearch">预警时间&nbsp;&nbsp;</label>
            <Select value={this.state.warningDays} style={{ width: 100 }} size="small" onChange={changeWeek}>
              <Option value={3}>三天</Option>
              <Option value={7}>一周</Option>
              <Option value={30}>一个月</Option>
            </Select>
          </div>
        </div>
        <PubTable onRef={this.onRef}
          pagination={true}
          getData={this.getList}
          bordered={true}
          columns={columns4}
          rowSelection={true}
        
          total={this.state.total}
       
          scroll={{ x:"100%", y: this.props.height - 182 }}
          getRowData={this.getRowData} />

      </div>



    )
  }
}

export default MyWarnTem
