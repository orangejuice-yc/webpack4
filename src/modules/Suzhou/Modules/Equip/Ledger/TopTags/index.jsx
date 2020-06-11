import React, { Component } from 'react'
import SelectProjectBtn from '../../../../components/SelectBtn/SelectProBtn'
import SelectSectionBtn from '../../../../components/SelectBtn/SelectSectionBtn'
import Search from '../../../../components/Search'
import style from './style.less'
import PublicButton from '@/components/public/TopTags/PublicButton'
import notificationFun from '@/utils/notificationTip';
export class TopTags extends Component {
    btnClicks = () => {
        this.props.delSuccess()
    }
    //判断是否有选中数据
    hasRecord=()=>{
        if (this.props.selectedRows.length == 0){
            notificationFun('操作提醒', '请选择数据进行操作')
            return false;
        } else {
            return true
        }
    }
    render() {
        const {search, openPro, openSection, data1,permission} = this.props
        return (
            <div className={style.main}>
                <div className={style.search}>
                    <Search search={search} placeholder={"编码/名称"} />
                </div>
                <div className={style.tabMenu}>
                    <SelectProjectBtn openPro={openPro} />
                    <SelectSectionBtn openSection={openSection} data1={data1} /> 
                    {permission.indexOf('LEDGER_EDIT-DEVICE-ACCOUNT')!==-1 && ( 
                    <PublicButton 
                        name={'删除'} 
                        title={'删除'} 
                        icon={'icon-shanchu'}
                        useModel={true} 
                        verifyCallBack={this.hasRecord}
                        edit={true}
                        afterCallBack={this.btnClicks}
                        content={'你确定要删除吗？'}
                        res={'MENU_EDIT'}
                    />)}
                </div>
            </div>
        )
    }
}

export default TopTags
