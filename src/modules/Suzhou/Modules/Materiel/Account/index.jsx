import React, { Component } from 'react'
import { Table, notification } from 'antd'
import style from './style.less'
import { connect } from 'react-redux'
import { changeLocaleProvider } from '@/store/localeProvider/action'
import RightTags from '@/components/public/RightTags/index'
import * as util from '@/utils/util';
import * as dataUtil from '@/utils/dataUtil';
import {inventoryList,getPermission} from '@/modules/Suzhou/api/suzhou-api';
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
import {columnsCommon,columnsCreat,permissionFun} from "@/modules/Suzhou/components/Util/util.js";

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
            selectWarehouse:'',//选中
            warehouse:'',//搜索仓库
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
        const {projectId,sectionId,search,warehouse} = this.state;
        axios.get(inventoryList(pageSize,currentPageNum),{params:{projectId,sectionIds:sectionId,searcher:search,warehouse}}).then(res=>{
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
        // let menuCode = 'MATERIEL-ACCOUNT'
        //     axios.get(getPermission(menuCode)).then((res)=>{
        //     let permission = []
        //     res.data.data.map((item,index)=>{
        //         permission.push(item.code)
        //     })
        //     this.setState({
        //         permission
        //     })
        // })
        permissionFun(this.props.menuInfo.menuCode).then(res=>{
            this.setState({
                permission:!res.permission?[]:res.permission
            })
          });
        firstLoad().then(res=>{
            this.setState({
                projectId:res.projectId,
                projectName:res.projectName,
                sectionId:res.sectionId
            })
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
            section:section,
            selectWarehouse:''
        },()=>{
            this.table.getData();
        })
    }
    //搜索
    search =(val)=>{
        this.state.projectId?this.table.recoveryPage(1):'';
        const {selectWarehouse} = this.state;
        this.setState({
            search:val,
            warehouse:selectWarehouse
        },()=>{
            if(!this.state.projectId){
                notificationFun('警告','请选择项目')
            }else{
                this.table.getData();
            }
        })
    }
    //搜索仓库
    selectWarehouse = (val)=>{
        this.setState({
            selectWarehouse:!val?'':val
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
                        search={this.search}
                        openPro={this.openPro}
                        openSection={this.openSection}
                        projectId={this.state.projectId}
                        sectionId = {this.state.sectionId}
                        selectWarehouse = {this.selectWarehouse}
                        showselectWarehouse = {this.state.selectWarehouse}
                        permission={this.state.permission}
                    />
                </Toolbar>
                <MainContent contentWidth = {document.body.clientWidth}>
                    {this.state.projectId && (
                        <PublicTable onRef={this.onRef}
                            pagination={true}
                            getData={this.getList}
                            columns={columns}
                            getRowData={this.getInfo}
                            total={this.state.total}
                            pageSize={10}
                            scroll={{ x: 2300,y:this.props.height-100}}
                            />
                    )}
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
            title: '标段号',
            dataIndex: 'sectionCode',
            width:'130px',
            fixed: 'left',
            ellipsis: true,
            align: 'center',
        },
        {
            title: '标段名称',
            dataIndex: 'sectionName',
            width:'200px',
            fixed: 'left',
            ellipsis: true,
            align: 'center',
        },
        {
            title: '物料编码',
            dataIndex: 'materialCode',
            width:'230px',
            fixed: 'left',
            ellipsis: true,
            align: 'center',
        },
        {
            title: '物料名称',
            dataIndex: 'classificationVo.materialName',
            width:'200px',
            fixed: 'left',
            ellipsis: true,
            align: 'center',
        },
        {
            title: '来源',
            dataIndex: 'classificationVo.source',
            width:'100px',
            ellipsis: true,
        },
        {
            title: '规格型号',
            dataIndex: 'classificationVo.specification',
            width:'100px',
            ellipsis: true,
        },
        {
            title: '计量单位',
            dataIndex: 'classificationVo.unit',
            width:'100px',
            ellipsis: true,
        },
        {
            title: '供货商',
            dataIndex: 'classificationVo.supplier',
            width:'100px',
            ellipsis: true,
        },
        {
            title: '品牌',
            dataIndex: 'classificationVo.brand',
            width:'100px',
            ellipsis: true,
        },
        {
            title: '仓库位置',
            dataIndex: 'storagePosition',
            width:'100px',
            ellipsis: true,
        },
        {
            title: '本周到货量',
            dataIndex: 'thisWeekArrival',
            width:'100px',
            ellipsis: true,
        },
        {
            title: '本周出库量',
            dataIndex: 'thisWeekOutstore',
            width:'100px',
            ellipsis: true,
        },
        {
            title: '本周消耗量',
            dataIndex: 'thisWeekConsume',
            width:'100px',
            ellipsis: true,
        },
        {
            title: '合同总量',
            dataIndex: 'contractAmount',
            width:'100px',
            ellipsis: true,
        },
        {
            title: '累计到货量',
            dataIndex: 'totalArrival',
            width:'100px',
            ellipsis: true,
        },
        {
            title: '累计出库量',
            dataIndex: 'totalOutstore',
            width:'100px',
            ellipsis: true,
        },
        {
            title: '累计消耗量',
            dataIndex: 'totalConsume',
            width:'100px',
            ellipsis: true,
        },
        {
            title: '库存量',
            dataIndex: 'storageQuantity',
            width:'100px',
            ellipsis: true,
        },
        {
            title: '下周计划量',
            dataIndex: 'nextWeekPlanQuantity',
            width:'100px',
            ellipsis: true,
        },
        {
            title: '预警',
            dataIndex: 'warning',
            render:(text,record)=>{
                if(text == 1){
                    return <span><MyIcon type="icon-notice" style={{ fontSize: '18px',color:'#FFD306' }} /></span>
                }else{
                    return
                }
            },
            ellipsis: true,
            width:'100px',
        },
    ];