import React from 'react';
import RightTags from '@/components/public/RightTags';
import TopTags from './TopTags/index';
import axios from '@/api/axios';
import * as API from '@/modules/Suzhou/api/suzhou-api';
import ExtLayout from '@/components/public/Layout/ExtLayout';
import MainContent from '@/components/public/Layout/MainContent';
import Toolbar from '@/components/public/Layout/Toolbar';
import PublicTable from '@/components/PublicTable';
import { firstLoad } from '@/modules/Suzhou/components/Util/firstLoad';
import { queryParams } from '@/modules/Suzhou/components/Util/util';

export default class extends React.Component {
  state = {
    rightData: null,
    selectedRowKeys: [],
    projectId: '',
    projectName: '',
    sectionIds: '',
    record: null,
    params: {},
    status: false,
    permission:[]
  };
  componentDidMount() {
    let menuCode = 'SECURITY-PROCEDURES'
    axios.get(API.getPermission(menuCode)).then((res)=>{
      let permission = []
      res.data.data.map((item,index)=>{
        permission.push(item.code)
      })
      this.setState({
        permission
      })
    })
    firstLoad().then(({ projectId, projectName, sectionId })=>{
      this.setState({
        projectId, projectName, sectionIds: sectionId
      })
    })
  }
  getInfo = record => this.setState({ record });
  getList = (size, page, callBack) => {
    axios.get(
              API.querySubcontrApprovalList(size, page) +
                queryParams({
                  projectId: this.state.projectId,
                  sectionIds: this.state.sectionIds,
                  ...this.state.params,
                })
            )
            .then(response => {
              const { data } = response['data'];
              this.setState({
                total:response.data.total
              })
              callBack(data);
            });
    // firstLoad().then(({ projectId, projectName, sectionId }) => {
    //   this.setState(
    //     () => ({ projectId, projectName, sectionIds: sectionId }),
    //     () => {
    //       axios
    //         .get(
    //           API.querySubcontrApprovalList(size, page) +
    //             queryParams({
    //               projectId: this.state.projectId,
    //               sectionIds: this.state.sectionIds,
    //               ...this.state.params,
    //             })
    //         )
    //         .then(response => {
    //           const { data } = response['data'];
    //           this.setState({
    //             total:response.data.total
    //           })
    //           callBack(data);
    //         });
    //     }
    //   );
    // });
  };
  // 新增回掉
  handleAddData = () =>{
    this.table.recoveryPage(1);
    this.table.getData();
  } 
  // 获取项目回掉
  openPro = (...args) => {
    const [projectIds, , projectName] = args;
    this.table.recoveryPage(1);
    this.setState(() => ({ projectId: projectIds[0], projectName ,sectionIds:''}), () => this.table.getData());
  };
  // 获取标段回掉 sectionIds -> []
  openSection = sectionIds => {
    this.table.recoveryPage(1);
    this.setState(() => ({ sectionIds: sectionIds.join(',') }), () => this.table.getData());
  };
  // 搜索回掉
  handleSearch = data => {
    this.table.recoveryPage(1);
    this.setState({ params: data }, () => this.table.getData());
  };
  // 删除回掉
  handleDeleteData = () => {
    axios.deleted(API.delSubcontrApproval(), { data: this.state.selectedRowKeys }).then(() => {
      this.setState({ selectedRowKeys: [] });
      this.table.getData();
    });
  };
  // info更新回掉
  updatetableCallBack = val => {
    // this.setState({ record: data });
    // this.table.getData();
      this.table.update(this.state.rightData, val);
        this.setState({
            record: val,
            rightData: val
      })
  };
  render() {
    return (
      <ExtLayout
        renderWidth={({ contentWidth }) => {
          this.setState({ contentWidth });
        }}
      >
        <Toolbar>
          <TopTags
            projectId={this.state.projectId}
            openPro={this.openPro}
            openSection={this.openSection}
            handleAddData={this.handleAddData}
            handleSearch={this.handleSearch}
            selectedRowKeys={this.state.selectedRowKeys}
            handleDeleteData={this.handleDeleteData}
            status={this.state.status}
            // 流程参数
            projectName={this.state.projectName}
            sectionId={this.state.sectionIds}
            projectId={this.state.projectId}
            params={this.state.params}
            bizType={this.props.menuInfo.menuCode}
            updateFlow={() => this.table.getData()}
            permission={this.state.permission}
            rightData={this.state.record}
          />
        </Toolbar>
        <MainContent contentWidth={this.state.contentWidth} contentMinWidth={1100}>
          {this.state.projectId && 
              <PublicTable
                  columns={columns}
                  pagination={true}
                  rowSelection={true}
                  useCheckBox={true}
                  onRef={ref => (this.table = ref)}
                  total={this.state.total}
                  getRowData={this.getInfo}
                  getData={this.getList}
                  pageSize={10}
                  onChangeCheckBox={(selectedRowKeys, target) => {
                    let bool = false;
                    if (target.length > 0) {
                      bool = target.every(item => item.statusVo.code === 'INIT');
                    } else {
                      bool = false;
                    }
                    this.setState({ selectedRowKeys, status: bool });
                  }}
                />
          }
        </MainContent>
        <RightTags
          isEdit = {true}
          menuCode={this.props.menuInfo.menuCode}
          rightData={this.state.record}
          updatetableCallBack={this.updatetableCallBack}
          menuInfo = {this.props.menuInfo}
          // 文件
          projectId={this.state.projectId}
          menuId={this.props.menuInfo.id}
          bizType={this.props.menuInfo.menuCode}
          bizId={this.state.record ? this.state.record.id : null}
          fileEditAuth={true}
          extInfo={{ startContent: '分包审批' }}
          openWorkFlowMenu={this.props.openWorkFlowMenu}
          projectName = {this.state.projectName}
          taskFlag = {false}
          isCheckWf={true}  //流程查看
          isShow={this.state.permission.indexOf('PROCEDURES_FILE-SUBCONTRACT')==-1?false:true} //文件权限
          problemShow={this.state.permission.indexOf('PROCEDURES_EDIT-PROBLEMSUBCONTR')==-1?false:true}//问题权限
          problemSendShow={this.state.permission.indexOf('PROCEDURES_RELEASE-SUBCONTRAPRO')==-1?false:true}//问题发布权限
          permission={this.state.permission}
        />
      </ExtLayout>
    );
  }
}

