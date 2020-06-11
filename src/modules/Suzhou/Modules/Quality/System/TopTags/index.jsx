import propTypes from 'prop-types';
import React, { Component } from 'react';
import PublicButton from '@/components/public/TopTags/PublicButton';
import Search from '@/components/public/Search';
import SelectProjectBtn from '@/modules/Suzhou/components/SelectBtn/SelectProBtn';

import axios from '@/api/axios';
import { downQuaSystem } from '../../../../api/suzhou-api';

import notificationTip from '@/utils/notificationTip';
import AddForm from '../AddForm/index';
import UploadDoc from '../Upload/index';
import style from './style.less';

class TopTags extends Component {
  state = {
    visible: false,
    treeData: '',
    selectData: '',
    UploadVisible: false,
  };

  onClickHandle = name => {
    //导入
    if (name == 'importFile') {
      this.setState({
        UploadVisible: true,
      });
    }
    //导出
    if (name == 'exportFile') {
      axios.down(downQuaSystem(), {}, true);
    }
  };

  handleCancel = v => {
    this.setState({
      UploadVisible: false,
    });
  };

  handleAdd = () => {
    this.setState({ visible: true });
  };

  handleModalOk = () => {
    this.setState({
      visible: false,
    });
    this.props.addDatas();
  };

  handleModalCancel = () => {
    this.setState({
      visible: false,
    });
  };

  render() {
    const { handleDelete, handleSearch, handleUpdate, showUpdata, getDataQuaList ,permission,table} = this.props;
    return (
      <div className={style.main}>
        <div className={style.search}>
          <Search search={handleSearch} />
        </div>
        <AddForm
          visible={this.state.visible}
          parentId={this.props.parentId}
          treeData={this.state.treeData}
          selectData={this.state.selectData}
          handleModalOk={this.handleModalOk}
          handleModalCancel={this.handleModalCancel}
          projectId={this.props.projectId}
        />
        <div className={style.tabMenu}>
          <SelectProjectBtn openPro={this.props.getProjectId} />
          {permission.indexOf('SYSTEM_IMPORT-MASS-SYSTEM')!==-1 && (
          <PublicButton
            name={'导入'}
            title={'导入'}
            icon={'icon-daoru1'}
            afterCallBack={this.onClickHandle.bind(this, 'importFile')}
          />)}
          {permission.indexOf('SYSTEM_IMPORT-MASS-SYSTEM')!==-1 && (
          <PublicButton
            name={'导出'}
            title={'导出模版'}
            icon={'icon-iconziyuan2'}
            afterCallBack={this.onClickHandle.bind(this, 'exportFile')}
          />)}

          {this.state.UploadVisible && (
            <UploadDoc
              modalVisible={this.state.UploadVisible}
              handleOk={this.handleOk}
              handleCancel={this.handleCancel}
              getListData={table.getData}
              projectId={this.props.projectId}
              // getDataList={this.props.getDataList}
            />
          )}
          {permission.indexOf('SYSTEM_EDIT-MASS-SYSTEM')!==-1 && (
          <PublicButton
            name={'新增'}
            title={'新增'}
            icon={'icon-add'}
            afterCallBack={this.handleAdd}
            res={'MENU_EDIT'}
          />)}
          {permission.indexOf('SYSTEM_EDIT-MASS-SYSTEM')!==-1 && (
          <PublicButton
            name={'修改'}
            title={'修改'}
            show={showUpdata}
            icon={'icon-xiugaibianji'}
            afterCallBack={handleUpdate}
            res={'MENU_EDIT'}
          />)}
          {permission.indexOf('SYSTEM_EDIT-MASS-SYSTEM')!==-1 && (
          <PublicButton
            name={'删除'}
            title={'删除'}
            icon={'icon-shanchu'}
            useModel={true}
            show={showUpdata}
            edit={true}
            verifyCallBack={this.props.hasRecord}
            afterCallBack={handleDelete}
            content={`是否删除`}
            res={'MENU_EDIT'}
          />)}
        </div>
      </div>
    );
  }
}

const treeFunMap = arr => {
  for (let i = 0; i < arr.length; i++) {
    arr[i].title = arr[i].name;
    arr[i].value = arr[i].id;
    if (arr[i].children) {
      treeFunMap(arr[i].children);
    }
  }
  return arr;
};

const func = arr => {
  for (let i = 0; i < arr.length; i++) {
    arr[i].title = arr[i].typeNoVo.name;
    arr[i].value = arr[i].id;
    if (arr[i].children) {
      func(arr[i].children);
    }
  }
  return arr;
};

export default TopTags;
