import React, { Component } from 'react';
import { Table } from 'antd';
import style from './style.less';
import axios from '@/api/axios';
import TopTags from './TopTags/index';
import RightTags from '@/components/public/RightTags';
import * as dataUtil from '@/utils/dataUtil';
import notificationFun from '@/utils/notificationTip';
import {
  getsectionId,
  queryDeviceHoistingList,
  queryDeviceHoistingInfo,
  delDeviceHoisting,
  getPermission
} from '@/modules/Suzhou/api/suzhou-api';
import { firstLoad } from '@/modules/Suzhou/components/Util/firstLoad';
//布局
import ExtLayout from "@/components/public/Layout/ExtLayout";
import MainContent from "@/components/public/Layout/MainContent";
import Toolbar from "@/components/public/Layout/Toolbar";
import PublicTable from '@/components/PublicTable'
const columns = [
  {
    title: '序号',
    render: (text, record, index) => `${index + 1}`,
  },
  {
    title: '标题',
    dataIndex: 'title',
    key: 'title',
  },
  {
    title: '吊装日期',
    dataIndex: 'hoistTime',
    key: 'hoistTime',
  },
  // {
  //   title: '项目名称',
  //   dataIndex: 'projectName',
  //   key: 'projectName',
  // },
  {
    title: '标段号',
    dataIndex: 'sectionCode',
    key: 'sectionCode',
  },
  {
    title: '标段名称',
    dataIndex: 'sectionName',
    key: 'sectionName',
  },  
  {
    title: '施工单位',
    dataIndex: 'sgdw',
    key: 'sgdw',
  },
  // {
  //   title: '监理单位',
  //   dataIndex: 'jldw',
  //   key: 'jldw',
  // },
  {
    title: '状态',
    dataIndex: 'statusVo.name',
    key: 'statusVo',
  },
  {
    title: "创建人",
    dataIndex: 'creator',
    key: 'creator',
  },
  {
      title: "创建日期",
      dataIndex: 'creatTime',
      key: 'creatTime',        
  },
];
class EquitHoist extends Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedRowKeys: [],
      selectedRows: [],
      rightData: null,
      activeIndex: [],
      data: [],
      projectId: '',
      section: '',
      sectionId: '',
      pageSize: 10,
      currentPageNum: 1,
      loading: true,
      total: 0,
      search: '',
      status: false,
      projectName: '', //项目名称
      permission:[]
    };
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
  /**
   * 获取复选框 选中项、选中行数据
   * @method updateSuccess
   * @param {string} selectedRowKeys 复选框选中项
   * @param {string} selectedRows  行数据
   */
  getSelectedRowKeys = (selectedRowKeys, selectedRows) => {
      this.setState({
          selectedRows,
          selectedRowKeys
      })
  }
  // 生命周期函数
  componentDidMount() {
    let menuCode = 'DEVICE-HOIST'
        axios.get(getPermission(menuCode)).then((res)=>{
            let permission = []
            res.data.data.map((item,index)=>{
            permission.push(item.code)
            })
            this.setState({
            permission
            })
        })
    firstLoad().then(res => {
      this.setState(
        {
          projectId: res.projectId,
          projectName: res.projectName,
          sectionId: res.sectionId,
        },
        // () => {
        //   this.getList(res.projectId, res.sectionId);
        // }
      );
    });
  }
  // 获取项目ID或标段ID下所有数据列表
  getList = (currentPageNum, pageSize, callBack) => {
    const { search,projectId, sectionId } = this.state;
    let ids;
    if (Array.isArray(sectionId)) {
      ids = sectionId.join();
    } else {
      ids = sectionId;
    }
    axios
      .get(queryDeviceHoistingList(pageSize, currentPageNum), {
        params: { projectId, sectionIds: ids, title: search },
      })
      .then(res => {
        callBack(!res.data.data ?[]: res.data.data)
        const { data, total } = res.data;
        // if (data.length === 0 && currentPageNum > 1) {
        //   this.setState({ currentPageNum: currentPageNum - 1 }, () => {
        //     this.getList(projectId, sectionIds, title);
        //   });
        // }
        this.setState({ data, loading: false, total });
      })
      .catch(err => {
        this.setState({ loading: false });
      });
  };
  // 点击获取行信息
  getInfo = (record, index) => {
    const { id } = record;
    axios.get(queryDeviceHoistingInfo(id)).then(res => {
      const { data } = res.data;
      if (data.statusVo && data.statusVo.code === 'INIT') {
        this.setState({ status: false });
      } else {
        this.setState({ status: true });
      }
      this.setState({
        activeIndex: data.id,
        record: data,
        rightData: data,
      });
    });
  };
  // 选择项目
  openPro = (data1, data2, projectName) => {
    this.setState({
      projectId: data1[0],
      projectName,
      currentPageNum:1
    },()=>{
      this.table.getData();
    });
  };
  // 选择标段
  openSection = (sectionId, section) => {
    const { projectId } = this.state;
    this.setState({
      sectionId: sectionId,
      section: section,
      currentPageNum:1
    },()=>{
      this.table.getData();
    });
  };
  // 点击跟换样式
  // setClassName = (record, index) => {
  //   //判断索引相等时添加行的高亮样式
  //   return record.id == this.state.activeIndex ? 'tableActivty' : '';
  // };
  // 新增吊装
  addData = data0 => {
    this.table.recoveryPage(1);
    this.table.getData();
    // const {projectId,sectionId} = this.state;
    // this.setState({
    //   currentPageNum:1
    // },()=>{
    //   this.getList(projectId, sectionId);
    // })
  };
  // 删除吊装
  deleteData = () => {
    const {
      selectedRowKeys,
      selectedRows,
      rightData,
      total,
      data,
      currentPageNum,
      projectId,
      sectionId,
    } = this.state;
    if (selectedRowKeys.length === 0) {
      notificationFun('操作提醒', '请选择需要删除的项');
      return;
    }
    let deleteArray = [];
    selectedRows.forEach((value, item) => {
      if (value.statusVo.code == 'INIT') {
        deleteArray.push(value.id);
      } else {
        notificationFun('非新建状态数据不能删除', '标题' + value.title + '不能删除');
        return false;
      }
    });
    if (deleteArray.length > 0) {
      axios.deleted(delDeviceHoisting(), { data: deleteArray || [] }).then(() => {
        // 判断是否是删掉点击的那条 那么要清掉点击的数据和选中class
        // if (rightData && deleteArray.some(item => item === rightData.id)) {
        //   this.setState({
        //     rightData: null,
        //     rowClassName: null,
        //   });
        // }
        this.table.getData();
        this.setState(
          {
            // total: total - deleteArray.length,
            // data: data.filter(item => !deleteArray.includes(item.id)),
            selectedRowKeys: [],
            selectedRows: [],
          },
          () => {
          //   const { data } = this.state;
          //   if (currentPageNum > 1 && data.length === 0) {
          //     this.setState(
          //       {
          //         currentPageNum: currentPageNum - 1,
          //         loading: true,
          //       },
          //       () => {
          //         this.getList(projectId, sectionId);
          //       }
          //     );
          //   }
            notificationFun('操作提醒', '删除成功', 'success');
          }
        );
      });
    }
  };
  // 搜索
  search = val => {
    this.setState(
      {
        search: val,
        currentPageNum:1
      },
      () => {
        this.table.getData()
      }
    );
  };
  //发布流程回调
  updateFlow = v => {
    const { projectId, sectionId } = this.state;
    this.table.getData()
  };
  handleModifyOk = data0 => {
    this.table.update(this.state.rightData, data0)
    this.setState({
      rightData: { ...this.state.rightData, ...data0 },
      data: this.state.data.map(item => (item.id === data0.id ? { ...item, ...data0 } : item)),
    });
    notificationFun('操作提醒', '修改成功', 'success');
  };
  render() {
    const { height } = this.props;
    const {
      data,
      currentPageNum,
      pageSize,
      total,
      selectedRowKeys,
      selectedRows,
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
            this.getList(this.state.projectId, this.state.sectionId);
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
            this.getList(this.state.projectId, this.state.sectionId);
          }
        );
      },
    };
    return (
      <ExtLayout renderWidth={({ contentWidth }) => { this.setState({ contentWidth }) }}>
      <Toolbar>
        <TopTags
          projectName={this.state.projectName}
          addData={this.addData}
          deleteData={this.deleteData}
          selectedRowKeys={this.state.selectedRowKeys}
          data1={this.state.projectId}
          search={this.search}
          openSection={this.openSection}
          openPro={this.openPro}
          updateFlow={this.updateFlow}
          bizType={this.props.menuInfo.menuCode}
          sectionId={this.state.sectionId}
          permission={this.state.permission}
        />
        </Toolbar>
        <MainContent contentWidth={this.state.contentWidth} contentMinWidth={1100}>
              {this.state.projectId && (
              <PublicTable
                onRef={this.onRef}
                pagination={true}
                getData={this.getList}
                columns={columns}
                rowSelection={true}
                onChangeCheckBox={this.getSelectedRowKeys}
                useCheckBox={true} 
                getRowData={this.getInfo}
                total={this.state.total}
                pageSize={10}
                // size="small"
                // columns={columns}
                // dataSource={data}
                // pagination={pagination} // 分页配置
                // rowSelection={rowSelection}
                // rowKey={record => record.id}
                // rowClassName={this.setClassName}
                // // loading={loading}
                // onRow={(record, index) => {
                //   return {
                //     onClick: this.getInfo.bind(this, record),
                //   };
                // }}
              />)}
              </MainContent>
          {/* 右侧图标列：展示基本信息等 */}
            <RightTags
              menuCode={this.props.menuInfo.menuCode}
              groupCode={1}
              status={this.state.status}
              rightData={this.state.rightData}
              handleModifyOk={this.handleModifyOk}
              projectId={this.state.projectId}
              menuId={this.props.menuInfo.id}
              bizType={this.props.menuInfo.menuCode}
              bizId={this.state.rightData ? this.state.rightData.id : null}
              fileEditAuth={true}
              extInfo={{
                startContent: '吊装管理',
              }}
              taskFlag = {false}
              isCheckWf={true}  //流程查看
              openWorkFlowMenu={this.props.openWorkFlowMenu}
              isShow={this.state.permission.indexOf('HOIST_FILE-HOIST-MANAGE')==-1?false:true} //文件权限
              permission={this.state.permission}
            />
          </ExtLayout>
    );
  }
}

export default EquitHoist;
