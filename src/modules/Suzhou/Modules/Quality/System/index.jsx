import { Table, notification } from 'antd';
import React, { Fragment, Component, Children } from 'react';
import style from './style.less';
import TopTags from './TopTags/index';
import UpdateModal from './UpDataModal/index';
import { firstLoad } from '@/modules/Suzhou/components/Util/firstLoad';
import { getPermission} from '@/modules/Suzhou/api/suzhou-api';
import axios from '@/api/axios';
import { search, getExpandKeys } from '@/utils/dataUtil';
import {
  getBaseSelectTree,
  queryQuaSystem,
  queryQuaSystemAdd,
  queryQuaSystemDelete,
  queryQuaSystemPut,
} from '@/api/suzhou-api';
//布局
import ExtLayout from "@/components/public/Layout/ExtLayout";
import MainContent from "@/components/public/Layout/MainContent";
import Toolbar from "@/components/public/Layout/Toolbar";
import PublicTable from '@/components/PublicTable'
class System extends Component {
  constructor(props) {
    super(props);
    this.state = {
      currentIndex: 1,
      rowClassName: 0,
      arrLight: [],
      focusId: null,
      searchKey: null,
      FormDataName: '',
      FormDataType: '',
      FormDataParentId: 0, //父级id
      disabledAdd: false,
      parentCode: '',
      visibleModal: false, //新增弹窗
      visibleUpdata: false, //修改弹窗
      showUpdata: false, //修改按键
      tableData: [],
      tableDataOld: [],
      upData: {
        //修改的数据
        id: '',
        unitName: '',
        typeNoVo: {
          name: '',
          typeId: '',
        },
      },
      stkey: '',
      updataType: '',
      updataName: '',
      typeList: [],
      loadBoo: false,
      expandedRowKeys: [],
      // "execute": false
      projectId: '', // 项目id
      permission:[]
    };
  }
/**
   @method 父组件即可调用子组件方法
   @description 父组件即可调用子组件方法
   */
  onRef = ref => {
    this.table = ref;
  };
  componentDidMount() {
    let menuCode = 'QUALITY-SYSTEM'
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
      this.setState({ projectId: res.projectId }, () => {
        //this.getDataQuaList();
        this.getSelectTree();
      });
    });
  }

  //新增
  addDatas = () => {
    this.table.getData()
  };

  /********************修改点击***********************/
  //点击修改按钮
  handleUpdate = () => {
    this.setState({
      visibleUpdata: true,
    });
  };

  // 修改点击取消
  handleModalCancelUpdata = () => {
    this.setState({
      visibleUpdata: false,
    });
  };

  // 修改点击确定
  handleModalOkUpdata = () => {
    let _this = this;
    axios
      .put(
        queryQuaSystemPut(),
        {
          id: this.state.upData.id,
          unitName: this.state.upData.unitName,
          typeNo: this.state.upData.typeId,
        },
        true
      )
      .then(function(res) {
        if (res.data.success) {
          // _this.getDatav()
          _this.table.getData(); //重新获取数据
        }
      });
    this.setState({
      visibleUpdata: false,
    });
  };

  //获取修改名称数据，绑定至弹窗数据
  getUnitname = record => {
    let data = Object.assign({}, this.state.upData, { unitName: record.target.value });
    this.setState({
      upData: data,
      updataName: record.target.value,
    });
  };

  getTypeNoVo = record => {
    let data = Object.assign({}, this.state.upData, { typeId: record });
    this.setState({
      upData: data,
      typeId: record,
    });
  };

  /******************删除点击*********************/
  // 删除
  handleDelete = () => {
    let _this = this;
    if (this.state.focusId) {
      axios
        .deleted(
          queryQuaSystemDelete(),
          {
            data: [this.state.rowClassName],
          },
          true
        )
        .then(function(res) {
          if (res.data.success) {
            _this.table.getData();
            _this.setState({
              parentCode: 0,
              showUpdata: false, //修改图标出现
            });
          }
        });
    } else {
      notificationFun('未选中数据');
    }
  };

  /********************搜索************************/
  //点击搜索
  handleSearch = value => {
    const { tableDataOld } = this.state;
    let newData = search(tableDataOld, [{ key: 'unitName', value: value }], true);
    this.setState({
      tableData: newData,
    });
    this.table.search([{ key: 'unitName', value: value }])
  };

  // 设置选中表格
  // handleSetRowClassName = record => {
  //   return Object.is(record.id, this.state.rowClassName) ? 'tableActivty' : '';
  // };

  // 点击行触发方法
  handleOnRow = (record = {}) => {
    // return {
      // onClick: () => {
        // console.log(this.state.focusId == record.id);
        // console.log(this.state.focusId);
        // console.log(record);
        if(record.nodeType == 'project' || (this.state.focusId == record.id)){
          this.setState({
            focusId: null,
            rowClassName: 0,
            showUpdata: false, //修改图标消失
            FormDataParentId: 0,
            stkey: '',
            upData: {
              id: '',
              unitName: '',
              name: '',
              typeId: '',
            },
            parentCode: 0,
          });
        }else{
          this.setState({
            focusId: record.id,
            rowClassName: record.id,
            showUpdata: true, //修改图标出现
            FormDataParentId: record.id,
            stkey: record.key,
            upData: {
              id: record.id,
              unitName: record.unitName,
              name: record.typeNoVo.name,
              typeId: record.typeNoVo.code,
            },
          });
        }
      // },
    // };
  };

  //获取数据字典
  getSelectTree = () => {
    let _this = this;
    axios.get(getBaseSelectTree('szxm.zlgl.systype')).then(function(res) {
      _this.setState({
        typeList: res.data.data,
      });
    });
  };

  generateKey(arr = [], index = 0) {
    try {
      for (let i = 0; i < arr.length; i++) {
        if (index) {
          arr[i].key = index + (i + 1);
        } else {
          arr[i].key = i + 1 + '';
        }
        if (arr[i].children) {
          this.generateKey(arr[i].children, arr[i].key + '.');
        }
      }
      return arr;
    } catch (err) {
    }
  }

  //获取数据
  getDataQuaList = (callBack) => {
    const _this = this;
    this.setState({
      loadBoo: true,
    });
    axios
      .get(
        queryQuaSystem(),
        {
          params: {
            projectId: this.state.projectId,
          },
        },
      )
      .then(res => {
        callBack(res.data.data?res.data.data:[])
        const { data } = res.data;
        console.log(data);
        let arr = getExpandKeys(data, 3);
        _this.setState({
          tableData: _this.generateKey(data),
          // tableData:data,
          tableDataOld: _this.generateKey(data),
          loadBoo: false,
          focusId: null,
          expandedRowKeys: arr,
        });
      })
      .catch(() => {
        _this.setState({
          loadBoo: false,
        });
      });
  };

  hasRecord = () => {
    const { focusId } = this.state;
    if (focusId == null) {
      notificationFun('未选中数据');
      return false;
    }
    return true;
  };

  /**
   @method 展开行事件
   @description  操作表格数据，删除数据
   @param record {object} 行数据
   */
  // handleOnExpand = (expanded, record) => {
  //   const { expandedRowKeys } = this.state;
  //   if (expanded) {
  //     expandedRowKeys.push(record.id);
  //   } else {
  //     let i = expandedRowKeys.findIndex(item => item == record.id);
  //     expandedRowKeys.splice(i, 1);
  //   }
  //   this.setState({
  //     expandedRowKeys,
  //   });
  // };
  getProjectId = projectIds => {
    this.setState({ projectId: projectIds[0] }, () => this.table.getData());
  };
  render() {
    const { height } = this.props;
    const {
      tableData,
      visibleUpdata,
      showUpdata,
      upData,
      loadBoo,
      FormDataParentId,
      expandedRowKeys,
    } = this.state;
    const {
      addDatas,
      hasRecord,
      handleAdd,
      handleDelete,
      handleSearch,
      handleImport,
      handleModalOkUpdata,
      handleModalCancelUpdata,
      handleUpdate,
      getFormDataName,
      getFormDataType,
      getUnitname,
      getTypeNoVo,
      table,
    } = this;
    const handles = {
      addDatas,
      hasRecord,
      handleAdd,
      handleDelete,
      handleSearch,
      handleImport,
      handleUpdate,
      showUpdata,
      table,
    };
    const UpdataFormHandles = { handleModalOkUpdata, handleModalCancelUpdata };
    return (
      <ExtLayout renderWidth={({ contentWidth }) => { this.setState({ contentWidth }) }}>
      <Toolbar>
        <TopTags
          {...handles}
          parentId={FormDataParentId}
          projectId={this.state.projectId}
          tableData={this.state.tableData}
          getProjectId={this.getProjectId}
          permission={this.state.permission}
        />
        </Toolbar>
        <MainContent contentWidth={this.state.contentWidth} contentMinWidth={1100}>
            {this.state.projectId &&(
              <PublicTable
                onRef={this.onRef}
                expanderLevel={"ALL"}
                getData={this.getDataQuaList}
                columns={tdData}
                contentMenu={null}
                scroll={{ x: '100%', y: this.props.height - 100 }} 
                getRowData={this.handleOnRow}
                // size="small"
                // rowKey={record => record.id}
                // pagination={false}
                // columns={tdData}
                // dataSource={tableData}
                // expandedRowKeys={expandedRowKeys}
                // onExpand={this.handleOnExpand.bind(this)}
                // bordered={false}
                // onRow={record => this.handleOnRow(record)}
                // rowClassName={this.handleSetRowClassName} //
                // loading={loadBoo}
              />)}
        </MainContent>
        {/*  */}
        <UpdateModal
          {...UpdataFormHandles}
          visibleModalUpdata={visibleUpdata}
          UpdateList={upData}
          getUnitName={getUnitname}
          getTypeNoVo={getTypeNoVo}
        />
        {/* <Form /> */}
      </ExtLayout>
    );
  }

  //导入
  handleImport = () => {
    alert('导入');
  };
}

const notificationFun = (message, description = null) => {
  notification.warning({
    placement: 'bottomRight',
    bottom: 50,
    duration: 2,
    message: message,
    description: description,
  });
};

// //表头
const tdData = [
  { title: '编号', dataIndex: 'serialNo', key: 'serialNo', width: '20%' },
  { title: '名称', dataIndex: 'unitName', key: 'unitName', width: '30%' },
  { title: '类别', dataIndex: 'typeNoVo.name', key: 'typeNo', width: '30%' },
  { title: '项目名称', dataIndex: 'projectName', key: 'projectName', width: '20%' },
];

export default System;
