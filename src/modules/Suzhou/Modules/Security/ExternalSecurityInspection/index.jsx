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
    let menuCode = 'SCENE-CHECK'
    axios.get(API.getPermission(menuCode)).then((res)=>{
        let permission = []
        res.data.data.map((item,index)=>{
        permission.push(item.code)
        })
        this.setState({
        permission
        })
        console.log(res.data.data)
    })
}
  getInfo = record => this.setState({ record });
  getList = (size, page, callBack) => {
    firstLoad().then(({ projectId, projectName, sectionId }) => {
      this.setState(
        () => ({ projectId, projectName, sectionIds: sectionId }),
        () => {
          axios
            .get(
              API.queryOutUnitSecurityCheckList(size, page) +
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
        }
      );
    });
  };
  // 新增回掉
  handleAddData = () =>{
    this.table.recoveryPage(1);
    this.table.getData();
  } 
  // 获取项目回掉 清空搜索条件 和 标段
  openSection = (...args) => {
    const [projectIds, , projectName] = args;
    this.table.recoveryPage(1);
    this.setState(
      () => ({ projectId: projectIds[0], projectName, params: {}, sectionIds: '' }),
      () => this.table.getData()
    );
  };
  // 获取标段回掉 sectionIds -> []
  openPro = sectionIds => {
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
      .deleted(API.delOutUnitSecurityCheck, { data: this.state.selectedRowKeys }, true)
      .then(() => {
        this.setState({ selectedRowKeys: [] });
        this.table.getData();
      });
  };
  // info更新回掉
  updatetableCallBack = data => {
    this.setState({ record: data });
    this.table.getData();
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
            openPro={this.openPro}
            openSection={this.openSection}
            handleAddData={this.handleAddData}
            handleSearch={this.handleSearch}
            selectedRowKeys={this.state.selectedRowKeys}
            handleDeleteData={this.handleDeleteData}
            permission={this.state.permission}
          />
        </Toolbar>
        <MainContent contentWidth={this.state.contentWidth} contentMinWidth={1100}>
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
        </MainContent>
        <RightTags
          fileRelease={true}
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
          isShow={this.state.permission.indexOf('CHECK_FILE-SCENECHECK')==-1?false:true} //文件权限
          fileRelease={this.state.permission.indexOf('CHECK_FILE-ISSUESCENECHECK')==-1?false:true}//文件发布权限
          permission={this.state.permission}
        />
      </ExtLayout>
    );
  }
}
const columns = [
  {
    title: '检查编号',
    dataIndex: 'code',
    key: 'code',
  },
  {
    title: '检查标题',
    dataIndex: 'title',
    key: 'title',
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
    title: '检查单位',
    dataIndex: 'jcdwName',
    key: 'jcdwName',
  },
  {
    title: '检查类型',
    dataIndex: 'jclxVo',
    key: 'jclxVo',
    render: obj => (obj ? obj.name : ''),
  },
  {
    title: '创建人员',
    dataIndex: 'creater',
    key: 'creater',
  },
  {
    title: '创建时间',
    dataIndex: 'creatTime',
    key: 'creatTime',
  },
];
