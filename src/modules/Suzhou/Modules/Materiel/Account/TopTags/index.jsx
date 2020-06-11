import React, {Component} from 'react';
// import dynamic from 'next/dynamic';
import {Modal, message,Select,notification} from 'antd';
import {connect} from 'react-redux';
import {curdCurrentData} from '../../../../../../store/curdData/action';
import Search from '@/modules/Suzhou/components/Search';
import SelectProBtn from '@/modules/Suzhou/components/SelectBtn/SelectProBtn';
import SelectSectionBtn from '@/modules/Suzhou/components/SelectBtn/SelectSectionBtn';
import style from './style.less';
import axios from '@/api/axios';
import {addSpecialWorker,getMaterialRecordReport,getWarnHouseListNoPage} from '@/modules/Suzhou/api/suzhou-api';
import PublicButton from '@/components/public/TopTags/PublicButton';
import notificationFun from '@/utils/notificationTip';
const { Option } = Select;
export class TopTags extends Component{
    constructor(props){
        super(props);
        this.state = {
            modalVisible:false, //增加修改弹窗
            optionWarehouse:[],//仓库
        }
    }
    getWarnHouseList = ()=>{
        const {projectId,sectionId} = this.props;
        axios.get(getWarnHouseListNoPage,{params:{projectId,sectionIds:sectionId}}).then(res=>{
            this.setState({
                optionWarehouse:res.data.data
            })
        })
    }
    componentDidMount(){
        // this.props.projectId?this.getWarnHouseList():null;
    }
    //判断是否有选中数据
    hasRecord=()=>{
        if(this.props.selectedRows.length == 0){
            notificationFun('未选中数据','请选择数据进行操作');
            return false;
        }else {
            return true
        }
    }
    btnClicks = (name, type) => {
        const {record,sectionId,selectedRows,projectName,projectId} = this.props;
        if(name == 'ExportFile'){
            if(!projectId){
                notificationFun('提示','请先选择项目');
            }else{
                axios.down(getMaterialRecordReport+`?projectId=${projectId}&sectionIds=${sectionId}`).then((res)=>{
                })
            }
        }
    }
    render(){
        return(
            <div className={style.main}>
                <div className={style.search}>
                    仓库：
                    <Select allowClear 
                            onChange={this.props.selectWarehouse}
                            onFocus={this.getWarnHouseList}
                            value={this.props.showselectWarehouse}
                            style={{minWidth:'150px',marginRight: 10 }}
                            size="small">
                            {
                                this.state.optionWarehouse.length && this.state.optionWarehouse.map((item,i) => {
                                return (
                                    <Option key={item.id} value={item.name}>{item.name}</Option>
                                )
                                })
                            }
                    </Select>
                    <Search search={this.props.search} placeholder={'编码/名称'} />
                </div>
                <div className={style.tabMenu}>
                    <SelectProBtn  openPro={this.props.openPro} />
                    <SelectSectionBtn openSection={this.props.openSection} data1={this.props.projectId} />
                    {this.props.permission.indexOf('ACCOUNT_MATERIEL-DETAIL-EX')!==-1 && (
                    <PublicButton name={'导出'} title={'导出'} icon={'icon-iconziyuan2'}
                        afterCallBack={this.btnClicks.bind(this,'ExportFile')}
                        res={'MENU_EDIT'} />)}
                </div>
            </div>
        )
    }
}
export default TopTags;