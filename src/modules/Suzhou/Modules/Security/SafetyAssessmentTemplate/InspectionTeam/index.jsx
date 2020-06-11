import style from './style.less';
import React from 'react';
import SelectUser from '../SelectUser';
import LabelToolbar from '@/components/public/Layout/Labels/Table/LabelToolbar';
import PublicButton from '@/components/public/TopTags/PublicButton';
import { Table } from 'antd';
import {
  querySecurityExaminationModuleStaffList,
  addSecurityExaminationModuleStaff,
  delSecurityExaminationModuleStaff,
} from '@/modules/Suzhou/api/suzhou-api';
import axios from '@/api/axios';

export default class extends React.Component {
  state = {
    distributeType: false,
    dataSource: [],
    selectedRowKeys: [],
    total: 0,
  };
  handleRequset = (id, size, page) => {
    axios.get(querySecurityExaminationModuleStaffList(id, size, page)).then(res => {
      this.setState({
        dataSource: res.data.data,
      });
    });
  };
  handleDelete = () => {
    axios
      .deleted(delSecurityExaminationModuleStaff, { data: this.state.selectedRowKeys })
      .then(() => {
        this.setState(
          {
            selectedRowKeys: [],
          },
          () => {
            this.handleRequset(this.props.rightData.id, 10, 1);
          }
        );
      });
  };
  handleOk = data => {
    data = data.map(item => ({
      staffId: item.id,
      staffName: item.name,
      moduleId: this.props.rightData.id,
    }));
    axios.post(addSecurityExaminationModuleStaff, data).then(res => {
      this.handleRequset(this.props.rightData.id, 10, 1);
    });
  };
  componentDidMount() {
    this.handleRequset(this.props.rightData.id, 10, 1);
  }

  render() {
    return (
      <div className={style.container}>
        <h3 className={style.h3}>考核人员</h3>
        <LabelToolbar>
          {/*分配*/}
          {this.props.permission.indexOf('TEMPLATE_EDIT-ASSESSPERSON')!==-1 && (
          <PublicButton
            name={'新增'}
            title={'新增'}
            icon={'icon-fenpeirenyuan'}
            afterCallBack={() => this.setState({ distributeType: true })}
          />)}
          {/*删除*/}
          {this.props.permission.indexOf('TEMPLATE_EDIT-ASSESSPERSON')!==-1 && (
          <PublicButton
            title={'删除'}
            useModel={true}
            show={this.state.selectedRowKeys.length > 0}
            afterCallBack={this.handleDelete}
            icon={'icon-delete'}
          />)}
        </LabelToolbar>
        <Table
          size="small"
          rowKey={record => record.id}
          rowSelection={{ onChange: selectedRowKeys => this.setState({ selectedRowKeys }) }}
          // pagination={{
          //   showSizeChanger: true,
          //   showQuickJumper: true,
          //   LocaleProvider: true,
          //   total: this.state.total,
          //   showTotal: () => `总共${this.state.total}条`,
          // }}
          pagination={false}
          dataSource={this.state.dataSource}
          columns={columns}
          onChange={({ current, pageSize }) => {
            this.handleRequset(this.props.rightData.id, current, pageSize);
          }}
          scroll={{ y: this.props.height - 45 }}
        />
        {this.state.distributeType && (
          <SelectUser
            visible={this.state.distributeType}
            handleCancel={() => this.setState({ distributeType: false })}
            handleOk={this.handleOk}
          />
        )}
      </div>
    );
  }
}
const columns = [
  {
    title: '姓名',
    dataIndex: 'staffName',
  },
  {
    title: '部门',
    dataIndex: 'orgName',
  },
  {
    title: '职务',
    dataIndex: 'staffZw',
  },
];
