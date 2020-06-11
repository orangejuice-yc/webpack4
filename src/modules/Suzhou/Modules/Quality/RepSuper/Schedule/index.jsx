import { Component } from 'react';
import { Table } from 'antd';

import PublicButton from '@/components/public/TopTags/PublicButton';
import ScheduleAddModal from '../ScheduleAddModal';

import axios from '@/api/axios';
import { queryQuaSupervDescList, deleteQuaSupervDesc } from '@/api/suzhou-api';
import notificationTip from '@/utils/notificationTip';
import style from './style.less';

class Schedule extends Component {
  state = {
    tableData: [],
    rowClassName: null,
    total: 0,
    selectedRowKeys: [],
    selectedRows: null,
    tabelColumns: columns,
    modalData: {
      supervisorId: this.props.data.id,
      title: '',
      modalType: null,
      formValue: {},
      isModal: false,
    },
  };
  handleAsyncRequest = (pageSize = 10, currentPageNum = 1) => {
    axios.get(queryQuaSupervDescList(this.props.data.id, pageSize, currentPageNum)).then(res => {
      const { data = [], total = 0, status } = res.data;
      if (status === 200) {
        this.setState({
          tableData: data,
          total: total,
        });
      }
    });
  };
  // 添加会掉
  callBackAdd = data => {
    this.setState({
      tableData: [...this.state.tableData, data],
      total: this.state.total + 1,
      modalData: { ...this.state.modalData, isModal: false },
    });
    if (data.descStatusVo.code === '1') {
      // 等于标段的id
      this.props.handleUpdateSchedule({ ...data, id: this.props.data.id });
      // this.props.closeRightBox();
    }
  };
  // 修改会掉
  callbackUpdate = data => {
    this.setState({
      tableData: this.state.tableData.map(item =>
        item.id === data.id ? { ...item, ...data } : item
      ),
      modalData: { ...this.state.modalData, isModal: false },
    });
  };
  // 增加
  handleAdd = () => {
    this.setState({
      modalData: { ...this.state.modalData, title: '新增', modalType: 'ADD', isModal: true },
    });
  };
  // 删除
  handleDelete = () => {
    if (this.state.selectedRowKeys.length > 0) {
      axios
        .deleted(
          deleteQuaSupervDesc(),
          {
            data: this.state.selectedRowKeys,
          },
          true
        )
        .then(res => {
          const { status } = res.data;
          if (status === 200) {
            this.setState({
              tableData: this.state.tableData.filter(
                item => !this.state.selectedRowKeys.includes(item.id)
              ),
              selectedRowKeys: [],
              total: this.state.total - this.state.selectedRowKeys.length,
            });
          }
        });
    } else {
      notificationTip('未选中');
    }
  };
  onCancel = () => {
    this.setState({
      modalData: {
        ...this.state.modalData,
        isModal: false,
      },
    });
  };
  // 修改
  handleUpdate = () => {
    if (this.state.selectedRows && this.state.selectedRows.id) {
      const { descStatusVo, supervisorDesc, id } = this.state.selectedRows;
      this.setState({
        modalData: {
          ...this.state.modalData,
          title: '修改',
          modalType: 'UPDATE',
          formValue: {
            supervisorDesc,
            descStatus: Number(descStatusVo.code),
            id,
          },
          isModal: true,
        },
      });
    } else {
      notificationTip('未选中');
    }
  };
  hasRecord = () => {
    if (!this.state.selectedRowKeys.length > 0) {
      notificationTip('未选中数据');
      return false;
    } else {
      return true;
    }
  };
  // 设置选中表格颜色
  handleSetRowClassName = record =>
    Object.is(record.id, this.state.rowClassName) ? 'tableActivty' : '';
  // 点击行触发方法
  handleOnRow = record => {
    return {
      onClick: () => {
        this.setState({
          rowClassName: record.id,
          selectedRows: record,
        });
      },
    };
  };
  render() {
    // 监听选中
    const handleRowSelection = {
      onChange: selectedRowKeys => {
        this.setState({
          selectedRowKeys: selectedRowKeys,
        });
      },
    };

    const paginationProps = {
      showSizeChanger: true,
      showQuickJumper: true,
      LocaleProvider: true,
      total: this.state.total,
      showTotal: () => `总共${this.state.total}条`,
    };
    const {scheduleEditPermission} = this.props
    return (
      <div className={style.container}>
        <h3 className={style.h3}>情况说明</h3>
        <div className={style.tools}>
        {this.props.permission.indexOf(scheduleEditPermission)!==-1 && (
          <PublicButton
            name={'新增'}
            title={'新增'}
            icon={'icon-add'}
            afterCallBack={this.handleAdd}
            res={'MENU_EDIT'}
            edit={!Number(this.props.data.isConfirmVo.code)}
        />)}
        {this.props.permission.indexOf(scheduleEditPermission)!==-1 && (
          <PublicButton
            name={'修改'}
            title={'修改'}
            icon={'icon-xiugaibianji'}
            afterCallBack={this.handleUpdate}
            res={'MENU_EDIT'}
            edit={!Number(this.props.data.isConfirmVo.code)}
          />)}
          {this.props.permission.indexOf(scheduleEditPermission)!==-1 && (
          <PublicButton
            name={'删除'}
            title={'删除'}
            icon={'icon-shanchu'}
            afterCallBack={this.handleDelete}
            res={'MENU_EDIT'}
            edit={!Number(this.props.data.isConfirmVo.code)}
            useModel={true}
            content={'你确定要删除吗？'}
            verifyCallBack={this.hasRecord}
          />)}
        </div>
        <Table
          size="small"
          pagination={paginationProps}
          rowSelection={handleRowSelection}
          columns={columns}
          rowKey={record => record.id}
          dataSource={this.state.tableData.length > 0 ? this.state.tableData : null}
          onRow={record => this.handleOnRow(record)}
          rowClassName={this.handleSetRowClassName}
          onChange={({ current, pageSize }) => {
            this.handleAsyncRequest(pageSize, current);
          }}
        />
        <ScheduleAddModal
          modalData={this.state.modalData}
          callBackAdd={this.callBackAdd}
          onCancel={this.onCancel}
          callbackUpdate={this.callbackUpdate}
          supervisorId={this.props.data.id}
        />
      </div>
    );
  }
  componentDidMount() {
    this.handleAsyncRequest();
  }
}

const columns = [
  {
    title: '内容描述',
    dataIndex: 'supervisorDesc',
    width: '55%',
  },
  {
    title: '状态',
    dataIndex: 'descStatusVo',
    width: '10%',
    render: ({ name }) => name,
  },
  {
    title: '填报人',
    width: '10%',
    dataIndex: 'creater',
  },
  {
    title: '上报时间',
    width: '25%',
    dataIndex: 'creatTime',
  },
];
export default Schedule;
