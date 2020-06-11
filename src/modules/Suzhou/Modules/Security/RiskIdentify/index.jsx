import React, { Component } from 'react'
import { Table, notification } from 'antd'
import style from './style.less'
import { connect } from 'react-redux'
import { changeLocaleProvider } from '@/store/localeProvider/action'
import RightTags from '@/components/public/RightTags/index'
import * as util from '@/utils/util';
import * as dataUtil from '@/utils/dataUtil';
import {riskIndentifyList,getPermission} from '@/modules/Suzhou/api/suzhou-api';
import axios from '@/api/axios';
import MyIcon from "@/components/public/TopTags/MyIcon";
import TopTags from './TopTags/index';
import notificationFun from '@/utils/notificationTip';
// 布局
import ExtLayout from "@/components/public/Layout/ExtLayout";
import MainContent from "@/components/public/Layout/MainContent";
import Toolbar from "@/components/public/Layout/Toolbar";
import PublicTable from '@/components/PublicTable'
import {firstLoad} from "@/modules/Suzhou/components/Util/firstLoad";
import {columnsCommon} from "@/modules/Suzhou/components/Util/util.js";

class Sort extends Component {
    constructor(props){
        super(props);
        this.state = {
            selectedRowKeys:[],
            pageSize:10,
            currentPageNum:1,
            total:'',
            selectedRows:[],
            projectId:'', //项目id
            sectionId:'', //标段id
            projectName:'', //项目名称
            data:[], 
            activeIndex:null, 
            search:'', //搜索编号/名称
            initiateTimeFrom:'',//开始时间
            initiateTimeTo:'' ,//结束时间
            permission:[]
        }
    }
    /**
    * 父组件即可调用子组件方法
    * @method
    * @description 获取用户列表、或者根据搜索值获取用户列表
    * @param {string} record  行数据
    * @return {array} 返回选中用户列表
    */
    onRef = (ref) => {
        this.table = ref
    }
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
    getInfo = (record)=>{
        const { activeIndex } = this.state;
        const { id } = record;
        this.setState({
            activeIndex: id,
            record: record,
            rightData: record
        });
    }
    getList= (currentPageNum, pageSize, callBack) =>{
        const {projectId,sectionId,initiateTimeFrom,initiateTimeTo} = this.state;
        axios.get(riskIndentifyList(pageSize,currentPageNum),{params:{projectId,sectionIds:sectionId,initiateTimeFrom,initiateTimeTo}}).then(res=>{
            callBack(res.data.data ? res.data.data : [])
            let data = res.data.data;
            this.setState({
                data,
                total: res.data.total,
                rightData: null,
                selectedRowKeys: [],
            })
        })
    }
    componentDidMount(){
        let menuCode = 'SECURITY-RISK'
        axios.get(getPermission(menuCode)).then((res)=>{
        let permission = []
        res.data.data.map((item,index)=>{
            permission.push(item.code)
        })
        this.setState({
            permission
        })
        })
        firstLoad().then(res=>{
            this.setState({
                projectId:res.projectId,
                projectName:res.projectName,
                sectionId:res.sectionId
            })
        })
    }
    //增加回调
    addSuccess=(val)=>{
        this.table.recoveryPage(1)
        this.table.getData();
    }
    //删除回调
    delSuccess = (del)=>{
        this.table.getData();
    }
    //更新回调
    updateSuccess=(val)=>{
        this.table.update(this.state.rightData, val);
        this.setState({
            record: val,
            rightData: val
        })
    }
    //打开项目
    openPro=(projectId,project,projectName)=>{
        !this.state.projectId?'':this.table.recoveryPage(1);
        this.setState({
            projectId:projectId[0],
            projectName,
            sectionId:''
        },()=>{
            this.table.getData();
        })
    }
    //打开标段
    openSection = (sectionId,section)=>{
        this.table.recoveryPage(1);
        const {projectId} = this.state;
        this.setState({
            sectionId:sectionId.join(','),
            section:section
        },()=>{
            this.table.getData();
        })
    }
    
    //搜索
    search =(val)=>{
        this.state.projectId?this.table.recoveryPage(1):'';
        this.setState({
            initiateTimeFrom:val.initiateTimeFrom,
            initiateTimeTo:val.initiateTimeTo
        },()=>{
            if(!this.state.projectId){
                notificationFun('警告','请选择项目')
            }else{
                this.table.getData();
            }
        })
    }
    //设置table的选中行class样式
    setClassName = (record, index) => {
        return record.id === this.state.activeIndex ? 'tableActivty' : '';
    };
    render(){
        return(
            <ExtLayout renderWidth={({ contentWidth }) => { this.setState({ contentWidth }) }}>
                <Toolbar>
                    <TopTags
                        projectName = {this.state.projectName}
                        record={this.state.record}
                        selectedRows={this.state.selectedRows}
                        selectedRowKeys={this.state.selectedRowKeys}
                        success={this.addSuccess}
                        delSuccess={this.delSuccess}
                        search={this.search}
                        openPro={this.openPro}
                        openSection={this.openSection}
                        projectId={this.state.projectId}
                        sectionId = {this.state.sectionId}
                        updateSuccess={this.updateSuccess}
                        selectDate = {this.selectDate}
                        permission={this.state.permission}
                    />
                </Toolbar>
                <MainContent>
                    {this.state.projectId && (
                        <PublicTable onRef={this.onRef}
                            pagination={true}
                            getData={this.getList}
                            columns={columns}
                            rowSelection={true}
                            onChangeCheckBox={this.getSelectedRowKeys}
                            useCheckBox={true} 
                            getRowData={this.getInfo}
                            total={this.state.total}
                            pageSize={10}
                            />
                    )}
                </MainContent>
                <RightTags
                        rightData={this.state.rightData}
                        updateSuccess={this.updateSuccess}
                        projectId ={this.state.projectId}
                        groupCode={1}
                        menuCode = {this.props.menuInfo.menuCode}
                        menuId = {this.props.menuInfo.id}
                        bizType={this.props.menuInfo.menuCode}
                        bizId = {this.state.rightData ? this.state.rightData.id : null}
                        fileEditAuth={true}
                        extInfo={{startContent: "安全管理-风险辨识"}}
                        permission={this.state.permission}
                    />
            </ExtLayout>
        )
    }
}
export default connect(state => ({
    currentLocale: state.localeProviderData
}), {
        changeLocaleProvider
    })(Sort);

    const columns = [
        ...columnsCommon,
        {
            title: '风险名称',
            dataIndex: 'title',
            width:"10%"
        },
        // {
        //     title: '项目名称',
        //     dataIndex: 'projectName',
        //     width:"10%"
        // },
        // {
        //     title: '标段名称',
        //     dataIndex: 'sectionName',
        //     width:"8%"
        // },
        {
            title: '发生位置',
            dataIndex: 'location',
            width:"10%"
        },
        {
            title: '风险因素',
            dataIndex: 'riskReason',
            width:"10%"
        },
        {
            title: '风险损失',
            dataIndex: 'riskLoss',
            width:"10%"
        },
        {
            title: '概率',
            dataIndex: 'probability',
            width:"6%"
        },
        {
            title: '风险等级',
            dataIndex: 'riskLevel',
            width:"10%"
        },
        {
            title: '处置负责单位',
            dataIndex: 'processCompany',
            width:"10%"
        },
        {
            title: '创建日期',
            dataIndex: 'initiateTime',
            width:"10%"
        },
        {
            title: '创建人',
            dataIndex: 'initiator',
            width:"6%"
        },
    ];