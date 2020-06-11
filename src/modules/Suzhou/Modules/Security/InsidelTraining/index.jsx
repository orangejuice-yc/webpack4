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
import { notification } from 'antd';
export default class extends React.Component {
  state = {
    selectedRowKeys: [],
    record: null,
    params: {},
    auth: false, // 只有属于自己 的部门才能操作
    permission:[],
    myTrainingFlag:false, //判断是否从消息过来，然后加载table
    setRecord:false,
    msgFlag:false
  };
  componentDidMount() {
    let menuCode = 'SECURITY-INSIDELTRAINING'
    axios.get(API.getPermission(menuCode)).then((res)=>{
      let permission = []
      res.data.data.map((item,index)=>{
        permission.push(item.code)
      })
      this.setState({
        permission
      })
    })

    const myTraining = JSON.parse(localStorage.getItem("myTraining"));
    if(!myTraining){
      this.setState({
        myTrainingFlag:true,
        // msgFlag:true,
      })
    }else{
      this.setState({
        myTrainingFlag:true,
        myTraining,
        // msgFlag:false
      })
     
    }
  }
  getListOne = (size, page, callBack)=>{
    const myTraining = JSON.parse(localStorage.getItem("myTraining"));
    axios.get(API.getqueryTrainDisclosureInfo(myTraining.id)).then((res)=>{
      callBack([res.data.data]);
      localStorage.removeItem('myTraining');
      this.table.getLineInfo(res.data.data);
      this.setState({total:1,setRecord:true,msgFlag:true})
    })
  }
  getList = (size, page, callBack) => {
    axios
      .get(
        API.queryTrainDisclosureList(page, size) +
          queryParams({
            ...this.state.params,
            intExt: 0,
          })
      )
      .then(response => {
        const { data } = response['data'];
        this.setState({
          total:response.data.total,
          setRecord:true,
          msgFlag:false
        })
        callBack(data);
      });
  };
  // 获取当前行的信息
  getInfo = record => {
    const { id } = JSON.parse(sessionStorage['userInfo']);
    const userId = record.creator;
    this.setState({ auth: id + '' === userId + '',record });
  };
  // 新增回掉
  handleAddData = () =>{
    this.table.recoveryPage(1);
    this.table.getData();
  } 
  refresh = ()=>{
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
  // 删除回掉
  handleDeleteData = () => {
    axios.deleted(API.delTrainDisclosure(), { data: this.state.selectedRowKeys }, true).then(() => {
      this.setState({ selectedRowKeys: [] });
      this.table.getData();
    });
  };
  render() {
    console.log(this.state.record);
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
            auth={this.state.auth}
            permission={this.state.permission}
          />
        </Toolbar>
        <MainContent contentWidth={this.state.contentWidth} contentMinWidth={1100}>
          {this.state.myTrainingFlag && 
            <PublicTable
            columns={columns}
            pagination={true}
            rowSelection={true}
            useCheckBox={true}
            onRef={ref => (this.table = ref)}
            total={this.state.total}
            getRowData={this.getInfo}
            getData={!this.state.myTraining?this.getList:this.getListOne}
            pageSize={10}
            onChangeCheckBox={(selectedRowKeys, target) => {
              const { id } = JSON.parse(sessionStorage['userInfo']);
              const auth = target.every(item => item.creator + '' === id + '');
              if (!auth) {
                notification.warning({
                  placement: 'bottomRight',
                  bottom: 50,
                  duration: 1,
                  message: '提示',
                  description: '非本人数据不可操作',
                });
              }
              this.setState({ auth });
              this.setState({ selectedRowKeys });
            }}
          />
        }
        </MainContent>
        {this.state.myTrainingFlag && this.state.setRecord &&(
              <RightTags
                  fileRelease={true}
                  rightData={this.state.record}
                  updatetableCallBack={this.updatetableCallBack}
                  auth={this.state.auth}
                  // 文件
                  menu={this.props.menuInfo}
                  menuCode={this.props.menuInfo.menuCode}
                  projectId={this.state.projectId}
                  menuId={this.props.menuInfo.id}
                  bizType={this.props.menuInfo.menuCode}
                  bizId={this.state.record ? this.state.record.id : null}
                  fileEditAuth={true}
                  extInfo={{ startContent: '内部培训' }}
                  isShow={this.state.permission.indexOf('INSIDELTRAINING_EDIT-FILE-IN-STAFF')==-1?false:true} //文件权限
                  permission={this.state.permission}
                  refresh = {this.refresh}
                  openRight={this.state.msgFlag}
                />
            )
        }
      </ExtLayout>
    );
  }
}
const columns = [
  {
    title: '培训类型',
    dataIndex: 'trainTypeVo',
    key: 'trainTypeVo',
    render: obj => (obj ? obj.name : ''),
  },
  {
    title: '发起部门',
    dataIndex: 'sponsorDep',
    key: 'sponsorDep',
  },
  {
    title: '培训名称',
    dataIndex: 'trainName',
    key: 'trainName',
  },
  {
    title: '培训时间',
    dataIndex: 'trainTime',
    key: 'trainTime',
  },
  {
    title: '培训地点',
    dataIndex: 'trainLocation',
    key: 'trainLocation',
  },
  {
    title: '培训学时',
    dataIndex: 'trainLearnTime',
    key: 'trainLearnTime',
  },
  {
    title: '创建人',
    dataIndex: 'creater',
    key: 'creater',
  },
  {
    title: '创建时间',
    dataIndex: 'creatTime',
    key: 'creatTime',
  },
  {
    title: '附件状态',
    dataIndex: 'fileStatusVo',
    key: 'fileStatusVo',
    render: obj => (obj ? obj.name : ''),
  },
];
