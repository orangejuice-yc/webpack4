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
    permission:[]
  };
  componentDidMount() {
    let menuCode = 'SECURITY-EXTERNALTRAINING'
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
              API.queryTrainDisclosureList(page, size) +
                queryParams({
                  projectId: this.state.projectId,
                  sectionIds: this.state.sectionIds,
                  ...this.state.params,
                  intExt: 1,
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
    //           API.queryTrainDisclosureList(page, size) +
    //             queryParams({
    //               projectId: this.state.projectId,
    //               sectionIds: this.state.sectionIds,
    //               ...this.state.params,
    //               intExt: 1,
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
  handleAddData = () => {
    this.table.recoveryPage(1);
    this.table.getData();
  }
  // 获取项目回掉 清空搜索条件 和 标段
  openPro = (...args) => {
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
    axios.deleted(API.delTrainDisclosure(), { data: this.state.selectedRowKeys }, true).then(() => {
      this.setState({ selectedRowKeys: [] });
      this.table.getData();
    });
  };
  // 发布审批
  handleApproval = ()=>{
  }
  // info更新回掉
  updatetableCallBack = val => {
    // this.setState({
    //   record: data,
    // });
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
            sectionIds={this.state.sectionIds}
            projectName={this.state.projectName}
            openPro={this.openPro}
            openSection={this.openSection}
            handleAddData={this.handleAddData}
            handleSearch={this.handleSearch}
            selectedRowKeys={this.state.selectedRowKeys}
            handleDeleteData={this.handleDeleteData}
            bizType={this.props.menuInfo.menuCode}
            params={this.state.params}
            sectionId={this.state.sectionIds}
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
                  onChangeCheckBox={selectedRowKeys => this.setState({ selectedRowKeys })}
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
          extInfo={{ startContent: '外部培训' }}
          openWorkFlowMenu={this.props.openWorkFlowMenu}
          taskFlag = {false}
          isCheckWf={true}  //流程查看
          isShow={this.state.permission.indexOf('EXTERNALTRAINING_FILE-EX-TRAINING')==-1?false:true} //文件权限
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
    width: '10%',
  },
  {
    title: '标段名称',
    dataIndex: 'sectionName',
    key: 'sectionName',
    width: '10%',
  },
  {
    title: '培训单位',
    dataIndex: 'trainUnitName',
    key: 'trainUnitName',
    width: '10%',
  },
  {
    title: '培训名称',
    dataIndex: 'trainName',
    key: 'trainName',
    width: '10%',
  },
  {
    title: '培训时间',
    dataIndex: 'trainTime',
    key: 'trainTime',
    width: '10%',
  },
  {
    title: '培训地点',
    dataIndex: 'trainLocation',
    key: 'trainLocation',
    width: '10%',
  },
  {
    title: '培训学时',
    dataIndex: 'trainLearnTime',
    key: 'trainLearnTime',
    width: '8%',
  },
  {
    title: '培训类型',
    dataIndex: 'trainTypeVo',
    key: 'trainTypeVo',
    render: obj => (obj ? obj.name : ''),
    width: '8%',
  },
  {
    title: '状态',
    dataIndex: 'statusVo.name',
    key: 'statusVo.name',
    width: '5%',
  },
  {
    title: '创建人员',
    dataIndex: 'creater',
    key: 'creater',
    width: '6%',
  },
  {
    title: '创建时间',
    dataIndex: 'creatTime',
    key: 'creatTime',
    width: '7%',
  },
  {
    title: '附件状态',
    key: 'fileStatusVo',
    dataIndex: 'fileStatusVo',
    render: obj => (obj ? obj.name : ''),
    width: '6%',
  },
];
