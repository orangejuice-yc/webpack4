import React from 'react';
import RightTags from '@/components/public/RightTags/index';
import TopTags from './TopTags/index';
import axios from '@/api/axios';
import * as API from '@/modules/Suzhou/api/suzhou-api';
import ExtLayout from '@/components/public/Layout/ExtLayout';
import MainContent from '@/components/public/Layout/MainContent';
import Toolbar from '@/components/public/Layout/Toolbar';
import PublicTable from '@/components/PublicTable';
import { firstLoad } from '@/modules/Suzhou/components/Util/firstLoad';
import { queryParams } from '@/modules/Suzhou/components/Util/util';
import moment from 'moment';

export default class extends React.Component {
  state = {
    selectedRowKeys: [],
    record: null,
    params: {},
    data: [],
    year: moment(new Date()).format('YYYY'),
    permission:[]
  };
  componentDidMount() {
    let menuCode = 'SECURITY-OUTHOURSSTATISTICS'
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
        projectId, projectName, sectionIds: sectionId,params:{...this.state.params,projectId,sectionIds:sectionId} 
      })
    })
  }
  getList = (size, page, callBack) => {
    axios.get(
      API.queryOutTrainTimeStatisticsList(page, size) +
        queryParams({
          ...this.state.params,
        })
    )
    .then(response => {
      let { data } = response['data'];
      data = data.map((item, index) => ({ ...item, id: index + 1 }));
      this.setState({ data: data || [],total:response.data.total });
      callBack(data);
    });

    // firstLoad().then(({ projectId, projectName, sectionId }) => {
    //   this.setState(
    //     () => ({ projectId, projectName, sectionIds: sectionId,params:{...this.state.params,projectId,sectionIds:sectionId} }),
    //     () => {
    //       axios
    //         .get(
    //           API.queryOutTrainTimeStatisticsList(page, size) +
    //             queryParams({
    //               ...this.state.params,
    //             })
    //         )
    //         .then(response => {
    //           let { data } = response['data'];
    //           data = data.map((item, index) => ({ ...item, id: index + 1 }));
    //           this.setState({ data: data || [],total:response.data.total });
    //           callBack(data);
    //         });
    //     }
    //   );
    // });

    
  };
  // 获取年
  getYear = time => {
    this.setState({
      year: time,
    });
  };
  // 获取当前行的信息
  getInfo = record => this.setState({ record });
  // 搜索回掉
  handleSearch = data =>{
    // this.table.recoveryPage(1);
    // this.setState({
    //   data
    // })
    // this.setState({ params: { ...this.state.params, ...data } }, () => this.table.getData());
  }
  // 更新回掉
  updatetableCallBack = data => {
    this.setState({
      record: data,
    });
    this.table.getData();
  };
  //搜索
  search =(val)=>{
    this.state.projectId?this.table.recoveryPage(1):'';
    const {selectDate,year} = this.state;
    this.setState({
      params:{
        ...this.state.params,year:this.state.year,trainUnitName:val
      }
    },()=>{
        if(!this.state.projectId){
            notificationFun('警告','请选择项目')
        }else{
            this.table.getData();
        }
    })
  }
  //打开项目
  openPro=(projectId,project,projectName)=>{
    !this.state.projectId?'':this.table.recoveryPage(1);
    this.setState({
        projectId:projectId[0],
        projectName,
        params:{
          ...this.state.params,projectId:projectId[0],sectionIds:''
        }
    },()=>{
        this.table.getData();
    })
  }
  //打开标段
  openSection = (sectionId,section)=>{
    this.table.recoveryPage(1);
    const {projectId} = this.state;
    this.setState({
        params:{
          ...this.state.params,sectionIds:sectionId.join(',')
        }
    },()=>{
        this.table.getData();
    })
  }
  render() {
    return (
      <ExtLayout
        renderWidth={({ contentWidth }) => {
          this.setState({ contentWidth });
        }}
      >
        <Toolbar>
          <TopTags
            handleSearch={this.handleSearch}
            selectedRowKeys={this.state.selectedRowKeys}
            params={this.state.params}
            data={this.state.data}
            getYear={this.getYear}
            search = {this.search}
            openPro = {this.openPro}
            openSection = {this.openSection}
            projectId={this.state.projectId}
            permission={this.state.permission}
          />
        </Toolbar>
        <MainContent contentWidth={this.state.contentWidth} contentMinWidth={1100}>
          {this.state.projectId && 
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
    title: '项目名称',
    dataIndex: 'projectName',
    key: 'projectName',
    width: '20%',
  },
  {
    title: '标段名称',
    dataIndex: 'sectionName',
    key: 'sectionName',
    width: '15%',
  },
  {
    title: '培训单位',
    dataIndex: 'trainUnitName',
    key: 'trainUnitName',
    width: '15%',
  },
  {
    title: '人员分类',
    dataIndex: 'typeVo',
    key: 'typeVo',
    width: '10%',
    render:text=>(text?text.name:''),
  },
  {
    title: '职务',
    dataIndex: 'jobVo',
    key: 'jobVo',
    width: '10%',
    render:text=>(text?text.name:''),
  },

  {
    title: '累计学时',
    dataIndex: 'totalTime',
    key: 'totalTime',
    width: '10%',
  },
  {
    title: '状态',
    dataIndex: 'isEntryVo',
    key: 'isEntryVo',
    render: obj => (obj ? obj.name : ''),
    width: '10%',
  },
];
