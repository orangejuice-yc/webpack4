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
    let menuCode = 'SECURITY-CONSTRUCTIONEVALUATION'
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
    let constructQus = JSON.parse(localStorage.getItem("constructQus"))
    if(constructQus){
      const {projectId,sectionId,year,season} = constructQus
      axios.get(
              API.queryConstructEvaluationList(page, size) +
                queryParams({
                  projectId,sectionId,year,season
                })
            )
            .then(response => {
              const { data } = response['data'];
              this.setState({
                total:response.data.total
              })
              callBack(data);
            })
    }else{
    axios
            .get(
              API.queryConstructEvaluationList(page, size) +
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
            });}
    // firstLoad().then(({ projectId, projectName, sectionId }) => {
    //   this.setState(
    //     () => ({ projectId, projectName, sectionIds: sectionId }),
    //     () => {
    //       axios
    //         .get(
    //           API.queryConstructEvaluationList(page, size) +
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
  //导出
  handleExport = () => {
    axios.down(
      API.exportGetConstructEvaluation +
        queryParams({
          projectId: this.state.projectId,
          sectionIds: this.state.sectionIds,
          ...this.state.params,
        })
    );
  };
  // 新增回掉
  handleAddData = () => {
    this.table.recoveryPage(1);
    this.table.getData();
  }
  // 获取项目回掉 清空搜索条件 和 标段
  openPro = (...args) => {
    this.table.recoveryPage(1);
    const [projectIds, , projectName] = args;
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
    axios
      .deleted(API.delConstructEvaluation, { data: this.state.selectedRowKeys }, true)
      .then(() => {
        this.setState({ selectedRowKeys: [] });
        this.table.getData();
      });
  };
  // info更新回掉
  updatetableCallBack = val => {
    // this.setState({ record: data });
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
            projectName={this.state.projectName}
            projectId={this.state.projectId}
            sectionIds={this.state.sectionIds}
            openPro={this.openPro}
            openSection={this.openSection}
            handleAddData={this.handleAddData}
            handleSearch={this.handleSearch}
            selectedRowKeys={this.state.selectedRowKeys}
            handleDeleteData={this.handleDeleteData}
            handleExport={this.handleExport}
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
          fileRelease={true}
          openMenuByMenuCode={this.props.openMenuByMenuCode}
          rightData={this.state.record}
          updatetableCallBack={this.updatetableCallBack}
          // 文件
          menuCode={this.props.menuInfo.menuCode}
          projectId={this.state.projectId}
          menuId={this.props.menuInfo.id}
          bizType={this.props.menuInfo.menuCode}
          bizId={this.state.record ? this.state.record.id : null}
          fileEditAuth={true}
          extInfo={{ startContent: '施工考评' }}
          openWorkFlowMenu={this.props.openWorkFlowMenu}
          taskFlag = {false}
          isCheckWf={true}  //流程查看
          isShow={this.state.permission.indexOf('CONSTRUCTIONEVALUATION_FILE-SHIGONG-KAOPING')==-1?false:true} //文件权限
          fileRelease={this.state.permission.indexOf('CONSTRUCTIONEVALUATION_FILE-ISSUESHIGONGKAO')==-1?false:true}//文件发布权限
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
    title: '专业类型',
    dataIndex: 'professionVo',
    key: 'professionVo',
    render: obj => (obj ? obj.name : ''),
  },
  {
    title: '施工单位',
    dataIndex: 'sgdw',
    key: 'sgdw',
  },
  {
    title: '年份',
    dataIndex: 'year',
    key: 'year',
  },
  {
    title: '季度',
    dataIndex: 'seasonVo',
    key: 'seasonVo',
    render: obj => (obj ? obj.name : ''),
  },
  {
    title: '中心季度检查得分',
    dataIndex: 'zxjdScore',
    key: 'zxjdScore',
  },
  {
    title: '部门月度检查得分',
    dataIndex: 'bmydScore',
    key: 'bmydScore',
  },
  {
    title: '日常安全巡查得分',
    dataIndex: 'rcjcScore',
    key: 'rcjcScore',
  },
  {
    title: '季度考评综合得分',
    dataIndex: 'totalScore',
    key: 'totalScore',
  },
  {
    title: '排名',
    dataIndex: 'pm',
    key: 'pm',
  },
  {
    title: '状态',
    dataIndex: 'statusVo',
    key: 'statusVo',
    render: obj => (obj ? obj.name : ''),
  },
  {
    title: '发起人',
    dataIndex: 'initiator',
    key: 'initiator',
    width: '10%',
  },
  {
    title: '发起时间',
    key: 'initTime',
    dataIndex: 'initTime',
    width: '10%',
  },
];
