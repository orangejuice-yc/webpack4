import React from 'react';
import RightTags from '@/components/public/RightTags/index';
import TopTags from './TopTags/index';
import axios from '@/api/axios';
import * as API from '@/modules/Suzhou/api/suzhou-api';
import ExtLayout from '@/components/public/Layout/ExtLayout';
import MainContent from '@/components/public/Layout/MainContent';
import Toolbar from '@/components/public/Layout/Toolbar';
import PublicTable from '@/components/PublicTable';
import { queryParams } from '@/modules/Suzhou/components/Util/util';
import moment from 'moment';

export default class extends React.Component {
  state = {
    selectedRowKeys: [],
    record: null,
    params: {dep:''},
    data: [],
    year: moment(new Date()).format('YYYY'),
    permission:[]
  };
  componentDidMount() {
    let menuCode = 'SECURITY-HOURSSTATISTICS'
    axios.get(API.getPermission(menuCode)).then((res)=>{
      let permission = []
      res.data.data.map((item,index)=>{
        permission.push(item.code)
      })
      this.setState({
        permission
      })
    })
  }
  getList = (size, page, callBack) => {
    axios
      .get(
        API.queryTrainTimeStatisticsList(page, size) +
          queryParams({
            ...this.state.params,
            intExt: 0,
          })
      )
      .then(response => {
        let { data } = response['data'];
        data = data.map((item, index) => ({ ...item, id: index + 1 }));
        this.setState({ data: data || [],total:response.data.total });
        callBack(data);
      });
  };
  // 获取年
  getYear = time => {
    this.setState({
      year: time,
    });
  };
  // 获取当前行的信息
  getInfo = record => this.setState({ record });
  // 新增回掉
  handleAddData = () =>{
    this.table.recoveryPage(1);
    this.table.getData();
  } 
  // 搜索回掉
  handleSearch = data =>{
    this.table.recoveryPage(1);
    this.setState({ params: { ...this.state.params, ...data } }, () => this.table.getData());
  }
  // 更新回掉
  updatetableCallBack = data => {
    this.setState({
      record: data,
    });
    this.table.getData();
  };
  // 删除回掉
  handleDeleteData = () => {
    axios.deleted(API.delTrainDisclosure(), { data: this.state.selectedRowKeys }, true).then(() => {
      this.setState({ selectedRowKeys: [] });
      this.table.getData();
    });
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
            handleAddData={this.handleAddData}
            handleSearch={this.handleSearch}
            selectedRowKeys={this.state.selectedRowKeys}
            handleDeleteData={this.handleDeleteData}
            params={this.state.params}
            data={this.state.data}
            getYear={this.getYear}
            permission={this.state.permission}
          />
        </Toolbar>
        <MainContent contentWidth={this.state.contentWidth} contentMinWidth={1100}>
          <PublicTable
            columns={columns}
            pagination={true}
            rowSelection={true}
            onRef={ref => (this.table = ref)}
            total={this.state.total}
            getRowData={this.getInfo}
            getData={this.getList}
            pageSize={10}
            onChangeCheckBox={selectedRowKeys => this.setState({ selectedRowKeys })}
          />
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
          extInfo={{ startContent: '内部培训' }}
          year={this.state.year}
        />
      </ExtLayout>
    );
  }
}
const columns = [
  {
    title: '姓名',
    dataIndex: 'workerName',
    key: 'workerName',
    width: '10%',
  },
  {
    title: '性别',
    dataIndex: 'sexVo',
    key: 'sexVo',
    render: obj => (obj ? obj.name : ''),
    width: '10%',
  },
  {
    title: '文化程度',
    dataIndex: 'eduVo',
    key: 'eduVo',
    render: obj => (obj ? obj.name : ''),
    width: '10%',
  },
  {
    title: '入司时间',
    dataIndex: 'entryDate',
    key: 'entryDate',
    width: '10%',
  },

  {
    title: '部门',
    dataIndex: 'orgName',
    key: 'orgName',
    width: '10%',
  },
  {
    title: '职务',
    dataIndex: 'positionVo',
    key: 'positionVo',
    render: obj => (obj ? obj.name : ''),
    width: '10%',
  },
  {
    title: '机电中心培训学时',
    dataIndex: 'jdzxTotalTime',
    key: 'jdzxLearnTime',
    width: '20%',
  },
  {
    title: '部门培训学时',
    dataIndex: 'bmTotalTime',
    key: 'bmTotalTime',
    width: '20%',
  },
];
