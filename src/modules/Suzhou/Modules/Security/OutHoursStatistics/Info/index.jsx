import React, { Component } from 'react';
import { Table } from 'antd';
import style from './style.less';
import axios from '@/api/axios';
import { queryPeopleOutTrainTimeStatisticsList } from '@/modules/Suzhou/api/suzhou-api';

export default class extends Component {
  state = {
    data: null,
    workerId: null,
    year:null,
    total:'',
    size:10,
    page:1
  };
  getList = () => {
    axios.get(queryPeopleOutTrainTimeStatisticsList(this.state.size, this.state.page), {params:{workerId:this.state.workerId,year:this.state.year} }).then(res => {
      this.setState({
        data: res.data.data,
        total:res.data.total
      });
    });
  };
  componentDidMount() {
    this.setState(
      {
        workerId: this.props.rightData.workerId,
        year: this.props.year
      },
      () => {
        this.getList();
      }
    );
  }

  render() {
    let pagination = {
      total: this.state.total,
      // hideOnSinglePage: true,
      current: this.state.currentPageNum,
      pageSize: this.state.pageSize,
      showSizeChanger: true,
      size:"small",
      showQuickJumper: true,
      showTotal: total => `总共${this.state.total}条`,
      onShowSizeChange: (current, size) => {
        this.setState({
          pageSize: size,
          currentPageNum: 1
        }, () => {
          this.getList()
        })
      },
      onChange: (page, pageSize) => {
        this.setState({
          currentPageNum: page
        }, () => {
          this.getList()
        })
      }
    }
    return (
      <div className={style.main}>
        <h3 className={style.listTitle}>基本信息</h3>
        <div className={style.mainScorll}>
          <Table className={style.table} 
            dataSource={this.state.data}
            size="small"
            columns={columns}
            pagination={pagination}
            // onChange={() => {
            //   this.getList();
            // }}
          />
       </div>
      </div>
    );
  }
}
const columns = [
  {
    title: '培训时间',
    dataIndex: 'trainTime',
    key: 'trainTime',
  },
  {
    title: '培训类型',
    dataIndex: 'trainTypeVo.name',
    key: 'trainTypeVo.name',
  },
  {
    title: '培训名称',
    dataIndex: 'trainName',
    key: 'trainName',
  },
  {
    title: '培训地点',
    dataIndex: 'trainLocation',
    key: 'trainLocation',
  },
  {
    title: '培训学时',
    dataIndex: 'learnTime',
    key: 'learnTime',
  },
];
