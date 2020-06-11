import React from 'react';
import PublicButton from '@/components/public/TopTags/PublicButton';
import SelectProjectBtn from '@/modules/Suzhou/components/SelectBtn/SelectProBtn';
import SelectSectionBtn from '@/modules/Suzhou/components/SelectBtn/SelectSectionBtn';
import SearchVeiw from '../SearchVeiw';
import AddForm from '../AddForm';
import style from './index.less';
import notificationFun from '@/utils/notificationTip';

const TopTags = ({
  handleAdd,
  handleDelete,
  handleSearch,
  handleGetProjectId,
  handleOpenSection,
  selectedRowKeys,
  projectId,
  type,
  permission,
  editPermission
}) => {
  const hasRecord = () => {
    if (selectedRowKeys.length > 0) {
      return true;
    } else {
      notificationFun('未选中数据');
      return false;
    }
  };

  return (
    <div className={style.main}>
      <div className={style.tabMenu}>
        <SelectProjectBtn openPro={handleGetProjectId} />
        <SelectSectionBtn openSection={handleOpenSection} data1={projectId} />
        {permission.indexOf(editPermission)!==-1 && (
        <AddForm projectId={projectId} handleAdd={handleAdd} type={type} />)}
        {permission.indexOf(editPermission)!==-1 && (
        <PublicButton
          name={'删除'}
          title={'删除'}
          icon={'icon-shanchu'}
          afterCallBack={handleDelete}
          res={'MENU_EDIT'}
          edit={true}
          useModel={true}
          show={selectedRowKeys.length > 0}
          content={'你确定要删除吗？'}
        />)}
      </div>
      <div className={style.rightLayout}>
        <SearchVeiw handleSearch={handleSearch} />
      </div>
    </div>
  );
};

export default TopTags;
