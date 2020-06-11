import React, { Component } from 'react';

import { Table, notification } from 'antd';
import style from './style.less';
import AddEqModal from './AddEqModal';
import AddModal from './AddModal';
import AddMaterialModal from './AddMaterialModal';
import AddKindModal from './AddKindModal';
import TreeTable from '../../../components/PublicTable'
/* *********** 引入redux及redux方法 start ************* */
import { connect } from 'react-redux';
import axios from '../../../api/axios';
import {
  getUserRsrc,
  geteuipRsrc,
  getmaterial,
  deleteEuipRsrc,
  deletematerial,
  deleteUserRsrc,
} from '../../../api/api';
import TopTags from './TopTags/index';
import RightTags from '../../../components/public/RightTags/index';
import ExtLayout from "../../../components/public/Layout/ExtLayout";
import MainContent from "../../../components/public/Layout/MainContent";
import Toolbar from "../../../components/public/Layout/Toolbar";
import * as dataUtil from '../../../utils/dataUtil';


class TableComponent extends Component {
  constructor(props) {
    super(props);

    this.state = {
      type: '人力资源',
      rightData: null,
      rightTags: [
        { icon: 'iconjibenxinxi', title: '基本信息', fielUrl: 'Resource/Resoulist/PeopleListInfo' },
        { icon: 'iconjiaose1', title: '资源角色', fielUrl: 'Resource/Resoulist/RoleInfo' },

      ],
      initDone: false,
      resource: 'user',
      data: [],
      initData: [],
      selectedRowKeys: [],
      groupCode: 1,
    };


  }

  //注册 父组件即可调用子组件方法
  onRef = (ref) => {
    this.table = ref
  }

  //获取表格数据 默认请求 人力资源接口
  getData = (callBack) => {
    const { initData, resource, data, keywords } = this.state;
    if (keywords) {
      let newData = initData;
      if (resource == 'user') {
        newData = dataUtil.search(initData, [{ 'key': 'rsrcUserName|rsrcUserCode', 'value': keywords }], true);
      } else if (resource == 'material') {
        newData = dataUtil.search(initData, [{ 'key': 'materialName|materialCode', 'value': keywords }], true);
      } else if (resource == 'equip') {
        newData = dataUtil.search(initData, [{ 'key': 'equipName|equipCode', 'value': keywords }], true);
      }
      callBack(newData)
      return;
    }
    let api = getUserRsrc
    if (this.state.type == '设备资源') {
      api = geteuipRsrc
    } else if (this.state.type == '材料资源') {
      api = getmaterial
    }
    axios.get(api).then(res => {
      callBack(res.data.data ? res.data.data : [])
      if (res.data.data) {
        this.setState({
          data: res.data.data,
          initData: res.data.data,
        });
      }

    });
    this.setState({rightData:null})
  }

  //删除校验
  deleteVerifyCallBack = () => {
    const { data, dataMap, rightData, resource, selectedRowKeys } = this.state;

    if (resource == 'material' || resource == 'equip') {
      if (selectedRowKeys.length == 0) {
        notification.warning(
          {
            placement: 'bottomRight',
            bottom: 50,
            duration: 1,
            message: '警告',
            description: '没有勾选数据！',
          },
        );
        return false
      }
    }
    if (resource == 'user') {
      if (!rightData) {
        notification.warning(
          {
            placement: 'bottomRight',
            bottom: 50,
            duration: 1,
            message: '警告',
            description: '没有选择数据！',
          },
        );
        return false;
      }
    }
    return true
  }
  // 监听 添加 修改 删除事件
  TopTagsonClickHandle = (name, title) => {
    const { data, dataMap, rightData, resource, selectedRowKeys } = this.state;
    switch (name) {
      case 'AddTopBtn':
        if (!rightData) {
          notification.warning(
            {
              placement: 'bottomRight',
              bottom: 50,
              duration: 1,
              message: '警告',
              description: '没有选择数据！',
            },
          );
          return;
        }
        this.setState({
          addName: '新增人力资源',
          isshowAddModal: true,
        });

        break;

      case 'AddEquipBtn':

        this.setState({
          addName: '新增设备资源',
          isshowAddEqModal: true,
        });
        break;
      case 'AddMaterialBtn':


        this.setState({
          addName: '新增材料资源',
          isshowAddMaterialModal: true,
        });
        break;
      case 'ImportTopBtn':

        break;
      case 'DeleteTopBtn':


        //设备资源
        if (resource == 'equip') {
          if (selectedRowKeys.length == 0) {
            notification.warning(
              {
                placement: 'bottomRight',
                bottom: 50,
                duration: 1,
                message: '警告',
                description: '没有勾选数据！',
              },
            );
            return
          }
          axios.deleted(deleteEuipRsrc, { data: selectedRowKeys }, true, '删除设备资源成功').then(res => {
            this.table.getData();
            this.setState({
              data,
              selectedRowKeys: [],
              rightData: null,
              activeIndex: null,
            });
          });
          return;


        }
        if (resource == 'material') {
          if (selectedRowKeys.length == 0) {
            notification.warning(
              {
                placement: 'bottomRight',
                bottom: 50,
                duration: 1,
                message: '警告',
                description: '没有勾选数据！',
              },
            );
            return
          }
          axios.deleted(deletematerial, { data: selectedRowKeys }, true, '删除材料资源成功').then(res => {
            this.table.getData();
            this.setState({
              data,
              selectedRowKeys: [],
              rightData: null,
              activeIndex: null,
            });
          });
        }
        if (resource == 'user') {
          if (!rightData) {
            notification.warning(
              {
                placement: 'bottomRight',
                bottom: 50,
                duration: 1,
                message: '警告',
                description: '没有选择数据！',
              },
            );
            return;
          }
          if (rightData.rsrcUserType == 1 || rightData.rsrcUserType == 0) {

            notification.warning(
              {
                placement: 'bottomRight',
                bottom: 50,
                duration: 1,
                message: '警告',
                description: '选择人员，而不是公司或者机构数据！',
              },
            );
            return;
          }
          axios.deleted(deleteUserRsrc, { data: [rightData.id] }, true, '删除人力资源成功').then(res => {
            this.table.deleted(rightData);
            this.setState({
              data,
              rightData: null,
            });
          });
        }
        break;
      default:
        return;
    }
  };

