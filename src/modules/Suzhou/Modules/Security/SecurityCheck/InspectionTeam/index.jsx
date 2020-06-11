import style from './style.less';
import React from 'react';
import SelectUser from '../SelectUser';
import LabelToolbar from '@/components/public/Layout/Labels/Table/LabelToolbar';
import PublicButton from '@/components/public/TopTags/PublicButton';
import { Table } from 'antd';
import { addCheckTeam, queryTeamList, deleteTeam } from '@/modules/Suzhou/api/suzhou-api';
import axios from '@/api/axios';

export default class extends React.Component {
  state = {
    distributeType: false,
    dataSource: [],
    selectedRowKeys: [],
    total: 0,
    teamEditPermission:'',  //小组编辑权限
  };
  handleRequset = (id, size, page) => {
    axios.get(queryTeamList(id, size, page)).then(res => {
      this.setState({
        dataSource: res.data.data,
        total: res.data.total,
      });
    });
  };
  handleDelete = () => {
    axios.deleted(deleteTeam, { data: this.state.selectedRowKeys }).then(() => {
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
      userId: item.id,
      userName: item.name,
      isLeader:item.isLeader,
      checkId: this.props.rightData.id,
    }));
    axios.post(addCheckTeam, data).then(res => {
      this.handleRequset(this.props.rightData.id, 10, 1);
    });
  };
  componentDidMount() {
    this.handleRequset(this.props.rightData.id, 10, 1);
    if(this.props.bizType=='SECURITY-SECURITYCHECK'){
      this.setState({
        teamEditPermission:'SECURITYCHECK_EDIT-TROIKA-ORGCHECK',
      })
    }else if(this.props.bizType=='SECURITY-SECURITYCHECKONLY'){
      this.setState({
        teamEditPermission:'SECURITYCHECKONLY_EDIT-TROIKA-PERCHECK',
      })
    }
  }

  render() {
    const {teamEditPermission} = this.state;
    return (
      <div className={style.container}>
        <h3 className={style.h3}>{this.props.title}</h3>
        <LabelToolbar>
          {/*分配*/} 
          {this.props.permission.indexOf(teamEditPermission)!==-1  && (
          <PublicButton
            name={'分配'}
            title={'分配'}
            icon={'icon-fenpeirenyuan'}
            show={(this.props.checkStatus == '1')?(this.props.rightData.statusVo.code == 'INIT'?true:false):true}
            afterCallBack={() => this.setState({ distributeType: true })}
          />)}
          {/*删除*/}
          {this.props.permission.indexOf(teamEditPermission)!==-1  &&(
          <PublicButton
            title={'删除'}
            useModel={true}
            show={
              (this.props.checkStatus == '1')?(this.props.rightData.statusVo.code == 'INIT'?true:false):true
            }
            afterCallBack={this.handleDelete}
            icon={'icon-delete'}
          />)}
        </LabelToolbar>
        <Table
          size="small"
          rowKey={record => record.id}
          rowSelection={{ onChange: selectedRowKeys => this.setState({ selectedRowKeys }) }}
          pagination={{
            showSizeChanger: true,
            showQuickJumper: true,
            LocaleProvider: true,
            total: this.state.total,
            showTotal: () => `总共${this.state.total}条`,
          }}
          dataSource={this.state.dataSource}
          columns={columns}
          onChange={({ current, pageSize }) => {
            this.handleRequset(this.props.rightData.id, pageSize,current );
          }}
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
    dataIndex: 'userName',
  },
  {
    title: '部门',
    dataIndex: 'departName',
  },
  {
    title: '职务',
    dataIndex: 'position',
  },
  {
    title: '是否为小组组长',
    dataIndex: 'isLeaderVo.name',
  }
];
