import React, { Component } from 'react';

import { Table, notification } from 'antd';
import { connect } from 'react-redux';
import style from './style.less';
import LabelToolbar from '../../../../components/public/Layout/Labels/Table/LabelToolbar'
import LabelTableLayout from '../../../../components/public/Layout/Labels/Table/LabelTableLayout'
import LabelTable from '../../../../components/public/Layout/Labels/Table/LabelTable'
import LabelTableItem from '../../../../components/public/Layout/Labels/Table/LabelTableItem'

import PublicButton from '../../../../components/public/TopTags/PublicButton';
import DistributionBtnModal from '../Distribute';
import axios from '../../../../api/axios';
import { rsrcAssign, addrsrcAssign, deletersrcAssign } from '../../../../api/api';
import TreeTable from '../../../../components/PublicTable'
class TableComponent extends Component {
  constructor(props) {
    super(props);
    this.state = {
      initDone: false,
      data: [],
    };
  }


  //注册 父组件即可调用子组件方法
  onRef = (ref) => {
    this.table = ref
  }
  getList = (callBack) => {
    axios.get(rsrcAssign(this.props.data.id, this.props.type)).then(res => {
      callBack(res.data.data ? res.data.data : [])
    });
  };
  //分配
  distribute = (data) => {
    let array = [];
    data.forEach(item => {
      array.push({ roleId: item.id, rsrcId: this.props.data.id, rsrcType: this.props.type });
    });
    axios.post(addrsrcAssign, array, true, '分配成功').then(res => {
      this.table.getData();
    });
  };
  //打开分配
  onClickHandle = (name) => {
    const { data, rightData } = this.state;
    if (name == 'DistributionBtn') {
      this.setState({
        isShowDistribute: true,
      });
      return;
    }
    if (name == 'DeleteTopBtn') {
      axios.deleted(deletersrcAssign, { data: [rightData.id] }, true, '删除分配角色成功').then(res => {
        this.table.deleted(rightData)
      });
    }
  };
  //关闭分配
  closeDistributionBtnModal = () => {
    this.setState({
      isShowDistribute: false,
    });
  };
  getInfo = (record, index) => {
    this.setState({
      rightData: record,
    });

  };


  deleteVerifyCallBack = () => {
    const { data, dataMap, rightData } = this.state;
    if (!rightData) {
      notification.warning(
        {
          placement: 'bottomRight',
          bottom: 50,
          duration: 1,
          message: '警告',
          description: '没有选择数据！'
        }
      )
      return false
    } else {
      return true
    }
  }
  render() {
    const { intl } = this.props.currentLocale;
    const columns = [
      {
        title: intl.get('wsd.i18n.rsrc.rsrclist.rsrcname'),
        dataIndex: 'id',
        key: 'id',
        render: (text, record, index) => {
          return <span>{record.role.roleName}</span>
        }
      },
      {
        title: intl.get('wsd.i18n.rsrc.rsrclist.rsrccode'),
        dataIndex: 'rsrcId',
        key: 'rsrcId',
        render: (text, record, index) => {
          return <span>{record.role.roleCode}</span>
        }
      },
    ];

    return (
      <LabelTableLayout title={this.props.title}>
        <LabelToolbar>
          {/*分配*/}
          <PublicButton name={'分配'} title={'分配'} icon={'icon-fenpeirenyuan'} afterCallBack={this.onClickHandle.bind(this, 'DistributionBtn')} />
          {/*删除*/}
          <PublicButton title={"删除"} useModel={true} verifyCallBack={this.deleteVerifyCallBack} afterCallBack={this.onClickHandle.bind(this, "DeleteTopBtn")} icon={"icon-delete"} />
        </LabelToolbar>
        <LabelTable labelWidth={this.props.labelWidth} contentMinWidth={800}>
          <TreeTable istile={true} onRef={this.onRef} getData={this.getList}
            pagination={false} columns={columns}
            getRowData={this.getInfo}
          />
        </LabelTable>
        {this.state.isShowDistribute &&
          <DistributionBtnModal handleCancel={this.closeDistributionBtnModal.bind(this)}
            distribute={this.distribute}></DistributionBtnModal>}


      </LabelTableLayout>

    );
  }
}


const mapStateToProps = state => {
  return {
    currentLocale: state.localeProviderData,
  };
};


export default connect(mapStateToProps, null)(TableComponent);