  viewChange = (name) => {
    let columns, groupCode, type;
    if (name == 'user') {
      columns = this.state.columns1;
      type = "人力资源";
      groupCode = 1;

    } else if (name == 'equip') {
      columns = this.state.columns3;
      type = "设备资源";
      groupCode = 2;
    }
    else if (name == 'material') {
      columns = this.state.columns2;
      type = "材料资源";
      groupCode = 3;
    }
    this.setState({
      type,
      columns,
      rightData: null,
      resource: name,
      groupCode,
      data: []
    }, () => {
      this.table.getData();
    });
  }

  //新增
  addArrayData = (value, type) => {
    const { rightData } = this.state;
    if (type == 'useradd') {
      if (rightData.rsrcUserType == 'user') {
        this.table.add(rightData, value, 'same')
      } else {
        this.table.add(rightData, value)
      }
    } else {
      this.table.add(rightData, value)
    }
  };

  //修改更新
  updateSuccess = (value) => {
    const { rightData } = this.state;
    this.table.update(rightData, value)
  };

  componentDidMount() {
    const { intl } = this.props.currentLocale;
    this.setState({
      columns: [
        {
          title: intl.get('wsd.i18n.rsrc.rsrclist.rsrcname'),
          dataIndex: 'rsrcUserName',
          key: 'rsrcUserName',
          render: (text, record) => dataUtil.getIconCell("user", text, record.rsrcUserType)
        },
        {
          title: intl.get('wsd.i18n.rsrc.rsrclist.rsrccode'),
          dataIndex: 'rsrcUserCode',
          key: 'rsrcUserCode',
        },
        {
          title: intl.get('wsd.i18n.rsrc.rsrclist.rsrctype'),
          dataIndex: 'rsrcUserType',
          key: 'rsrcUserType',
          render: (text) => {
            if (text == 'user') {
              return <span>人力</span>;
            } else {
              return null;
            }
          },
        },
        {
          title: intl.get('wsd.i18n.rsrc.rsrclist.maxunit'),
          dataIndex: 'maxunit',
          key: 'maxunit',
          render: (text) => text ? <span>{text + 'h/d'}</span> : null,
        },
        {
          title: intl.get('wsd.i18n.rsrc.rsrclist.rsrcrolename'),
          dataIndex: 'importance',
          key: 'importance',
          render: (text) => {
            if (text) {
              return <span>{text.name}</span>;
            } else {
              return null;
            }
          },
        },

        {
          title: intl.get('wsd.i18n.rsrc.rsrclist.status'),
          dataIndex: 'status',
          key: 'status',
          render: (text) => {
            if (text) {
              return <span>{text.name}</span>;
            } else {
              return null;
            }
          },
        },
        {
          title: intl.get('wsd.i18n.rsrc.rsrcrole.remark'),
          dataIndex: 'remark',
          key: 'remark',
        },
      ],
      columns1: [
        {
          title: intl.get('wsd.i18n.rsrc.rsrclist.rsrcname'),
          dataIndex: 'rsrcUserName',
          key: 'rsrcUserName',
          render: (text, record) => dataUtil.getIconCell("user", text, record.rsrcUserType)
        },
        {
          title: intl.get('wsd.i18n.rsrc.rsrclist.rsrccode'),
          dataIndex: 'rsrcUserCode',
          key: 'rsrcUserCode',
        },
        {
          title: intl.get('wsd.i18n.rsrc.rsrclist.rsrctype'),
          dataIndex: 'rsrcUserType',
          key: 'rsrcUserType',
          render: (text) => {
            if (text == 'user') {
              return <span>人力</span>;
            } else {
              return null;
            }
          },
        },
        {
          title: intl.get('wsd.i18n.rsrc.rsrclist.maxunit'),
          dataIndex: 'maxunit',
          key: 'maxunit',
          render: (text) => text ? <span>{text + 'h/d'}</span> : null,
        },
        {
          title: intl.get('wsd.i18n.rsrc.rsrclist.rsrcrolename'),
          dataIndex: 'importance',
          key: 'importance',
          render: (text) => {
            if (text) {
              return <span>{text.name}</span>;
            } else {
              return null;
            }
          },
        },

        {
          title: intl.get('wsd.i18n.rsrc.rsrclist.status'),
          dataIndex: 'status',
          key: 'status',
          render: (text) => {
            if (text) {
              return <span>{text.name}</span>;
            } else {
              return null;
            }
          },
        },
        {
          title: intl.get('wsd.i18n.rsrc.rsrcrole.remark'),
          dataIndex: 'remark',
          key: 'remark',
        },
      ],
      columns2: [
        {
          title: intl.get('wsd.i18n.rsrc.rsrclist.rsrcname'),
          dataIndex: 'materialName',
          key: 'materialName',
          render: (text, record) => dataUtil.getIconCell("material", text)
        },
        {
          title: intl.get('wsd.i18n.rsrc.rsrclist.rsrccode'),
          dataIndex: 'materialCode',
          key: 'materialCode',
        },
        {
          title: intl.get('wsd.i18n.rsrc.rsrclist.rsrctype'),
          dataIndex: 'materialType',
          key: 'materialType',
          render: (text) => {
            if (text == 'material') {
              return <span>材料</span>;
            } else {
              return null;
            }
          },
        },
        {
          title: intl.get('wsd.i18n.rsrc.rsrclist.rsrcrolename'),
          dataIndex: 'importance',
          key: 'importance',
          render: (text) => {
            if (text) {
              return <span>{text.name}</span>;
            } else {
              return null;
            }
          },
        },
        {
          title: intl.get('wsd.i18n.rsrc.rsrclist.rsrcaddress'),
          dataIndex: 'location',
          key: 'location',
        },
        {
          title: intl.get('wsd.i18n.rsrc.rsrclist.maxunit'),
          dataIndex: 'maxunit',
          key: 'maxunit',
        },
        {
          title: intl.get('wsd.i18n.rsrc.rsrcrole.remark'),
          dataIndex: 'remark',
          key: 'remark',
        },
      ],
      columns3: [
        {
          title: intl.get('wsd.i18n.rsrc.rsrclist.rsrcname'),
          dataIndex: 'equipName',
          key: 'equipName',
          render: (text, record) => dataUtil.getIconCell("equip", text)
        },
        {
          title: intl.get('wsd.i18n.rsrc.rsrclist.rsrccode'),
          dataIndex: 'equipCode',
          key: 'equipCode',
        },
        {
          title: intl.get('wsd.i18n.rsrc.rsrclist.rsrctype'),
          dataIndex: 'equipType',
          key: 'equipType',
          render: (text) => {
            if (text == 'equip') {
              return <span>设备</span>;
            } else {
              return null;
            }
          },
        },
        {
          title: intl.get('wsd.i18n.rsrc.rsrclist.rsrcrolename'),
          dataIndex: 'importance',
          key: 'importance',
          render: (text) => {
            if (text) {
              return <span>{text.name}</span>;
            } else {
              return null;
            }
          },
        },
        {
          title: intl.get('wsd.i18n.rsrc.rsrclist.rsrcaddress'),
          dataIndex: 'location',
          key: 'location',
        },
        {
          title: intl.get('wsd.i18n.rsrc.rsrclist.maxunit'),
          dataIndex: 'maxunit',
          key: 'maxunit',
          render: (text) => text ? <span>{text + 'h/d'}</span> : null,
        },
        {
          title: intl.get('wsd.i18n.rsrc.rsrclist.status'),
          dataIndex: 'status',
          key: 'status',
          render: (text) => {
            if (text) {
              return <span>{text.name}</span>;
            } else {
              return null;
            }
          },
        },
        {
          title: intl.get('wsd.i18n.rsrc.rsrclist.remark'),
          dataIndex: 'remark',
          key: 'remark',
        },
      ],
    });
  }