const columns = [
  {
    title: '分包编号',
    dataIndex: 'subcontrCode',
    key: 'subcontrCode',
    width: '10%',
  },
  {
    title: '标段号',
    dataIndex: 'sectionCode',
    key: 'sectionCode',
    width: '10%',
  },
  {
    title: '标段名称',
    dataIndex: 'sectionName',
    key: 'sectionName',
    width: '10%',
  },
  {
    title: '施工单位',
    dataIndex: 'sgdw',
    key: 'sgdw',
    width: '10%',
  },
  {
    title: '分包单位名称',
    dataIndex: 'subcontrName',
    key: 'subcontrName',
    width: '10%',
  },
  {
    title: '分包类型',
    dataIndex: 'subcontrTypeVo',
    key: 'subcontrTypeVo',
    width: '10%',
    render: obj => (obj ? obj.name : ''),
  },
  {
    title: '签订日期',
    dataIndex: 'signDate',
    key: 'signDate',
    width: '10%',
  },
  {
    title: '状态',
    dataIndex: 'statusVo',
    key: 'statusVo',
    render: obj => (obj ? obj.name : ''),
    width: '10%',
  },
  {
    title: '创建人',
    dataIndex: 'creater',
    key: 'creater',
    width: '10%',
  },
  {
    title: '创建日期',
    key: 'creatTime',
    dataIndex: 'creatTime',
    width: '10%',
  },
];
