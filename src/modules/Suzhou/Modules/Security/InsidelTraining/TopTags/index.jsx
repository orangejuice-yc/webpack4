import React from 'react';
import PublicButton from '@/components/public/TopTags/PublicButton';
import AddFormComponent from '../AddForm';
import SearchVeiw from '../SearchVeiw';
import style from './style.less';

export default props => (
  <div className={style.main}>
    <div className={style.tabMenu}>
      {props.permission.indexOf('INSIDELTRAINING_EDIT-IN-TRAINING')!==-1 && ( 
      <AddFormComponent handleAddData={props.handleAddData} />)}
      {props.permission.indexOf('INSIDELTRAINING_EDIT-IN-TRAINING')!==-1 && ( 
      <PublicButton
        name={'删除'}
        title={'删除'}
        icon={'icon-shanchu'}
        content={'你确定要删除吗？'}
        res={'MENU_EDIT'}
        useModel={true}
        edit={true}
        afterCallBack={props.handleDeleteData}
        show={props.selectedRowKeys.length > 0 && props.auth}
      />)}
    </div>
    <div className={style.rightLayout}>
      <SearchVeiw handleSearch={props.handleSearch} />
    </div>
  </div>
);
