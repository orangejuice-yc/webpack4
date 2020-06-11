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
import { notification, AutoComplete } from 'antd';
export default class extends React.Component {
  state = {
    selectedRowKeys: [],
    record: null,
    projectId: '',
    sectionIds: '',
    params: {},
    projectName: '',
    auth: false, // 只有属于自己 的部门才能操作
    status: false,
    permission:[],
    myLoading:false, //判断是否从消息过来，然后加载table
  };
  componentDidMount() {
    let menuCode = 'SECURITY-SAFETYASSESSMENT'
    axios.get(API.getPermission(menuCode)).then((res)=>{
      let permission = []
      res.data.data.map((item,index)=>{
        permission.push(item.code)
      })
      this.setState({
        permission
      })
    })
    const mySafetyAssessment = JSON.parse(localStorage.getItem("mySafetyAssessment"));
    if(!mySafetyAssessment){
      this.setState({
        myLoading:true,
      })
    }else{
      this.setState({
        myLoading:true,
        mySafetyAssessment,
      })
     
    }
  }
  getList = (size, page, callBack) => {
    const mySafetyAssessment = JSON.parse(localStorage.getItem("mySafetyAssessment"));
    if(!mySafetyAssessment){
      axios.get(
        API.querySecurityExaminationList(page, size) +
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
    }else{
      axios.get(
        API.querySecurityExaminationList(100, size) +
          queryParams({
            bkhrId:mySafetyAssessment.id
          })
      )
      .then(response => {
        localStorage.removeItem('mySafetyAssessment');
        const { data } = response['data'];
        this.setState({
          total:response.data.total
        })
        callBack(data);
      });
    }
    
  };
  // 获取当前行的信息
  getInfo = record => {
    const { id } = JSON.parse(sessionStorage['userInfo']);
    const userId = record.bkhrId;
    this.setState({ auth: id + '' === userId + '' });
    this.setState({ record });
  };
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
  // 新增回掉
  handleAddData = () =>{
    this.table.recoveryPage(1);
    this.table.getData();
  } 
  // 搜索回掉
  handleSearch = data =>{
    this.table.recoveryPage(1);
    this.setState({ params: data }, () => this.table.getData());
  } 
  // 更新回掉
  updatetableCallBack = data => {
    this.setState({
      record: data,
    });
    this.table.getData();
  };
  //更新回调
  updateSuccess=(val)=>{
    this.setState({record:val});
    this.table.update(this.state.rightData, val)
  }
  // 删除回掉
  handleDeleteData = () => {
    axios
      .deleted(API.delSecurityExamination, { data: this.state.selectedRowKeys }, true)
      .then(() => {
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
            rightData={this.state.record}
            menu = {this.props.menuInfo}
          />
        </Toolbar>
        <MainContent contentWidth={this.state.contentWidth} contentMinWidth={1100}>
          {this.state.myLoading && (
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
                  // const { id } = JSON.parse(sessionStorage['userInfo']);
                  // const auth = target.every(item => item.bkhrId + '' === id + '');
                  if (target.length > 0) {
                    bool = target.every(item => item.statusVo.code === 'INIT');
                  } else {
                    bool = false;
                  }
                  // if (!auth) {
                  //   notification.warning({
                  //     placement: 'bottomRight',
                  //     bottom: 50,
                  //     duration: 1,
                  //     message: '提示',
                  //     description: '非被考核人数据不可操作',
                  //   });
                  // }
                  this.setState({ selectedRowKeys, status: bool });
                }}
              />
          )}
        </MainContent>
        <RightTags
          rightData={this.state.record}
          updatetableCallBack={this.updatetableCallBack}
          auth={this.state.auth}
          handleAddData={this.handleAddData}
          // 文件
          menuCode={this.props.menuInfo.menuCode}
          projectId={this.state.projectId}
          menuId={this.props.menuInfo.id}
          bizType={this.props.menuInfo.menuCode}
          bizId={this.state.record ? this.state.record.id : null}
          fileEditAuth={true}
          extInfo={{ startContent: '内部培训' }}
          taskFlag = {false}
          isCheckWf={true}  //流程查看
          openWorkFlowMenu={this.props.openWorkFlowMenu}
          permission={this.state.permission}
          updateSuccess={this.updateSuccess}
        />
      </ExtLayout>
    );
  }
}
const columns = [
  {
    title: '部门',
    dataIndex: 'orgName',
    key: 'orgName',
  },
  {
    title: '被考核人姓名',
    dataIndex: 'bkhrXm',
    key: 'bkhrXm',
  },
  {
    title: '被考核人职位',
    dataIndex: 'bkhrZw',
    key: 'bkhrZw',
  },
  {
    title: '考核时间',
    dataIndex: 'khsj',
    key: 'khsj',
  },
  {
    title: '扣减分数',
    dataIndex: 'reduTotal',
    key: 'reduTotal',
  },
  {
    title: '实得分数',
    dataIndex: 'actTotal',
    key: 'actTotal',
  },
  {
    title: '评定',
    dataIndex: 'isPassVo',
    key: 'isPassVo',
    render: obj => (obj ? obj.name : ''),
  },
  {
    title: '考核人',
    dataIndex: 'assessmenter',
    key: 'assessmenter',
  },
  {
    title: '状态',
    dataIndex: 'statusVo',
    key: 'statusVo',
    render: obj => (obj ? obj.name : ''),
  },
];
