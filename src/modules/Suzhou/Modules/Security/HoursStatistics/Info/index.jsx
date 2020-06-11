import React, { Component } from 'react';
import { Table } from 'antd';
import style from './style.less';
import axios from '@/api/axios';
import { queryPeopleStatisticsList } from '@/modules/Suzhou/api/suzhou-api';

export default class extends Component {
  state = {
    data: null,
    workerId: null,
  };
  getList = (size, page, params) => {
    axios.get(queryPeopleStatisticsList(size, page), { params }).then(res => {
      this.setState({
        data: res.data.data,
      });
    });
  };
  componentDidMount() {
    this.setState(
      {
        workerId: this.props.rightData.workerId,
      },
      () => {
        this.getList(10, 1, { workerId: this.state.workerId, year: this.props.year });
      }
    );
  }

  render() {
    return (
      <div className={style.container}>
        <h3 className={style.h3}>基本信息</h3>
        <Table
          dataSource={this.state.data}
          columns={columns}
          onChange={({ current, pageSize }) => {
            this.getList(pageSize, current, { workerId: this.state.workerId });
          }}
        />
        ;
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
    title: '培训内容',
    dataIndex: 'trainName',
    key: 'trainName',
  },
  {
    title: '发起部门',
    dataIndex: 'sponsorDep',
    key: 'sponsorDep',
  },
  {
    title: '机电中心培训学时',
    dataIndex: 'jdzxLearnTime',
    key: 'jdzxLearnTime',
  },
  {
    title: '部门培训学时',
    dataIndex: 'bmLearnTime',
    key: 'bmLearnTime',
  },
];
