import React, { Component } from 'react';
import { Table ,notification} from 'antd';
import notificationFun from '@/utils/notificationTip';
import style from './style.less';
import * as dataUtil from '@/utils/dataUtil';
import axios from '@/api/axios';
import TopTags from './TopTags';
import {
  getsectionId,
  queryStopReworkList,
  queryStopRework,
  delStopRework,
  getPermission
} from '../../../api/suzhou-api';
import RightTags from '@/components/public/RightTags/index';
import { firstLoad } from '@/modules/Suzhou/components/Util/firstLoad';
// 布局
import ExtLayout from "@/components/public/Layout/ExtLayout";
import MainContent from "@/components/public/Layout/MainContent";
import Toolbar from "@/components/public/Layout/Toolbar";
import PublicTable from '@/components/PublicTable'
class StopReworkOrder extends Component {
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
      projectName: '',
      applyType:1,//1
      searchParam:{},//搜索条件
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
  // 点击获取行信息
  getInfo = (record, index) => {
    const { id } = record;
    axios.get(queryStopRework(id)).then(res => {
      const { data } = res.data;
      this.setState({
        activeIndex: data.id,
        rightData: data,
      });
    });
  };
  getList= (currentPageNum, pageSize, callBack) =>{
    axios.get(queryStopReworkList(this.state.applyType,pageSize,currentPageNum),{
      params: { projectId:this.state.projectId, sectionIds: this.state.sectionId ,...this.state.searchParam},
    }).then(res=>{
        callBack(res.data.data ? res.data.data : [])
        let data = res.data.data;
        this.setState({
            data,
            total: res.data.total,
            rightData: null,
            selectedRowKeys: [],
        })
    })
  }
  // // 搜索停复工令数据列表
  // getList = (projectId, sectionIds) => {
  //   const { pageSize, currentPageNum ,searchParam} = this.state;
  //   const applyType = '1';
  //   let ids;
  //   if (Array.isArray(sectionIds)) {
  //     ids = sectionIds.join();
  //   } else {
  //     ids = sectionIds;
  //   }
  //   axios
  //     .get(queryStopReworkList(applyType, pageSize, currentPageNum), {
  //       params: { projectId, sectionIds: ids ,...searchParam},
  //     })
  //     .then(res => {
  //       const { data, total } = res.data;
  //       if (data.length === 0 && currentPageNum > 1) {
  //         this.setState({ currentPageNum: currentPageNum - 1 }, () => {
  //           this.getList(projectId, sectionIds);
  //         });
  //       }
  //       this.setState({ data, loading: false, total });
  //     })
  //     .finally(err => {
  //       this.setState({ loading: false });
  //     });
  // };
  // 选择项目
  openPro = (...args) => {
    !this.state.projectId?'':this.table.recoveryPage(1);
    const [projectIds, , projectName] = args;
    this.setState(
      () => ({ projectId: projectIds[0], projectName ,sectionId:''}),
      () => {
        // this.getList(projectIds[0], []);
        this.table.getData();
      }
    );
  };
  // 选择标段
  openSection = (sectionId, section) => {
    const { projectId } = this.state;
    this.table.recoveryPage(1)
    this.setState({
      sectionId: sectionId.join(','),
      section: section,
    },()=>{
        // this.getList(projectId, sectionId);
        this.table.getData();
    });
  };
  // 生命周期函数
  componentDidMount() {
    let menuCode = 'ST-STOPREWORKORDER'
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
        () => ({ projectId, projectName, sectionId: sectionId }),
        // () => {
        //   this.getList(this.state.projectId, this.state.sectionId);
        // }
      );
    });
  }
  // 新增回调
  addData = newData => {
    // this.getList(this.state.projectId,this.state.sectionId)
    this.table.recoveryPage(1);
    this.table.getData();
  };
  // 删除回调
  deleteData = () => {
    const {selectedRows,selectedRowKeys} = this.state;
    axios.deleted(delStopRework()+ `?applyType=${this.state.applyType}`, {data:selectedRowKeys}, true).then(res => {
      // this.getList(this.state.projectId,this.state.sectionId);
      this.table.getData();
      this.setState({
        selectedRows:[],
        selectedRowKeys:[]
      })
    }).catch(err => {
    });
  };
  // 修改
  handleModelOk = newData => {
    // this.setState({
    //   rightData: { ...this.state.rightData, ...newData },
    //   data: this.state.data.map(item => (item.id === newData.id ? { ...item, ...newData } : item)),
    // });
    // notificationFun('操作提醒', '修改成功', 'success');
    this.table.update(this.state.rightData, newData)
  };
   // 搜索
   search = (searchParam)=>{
    this.setState({
      searchParam
    },()=>{
      // this.getList(this.state.projectId,this.state.sectionId);
      this.table.getData();
    })
  } 
  render() {
    const { height } = this.props;
    const {
      selectedRowKeys,
      data,
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
    return (
      <ExtLayout renderWidth={({ contentWidth }) => { this.setState({ contentWidth }) }}>
            <Toolbar>
                <TopTags
                    data1={projectId}
                    selectedRowKeys={selectedRowKeys}
                    openPro={this.openPro}
                    openSection={this.openSection}
                    addData={this.addData}
                    deleteData={this.deleteData}
                    // -
                    search = {this.search}
                    applyType = {this.state.applyType}
                    menuCode={this.props.menuInfo.menuCode}
                    bizType={this.props.menuInfo.menuCode}
                    projectId={projectId}
                    sectionId={this.state.sectionId}
                    projectName={this.state.projectName}
                    updateFlow={() => {
                      // this.getList(this.state.projectId, this.state.sectionId, '');
                      this.table.getData();
                    }}
                    permission={this.state.permission}
                  />
            </Toolbar>
            <MainContent contentWidth={this.state.contentWidth} contentMinWidth={1100}>
                {this.state.projectId && (
                    <PublicTable onRef={this.onRef}
                        pagination={true}
                        getData={this.getList}
                        columns={columns}
                        rowSelection={true}
                        onChangeCheckBox={this.getSelectedRowKeys}
                        useCheckBox={true} 
                        getRowData={this.getInfo}
                        total={this.state.total}
                        pageSize={10}
                        />
                )}
            </MainContent>
            <RightTags
                fileRelease={true}
                menuCode={this.props.menuInfo.menuCode}
                groupCode={1}
                rightData={rightData}
                handleModelOk={this.handleModelOk}
                projectId={this.state.projectId}
                menuId={this.props.menuInfo.id}
                bizType={this.props.menuInfo.menuCode}
                bizId={this.state.rightData ? this.state.rightData.id : null}
                fileEditAuth={true}
                extInfo={{
                  startContent: '停复工令',
                }}
                openWorkFlowMenu={this.props.openWorkFlowMenu}
                isShow={this.state.permission.indexOf('STOPREWORKORDER_FILE-STOP-RE-ORDER')==-1?false:true} //文件权限
                fileRelease={this.state.permission.indexOf('STOPREWORKORDER_RELEASE-STOP-REORDER')==-1?false:true}//文件发布权限
                permission={this.state.permission}
              />
      </ExtLayout>
    );
  }
}
const columns = [
  {
    title: '编号',
    dataIndex: 'applyNum',
    key: 'applyNum',
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
    title: '合同号',
    dataIndex: 'contract',
    key: 'contract',
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
    title: '类别',
    dataIndex: 'typeVo.name',
    key: 'typeVo.name',
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
];
export default StopReworkOrder;
