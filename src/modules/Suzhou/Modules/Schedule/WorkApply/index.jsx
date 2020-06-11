import React, { Component } from 'react';
import { Table ,notification} from 'antd';
import notificationFun from '@/utils/notificationTip';
import style from './style.less';
import * as dataUtil from '@/utils/dataUtil';
import axios from '@/api/axios';
import TopTags from './TopTags';
import {
  getWorkApplyList,
  delWorkApply,
  dyWorkApply,
  getPermission
} from '../../../api/suzhou-api';
import RightTags from '@/components/public/RightTags/index';
import { firstLoad } from '@/modules/Suzhou/components/Util/firstLoad';
// 布局
import ExtLayout from "@/components/public/Layout/ExtLayout";
import MainContent from "@/components/public/Layout/MainContent";
import Toolbar from "@/components/public/Layout/Toolbar";
import PublicTable from '@/components/PublicTable'
class WorkApply extends Component {
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
      sectionId: '',
      section: '',
      loading: true,
      code: false,
      projectName: '',
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
    const { activeIndex } = this.state;
    const { id } = record;
    this.setState({
        activeIndex: id,
        record: record,
        rightData: record
    });
  };
//   getList= (currentPageNum, pageSize, callBack) =>{
//     axios.get(getHolidayList(pageSize,currentPageNum)+`?projectId=${this.state.projectId}&sectionIds=${this.state.sectionId}&searcher=${this.state.search}&status=${this.state.status}`).then(res=>{
//         callBack(res.data.data ? res.data.data : [])
//         let data = res.data.data;
//         this.setState({
//             data,
//             total: res.data.total,
//             rightData: null,
//             selectedRowKeys: [],
//         })
//     })
// }
  // 搜索开工申请数据列表
  getList = (currentPageNum, pageSize, callBack) => {
    const { projectId, sectionId } = this.state;
    const {applyCode,status} = this.state.searchParam
    axios
      .get(getWorkApplyList(pageSize, currentPageNum), {
        params: { projectId, sectionIds: sectionId, applyCode, status},
      })
      .then(res => {
        callBack(res.data.data ? res.data.data : [])
        let data = res.data.data;
        this.setState({
            data,
            total: res.data.total,
            rightData: null,
            selectedRowKeys: [],
            loading: false
        })
      })
      .finally(err => {
        this.setState({ loading: false });
      });
  };
  // 选择项目
  openPro = (...args) => {
    !this.state.projectId?'':this.table.recoveryPage(1);
    const [projectIds, , projectName] = args;
    this.setState(
      () => ({ projectId: projectIds[0], projectName,sectionId:'' }),
      () => {
        this.table.getData();
      }
    );
  };
  // 选择标段
  openSection = (sectionId, section) => {
    const { projectId } = this.state;
    this.setState({
      sectionId: sectionId.join(','),
      section: section,
    },()=>{
      this.table.recoveryPage(1);
      this.table.getData();
      // this.getList(projectId, this.state.sectionId);
    });
    
  };
  // 生命周期函数
  componentDidMount() {
    let menuCode = this.props.menuInfo.menuCode
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
    this.table.recoveryPage(1);
    this.table.getData();
    // this.getList(this.state.projectId,this.state.sectionId)
  };
  // 删除回调
  deleteData = () => {
    const {selectedRows} = this.state;
    const deletedArr = [];
    selectedRows.forEach((value,item)=>{
      if(value.statusVo.code == 'INIT'){
        deletedArr.push(value.id)
      }else{
        notification.warning(
          {
            placement: 'bottomRight',
            bottom: 50,
            duration: 2,
            message: '提示',
            description: "非新建状态数据不能删除"
          }
        );
        return false;
      }
    }) 
    if(deletedArr.length > 0){
      const ids = deletedArr
      axios.deleted(delWorkApply ,{data:ids}, true).then(res => {
        // this.getList(this.state.projectId,this.state.sectionId);
        this.table.getData();
        this.setState({
          selectedRows:[],
          selectedRowKeys:[]
        })
      }).catch(err => {
      });
    } 
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
        this.state.projectId?this.table.recoveryPage(1):'';
        this.table.getData();
        // this.getList(this.state.projectId,this.state.sectionId);
      })
  }
  //审批预览
  viewDetail = (record) => {
    axios.view(dyWorkApply+`?id=${record.id}`).then(res=>{})
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
    const columns = [
      {
        title: '编号',
        dataIndex: 'applyCode',
        key: 'applyCode',
      },
      {
        title: '项目名称',
        dataIndex: 'projectName',
        key: 'projectName',
      },
      {
        title: '标段名称',
        dataIndex: 'sectionCodeName',
        key: 'sectionCodeName',
      },
      {
        title: '施工单位',
        dataIndex: 'sgdw',
        key: 'sgdw',
      },
      {
        title: '合同号',
        dataIndex: 'contract',
        key: 'contract',
      },
      {
        title: '开工申请日期',
        dataIndex: 'applyWorkDay',
        key: 'applyWorkDay',
      },
      {
        title: '状态',
        dataIndex: 'statusVo.name',
        key: 'statusVo.name',
      }, 
      {
          title: "审批预览",
          width: 80,
          render: (text, record) => {
            return <a onClick={this.viewDetail.bind(this, record)} style={{ cursor: 'pointer' }}>预览</a>
          }
        }
    ];
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
                  search = {this.search}
                  searchParam={this.state.searchParam}
                  menuInfo = {this.props.menuInfo}
                  menuCode={this.props.menuInfo.menuCode}
                  bizType={this.props.menuInfo.menuCode}
                  projectId={projectId}
                  sectionId={this.state.sectionId}
                  projectName={this.state.projectName}
                  updateFlow={() => {
                    this.table.getData();
                    // this.getList(this.state.projectId, this.state.sectionId);
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
              menuCode={this.props.menuInfo.menuCode}
              groupCode={1}
              rightData={rightData}
              handleModelOk={this.handleModelOk}
              code={this.state.code}
              projectId={this.state.projectId}
              menuId={this.props.menuInfo.id}
              bizType={this.props.menuInfo.menuCode}
              bizId={this.state.rightData ? this.state.rightData.id : null}
              fileEditAuth={true}
              extInfo={{
                startContent: '开工申请',
              }}
              openWorkFlowMenu={this.props.openWorkFlowMenu}
              taskFlag = {false}
              isShow={this.state.permission.indexOf('WORKAPPLY_FILE')==-1?false:true} //文件权限
              permission={this.state.permission}
            />
      </ExtLayout>
    );
  }
}

export default WorkApply;
