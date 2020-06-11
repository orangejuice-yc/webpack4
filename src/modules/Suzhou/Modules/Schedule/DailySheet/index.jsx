import React, { Component } from 'react';
import { Table } from 'antd';
import notificationFun from '@/utils/notificationTip';
import style from './style.less';
import * as dataUtil from '@/utils/dataUtil';
import axios from '@/api/axios';
import TopTags from './TopTags';
import {
  getsectionId,
  queryDailySheet,
  queryDailySheetList,
  delDailySheet,
  getPermission,publishDailySheet
} from '@/modules/Suzhou/api/suzhou-api';
import RightTags from '@/components/public/RightTags';
import { firstLoad } from '@/modules/Suzhou/components/Util/firstLoad';
import {getPgdListByViewType} from '@/api/suzhou-api'

class DaillySheet extends Component {
  constructor(props) {
    super(props);
    this.state = {
      data: [],
      activeIndex: undefined,
      rightData: null,
      selectedRowKeys: [],
      selectedRows: [],
      total: 0,
      currentPageNum: 1,
      pageSize: 10,
      projectId: '',
      sectionIds: [],
      sectionId: '',
      loading: true,
      status: false,
      projectName: '',
      searchParam:{},
      permission:[]
    };
  }
  // 点击跟换样式
  setClassName = (record, index) => {
    //判断索引相等时添加行的高亮样式
    return record.id == this.state.activeIndex ? 'tableActivty' : '';
  };
  // 点击获取行信息
  getInfo = (record, index) => {
    const { id } = record;
    axios.get(queryDailySheet(id)).then(res => {
      const { data } = res.data;
      if (data.statusVo && data.statusVo.code === 'INIT') {
        this.setState({ status: false });
      } else {
        this.setState({ status: true });
      }
      this.setState({
        activeIndex: data.id,
        rightData: data,
      });
    });
  };
  // 搜索日派工单数据列表
  getList = (projectId, sectionIds) => {
    let pgdQus = JSON.parse(localStorage.getItem("pgdQus"))
    const { pageSize, currentPageNum,searchParam } = this.state;
    if(pgdQus){
      const {projectId,viewType,sectionId,stationId} = pgdQus
      const params = {projectId,viewType,sectionId,stationId}
      axios.get(getPgdListByViewType(pageSize, currentPageNum), {params}).then(res => {
        if (res.data.status === 200) {
          const { data, total } = res.data;
          if (data.length === 0 && currentPageNum > 1) {
            this.setState({ currentPageNum: currentPageNum - 1 }, () => {
              this.getList(projectId, sectionIds);
            });
          }
          this.setState({ data, loading: false, total });
        } else {
          this.setState({ loading: false });
        }
      })
      .finally(() => {
        this.setState({ loading: false });
      })
    }else{
    let ids;
    if (Array.isArray(sectionIds)) {
      ids = sectionIds.join();
    } else {
      ids = sectionIds;
    }
    axios
      .get(queryDailySheetList(pageSize, currentPageNum), {
        params: { projectId, sectionIds: ids,...searchParam },
      })
      .then(res => {
        if (res.data.status === 200) {
          const { data, total } = res.data;
          if (data.length === 0 && currentPageNum > 1) {
            this.setState({ currentPageNum: currentPageNum - 1 }, () => {
              this.getList(projectId, sectionIds);
            });
          }
          this.setState({ data, loading: false, total });
        } else {
          this.setState({ loading: false });
        }
      })
      .finally(() => {
        this.setState({ loading: false });
      });}
  };
  // 选择项目
  openPro = (...args) => {
    const [projectIds, , projectName] = args;
    this.setState(
      () => ({ projectId: projectIds[0], projectName }),
      () => {
        this.getList(projectIds[0], []);
      }
    );
  };
  // 选择标段
  openSection = (sectionId, section) => {
    const { projectId } = this.state;
    this.setState({
      sectionId: sectionId.join(","),
      section: section,
    });
    this.getList(projectId, sectionId);
  };
  // 生命周期函数
  componentDidMount() {
    let menuCode = 'ST-DAILYSHEET'
        axios.get(getPermission(menuCode)).then((res)=>{
        let permission = []
        res.data.data.map((item,index)=>{
            permission.push(item.code)
        })
        this.setState({
            permission
        })
    })
    firstLoad().then(({ projectId, projectName, sectionId }) => {
      this.setState(
        () => ({ projectId, projectName, sectionIds: sectionId }),
        () => {
          this.getList(this.state.projectId, this.state.sectionId);
        }
      );
    });
  }
  // 新增回调
  addData = data0 => {
    this.getList(this.state.projectId,this.state.sectionId)
  };
  // 删除回调
  deleteData = () => {
    const {
      selectedRowKeys,
      selectedRows,
      rightData,
      currentPageNum,
      total,
      data,
      projectId,
      sectionId,
    } = this.state;
    const obj = [];
    selectedRows.map(item =>{
        if(item.statusVo && item.statusVo.code == 'INIT'){
          obj.push(item.id);
        }else{
          notificationFun('操作提醒', '只有新建状态可以删除');
        }
    })
    if(obj.length > 0){
      axios.deleted(delDailySheet(), { data: obj || [] }).then(() => {
        this.getList(this.state.projectId,this.state.sectionId);
        this.setState({
            selectedRowKeys: [],
            selectedRows: [],
        })
      });
    }
  };
   // 发布回调
   fabuData = () => {
    const {
      selectedRowKeys,
      selectedRows,
      rightData,
      currentPageNum,
      total,
      data,
      projectId,
      sectionId,
    } = this.state;
    const obj = [];
    selectedRows.map(item =>{
        if(item.statusVo && item.statusVo.code == 'INIT'){
          obj.push(item.id);
         
        }else{
          notificationFun('操作提醒', '只有新建状态可以发布');
        }
    })
    if(obj.length > 0){
      axios.put(publishDailySheet,obj || [],true).then(() => {
        this.getList(this.state.projectId,this.state.sectionId);
        this.setState({
            selectedRowKeys: [],
            selectedRows: [],
        })
      });
    }
  };
  // 修改
  handleModelOk = newData => {
    this.setState({
      rightData: { ...this.state.rightData, ...newData },
      data: this.state.data.map(item => (item.id === newData.id ? { ...item, ...newData } : item)),
    },()=>{
      this.getList(this.state.projectId, this.state.sectionId)
    });
    notificationFun('操作提醒', '修改成功', 'success');
  };
  //搜索
  search=(searchParam)=>{
    this.setState({
      searchParam
    },()=>{
      this.getList(this.state.projectId,this.state.sectionId);
    })
  }
  //查看考勤
  // onClickHandleCheck = (record) => {
  //   const data = {
  //     ...record,
  //   }
  //   localStorage.setItem("myPaigongdan", JSON.stringify(data))
  //   this.props.openMenuByMenuCode('STAFF-ATTENDLOG-DAILYSHEET',true);
  // }
  render() {
    const { height } = this.props;
    const { data } = this.state;
    const {
      selectedRowKeys,
      selectedRows,
      total,
      currentPageNum,
      pageSize,
      rightData,
      projectId,
      loading,
    } = this.state;
    // 表格行是否可选配置
    const rowSelection = {
      selectedRowKeys,
      selectedRows,
      onChange: (selectedRowKeys, selectedRows) => {
        this.setState({
          selectedRowKeys,
          selectedRows,
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
            this.getList(this.state.projectId, this.state.sectionId, '');
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
            this.getList(this.state.projectId, this.state.sectionId, '');
          }
        );
      },
    };
    const columns = [
      // {
      //   title: '标段号',
      //   dataIndex: 'sectionCode',
      //   key: 'sectionCode',
      // },
      {
        title: '派工单编号',
        dataIndex: 'sheetNum',
        key: 'sheetNum',
      },
      {
        title: '派工单名称',
        dataIndex: 'sheetName',
        key: 'sheetName',
      },
      {
        title: '项目名称',
        dataIndex: 'projectName',
        key: 'projectName',
      },
      {
        title: '标段名称',
        dataIndex: 'sectionName',
        key: 'sectionName',
      },
      {
        title: '标段号',
        dataIndex: 'sectionCode',
        key: 'sectionCode',
      },
      {
        title: '施工单位',
        dataIndex: 'sgdw',
        key: 'sgdw',
      },
      {
        title: '带班领导',
        dataIndex: 'leaderName',
        key: 'leaderName',
      },
      {
        title: '联系方式',
        dataIndex: 'telephone',
        key: 'telephone',
      },
      {
        title: '派工日期',
        dataIndex: 'dispatchTime',
        key: 'dispatchTime',
      },
      {
        title: '状态',
        dataIndex: 'statusVo.name',
        key: 'statusVo.name',
      },
      {
        title: '创建人',
        dataIndex: 'creater',
        key: 'creater',
      },
      {
        title: '创建时间',
        dataIndex: 'creatTime',
        key: 'creatTime',
      },
      // {
      //   title: '人员出勤',
      //   dataIndex: 'a5',
      //   key: 'a5',
      //   render:(text,record)=>{
      //     if(record.statusVo.code == 'INIT'){
      //       return <span>{`--`}</span>
      //     }else{
      //       return <a onClick={this.onClickHandleCheck.bind(this, record)} style={{ cursor: 'pointer' }}>{`查看`}</a>
      //     }
      //   }
      // },
    ];
    return (
      <div>
        <TopTags
          data1={projectId}
          selectedRowKeys={selectedRowKeys}
          openPro={this.openPro}
          openSection={this.openSection}
          addData={this.addData}
          deleteData={this.deleteData}
          fabuData = {this.fabuData}
          status={this.state.status}
          // --
          search = {this.search}
          menuCode={this.props.menuInfo.menuCode}
          bizType={this.props.menuInfo.menuCode}
          projectId={projectId}
          sectionId={this.state.sectionIds}
          projectName={this.state.projectName}
          updateFlow={() => {
            this.getList(this.state.projectId, this.state.sectionId, '');
          }}
          permission={this.state.permission}
        />
        <div className={style.main}>
          <div className={style.leftMain} style={{ height }}>
            <div style={{ minWidth: 'calc(100vw - 60px)' }}>
              <Table
                size="small"
                pagination={pagination}
                columns={columns}
                rowKey={record => record.id}
                dataSource={data}
                rowSelection={rowSelection}
                rowClassName={this.setClassName}
                loading={loading}
                onRow={record => {
                  return {
                    onClick: this.getInfo.bind(this, record),
                  };
                }}
                scroll={{'x':'1200px'}}
              />
            </div>
          </div>
          <div className={style.rightBox} style={{ height }}>
            <RightTags
              menuCode={this.props.menuInfo.menuCode}
              groupCode={1}
              rightData={rightData}
              handleModelOk={this.handleModelOk}
              status={this.state.status}
              projectId={this.state.projectId}
              menuId={this.props.menuInfo.id}
              bizType={this.props.menuInfo.menuCode}
              bizId={this.state.rightData ? this.state.rightData.id : null}
              fileEditAuth={true}
              extInfo={{
                startContent: '日派工单',
              }}
              menuInfo={this.props.menuInfo}
              openWorkFlowMenu={this.props.openWorkFlowMenu}
              openMenuByMenuCode={this.props.openMenuByMenuCode}
              isShow={this.state.permission.indexOf('DAILYSHEET_FILE-EDIT')==-1?false:true} //文件权限
              fileRelease={this.state.permission.indexOf('DAILYSHEET_FILE-EDIT')==-1?false:true}//文件发布权限
              permission={this.state.permission}
            />
          </div>
        </div>
      </div>
    );
  }
}

export default DaillySheet;
