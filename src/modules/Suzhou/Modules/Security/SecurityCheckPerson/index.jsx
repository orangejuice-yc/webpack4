import React from 'react';
import RightTags from '@/components/public/RightTags';
import TopTags from '../SecurityCheck/TopTags/index';
import axios from '@/api/axios';
import * as API from '@/modules/Suzhou/api/suzhou-api';
import ExtLayout from '@/components/public/Layout/ExtLayout';
import MainContent from '@/components/public/Layout/MainContent';
import Toolbar from '@/components/public/Layout/Toolbar';
import PublicTable from '@/components/PublicTable';
import { firstLoad } from '@/modules/Suzhou/components/Util/firstLoad';
import { queryParams } from '@/modules/Suzhou/components/Util/util';
import notificationFun from '@/utils/notificationTip';

export default class extends React.Component {
  state = {
    selectedRowKeys: [],
    selectedRows:[],
    projectId: '',
    projectName: '',
    sectionIds: '',
    record: null,
    params: {},
    status: false,
    checkStatus:'',
    permission:[],
    isShow:'',  //文件编辑权限
    problemShow:'', //问题编辑权限
    problemSendShow:'', //问题发布权限
  };
  componentDidMount() {
    let menuCode = this.props.menuInfo.menuCode
    axios.get(API.getPermission(menuCode)).then((res)=>{
      let permission = []
      res.data.data.map((item,index)=>{
        permission.push(item.code)
      })
      if(menuCode=='SECURITY-SECURITYCHECK'){
        this.setState({
          isShow:'SECURITYCHECK_FILE-ORG-CHECK',
          problemShow:'SECURITYCHECK_EDIT-PRO-ORGCHECK',
          problemSendShow:'SECURITYCHECK_RELEASE-PRO-ORGCHECK',
          checkStatus:'1'
        })
      }else if(menuCode=='SECURITY-SECURITYCHECKONLY'){
        this.setState({
          isShow:'SECURITYCHECKONLY_FILE-PERSON-CHECK',
          problemShow:'SECURITYCHECKONLY_EDIT-PRO-PERCHECK',
          problemSendShow:'SECURITYCHECKONLY_RELEASE-PRO-PERCHECK',
          checkStatus:'0'
        })
      }
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
    let menuCode = this.props.menuInfo.menuCode
      let checkStatus = ''
      if(menuCode=='SECURITY-SECURITYCHECK'){
          checkStatus='1'
      }else if(menuCode=='SECURITY-SECURITYCHECKONLY'){
          checkStatus='0'
      }
      this.setState({checkStatus});
      axios
      .get(
        API.querySecurityCheckList(size, page) +
          queryParams({
            projectId: this.state.projectId,
            sectionIds: this.state.sectionIds,
            ...this.state.params,
            checkStatus:this.state.checkStatus,
            // 安全检查跳转过来参数
            checkId: sessionStorage['ConstructionEvaluation'] || '',
          })
      )
      .then(response => {
        console.log('安全检查res',response)
        if (sessionStorage['ConstructionEvaluation']) {
          delete sessionStorage['ConstructionEvaluation'];
        }
        const { data } = response['data'];
        this.setState({
          total:response.data.total
        })
        callBack(data);
      });
    // firstLoad().then(({ projectId, projectName, sectionId }) => {
      
    //   this.setState(
    //     () => ({ projectId, projectName, sectionIds: sectionId ,checkStatus}),
    //     () => {
    //       axios
    //         .get(
    //           API.querySecurityCheckList(size, page) +
    //             queryParams({
    //               projectId: this.state.projectId,
    //               sectionIds: this.state.sectionIds,
    //               ...this.state.params,
    //               checkStatus:this.state.checkStatus,
    //               // 安全检查跳转过来参数
    //               checkId: sessionStorage['ConstructionEvaluation'] || '',
    //             })
    //         )
    //         .then(response => {
    //           console.log('安全检查res',response)
    //           if (sessionStorage['ConstructionEvaluation']) {
    //             delete sessionStorage['ConstructionEvaluation'];
    //           }
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
    const deleteArray = [];
    const {selectedRows} = this.state;
    selectedRows.forEach((value,item)=>{
        if(value.statusVo.code == 'INIT'){
            deleteArray.push(value.id)
        }else{
            notificationFun("提示",'非新建不能删除');
            return false;
        }
    })  
    if(deleteArray.length >0){
        axios.deleted(API.delSecurityCheck(), {data:deleteArray}, true).then(res => {
          this.setState({ selectedRowKeys: [], selectedRows:[]});
          this.table.getData();
        }).catch(err => {
        });
    }
    // axios.deleted(API.delSecurityCheck(), { data: this.state.selectedRowKeys }, true).then(() => {
    //   this.setState({ selectedRowKeys: [] });
    //   this.table.getData();
    // });
  };
  // info更新回掉
  updatetableCallBack = data => {
    this.setState({
      record: null,
    });
    this.table.getData();
  };
  //点击显示查看
  viewDetail = (record) => {
    axios.view(API.dySecurityCheckWord+`?id=${record.id}&checkStatus=0`).then(res=>{})
  }
  render() {
    const {isShow,problemShow,problemSendShow} = this.state;
    const columns = [
      {
        title: '检查编号',
        dataIndex: 'code',
        width:'10%',
        key: 'code',
        align: 'center',
        render(text, record) {
          return <span title={text ? text : null}>{text ? text : null}</span>
          }
      },
      {
        title: '检查标题',
        dataIndex: 'stationPointInfo',
        width:'7%',
        key: 'stationPointInfo',
        align: 'center',
        render(text, record) {
          return <span title={text ? text : null}>{text ? text : null}</span>
          }
      },
      {
        title: '项目名称',
        dataIndex: 'projectName',
        width:'9%',
        key: 'projectName',
        align: 'center',
        render(text, record) {
          return <span title={text ? text : null}>{text ? text : null}</span>
          }
      },
      {
        title: '检查类型',
        dataIndex: 'jclxVo',
        width:'7%',
        key: 'jclxVo',
        align: 'center',
        render(text, record) {
          return <span title={text ? text.name : null}>{text ? text.name : null}</span>
          }
      },
      {
        title: '检查地点',
        dataIndex: 'checkLocation',
        width:'7%',
        key: 'checkLocation',
        align: 'center',
        render(text, record) {
          return <span title={text ? text : null}>{text ? text : null}</span>
          }
      },
      {
        title: '检查时间',
        dataIndex: 'jcsx',
        key: 'jcsx',
        width:'7%',
        align: 'center',
        render(text, record) {
          return <span title={text ? text : null}>{text ? text : null}</span>
          }
      },
      {
        title: '受检单位',
        dataIndex: 'sjdw',
        width:'7%',
        key: 'sjdw',
        align: 'center',
        render(text, record) {
          return <span title={text ? text : null}>{text ? text : null}</span>
          }
      },
      {
        title: '主要施工内容',
        dataIndex: 'constructionContent',
        width:'12%',
        key: 'constructionContent',
        align: 'center',
        render(text, record) {
          return <span title={text ? text : null}>{text ? text : null}</span>
          }
      },
      // {
      //   title: '问题闭环个数',
      //   dataIndex: 'bhNums',
      //   width:'7%',
      //   key: 'bhNums',
      //   align: 'center',
      //   render(text, record) {
      //     return <span title={text ? text : null}>{text ? text : null}</span>
      //     }   
      // },
      {
        title: '问题总数',
        dataIndex: 'wtNums',
        width:'6%',
        key: 'wtNums',
        align: 'center',
        render(text, record) {
          return <span title={text ? text : null}>{text ? text : null}</span>
          }
      },
      {
        title: '未闭环问题个数',
        dataIndex: 'wbhNums',
        width:'7%',
        key: 'wbhNums',
        align: 'center',
        render(text, record) {
          return <span style={{color:'red'}} title={text ? text : null}>{text ? text : null}</span>
          }  
      },
      {
        title: '创建时间',
        key: 'creatTime',
        dataIndex: 'creatTime',
        width:'7%',
        align: 'center',
        render(text, record) {
          return <span title={text ? text : null}>{text ? text : null}</span>
          }
      },
      {
        title: '创建人',
        dataIndex: 'creater',
        key: 'creater',
        width:'7%',
        align: 'center',
        render(text, record) {
          return <span title={text ? text : null}>{text ? text : null}</span>
          }
      }, 
      {
        title: "审批预览",
        width: 80,
        render: (text, record) => {
          return <a onClick={this.viewDetail.bind(this, record)} style={{ cursor: 'pointer' }}>预览</a>
        }
      }
    ];
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
            checkStatus={this.state.checkStatus}
            permission={this.state.permission}
            rightData={this.state.record}
          />
        </Toolbar>
        {/* contentWidth={this.state.contentWidth}  contentWidth = {document.body.clientWidth} */}
        <MainContent contentMinWidth={1800}>
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
                  onChangeCheckBox={(selectedRowKeys,selectedRows, target) => {
                    let bool = true;
                    // if (target.length > 0) {
                    //   bool = target.every(item => item.statusVo.code === 'INIT');
                    // } else {
                    //   bool = false;
                    // }
                    this.setState({ selectedRowKeys, status: bool,selectedRows });
                  }}
                  // scroll={{ x: 1800, y: this.props.height-100}}
                />
          }
         
        </MainContent>
        <RightTags
          isEdit = {true}
          rightData={this.state.record}
          updatetableCallBack={this.updatetableCallBack}
          menuInfo={this.props.menuInfo}
          // 文件
          menuCode={this.props.menuInfo.menuCode}
          projectId={this.state.projectId}
          menuId={this.props.menuInfo.id}
          bizType={this.props.menuInfo.menuCode}
          bizId={this.state.record ? this.state.record.id : null}
          fileEditAuth={true}
          extInfo={{ startContent: '外部培训' }}
          projectName = {this.state.projectName}
          openWorkFlowMenu={this.props.openWorkFlowMenu}
          taskFlag = {true}
          isShow={this.state.permission.indexOf(isShow)==-1?false:true} //文件权限
          problemShow={this.state.permission.indexOf(problemShow)==-1?false:true}//问题权限
          problemSendShow={this.state.permission.indexOf(problemSendShow)==-1?false:true}//问题发布权限
          permission={this.state.permission}
          checkStatus = {this.state.checkStatus}
          sectionType = 'multiple'
        />
      </ExtLayout>
    );
  }
}

