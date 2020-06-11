import React, { Component, Fragment } from 'react';
import { addSecurityExaminationBatch } from '@/modules/Suzhou/api/suzhou-api';
import PublicButton from '@/components/public/TopTags/PublicButton';
import SelectUser from '../SelectUser';

import axios from '@/api/axios';
import style from './style.less';
//
export default class extends Component {
  state = { visible: false };
  handleOk = params => {
    axios.post(addSecurityExaminationBatch, params, true).then(res => {
      const { data } = res.data;
      this.setState(() => ({ visible: false }), () => this.props.handleAddData(data));
    });
  };
  render() {
    return (
      <Fragment>
        <PublicButton
          name={'新增'}
          title={'新增'}
          icon={'icon-add'}
          afterCallBack={() => this.setState({ visible: true })}
          res={'MENU_EDIT'}
        />
        {this.state.visible && (
          <SelectUser
            visible={this.state.visible}
            handleCancel={() => this.setState({ visible: false })}
            menu={this.props.menu}
            handleOk={this.handleOk}
          />
        )}
      </Fragment>
    );
  }
}
