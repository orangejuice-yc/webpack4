import { Fragment, Component } from 'react';
import { Table } from 'antd';
import TopTags from './TopTags';
import RightTags from '@/components/public/RightTags';
import axios from '@/api/axios';
import { queryQuaSuperv, deleteQuaSuperv, updateQuaSuperv } from '@/api/suzhou-api';
import { getPermission} from '@/modules/Suzhou/api/suzhou-api';
import notificationFun from '@/utils/notificationTip';
import style from './index.less';
import { firstLoad } from '@/modules/Suzhou/components/Util/firstLoad';
//布局
import ExtLayout from "@/components/public/Layout/ExtLayout";
import MainContent from "@/components/public/Layout/MainContent";
import Toolbar from "@/components/public/Layout/Toolbar";
import PublicTable from '@/components/PublicTable'
class RepSuper extends Component {
  state = {
    rightData: null, // 选中数据
    // 表格数据
    table: {
      data: null,
      total: '',
    },
    selectedRowKeys: [], // 分页器选中数据
    projectName:'',
    // 查询参数
    params: {
      projectId: '',
      sectionIds: '',
    },
    permission:[],
    isShow:'',  //文件编辑权限
    fileRelease:'', //文件发布权限 
    problemShow:'', //问题编辑权限
    problemSendShow:'', //问题发布权限
    editPermission:'',  //基本信息编辑权限
    scheduleEditPermission:'',  //情况说明编辑权限
  };
  /**
      * 父组件即可调用子组件方法
      * @method
      * @description 获取用户列表、或者根据搜索值获取用户列表
      * @param {string} record  行数据
      * @return {array} 返回选中用户列表
      */
     onRef = (ref) => {
      this.table = ref
  }
  /**
   * 获取复选框 选中项、选中行数据
   * @method updateSuccess
   * @param {string} selectedRowKeys 复选框选中项
   * @param {string} selectedRows  行数据
   */
  getSelectedRowKeys = (selectedRowKeys, selectedRows) => {
      this.setState({
          selectedRows,
          selectedRowKeys
      })
  }
  getInfo = (record)=>{
      const { activeIndex } = this.state;
      const { id } = record;
      this.setState({
          activeIndex: id,
          record: record,
          rightData: record
      });
  }
  // 增加
  handleAdd = data => {
    this.table.recoveryPage(1);
    this.table.getData();
    //this.getList(this.state.params, this.state.table.size, this.state.table.page);
  };
  // 删除
  handleDelete = () => {
    const { selectedRowKeys, rightData, table, params } = this.state;
    axios.deleted(deleteQuaSuperv(), { data: selectedRowKeys }, true).then(res => {
      // 当前页全删除 判断当前的页数如果大于1 那么调用上一页的接口
      // if (table.data.length === selectedRowKeys.length && table.page > 1) {
      //   this.getList(this.state.params, table.size, table.page - 1);
      // } else {
      //   // 调用当前页的接口刷新
      //   this.getList(this.state.params, table.size, table.page);
      // }
      // // 如果删除的数据中存在选择的数据那么清空
      // if (rightData) {
      //   this.setState({
      //     rightData: selectedRowKeys.some(id => rightData.id === id) ? null : rightData,
      //   });
      // }
      this.table.getData();
      this.setState({
        selectedRowKeys: [],
      });
    });
  };
  // 更新
  handleUpdate = val => {
    this.table.update(this.state.rightData, val)
    this.setState({         
      table: {
        ...this.state.table,
        data: this.state.table.data.map(item =>
          item.id === data['id']
            ? {
                ...item,
                registerNum: data['registerNum'],
                remark:data['remark']
              }
            : item
        ),
      },
      rightData: {
        ...this.state.rightData,
        registerNum: data['registerNum'],
        remark:data['remark']
      },
    });
  };
  // 搜索
  handleSearch = value => {
    if (this.state.params.projectId) {
      this.table.recoveryPage(1);
      this.setState(({ params }) => ({ params: { ...params, ...value } }), 
      () => this.table.getData());
    } else {
      notificationTip('请选择项目');
    }
    // if (!this.state.params.projectId) return notificationFun('请选择项目');

    // this.setState(
    //   ({ params }) => ({ params: { ...params, ...value } }),
    //   () => this.handleAsyncRequest(this.state.params)
    // );
  };
  // 接收到进展情况 已完成
  handleUpdateSchedule = data => {
    // this.getList(this.state.params, this.state.table.size, this.state.table.page);
    this.setState({
      rightData: {
        ...this.state.rightData,
        isConfirmVo: { ...this.state.rightData.isConfirmVo, code: '1' },
        registerNum: data['registerNum'],
      },
      table: {
        ...this.state.table,
        data: this.state.table.data.map(item =>
          item.id === data['supervisorId']
            ? {
                ...item,
                isConfirmVo: { name: '已确认', code: '1' },
                registerNum: data['registerNum'],
              }
            : item
        ),
      },
    });
  };
  render() {
    const {isShow,fileRelease,problemShow,problemSendShow} = this.state
    return (
      <ExtLayout renderWidth={({ contentWidth }) => { this.setState({ contentWidth }) }}>
      <Toolbar>
        <TopTags
          projectId={this.state.params.projectId}
          selectedRowKeys={this.state.selectedRowKeys}
          handleAdd={this.handleAdd}
          handleDelete={this.handleDelete}
          handleGetProjectId={this.handleGetProjectId}
          handleOpenSection={this.handleOpenSection}
          handleSearch={this.handleSearch}
          type={this.props.type}
          menuCode={this.props.menuInfo.menuCode}
          editPermission={this.state.editPermission}  //基本信息编辑权限
          permission={this.state.permission}       
        />
        </Toolbar>
        <MainContent contentWidth={this.state.contentWidth} contentMinWidth={1100}>
              {this.state.params.projectId && (
              <PublicTable
                onRef={this.onRef}
                pagination={true}
                getData={this.getList}
                columns={columns}
                rowSelection={true}
                onChangeCheckBox={this.getSelectedRowKeys}
                useCheckBox={true} 
                getRowData={this.getInfo}
                total={this.state.table.total}
                pageSize={10}
              />)}
              </MainContent>
            <RightTags
              // fileRelease={true}
              isEdit = {true}
              menuCode={this.props.menuInfo.menuCode}
              groupCode={1}
              rightData={this.state.rightData}
              projectId={this.state.params.projectId}
              menuInfo = {this.props.menuInfo}
              menuId={this.props.menuInfo.id}
              bizType={this.props.menuInfo.menuCode}
              bizId={this.state.rightData ? this.state.rightData.id : null}
              fileEditAuth={true}
              extInfo={{
                startContent:
                  this.props.type === 1
                    ? '安全报监'
                    : this.props.type === 2
                    ? '施工许可证'
                    : this.props.type === 3
                    ? '安全监督销项'
                    : this.props.type === 4
                    ? '竣工备案'
                    : '质量报监',
              }}
              type={this.props.type}
              handleUpdate={this.handleUpdate}
              handleUpdateSchedule={this.handleUpdateSchedule}
              projectName = {this.state.projectName}
              isShow={this.state.permission.indexOf(isShow)==-1?false:true} //文件权限
              fileRelease={this.state.permission.indexOf(fileRelease)==-1?false:true}//文件发布权限
              problemShow={this.state.permission.indexOf(problemShow)==-1?false:true}//问题权限
              problemSendShow={this.state.permission.indexOf(problemSendShow)==-1?false:true}//问题发布权限
              editPermission={this.state.editPermission}  //基本信息编辑权限
              scheduleEditPermission={this.state.scheduleEditPermission}  //情况说明编辑权限
              permission={this.state.permission}
            />
          </ExtLayout>
    );
  }
  componentDidMount() { 
    let menuCode = this.props.menuInfo.menuCode
    axios.get(getPermission(menuCode)).then((res)=>{
      let permission = []
      res.data.data.map((item,index)=>{
        permission.push(item.code)
      })
      if(menuCode=='QUALITY-REPSUPER'){
        this.setState({
          isShow:'REPSUPER_FILE-REPSUPER',
          fileRelease:'REPSUPER_FILE-ISSUE-REPSUPER',
          problemShow:'REPSUPER_EDIT-REPSUPERPRO',
          problemSendShow:'REPSUPER_RELEASE-REPSUPERPRO',
          editPermission:'REPSUPER_EDIT-QUALREPSUPER',
          scheduleEditPermission:'REPSUPER_EDIT-REPSUPERSITUAT'
        })
      }else if(menuCode=='SECURITY-SAFETYREPORT'){
        this.setState({
          isShow:'SAFETYREPORT_FILE-SAFEREPORT',
          fileRelease:'SAFETYREPORT_FILE-ISSUESAFEREPORT',
          problemShow:'SAFETYREPORT_EDIT-PROSAFEREPORT',
          problemSendShow:'SAFETYREPORT_RELEASE-SAFEREPORT',
          editPermission:'SAFETYREPORT_EDIT-SAFE-REPORT',
          scheduleEditPermission:'SAFETYREPORT_EDIT-SITUATIONSAFE'
        })
      }else if(menuCode=='SECURITY-SAFETYSUPERVISIONSALES'){
        this.setState({
          isShow:'SAFETYSUPERVISIONSALES_FILE-SAFECONTROL',
          fileRelease:'SAFETYSUPERVISIONSALES_FILE-ISSUECONTROL',
          problemShow:'SAFETYSUPERVISIONSALES_EDIT-PROSAFECONTROL',
          problemSendShow:'SAFETYSUPERVISIONSALES_RELEASE-SAFECONTROL',
          editPermission:'SAFETYSUPERVISIONSALES_EDIT-SAFECONTROL',
          scheduleEditPermission:'SAFETYSUPERVISIONSALES_EDIT-SITUATIONCONTR'
        })
      }else if(menuCode=='SECURITY-CONSTRUCTION'){
        this.setState({
          isShow:'CONSTRUCTION_FILE-CONSTRUCTPERMIT',
          fileRelease:'CONSTRUCTION_FILE-ISSUE-PERMIT',
          problemShow:'CONSTRUCTION_EDIT-PROBLEM-PERMIT',
          problemSendShow:'CONSTRUCTION_RELEASE-PRO-PERMIT',
          editPermission:'CONSTRUCTION_EDIT-CONSTRUCTPERMIT',
          scheduleEditPermission:'CONSTRUCTION_EDIT-SITUATIONPERMIT'
        })       
      }else if(menuCode=='QUALITY-COMPLETIONANDFILING'){
        this.setState({
          isShow:'COMPLETIONANDFILING_FILE-COMPLETED',
          fileRelease:'COMPLETIONANDFILING_FILE-ISSUE-COMPLETED',
          problemShow:'COMPLETIONANDFILING_EDIT-COMPLETEPROBLEM',
          problemSendShow:'COMPLETIONANDFILING_RELEASE-COMPLETEDPRO',
          editPermission:'COMPLETIONANDFILING_EDIT-COMPLETEDRECORD',
          scheduleEditPermission:'COMPLETIONANDFILING_EDIT-SITUATION-DES'
        })
        
      }
      this.setState({
        permission
      })
    })
    firstLoad().then(res => {
      this.setState(
        ({ params }) => ({
          projectName:res.projectName,
          params: { ...params, projectId: res.projectId, sectionIds: res.sectionId,},
        }),
        //() => this.getList(this.state.params)
      );
    });
  }
  // 获取表格数据
  getList = (currentPageNum, pageSize, callBack) => {
    axios
      .get(queryQuaSuperv(pageSize,currentPageNum), { params: { ...this.state.params, type: this.props.type || 0 } })
      .then(res => {
        callBack(!res.data.data ?[]: res.data.data)
        const { total, data } = res.data;
        this.setState({
          table: { data, total},
          rightData: null,
          selectedRowKeys: []
        });
      });
  };
  // 获取项目id
  handleGetProjectId = projectIds => {
    this.setState(
      () => ({ params: { projectId: projectIds[0] } }),
      () => this.table.getData()
    );
  };
  // 获取标段
  handleOpenSection = sectionIds => {
    this.setState(
      ({ params }) => ({
        params: { projectId: params.projectId, sectionIds: sectionIds.join(',') },
      }),
      () => this.table.getData()
    );
  };
  // 设置选中表格颜色
//   handleSetRowClassName = record => {
//     if (this.state.rightData) {
//       return Object.is(record.id, this.state.rightData.id) ? 'tableActivty' : '';
//     } else {
//       return '';
//     }
//   };
}

