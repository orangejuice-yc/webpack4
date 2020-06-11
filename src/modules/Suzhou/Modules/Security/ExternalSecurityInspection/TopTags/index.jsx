import React from 'react';
import PublicButton from '@/components/public/TopTags/PublicButton';
import SelectProjectBtn from '@/modules/Suzhou/components/SelectBtn/SelectProBtn';
import SelectSectionBtn from '@/modules/Suzhou/components/SelectBtn/SelectSectionBtn';
import AddFormComponent from '../AddForm';
import SearchVeiw from '../SearchVeiw';
import style from './style.less';

export default props => (
  <div className={style.main}>
    <div className={style.tabMenu}>
      <SelectProjectBtn openPro={props.openPro} />
      <SelectSectionBtn openSection={props.openSection} data1={props.projectId} />
      {props.permission.indexOf('CHECK_SCENE-CHECK')!==-1 && ( 
      <AddFormComponent projectId={props.projectId} handleAddData={props.handleAddData} />)}
      {props.permission.indexOf('CHECK_SCENE-CHECK')!==-1 && ( 
      <PublicButton
        name={'删除'}
        title={'删除'}
        icon={'icon-shanchu'}
        content={'你确定要删除吗？'}
        res={'MENU_EDIT'}
        useModel={true}
        edit={true}
        afterCallBack={props.handleDeleteData}
        show={props.selectedRowKeys.length > 0}
      />)}
    </div>
    <div className={style.rightLayout}>
      <SearchVeiw
        handleSearch={props.handleSearch}
        projectId={props.projectId}
        sectionIds={props.sectionIds}
      />
    </div>
  </div>
);
