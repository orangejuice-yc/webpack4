import React, { Component } from 'react';
import { Table } from 'antd';
import RightTags from '@/components/public/RightTags/index';
import TopTags from './TopTags/index';
import axios from '@/api/axios';
import { queryQuaInsp, getBaseSelectTree, deleteQuaInsp,getPermission } from '@/modules/Suzhou/api/suzhou-api';
import notificationTip from '@/utils/notificationTip';
import { queryQuaSystem ,getQuaInspectStatisticsList} from '@/api/suzhou-api';
import TableTree from './Select';
import style from './style.less';
import { firstLoad } from '@/modules/Suzhou/components/Util/firstLoad';
import { queryParams } from '@/modules/Suzhou/components/Util/util';
import SelectProjectBtn from '@/modules/Suzhou/components/SelectBtn/SelectProBtn';
import SelectSectionBtn from '@/modules/Suzhou/components/SelectBtn/SelectSectionBtn';
//布局
import ExtLayout from "@/components/public/Layout/ExtLayout";
import LeftContent from "@/components/public/Layout/LeftContent";
import MainContent from "@/components/public/Layout/MainContent";
import Toolbar from "@/components/public/Layout/Toolbar";
import PublicTable from '@/components/PublicTable'
class QualityReport extends Component {
  state = {
    data: null,
    // 表格点击行对象
    record: null,
    projectId: '',
    sectionIds: '',
    projectName: '',
    // 工程下拉框数据
    projectNames: [],
    // laoding
    loading: false,
    // 总数
    total: 0,
    // 选中
    selectedRowKeys: [],
    // 左侧数据
    leftTableTree: [],
    //
    typeVo: '',
    currentPageNum: 1,
    pageSize: 10,
    status: [],
    params: {},
    permission:[],
    addBtn:false,
    targetTreeData:null //左侧筛选数据
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
          typeVo={this.state.typeVo}
          addTabelData={this.addTabelData}
          handleOpenSection={this.handleOpenSection}
          handleGetProjectId={this.handleGetProjectId}
          handleDelete={this.handleDelete}
          handleSelectSearch={this.handleSelectSearch}
          handleSearch={this.handleSearch}
          hasRecord={this.hasRecord}
          projectId={projectId}
          selectedRowKeys={this.state.selectedRowKeys}
          // ---
          status={this.state.status}
          menuCode={menuCode}
          projectName={this.state.projectName}
          bizType={this.props.menuInfo.menuCode}
          sectionId={this.state.sectionIds}
          data1={this.state.projectId}
          params={this.state.params}
          leftTableTree={
            this.state.leftTableTree[0] ? targetTreeData([this.state.leftTableTree[0]]) : []
          }
          updateFlow={() => {
            this.setState({targetTreeData:targetTreeData([this.state.leftTableTree[0]])},
            ()=>this.table.getData())     
          }}
          permission={this.state.permission}
          addBtn={this.state.addBtn}
          rightData = {this.state.record}
        />
        </Toolbar>
        <LeftContent width={300}>
          <Toolbar>
            <SelectProjectBtn openPro={this.handleGetProjectId} />
            <SelectSectionBtn openSection={this.handleOpenSection} data1={this.state.projectId} />
          </Toolbar>
          <TableTree
            height={height}
            ref={ref => {this.leftTable = ref}}
            handleGetqueryQuaSystem={this.handleGetqueryQuaSystem}
            leftTableTree={this.state.leftTableTree}
            handleGetSystemTree={this.handleGetSystemTree}
            getSelectRecord={this.getSelectRecord}
            projectId={this.state.projectId}
          />
        </LeftContent>
        <MainContent contentWidth={this.state.contentWidth} contentMinWidth={800}>
            {this.state.projectId && this.state.targetTreeData &&(
              <PublicTable
                onRef={this.onRef}
                pagination={true}
                getData={this.getList}
                columns={columns}
                rowSelection={true}
                onChangeCheckBox={this.getSelectedRowKeys}
                useCheckBox={true} 
                getRowData={this.getInfo}
                total={this.state.total}
                pageSize={10}
                // onChange={({ current, pageSize }) => {
                //   this.setState(
                //     () => ({ currentPageNum: current, pageSize: pageSize }),
                //     () => {
                //       this.table.getData(
                //         {
                //           projectId: this.state.projectId,
                //           sectionIds: this.state.sectionIds,
                //           ...this.state.params,
                //         },
                //         targetTreeData([this.state.leftTableTree[0]]),
                //         current,
                //         pageSize
                //       );
                //     }
                //   );
                // }}
              />)}
              </MainContent>
            <RightTags
              isEdit = {true}
              menuCode={menuCode}
              groupCode={1}
              rightData={this.state.record}
              updateInfoTabel={this.updateInfoTabel}
              typeVo={this.state.typeVo}
              menuInfo = {this.props.menuInfo}
              // 参数
              projectId={this.state.projectId}
              menuId={this.props.menuInfo.id}
              bizType={this.props.menuInfo.menuCode}
              bizId={this.state.record ? this.state.record.id : null}
              fileEditAuth={true}
              extInfo={{ startContent: '质量报验' }}
              openWorkFlowMenu={this.props.openWorkFlowMenu}
              projectName={this.state.projectName}
              isShow={this.state.permission.indexOf('REPORT_FILE-INSPECTION')==-1?false:true} //文件权限
              problemShow={this.state.permission.indexOf('REPORT_EDIT-MASSREPORT-PRO')==-1?false:true}//问题权限
              problemSendShow={this.state.permission.indexOf('REPORT_RELEASE-MASSREPORT')==-1?false:true}//问题发布权限
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
  //获取表格数据
  getList = (currentPageNum, pageSize ,callBack) => {
    let getQuaInspectStatistics = JSON.parse(localStorage.getItem("getQuaInspectStatistics"))
    if(getQuaInspectStatistics){
      const {projectId,status} = getQuaInspectStatistics
      const params = {projectId,status}
        axios.get(getQuaInspectStatisticsList(pageSize, currentPageNum)+ queryParams(params)).then(res=>{
          callBack(!res.data.data ?[]: res.data.data.list)
          if(res.data.data){
            const { list, total } = res.data.data;
            this.setState(() => ({ data:list, total}))
          }
        })
    }else{
    axios
      .post(queryQuaInsp(pageSize, currentPageNum) + queryParams({projectId: this.state.projectId,sectionIds: this.state.sectionIds,...this.state.params}),
      this.state.targetTreeData).then(response => {
        callBack(!response.data.data ?[]: response.data.data)
        const { data, total } = response.data;
        this.setState(() => ({ data, total}));
      })
    }
  };
  // 获取选中的数据
  getSelectRecord = data => {
    console.log(data);
    if(!data.code){

    }else{
      this.setState({
        typeVo: data,
      });
    }
  };
  // 增加更细表格
  addTabelData = callBackData => {
    this.table.recoveryPage(1);
    this.setState({
      //targetTreeData:targetTreeData([this.state.leftTableTree[0]])
    },
            ()=>this.table.getData())
    // this.setState(({ data, total }) => ({
    //   data: [...data, callBackData],
    //   total: total + 1,
    // }));
  };
  // 更新   info 确定更新会掉
  updateInfoTabel = callBackData => {
    this.table.update(this.state.record, callBackData)
    this.setState(({ data, record }) => ({
      data: data.map(item => (item.id === callBackData.id ? callBackData : item)),
      record: { ...record, ...callBackData },
    }));
  };
  hasRecord = () => {
    if (!this.state.selectedRowKeys.length > 0) {
      notificationTip('未选中数据');
      return false;
    } else {
      return true;
    }
  };
  // 获取左侧质量管理单元数据
  handleGetqueryQuaSystem = (callBack) => {
    axios
      .get(queryQuaSystem(), {
        params: {
          projectId:this.state.projectId,
        },
      })
      .then(res => {
        callBack(res.data.data?func(res.data.data):[])
        const { data } = res.data;
        this.setState(
          {
            leftTableTree: func(data),
            targetTreeData:targetTreeData([func(data)[0]]),
            params:{}
          },
          () => {
            if (Array.isArray(this.state.leftTableTree) && this.state.leftTableTree.length > 0) {
              this.table.getData()
            }
          }
        );
      });
  };
  // 接收点击左侧单挑数据回掉方法
  handleGetSystemTree = data => {
    if(data.nodeType == 'project'){
      this.setState({addBtn:false})
    }else{
      this.setState({addBtn:true,})
    }
    this.setState({
              targetTreeData:targetTreeData([data]),
              params:{}
            },
      ()=>{this.table.getData()}
    )
    
  };
  // 删除
  handleDelete = () => {
    const { selectedRowKeys, record, data, currentPageNum, pageSize } = this.state;
    axios.deleted(deleteQuaInsp(), { data: this.state.selectedRowKeys || [] }, true).then(res => {
      // 当前页全删除 判断当前的页数如果大于1 那么调用上一页的接口
      // if (data.length === selectedRowKeys.length && currentPageNum > 1) {
      //   this.table.getData(
      //     {
      //       projectId: this.state.projectId,
      //       sectionIds: this.state.sectionIds,
      //       ...this.state.params,
      //     },
      //     targetTreeData([this.state.leftTableTree[0]]),
      //     pageSize,
      //     currentPageNum - 1
      //   );
      // } else {
      //   // 调用当前页的接口刷新
      //   this.table.getData(
      //     {
      //       projectId: this.state.projectId,
      //       sectionIds: this.state.sectionIds,
      //       ...this.state.params,
      //     },
      //     targetTreeData([this.state.leftTableTree[0]]),
      //     pageSize,
      //     currentPageNum
      //   );
      // }
      // // 如果删除的数据中存在选择的数据那么清空
      // if (record) {
      //   this.setState({
      //     record: selectedRowKeys.some(id => record.id === id) ? null : record,
      //   });
      // }
      this.setState(
        {
          selectedRowKeys: [],
          //targetTreeData:targetTreeData([this.state.leftTableTree[0]])
        },
        ()=>this.table.getData()     
      );
    });
  };
  // 获取单位工程 字典表数据
  handleGetBaseSelectTree = typeCode => {
    return axios.get(getBaseSelectTree(typeCode));
  };
  // 选择项目会掉
  handleGetProjectId = (...args) => {
    const [projectIds, , projectName] = args;
    this.setState(
      {
        projectId: projectIds[0],
        projectName,
        params: {},
      },
      () => this.leftTable.table.getData()
    );
  };

  //选择标段
  handleOpenSection = sectionIds => {
    this.setState(
      {
        sectionIds: sectionIds.join(','),
        targetTreeData:targetTreeData([this.state.leftTableTree[0]]),
        params: {},
      },
      () => {
        this.table.getData();
      }
    );
  };
  // 搜素
  handleSearch = value => {
    if (this.state.projectId) {
      this.setState(
        {
          params: value,
          //targetTreeData:targetTreeData([this.state.leftTableTree[0]])
        },
        () => {
          this.table.getData();
        }
      );
    } else {
      notificationTip('请选择项目');
    }
  };
  // 获取单位工程options
  handleSelectSearch = value => {
    if (this.state.projectId) {
      this.setState({params:{checkType: value}},()=>{
        this.table.getData();
      })
    } else {
      notificationTip('请选择项目');
    }
  };
  componentDidMount() {
    let menuCode = 'QUALITY-REPORT'
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
        },
        //() => this.handleGetqueryQuaSystem(this.state.projectId)
      );
    });
    // 获取单位工程 对应的字典数据
    this.handleGetBaseSelectTree('szxm.zlgl.systype').then(res => {
      const { data } = res.data;
      this.setState(() => ({ projectNames: data.filter(item => item.title !== '分项') }));
    });
    // 获取流程状态
    this.handleGetBaseSelectTree('base.flow.status').then(res => {
      const { data } = res.data;
      this.setState(() => ({ status: data || [] }));
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
    title: '验收分类',
    dataIndex: 'checkTypeVo',
    render: ({ name }) => name,
  },
  {
    title: '工程名称',
    dataIndex: 'engineName',
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
    title: '状态',
    dataIndex: 'statusVo',
    render: ({ name }) => name,
  },
];

export default QualityReport;
// 将树型结构 递归添加路径 key
const func = (arr = [], index = 0) => {
  for (let i = 0; i < arr.length; i++) {
    if (index) {
      arr[i].key = index + (i + 1);
    } else {
      arr[i].key = i + 1 + '';
    }
    arr[i].name = arr[i].unitName;
    if (arr[i].children) {
      func(arr[i].children, arr[i].key + '-');
    }
  }
  return arr;
};
const targetTreeData = (data, arr = []) => {
  for (let i = 0; i < data.length; i++) {
    if (data[i]) {
      arr.push(data[i].id);
      if (data[i].children) {
          targetTreeData(data[i].children, arr);
      }
    }
  }
  return arr;
};
// /**
//  * 对象转url参数
//  * @param {*} data
//  * @param {*} isPrefix
//  */
// const queryParams = obj => {
//   if (typeof obj === 'object') {
//     let params = [];
//     for (let key in obj) {
//       params.push({
//         [key]: obj[key],
//       });
//     }
//     params = params.map(item => {
  
//       let str = '';
//       for (let key in item) {
//         str = key + '=' + item[key];
//       }
//       return str;
//     });
//     return params.join('&');
//   }
//   throw Error('发生错误');
// };
