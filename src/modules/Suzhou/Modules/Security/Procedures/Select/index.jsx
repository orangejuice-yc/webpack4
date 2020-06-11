import React, { Component } from 'react';
import { Popover, Icon, Table } from 'antd';

import axios from '@/api/axios';
import { queryQuaSystem } from '@/api/suzhou-api';

export default class extends Component {
  state = {
    visible: false,
    tabelData: [],
    loading: false,
  };
  render() {
    const { visible, tabelData, loading } = this.state;
    return (
      <Popover
        placement="bottomLeft"
        content={
          visible ? (
            <Table
              loading={loading}
              indentSize={10}
              columns={columns}
              bordered={true}
              dataSource={tabelData}
              pagination={false}
              scroll={{ x: 500, y: 300 }}
              onRow={record => {
                return {
                  onClick: () => {
                    ;
                  }, // 点击行
                };
              }}
            />
          ) : null
        }
        trigger="click"
        visible={visible}
        onVisibleChange={this.handleVisibleChange}
      >
        <div style={{ marginLeft: '5px', color: '#1890ff', cursor: 'pointer' }}>
          <Icon type="table" />
          <span>选择工程</span>
          <Icon type="caret-down" />
        </div>
      </Popover>
    );
  }
  handleVisibleChange = visible => {
    this.setState(
      () => ({ visible }),
      () => {
        if (this.state.visible) {
          this.setState(() => ({ loading: true }));
          axios.get(queryQuaSystem()).then(res => {
            const { data } = res.data;
            this.setState(() => ({ tabelData: func(data), loading: false }));
          });
        }
      }
    );
  };
}
const columns = [
  {
    title: '选择工程',
    dataIndex: 'name',
    key: 'name',
  },
];

// 将树型结构 递归添加路径 key
const func = (arr = [], index = 0) => {
  for (let i = 0; i < arr.length; i++) {
    if (index) {
      arr[i].key = index + (i + 1);
    } else {
      arr[i].key = i + 1 + '';
    }
    arr[i].name = arr[i].typeNoVo.name;
    if (arr[i].children) {
      func(arr[i].children, arr[i].key + '-');
    }
  }
  return arr;
};
