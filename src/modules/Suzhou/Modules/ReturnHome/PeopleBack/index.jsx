import React, { Component } from 'react'
import { Table, notification } from 'antd'
import style from './style.less'
import { connect } from 'react-redux'
import { changeLocaleProvider } from '@/store/localeProvider/action'
import RightTags from '@/components/public/RightTags/index'
import * as util from '@/utils/util';
import * as dataUtil from '@/utils/dataUtil';
import {peopleBackList,getPermission} from '@/modules/Suzhou/api/suzhou-api';
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
            selectDate:'' ,//日期.
            instockDate:'', //搜索日期
            search:'', //搜索编号/名称
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
        const {projectId,sectionId,instockDate,search} = this.state;
        axios.get(peopleBackList(pageSize,currentPageNum),{params:{workerName:search}}).then(res=>{
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
        let menuCode = 'RETURNHOME-REPORT'
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
    instockSuccess = (val)=>{
        this.table.getData();
        // this.table.update(this.state.rightData, val)
    }
    //更新回调
    updateSuccess=(val)=>{
        this.table.update(this.state.rightData, val);
        this.setState({
            record: val,
            rightData: val
        })
    }
    //导入更新
    updateImportFile = ()=>{
        this.table.getData();
    }
    //选择入库时间
    selectDate = (date,dateString)=>{
        this.setState({
            selectDate:!dateString?'':dateString
        })
    }
    //搜索
    search =(val)=>{
        this.state.projectId?this.table.recoveryPage(1):'';
        const {selectDate} = this.state;
        this.setState({
            search:val,
            instockDate:selectDate
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
                        success={this.addSuccess}
                        delSuccess={this.delSuccess}
                        instockSuccess={this.instockSuccess}
                        search={this.search}
                        projectId={this.state.projectId}
                        sectionId = {this.state.sectionId}
                        selectDate = {this.selectDate}
                        updateSuccess={this.updateSuccess}
                        permission={this.state.permission}
                        updateImportFile = {this.updateImportFile}
                    />
                </Toolbar>
                <MainContent contentWidth = {document.body.clientWidth}>
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
                            scroll={{ x: 4000, y: this.props.height-100}}
                            />
                    )}
                </MainContent>
                {/* <RightTags
                        fileRelease={true}
                        rightData={this.state.rightData}
                        updateSuccess={this.updateSuccess}
                        projectId ={this.state.projectId}
                        groupCode={1}
                        menuCode = {this.props.menuInfo.menuCode}
                        menuId = {this.props.menuInfo.id}
                        bizType={this.props.menuInfo.menuCode}
                        bizId = {this.state.rightData ? this.state.rightData.id : null}
                        fileEditAuth={true}
                        extInfo={{startContent: "每日疫情"}}
                        // isShow={this.state.permission.indexOf('INSTOCK_FILE-MATERIELIN')==-1?false:true} //文件权限
                        // fileRelease={this.state.permission.indexOf('INSTOCK_FILE-ISSUEMATERIELIN')==-1?false:true}//文件发布权限
                        permission={this.state.permission}
                    /> */}
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
            title: '姓名',
            dataIndex: 'workerName',
            key: 'workerName',
            width:'100px'
        },
        {
            title: '籍贯',
            dataIndex: 'census',
            key: 'census',
            width:'150px'
        },
        {
            title: '单位名称',
            dataIndex: 'company',
            key: 'company',
            width:'200px'
        },
        {
            title: '身份证号',
            dataIndex: 'idNumber',
            key: 'idNumber',
            width:'200px'
        },
        {
            title: '手机号',
            dataIndex: 'phone',
            key: 'phone',
            width:'150px'
        },
        {
            title: '登记时健康状况',
            dataIndex: 'healthStatus',
            key: 'healthStatus',
            width:'150px'
        },
        {
            title: '返苏日期',
            dataIndex: 'dateBack',
            key: 'dateBack',
            width:'150px'
        },
        {
            title: '返苏居住地址',
            dataIndex: 'address',
            key:'address',
            width:'200px'
        },
        {
            title: '返苏交通工具',
            dataIndex: 'transportation',
            key: 'transportation',
            width:'100px'
        },
        {
            title: '车次或航班',
            dataIndex: 'flight',
            key: 'flight',
            width:'150px'
        },
        {
            title: '两周内重点人员接触史',
            dataIndex: 'isTouch',
            key: 'isTouch',
            width:'200px'
        },
        {
            title: '两周内重点疫区停留',
            dataIndex: 'isStay',
            key: 'isStay',
            width:'200px'
        },
        {
            title: '两周内途经重点疫区',
            dataIndex: 'isPassby',
            key: 'isPassby',
            width:'200px'
        },
        {
            title: '是否已在“苏州微公安”扫码申报',
            dataIndex: 'isApply',
            key: 'isApply',
            width:'250px'
        },
        {
            title: '是否封闭或隔离观察',
            dataIndex: 'isIsolate',
            key: 'isIsolate',
            width:'200px'
        },
        {
            title: '开始日期',
            dataIndex: 'startDate',
            key: 'startDate',
            width:'200px'
        },
        {
            title: '终止日期',
            dataIndex: 'endDate',
            key: 'endDate',
            width:'200px'
        },
        {
            title: '备注',
            dataIndex: 'des',
            key: 'des',
            width:'200px'
        },
    ];