  //关闭新增人类资源
  closeAddModal = () => {
    this.setState({
      isshowAddModal: false,
    });
  };
  //关闭新增材料资源
  closeAddMaterialModal = () => {
    this.setState({
      isshowAddMaterialModal: false,
    });
  };
  //关闭新增设备资源
  closeAddEqModal = () => {
    this.setState({
      isshowAddEqModal: false,
    });
  };
  closeAddKindModal = () => {
    this.setState({
      isshowAddKindModal: false,
    });
  };
  getInfo = (record, index) => {
    const { resource } = this.state;
    this.setState({
      rightData: record,
    }, () => {
      if (resource == 'user') {
        const { rightData } = this.state;
        if (rightData.rsrcUserType != 'user') {
          rightData.ischeck = true;
          this.setState({
            rightData,
          });
        }
      }
    });


  };

  search = (value) => {
    this.setState(
      { keywords: value }, () => {
        this.table.getData();
      });
  };

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
  //刷新
  refresh=()=>{
    this.table.getData();
  }
  render() {

    return (
      <ExtLayout renderWidth={({ contentWidth }) => { this.setState({ contentWidth }) }}>
        <Toolbar>
          <TopTags selectType={this.state.resource} viewChange={this.viewChange}
            search={this.search} onClickHandle={this.TopTagsonClickHandle}
            refresh={this.refresh} deleteVerifyCallBack={this.deleteVerifyCallBack}
          />
        </Toolbar>
        <MainContent contentWidth={this.state.contentWidth} contentMinWidth={1500}>
          {this.state.columns && this.state.type == '人力资源' && (
            <TreeTable onRef={this.onRef} getData={this.getData}
              rowSelection={this.state.resource == 'user' ? null : true}
              pagination={false} columns={this.state.columns}
              scroll={{ x: 1200, y: this.props.height - 50 }}
              getRowData={this.getInfo}
            />
          )}
          {this.state.columns && this.state.type == '材料资源' && (
            <TreeTable istile={true} onRef={this.onRef} getData={this.getData}
              rowSelection={this.state.resource == 'user' ? null : true}
              pagination={false} columns={this.state.columns}
              useCheckBox={true}
              scroll={{ x: 1200, y: this.props.height - 50 }}
              getRowData={this.getInfo}
              onChangeCheckBox={this.getSelectedRowKeys}
            />
          )}
          {this.state.columns && this.state.type == '设备资源' && (
            <TreeTable istile={true} onRef={this.onRef} getData={this.getData}
              rowSelection={this.state.resource == 'user' ? null : true}
              pagination={false} columns={this.state.columns}
              useCheckBox={true}
              scroll={{ x: 1200, y: this.props.height - 50 }}
              getRowData={this.getInfo}
              onChangeCheckBox={this.getSelectedRowKeys}
            />
          )}
        </MainContent>
        <RightTags rightTagList={this.state.rightTags}
          rightData={this.state.rightData && !this.state.rightData.ischeck ? this.state.rightData : null}
          updateSuccess={this.updateSuccess} type={this.state.resource} message="请选择"
          menuCode={this.props.menuInfo.menuCode}
          groupCode={this.state.groupCode}
        />
        {this.state.isshowAddModal &&
          <AddModal title={this.state.addName} handleCancel={this.closeAddModal.bind(this)}
            data={this.state.rightData} addArrayData={this.addArrayData}></AddModal>}
        {this.state.isshowAddEqModal &&
          <AddEqModal title={this.state.addName} handleCancel={this.closeAddEqModal.bind(this)}
            data={this.state.rightData} addArrayData={this.addArrayData}></AddEqModal>}
        {this.state.isshowAddMaterialModal &&
          <AddMaterialModal title={this.state.addName} handleCancel={this.closeAddMaterialModal.bind(this)}
            data={this.state.rightData} addArrayData={this.addArrayData}></AddMaterialModal>}
        {this.state.isshowAddKindModal &&
          <AddKindModal title={this.state.addkindName}
            handleCancel={this.closeAddKindModal.bind(this)}
            data={this.state.rightData}
            type={this.state.addtype}
            addType={this.addType}
            resource={this.state.resource}
          ></AddKindModal>}
      </ExtLayout>

    );
  }
}

const mapStateToProps = state => {
  return {
    currentLocale: state.localeProviderData,
  };
};


export default connect(mapStateToProps, null)(TableComponent);
