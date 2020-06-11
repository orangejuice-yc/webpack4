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
class StopReworkApply extends Component {
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
      code: false,
      projectName: '',
      applyType:2,//0
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
  // 递归获取Id
  getIds = (dats, idArr) => {
    if (dats) {
      dats.forEach((item, index, arr) => {
        idArr.push(item.id);
        this.getIds(item.children, idArr);
      });
    }
  };
  // 点击获取行信息
  getInfo = (record, index) => {
    const { activeIndex } = this.state;
    const { id } = record;
    this.setState({
        activeIndex: id,
        record: record,
        rightData: record
    });

    // axios.get(queryStopRework(id)).then(res => {
    //   const { data } = res.data;
    //   if (data.statusVo && data.statusVo.code === 'INIT') {
    //     this.setState({ code: false });
    //   } else {
    //     this.setState({ code: true });
    //   }
    //   this.setState({
    //     activeIndex: data.id,
    //     rightData: data,
    //   });
    // });
  };
  // 搜索日派工单数据列表
  getList= (currentPageNum, pageSize, callBack) =>{
    const {applyType,searchParam,sectionIds} = this.state;
    axios.get(queryStopReworkList(applyType,pageSize,currentPageNum), {
      // params: { projectId, sectionIds: ids,...searchParam },
      params: {...searchParam},
    }).then(res=>{
        callBack(res.data.data ? res.data.data : [])
        const { data, total } = res.data;
        if (data.length === 0 && currentPageNum > 1) {
          this.setState({ currentPageNum: currentPageNum - 1 }, () => {
            this.getList(projectId, sectionIds);
          });
        }
        this.setState({ data, loading: false, total });
    }).finally(err => {
      this.setState({ loading: false });
    });
  }
  // getList = (projectId, sectionIds) => {
  //   const { pageSize, currentPageNum ,applyType,searchParam} = this.state;
  //   let ids;
  //   if (Array.isArray(sectionIds)) {
  //     ids = sectionIds.join();
  //   } else {
  //     ids = sectionIds;
  //   }
  //   axios
  //     .get(queryStopReworkList(applyType, pageSize, currentPageNum), {
  //       // params: { projectId, sectionIds: ids,...searchParam },
  //       params: {projectId,...searchParam },
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
    let loginUser = JSON.parse(sessionStorage.getItem('userInfo'));
    this.setState({
      loginUser
    })
  }
  // 新增回调
  addData = newData => {
    this.table.recoveryPage(1);
    this.table.getData();
    this.setState({
      rightData:null,
      record:null
    })
  };
  // 删除回调
  deleteData = () => {
    const {selectedRows} = this.state;
    const deleteArray = [];
    selectedRows.forEach((value,item)=>{
      if(value.statusVo.code == 'INIT' && (this.state.loginUser.id == value.creator) ){
        deleteArray.push(value.id)
      }else{
        notification.warning(
          {
            placement: 'bottomRight',
            bottom: 50,
            duration: 2,
            message: '提示',
            description: "非新建状态、非创建人数据不能删除"
          }
        );
        return false;
      }
    }) 
    if(deleteArray.length > 0){
      axios.deleted(delStopRework()+ `?applyType=${this.state.applyType}`, {data:deleteArray}, true).then(res => {
        // this.getList(this.state.projectId,this.state.sectionId);
        this.table.getData();
        this.setState({
          selectedRows:[],
          selectedRowKeys:[],
          rightData:null,
          record:null
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
    this.table.recoveryPage(1)
      this.setState({
        searchParam
      },()=>{
        this.table.getData();
      })
  }
  updateFlow =()=>{
    this.table.getData();
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
    // //分页调用配置
    // const pagination = {
    //   total,
    //   currentPageNum,
    //   pageSize,
    //   showSizeChanger: true,
    //   showQuickJumper: true,
    //   size: 'small',
    //   showTotal: total => `总共${total}条`,
    //   onShowSizeChange: (currentPageNum, size) => {
    //     this.setState(
    //       {
    //         pageSize: size,
    //         currentPageNum: 1,
    //       },
    //       () => {
    //         this.getList(this.state.projectId, this.state.sectionId, '');
    //       }
    //     );
    //   },
    //   onChange: (page, pageSize) => {
    //     this.setState(
    //       {
    //         pageSize,
    //         currentPageNum: page,
    //       },
    //       () => {
    //         this.getList(this.state.projectId, this.state.sectionId, '');
    //       }
    //     );
    //   },
    // };
    
    return (
        <ExtLayout renderWidth={({ contentWidth }) => { this.setState({ contentWidth }) }}>
          <Toolbar>
                <TopTags
                // data1={projectId}
                selectedRowKeys={selectedRowKeys}
                addData={this.addData}
                deleteData={this.deleteData}
                search = {this.search}
                applyType = {this.state.applyType}
                // -
                searchParam={this.state.searchParam}
                menuInfo = {this.props.menuInfo}
                menuCode={this.props.menuInfo.menuCode}
                bizType={this.props.menuInfo.menuCode}
                // projectId={projectId}
                sectionId={this.state.sectionId}
                projectName={this.state.projectName}
                updateFlow={this.updateFlow}
                permission={this.state.permission}
                loginUser = {this.state.loginUser}
                rightData={rightData}
              />
          </Toolbar>
          <MainContent contentWidth={this.state.contentWidth} contentMinWidth={1100}>
                {/* <Table
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
                    /> */}
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
              loginUser = {this.state.loginUser}
              fileEditAuth={true}
              extInfo={{
                startContent: '停复工申请',
              }}
              openWorkFlowMenu={this.props.openWorkFlowMenu}
              taskFlag = {false}
              isCheckWf={true}  //流程查看
              isShow={this.state.permission.indexOf('STOPREVORKAPPLY1_FILE-RETURN-WORK')==-1?false:true} //文件权限
              fileRelease={this.state.permission.indexOf('STOPREVORKAPPLY1_FILE-RETURN-WORK')==-1?false:true}//文件发布权限
              permission={this.state.permission}
            />
        </ExtLayout>
);
  }
}
const columns = [
  // {
  //   title: '申请编号',
  //   dataIndex: 'applyNum',
  //   key: 'applyNum',
  // },
  {
    title: '项目名称',
    dataIndex: 'projectDictVo',
    key: 'projectDictVo',
    render:(text,record)=>{
      return (!text || !text.name)?'':text.name
    }
  },
  {
    title: '标段名称',
    dataIndex: 'sectionName',
    key: 'sectionName',
  },
  {
    title: '单位名称',
    dataIndex: 'company',
    key: 'company',
  },
  // {
  //   title: '合同号',
  //   dataIndex: 'contract',
  //   key: 'contract',
  // },
 
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
    title: '申请复工日期 ',
    dataIndex: 'stopReworkDate',
    key: 'stopReworkDate',
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
    title: '创建日期',
    dataIndex: 'creatTime',
    key: 'creatTime',
  },
];

export default StopReworkApply;
