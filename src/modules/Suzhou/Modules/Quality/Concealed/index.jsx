import React, { Component } from 'react';
import { Table } from 'antd';
import RightTags from '@/components/public/RightTags/index';
import TopTags from './TopTags/index';
import axios from '@/api/axios';
import { queryQuaConce, getBaseSelectTree, deleteQuaConce ,getPermission} from '@/modules/Suzhou/api/suzhou-api';
import notificationTip from '@/utils/notificationTip';
import { firstLoad } from '@/modules/Suzhou/components/Util/firstLoad';
import style from './style.less';
// 布局
import ExtLayout from "@/components/public/Layout/ExtLayout";
import MainContent from "@/components/public/Layout/MainContent";
import Toolbar from "@/components/public/Layout/Toolbar";
import PublicTable from '@/components/PublicTable'
import { queryParams } from '@/modules/Suzhou/components/Util/util';
class QualityReport extends Component {
  state = {
    data: null, // 表格数据
    record: null, // 表格点击行对象
    projectId: '', // 项目id
    sectionIds: '', // 标段id
    projectNames: [], // 工程下拉框数据
    loading: false, // laoding
    total: 0, // 总数
    rightData: null,
    status: false,
    selectedRowKeys: [], // 选中
    params: {}, // 参数
    currentPageNum: 1, // 页数
    pageSize: 10, // 条数
    projectName: '',
    permission:[]
  };
  render() {
    const {
      height,
      menuInfo: { menuCode },
    } = this.props;
    const { data, projectNames, loading, projectId, total } = this.state;
    return (
      <ExtLayout renderWidth={({ contentWidth }) => { this.setState({ contentWidth }) }}>
        <Toolbar>
        <TopTags
          projectNames={projectNames}
          projectId={projectId}
          addTabelData={this.addTabelData}
          handleOpenSection={this.handleOpenSection}
          handleGetProjectId={this.handleGetProjectId}
          handleDelete={this.handleDelete}
          handleSelectSearch={this.handleSelectSearch}
          handleSearch={this.handleSearch}
          hasRecord={this.hasRecord}
          selectedRowKeys={this.state.selectedRowKeys}
          //
          menuCode={menuCode}
          projectName={this.state.projectName}
          bizType={this.props.menuInfo.menuCode}
          sectionId={this.state.sectionIds}
          data1={this.state.projectId}
          params={this.state.params}
          permission={this.state.permission}
          updateFlow={() => {
            this.table.getData();
          }}
        />
        </Toolbar>
        <MainContent contentWidth = {this.state.contentWidth} contentMinWidth={1100}>
        {this.state.projectId &&<PublicTable onRef={this.onRef}
                pagination={true}
                getData={this.getList}
                columns={columns}
                rowSelection={true}
                useCheckBox={true} 
                getRowData={this.getInfo}
                total={this.state.total}
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
              />}
            </MainContent>
            <RightTags
              isEdit = {true}
              menuCode={menuCode}
              groupCode={1}
              rightData={this.state.record}
              updateInfoTabel={this.updateInfoTabel}
              // 参数
              projectName = {this.state.projectName}
              projectId={this.state.projectId}
              menuInfo = {this.props.menuInfo}
              menuId={this.props.menuInfo.id}
              bizType={this.props.menuInfo.menuCode}
              bizId={this.state.record ? this.state.record.id : null}
              fileEditAuth={true}
              extInfo={{ startContent: '隐蔽工程' }}
              openWorkFlowMenu={this.props.openWorkFlowMenu}
              isShow={this.state.permission.indexOf('CONCEALED_FILE-CONCEALED')==-1?false:true} //文件权限
              problemShow={this.state.permission.indexOf('CONCEALED_QUES-EDIT')==-1?false:true}//问题权限
              problemSendShow={this.state.permission.indexOf('CONCEALED_QUES-EDIT')==-1?false:true}//问题发布权限
              permission={this.state.permission}
              taskFlag = {false}
              isCheckWf={true}  //流程查看
            />
         </ExtLayout>
    );
  }
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
  getInfo = (record)=>{
    this.setState({
        record: record,
        rightData: record
    });
  }
  // 获取表格数据
  getList = (size, page, callBack) => {
    axios
      .get(queryQuaConce( page,size) + 
            queryParams({
                projectId: this.state.projectId,
                sectionIds: this.state.sectionIds,
                ...this.state.params
            })
          )
      .then(response => {
        callBack(response.data.data ?response.data.data:[] )
        const { data, total } = response.data;
        this.setState(() => ({ 
                data, 
                total,
                rightData: null,
                selectedRowKeys: []
        }));
      })
  };
  // 增加更细表格
  addTabelData = callBackData => {
    this.table.recoveryPage(1)
    this.table.getData();
  };
  // 更新   info 确定更新会掉
  updateInfoTabel = val => {
    this.table.update(this.state.rightData, val)
        this.setState({
            record: val,
            rightData: val
        })
  };
  hasRecord = () => {
    if (!this.state.selectedRowKeys.length > 0) {
      notificationTip('未选中数据');
      return false;
    } else {
      return true;
    }
  };
  // 删除
  handleDelete = () => {
    const { selectedRowKeys, record, data, currentPageNum, pageSize } = this.state;
    axios.deleted(deleteQuaConce(), { data: this.state.selectedRowKeys || [] }, true).then(res => {
      // 当前页全删除 判断当前的页数如果大于1 那么调用上一页的接口
      if (data.length === selectedRowKeys.length && currentPageNum > 1) {
        this.table.getData(
          pageSize,
          currentPageNum - 1           
        );
      } else {
        // 调用当前页的接口刷新
        this.table.getData( 
          pageSize,
          currentPageNum
        );
      }
      // 如果删除的数据中存在选择的数据那么清空
      if (record) {
        this.setState({
          record: selectedRowKeys.some(id => record.id === id) ? null : record,
        });
      }
      this.setState({
        selectedRowKeys: [],
      });
    });
  };
  // 获取单位工程 字典表数据
  handleGetBaseSelectTree = (typeCode = 'szxm.zlgl.systype') => {
    axios.get(getBaseSelectTree(typeCode)).then(res => {
      const { data } = res.data;
      this.setState(() => ({
        projectNames: data || [],
      }));
    });
  };
  // 选择项目会掉
  handleGetProjectId = (...args) => {
    const [projectIds, projectName] = args;
    !this.state.projectId?'':this.table.recoveryPage(1);
    this.setState({ projectId: projectIds[0], projectName, sectionIds:'' }, () => {
      this.table.getData();
    });
  };