const columns = [
  // {
  //   title: '项目名称',
  //   dataIndex: 'projectName',
  //   key: 'projectName',
  // },
  {
    title: '标段号',
    dataIndex: 'sectionCode',
    key: 'sectionCode',
  },
  {
    title: '标段名称',
    dataIndex: 'sectionName',
    key: 'sectionName',
  },
  {
    title: '施工单位',
    dataIndex: 'sgdw',
    key: 'sgdw',
  },
  {
    title: '业主代表',
    dataIndex: 'yzdb',
    key: 'yzdb',
  },
  // {
  //   title: '监理单位',
  //   dataIndex: 'jldw',
  //   key: 'jldw',
  // },
  {
    title: '确定状态',
    dataIndex: 'isConfirmVo',
    key: 'isConfirmVo',
    render: ({ name }) => name,
  },
  {
    title: '登记证号',
    dataIndex: 'registerNum',
    key: 'registerNum',
  },
  {
    title: '备注',
    dataIndex: 'remark',
    key: 'remark',
  },
  {
    title: '附件状态',
    dataIndex: 'fileStatusVo',
    key: 'fileStatusVo',
    render: ({ name }) => name,
  },
  {
    title: '创建人',
    dataIndex: 'creater',
    key: 'creater',
  },
  {
    title: '创建日期',
    dataIndex: 'creatTime',
    key: 'creatTime',
  },
];

export default RepSuper;
// 进展情况更新
