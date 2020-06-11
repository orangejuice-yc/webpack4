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
    let menuCode = 'SECURITY-MORTGAGE'
    axios.get(API.getPermission(menuCode)).then((res)=>{
      let permission = []
      res.data.data.map((item,index)=>{
        permission.push(item.code)
      })
      this.setState({
        permission
      })
    })
    firstLoad().then(({ projectId, projectName, sectionId }) =>{
      this.setState({
        projectId, projectName, sectionIds: sectionId
      })
    })
  }
  getInfo = record => this.setState({ record });
  getList = (size, page, callBack) => {
    axios
            .get(
              API.queryMortgageRefundList(page, size) +
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
    //           API.queryMortgageRefundList(page, size) +
    //             queryParams({
    //               projectId: this.state.projectId,
    //               sectionIds: this.state.sectionIds,
    //               ...this.state.params,
    //             })
    //         )
    //         .then(response => {
    //           const { data } = response['data'];
    //           this.setState({
    //               total:response.data.total
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
  // 获取项目回掉 清空搜索条件 和 标段
  openPro= (...args) => {
    const [projectIds, , projectName] = args;
    this.table.recoveryPage(1);
    this.setState(
      () => ({ projectId: projectIds[0], projectName, params: {}, sectionIds: '' }),
      () => this.table.getData()
    );
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
    axios.deleted(API.delMortgageRefund, { data: this.state.selectedRowKeys }, true).then(() => {
      this.setState({ selectedRowKeys: [] });
      this.table.getData();
    });
  };
  // info更新回掉
  updatetableCallBack = (data, bool) => {
    if (bool) {
      this.setState({ record: data });
    } else {
      this.setState({ record: data });
      this.table.getData();
    }
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
            projectName={this.state.projectName}
            projectId={this.state.projectId}
            sectionIds={this.state.sectionIds}
            openPro={this.openPro}
            openSection={this.openSection}
            handleAddData={this.handleAddData}
            handleSearch={this.handleSearch}
            selectedRowKeys={this.state.selectedRowKeys}
            handleDeleteData={this.handleDeleteData}
            params={this.state.params}
            status={this.state.status}
            bizType={this.props.menuInfo.menuCode}
            updateFlow={() => this.table.getData()}
            permission={this.state.permission}
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
          rightData={this.state.record}
          updatetableCallBack={this.updatetableCallBack}
          // 文件
          menuCode={this.props.menuInfo.menuCode}
          projectId={this.state.projectId}
          menuId={this.props.menuInfo.id}
          bizType={this.props.menuInfo.menuCode}
          bizId={this.state.record ? this.state.record.id : null}
          fileEditAuth={true}
          extInfo={{ startContent: '押金抵退还' }}
          openWorkFlowMenu={this.props.openWorkFlowMenu}
          taskFlag = {false}
          isCheckWf={true}  //流程查看
          isShow={this.state.permission.indexOf('MORTGAGE_FILE-MORTGAGE')==-1?false:true} //文件权限
          permission={this.state.permission}
        />
      </ExtLayout>
    );
  }
}
const columns = [
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
    title: '标段类型',
    dataIndex: 'sectionType',
    key: 'sectionType',
  },
  {
    title: '施工单位',
    dataIndex: 'sgdw',
    key: 'sgdw',
  },
  {
    title: '申请退还金额(万元)',
    dataIndex: 'sqthje',
    key: 'sqthje',
  },
  {
    title: '申请状态',
    dataIndex: 'statusVo',
    key: 'statusVo',
    render: obj => (obj ? obj.name : ''),
  },
  {
    title: '发起人',
    dataIndex: 'initiator',
    key: 'initiator',
  },
  {
    title: '发起时间',
    dataIndex: 'initTime',
    key: 'initTime',
  },
];
