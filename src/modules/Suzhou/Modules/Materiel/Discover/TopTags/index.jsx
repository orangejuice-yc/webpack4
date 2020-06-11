import React, { Component } from 'react';
// import dynamic from 'next/dynamic';
import { Modal, message, Select, notification } from 'antd';
import { connect } from 'react-redux';
import { curdCurrentData } from '@/store/curdData/action';
import Search from '@/modules/Suzhou/components/Search';
import SelectProBtn from '@/modules/Suzhou/components/SelectBtn/SelectProBtn';
import SelectSectionBtn from '@/modules/Suzhou/components/SelectBtn/SelectSectionBtn';
import style from './style.less';
import axios from '@/api/axios';
import { addInspection, delInspection } from '@/modules/Suzhou/api/suzhou-api';
import PublicButton from '@/components/public/TopTags/PublicButton';
import notificationFun from '@/utils/notificationTip';
import AddModal from '../AddModal';
const { Option } = Select;
export class TopTags extends Component {
  constructor(props) {
    super(props);
    this.state = {
      modalVisible: false, //增加修改弹窗
    };
  }
  //判断是否有选中数据
  hasRecord = () => {
    if (this.props.selectedRows.length == 0) {
      notificationFun('未选中数据', '请选择数据进行操作');
      return false;
    } else {
      return true;
    }
  };
  btnClicks = (name, type) => {
    const { record, sectionId, selectedRows, projectName, projectId } = this.props;
    if (name == 'AddTopBtn') {
      if (!projectId) {
      } else {
        this.setState({
          modalVisible: true,
          type: 'ADD',
        });
      }
    }
    if (name == 'ImportFile') {
    }
    if (name == 'DeleteTopBtn') {
      const deleteArray = [];
      selectedRows.forEach((value, item) => {
        deleteArray.push(value.id);
      });
      axios
        .deleted(delInspection, { data: deleteArray }, true)
        .then(res => {
          this.props.delSuccess(deleteArray);
        })
        .catch(err => {});
    }
  };
  submit = (values, type) => {
    const data = {
      ...values,
      projectId: this.props.projectId,
    };
    axios.post(addInspection, data, true).then(res => {
      if (res.data.status === 200) {
        if (type == 'save') {
          this.handleCancel();
        }
        this.props.success(res.data.data);
      }
    });
  };
  //关闭model
  handleCancel = () => {
    this.setState({
      modalVisible: false,
    });
  };
  render() {
    const props = this.props
    return (
      <div className={style.main}>
        <div className={style.search}>
          <Search search={this.props.search} placeholder={'编码/名称'} />
        </div>
        <div className={style.tabMenu}>
          <SelectProBtn openPro={this.props.openPro} />
          <SelectSectionBtn openSection={this.props.openSection} data1={this.props.projectId} />
          {props.permission.indexOf('DISCOVER_MATERIEL-CHECK')!==-1 && (
          <PublicButton
            name={'新增'}
            title={'新增'}
            icon={'icon-add'}
            afterCallBack={this.btnClicks.bind(this, 'AddTopBtn')}
            res={'MENU_EDIT'}
          />)}
          {props.permission.indexOf('DISCOVER_MATERIEL-CHECK')!==-1 && (
          <PublicButton
            name={'删除'}
            title={'删除'}
            icon={'icon-shanchu'}
            useModel={true}
            edit={true}
            verifyCallBack={this.hasRecord}
            afterCallBack={this.btnClicks.bind(this, 'DeleteTopBtn')}
            content={'你确定要删除嘛'}
            res={'MENU_EDIT'}
          />)}
        </div>
        {this.state.modalVisible && (
          <AddModal
            record={this.props.record}
            modalVisible={this.state.modalVisible}
            success={this.props.success}
            submit={this.submit.bind(this)}
            sectionId={this.props.sectionId}
            projectId={this.props.projectId}
            handleCancel={this.handleCancel.bind(this)}
          />
        )}
      </div>
    );
  }
}
export default TopTags;
