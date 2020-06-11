import React, { Component } from 'react'
import { Table, notification } from 'antd'
import style from './style.less'
import { connect } from 'react-redux'
import { changeLocaleProvider } from '@/store/localeProvider/action'
import RightTags from '@/components/public/RightTags/index'
import * as util from '@/utils/util';
import * as dataUtil from '@/utils/dataUtil';
import {getCountRcDetailReport,getPermission} from '@/modules/Suzhou/api/suzhou-api';
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
import { isArray } from 'util'

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
            search:'' ,//搜索
            viewType:'0',
            companyName:'',//组织信息
            zqStart:'',//时间开始
            zqEnd:'',//时间结束
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
        this.setState({
            record: record,
            rightData: record
        });
    }
    getList= (currentPageNum, pageSize, callBack) =>{
        const {search,viewType,companyName,zqStart,zqEnd} = this.state;
        axios.get(getCountRcDetailReport(pageSize,currentPageNum),{params:{viewType,companyName,zqStart,zqEnd}}).then(res=>{
            callBack(res.data.data ? res.data.data : [])
            let data = res.data.data;
            data && Array.isArray(data)?(
                data.map((item,i)=>{
                    item.id = item.COMPANY_ID
                })
            ):data;
            this.setState({
                data,
                total: res.data.total,
                rightData: null,
                selectedRowKeys: [],
            })
        })
    }
    componentDidMount(){
        let firstDate = new Date();
        firstDate.setDate(1); //第一天
        let endDate = new Date(firstDate);
        endDate.setMonth(firstDate.getMonth() + 1);
        endDate.setDate(0);
        const firstDay =
        (new Date(firstDate).getDate() + '').length == 1
            ? '0' + new Date(firstDate).getDate()
            : new Date(firstDate).getDate();
        const endDay =
        (new Date(endDate).getDate() + '').length == 1
            ? '0' + new Date(endDate).getDate()
            : new Date(endDate).getDate();
        const startTime = `${new Date(firstDate).getFullYear()}-${new Date(firstDate).getMonth() +
        1}-${firstDay}`;
        const endTime = `${new Date(endDate).getFullYear()}-${new Date(endDate).getMonth() +
        1}-${endDay}`;
        this.setState({
            zqStart: startTime,
            zqEnd: endTime,
        },()=>{
            this.table.getData();
        });
        let menuCode = 'SECURITY-REPORTSTATISTICS'
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
    //搜索
    successSearch = (companyName,zqStart,zqEnd)=>{
        this.table.recoveryPage(1)
        this.setState({
            companyName:companyName?companyName:'',
            zqStart:zqStart?zqStart:'',
            zqEnd:zqEnd?zqEnd:'',
        },()=>{
            this.table.getData();
        })
    }
    //设置table的选中行class样式
    
    
    //选择试图
    selectType = (val)=>{
        this.table.recoveryPage(1);
        this.setState({
            viewType:val
        },()=>{
            this.table.getData();
        })
    }
    render(){
        return(
            <ExtLayout renderWidth={({ contentWidth }) => { this.setState({ contentWidth }) }}>
                <Toolbar>
                    <TopTags
                        record={this.state.record}
                        successSearch={this.successSearch}
                        zqStart={this.state.zqStart}
                        zqEnd={this.state.zqEnd}
                        selectType={this.selectType}
                        viewType = {this.state.viewType}
                        permission={this.state.permission}
                    />
                </Toolbar>
                <MainContent contentWidth = {document.body.clientWidth}>
                <PublicTable onRef={this.onRef}
                            pagination={true}
                            getData={this.getList}
                            columns={columns}
                            getRowData={this.getInfo}
                            total={this.state.total}
                            pageSize={10}
                        />
                </MainContent>
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
        {
            title: '组织名称',
            dataIndex: 'ORG_NAME',
            key:"ORG_NAME",
            width:'40%'
        },
        {
            title: '工作事项',
            dataIndex: 'GZSX_NUM',
            key: 'GZSX_NUM',
            width:'40%'
        },
        {
            title: '逾期次数',
            dataIndex: 'YQ_NUM',
            key: 'YQ_NUM',
            width:'20%'
        },
    ];