  //选择标段
  handleOpenSection = sectionIds => {
    this.table.recoveryPage(1);
    this.setState(
      {
        sectionIds: sectionIds.join(','),
      },
      () => {
        this.table.getData();
      }
    );
  };
  // 搜素
  handleSearch = value => {
    if (this.state.projectId) {
      this.table.recoveryPage(1);
      this.setState({ params: value }, () => this.table.getData());
    } else {
      notificationTip('请选择项目');
    }
  };
  // 获取单位工程options
  handleSelectSearch = value => {
    if (this.state.projectId) {
      this.setState({ params:{projectName: value} }, () => this.table.getData());
      //this.table.getData({ projectId: this.state.projectId, projectName: value });
    } else {
      notificationTip('请选择项目');
    }
  };
  componentDidMount() {
    let menuCode = 'QUALITY-CONCEALED'
    axios.get(getPermission(menuCode)).then((res)=>{
      let permission = []
      res.data.data.map((item,index)=>{
        permission.push(item.code)
      })
      this.setState({
        permission
      })
    })
    firstLoad().then(res => {
      this.setState(
        {
          projectId: res.projectId,
          projectName: res.projectName,
          sectionIds: res.sectionId,
        }
      );
    });
  }
}
const columns = [
  {
    title: '项目名称',
    dataIndex: 'projectName',
  },
  {
    title: '标段名称',
    dataIndex: 'sectionName',
  },
  {
    title: '隐蔽工程名称',
    dataIndex: 'engineName',
  },
  {
    title: '所属站',
    dataIndex: 'belongStaVoList',
    render: arr => arr.map(item => item.name).join(','),
  },
  {
    title: '施工单位',
    dataIndex: 'sgdw',
  },
  // {
  //   title: '监理单位',
  //   dataIndex: 'jldw',
  // },
  {
    title: '验收时间',
    dataIndex: 'checkTime',
  },
  {
    title: '发起人',
    dataIndex: 'initiatorName',
  },
  {
    title: '发起时间',
    dataIndex: 'initTime',
  },
  {
    title: '附件状态',
    dataIndex: 'fileStatusVo',
    render: ({ name }) => name,
  },
  {
    title: '状态',
    dataIndex: 'statusVo',
    render: ({ name }) => name,
  },
];

export default QualityReport;
