import React, { Component } from 'react';
import style from './style.less';
import { Table } from 'antd';
import notificationFun from '@/utils/notificationTip';
import PublicButton from '@/components/public/TopTags/PublicButton';
import AddDetail from '../AddDetail';
import ModifyDetail from '../ModifyDetail';
import {
  queryDetailSheetList,
  queryDetailSheet,
  delDetailSheet,
  updateDetailSheet,
  addDetailSheet,
} from '../../../../api/suzhou-api';
import axios from '@/api/axios';



export class QualityInspectionDetail extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      visibleModal: false,
      visibleModalDetail: false,
      data: [],
      activeIndex: undefined,
      rightData: null,
      selectedRowKeys: [],
      pageSize: 10,
      currentPageNum: 1,
      total: 0,
    };
  }
  componentDidMount() {
    this.getList();
  }
  // 请求派工单明细数据列表
  getList = () => {
    const { sectionIds, rightData } = this.props;
    const { projectId, id } = rightData;
    const { pageSize, currentPageNum } = this.state;
    const dailySheetId = id;
    let ids;
    if (Array.isArray(sectionIds)) {
      ids = sectionIds.join();
    } else {
      ids = sectionIds;
    }
    axios
      .get(queryDetailSheetList(dailySheetId, pageSize, currentPageNum), {
        params: { projectId, sectionIds: ids },
      })
      .then(res => {
        const { data, total } = res.data;
        if (data.length === 0 && currentPageNum > 1) {
          this.setState({ currentPageNum: currentPageNum - 1 }, () => {
            this.getList();
          });
        }
        this.setState({ data, total, loading: false });
      })
      .catch(err => {
        this.setState({ loading: false });
      });
  };
  onClickHandleCheck = (record) => {
    const data = {
      ...record,
      projectId:this.props.rightData.projectId,
      sectionId:this.props.rightData.sectionId,
      dispatchTime:this.props.rightData.dispatchTime
    }
    localStorage.setItem("myPaigongdan", JSON.stringify(data))
    this.props.openMenuByMenuCode('STAFF-ATTENDLOG',true);
  }
  // 点击触发
  btnClicks = type => {
    if (type === 'AddTopBtn') {
      this.setState({ visibleModal: true });
    } else if (type === 'DeleteTopBtn') {
      const { selectedRowKeys, rightData, total, data } = this.state;
      axios
        .deleted(delDetailSheet, {
          data: selectedRowKeys || [],
        })
        .then(() => {
          this.getList();
          // 判断是否是删掉点击的那条 那么要清掉点击的数据和选中class
          // if (rightData && selectedRowKeys.some(item => item === rightData.id)) {
          //   this.setState({
          //     rightData: null,
          //     rowClassName: null,
          //   });
          // }
          // this.setState({
          //   total: total - selectedRowKeys.length,
          //   data: data.filter(item => !selectedRowKeys.includes(item.id)),
          //   selectedRowKeys: [],
          //   selectedRows: [],
          // });
          // notificationFun('操作提醒', '删除成功', 'success');
        });
    } else if (type === 'ModifyTopBtn') {
      const { activeIndex } = this.state;
      if (!Number.isInteger(activeIndex)) {
        notificationFun('操作提醒', '请选择修改项');
        return;
      }
      this.setState({ visibleModalDetail: true });
    }
  };
  // 获取点击行信息
  getInfo = (record, index) => {
    const { id } = record;
    axios.get(queryDetailSheet(id)).then(res => {
      const { data } = res.data;
      if (data) {
        this.setState({
          activeIndex: data.id,
          rightData: data,
        });
      }
    });
  };
  // 新增明细确认
  handleModalOk = data0 => {
    
    this.setState({ visibleModal: false });
    const { rightData } = this.props;
    const { projectId, sectionId, id } = rightData;
    const dailySheetId = id;
    const data1 = { ...data0, projectId, sectionId, dailySheetId };
    axios.post(addDetailSheet(), data1).then(res => {
      this.getList();
      // const { data, total } = this.state;
      // const newData = res.data.data;
      // this.setState({
      //   data: [...data, newData],
      //   total: total + 1,
      // });
      // notificationFun('操作提醒', '新增成功', 'success');
    });
  };
  // 修改明细确认
  handleModalOkDetail = data0 => {
    this.setState({ visibleModalDetail: false });
    axios.put(updateDetailSheet(), { ...data0 }).then(res => {
      this.setState({ rightData: data0 });
      this.setState({
        rightData: { ...this.state.rightData, ...data0 },
        data: this.state.data.map(item => (item.id === data0.id ? { ...item, ...data0 } : item)),
      });
      notificationFun('操作提醒', '修改成功', 'success');
    });
  };
  // 新增取消
  handleModalCancel = () => {
    this.setState({
      visibleModal: false,
      visibleModalDetail: false,
    });
  };
  // 点击行样式
  setClassName = (record, index) => {
    //判断索引相等时添加行的高亮样式
    return record.id == this.state.activeIndex ? 'tableActivty' : '';
  };
  //判断是否有选中数据
  hasRecord = () => {
    if (this.state.selectedRowKeys.length == 0) {
      notificationFun('操作提醒', '请选择数据进行操作');
      return false;
    } else {
      return true;
    }
  };

  render() {
    const { projectId, sectionId } = this.props.rightData;
    const { loading, selectedRowKeys, total, currentPageNum, pageSize, data } = this.state;
    // 表格行是否可选配置
    const rowSelection = {
      selectedRowKeys,
      onChange: (selectedRowKeys, selectedRows) => {
        this.setState({
          selectedRowKeys,
        });
      },
    };
    //分页调用配置
    const pagination = {
      total,
      currentPageNum,
      pageSize,
      showSizeChanger: true,
      showQuickJumper: true,
      size: 'small',
      showTotal: total => `总共${total}条`,
      onShowSizeChange: (currentPageNum, size) => {
        this.setState(
          {
            pageSize: size,
            currentPageNum: 1,
          },
          () => {
            this.getList();
          }
        );
      },
      onChange: (page, pageSize) => {
        this.setState(
          {
            pageSize,
            currentPageNum: page,
          },
          () => {
            this.getList();
          }
        );
      },
    };
    const columns = [
        {
          title: '序号',
          render: (text, record, index) => `${index + 1}`,
        },
        {
          title: '工作区域',
          dataIndex: 'workSpace',
          key: 'workSpace',
        },
        {
          title: '对应工序',
          dataIndex: 'taskName',
          key: 'taskName',
        },
        {
          title: '工作人员',
          dataIndex: 'worker',
          key: 'worker',
        },
        {
          title: '工作内容',
          key: 'workContent',
          dataIndex: 'workContent',
        },
        {
          title: '备注说明',
          dataIndex: 'remark',
          key: 'remark',
        },
        // {
        //   title: '考勤查看',
        //   dataIndex: 'a5',
        //   key: 'a5',
        //   render:(text,record)=>{
        //     return <a onClick={this.onClickHandleCheck.bind(this, record)} style={{ cursor: 'pointer' }}>{`查看考勤`}</a>
        //   }
        // },
      ];
      const {permission} = this.props
    return (
      <div className={style.main}>
        <div className={style.mainHeight}>
          <h3 className={style.listTitle}>派工单明细</h3>
          <div className={style.rightTopTogs}>
          {permission.indexOf('DAILYSHEET_EDIT-ASSIGNMENT-LIST')!==-1 && (
            <PublicButton
              name={'新增'}
              title={'新增'}
              icon={'icon-add'}
              edit={!this.props.status}
              afterCallBack={this.btnClicks.bind(this, 'AddTopBtn')}
              res={'MENU_EDIT'}
            />)}
            {permission.indexOf('DAILYSHEET_EDIT-ASSIGNMENT-LIST')!==-1 && (
            <PublicButton
              name={'修改'}
              title={'修改'}
              icon={'icon-xiugaibianji'}
              edit={!this.props.status}
              afterCallBack={this.btnClicks.bind(this, 'ModifyTopBtn')}
              res={'MENU_EDIT'}
            />)}
            {permission.indexOf('DAILYSHEET_EDIT-ASSIGNMENT-LIST')!==-1 && (
            <PublicButton
              name={'删除'}
              title={'删除'}
              icon={'icon-shanchu'}
              verifyCallBack={this.hasRecord}
              useModel={true}
              edit={!this.props.status}
              afterCallBack={this.btnClicks.bind(this, 'DeleteTopBtn')}
              content={'你确定要删除吗？'}
              res={'MENU_EDIT'}
            />)}
            <AddDetail
              projectId={projectId}
              sectionId={sectionId}
              rightData={this.state.rightData}
              handleModalOk={this.handleModalOk}
              visibleModal={this.state.visibleModal}
              handleModalCancel={this.handleModalCancel}
            />
            {this.state.visibleModalDetail ? (
              <ModifyDetail
                handleModalOkDetail={this.handleModalOkDetail}
                visibleModalDetail={this.state.visibleModalDetail}
                handleModalCancel={this.handleModalCancel}
                rightData={this.state.rightData}
                projectId={projectId}
                sectionId={sectionId}
              />
            ) : null}
          </div>
          <div className={style.mainScorll} style={{ minWidth: '100%', overflow: 'auto' }}>
            <Table
              className={style.table}
              columns={columns}
              dataSource={data}
              pagination={pagination}
              rowSelection={rowSelection}
              rowKey={_r => _r.id}
              rowClassName={this.setClassName}
              loading={loading}
              onRow={_r => {
                return {
                  onClick: this.getInfo.bind(this, _r),
                };
              }}
            />
          </div>
        </div>
      </div>
    );
  }
}

export default QualityInspectionDetail;
