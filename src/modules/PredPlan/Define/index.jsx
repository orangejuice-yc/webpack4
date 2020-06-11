/*
 * @Author: wihoo.wanghao
 * @Date: 2019-01-16 16:38:09
 * @Last Modified by: wihoo.wanghao
 * @Last Modified time: 2019-03-21 11:11:56
 */
import React, { Component } from 'react'
import { notification } from 'antd'
import { ContextMenu, MenuItem, ContextMenuTrigger, SubMenu } from "react-contextmenu"
import '../../../static/css/react-contextmenu.global.css'
import moment from 'moment'
import TopTags from './TopTags/index'
import RightTags from '../../../components/public/RightTags/index'
import { connect } from 'react-redux'
import MyIcon from '../../../components/public/TopTags/MyIcon'
import AddForm from "./Add"
import TipModal from "../../Components/TipModal"
import axios from '../../../api/axios'
import { defineDel_ } from '../../../api/suzhou-api'
import { defineTree_ } from '../../../api/suzhou-api'
import { defineTree, defineDel, isHasTaskByDefineId,getEditPlanDefineAuth } from '../../../api/api'
import * as dataUtil from '../../../utils/dataUtil'
import TreeTable from '../../../components/PublicTable'
import ExtLayout from "../../../components/public/Layout/ExtLayout";
import MainContent from "../../../components/public/Layout/MainContent";
import Toolbar from "../../../components/public/Layout/Toolbar";

export class PlanDefine extends Component {
    constructor(props) {
        super(props)
        this.state = {
            newValue: "adbc",
            date: new Date(),
            value: moment('2019-01-25'),
            selectedValue: moment('2019-01-25'),
            name: 'planDefine',
            width: '',
            columns: [],
            data: [],
            dataMap: [],
            activeIndex: "",
            rightData: null,
            selectData: [],
            projectData: [],
            projectId: 0,
            defineEditAuth:false,
            contentMenu: [
                { name: '新增', fun: 'add', type: 'buttom', icon: 'plus-square', isPublic: false },
                { name: '删除', fun: 'delete', type: 'buttom', icon: 'delete', isPublic: false },
                { name: '打开项目计划', fun: 'openplanprepared', type: 'buttom', icon: 'reload', isPublic: false },
            ]
        }
    }
    //注册 父组件即可调用子组件方法
    onRef = (ref) => {
        this.table = ref
    }

    initDatas = (callBack) => {
        dataUtil.CacheOpenProjectByType('predDefine').getLastOpenProject((data) => {
            const { projectId } = data;
            this.setState({
                projectId,
                projectName: data.projectName,
                rightData: null
            }, () => {
                this.getPlanTreeList(callBack);
            })
        },'predDefine');
    }

    componentDidMount() {
        // 初始化数据
    }

    //打开项目
    openProject = () => {
        this.table.getData();
    }

    // 获取计划定义列表
    getPlanTreeList = (callBack) => {
        if (this.state.projectId) {
            axios.get(defineTree_(this.state.projectId, "1")).then(res => {
                callBack(res.data.data ? res.data.data : [])
                this.setState({
                    data: res.data.data,
                })
            })
        }else{
            callBack([])
        }
    }

    //table 点击行事件
    getInfo = (record, index) => {
        axios.get(isHasTaskByDefineId(record.id)).then(res => {
            this.setState({
                rightData: record,
                editAuth: res.data.data
            })
        })
        axios.get(getEditPlanDefineAuth(this.state.projectId)).then(res =>{
             if(res.data.data){
               this.setState({
                   defineEditAuth:true
               })
             }
        })
    }


    //新增
    addData = (val) => {
        this.table.add(this.state.data[0], val)
    }

    //删除

    delData = () => {
        let { rightData } = this.state;
        let url = dataUtil.spliceUrlParams(defineDel(rightData.id), { "startContent": "项目【" + this.state.projectName + "】" });
        axios.deleted(url, {}, true).then(res => {
            this.table.deleted(rightData);
            this.setState({
                rightData: null,
            }, () => {
                //关闭删除提示
                if (this.state.deleteTip) {
                    this.closeDeleteTipModal()
                }
            })
        })
    }

    //修改
    upDate = (val) => {
        let { rightData } = this.state;
        this.table.update(rightData, val);
    }
    //关闭删除提示框
    closeDeleteTipModal = () => {
        this.setState({
            deleteTip: false
        })
    }
    //右击菜单事件处理
    rightClickMenu = (menu) => {
        //新增
        if (menu.fun == "add") {
            this.setState({
                modalVisible: true
            })
        }
        //删除
        if (menu.fun == "delete") {
            if (this.state.rightData.type == "project") {
                notification.warning(
                    {
                        placement: 'bottomRight',
                        bottom: 50,
                        duration: 2,
                        message: "警告",
                        description: "只能删除计划"
                    }
                )
                return false
            }
            if (this.state.editAuth == true) {
                notification.warning(
                    {
                        placement: 'bottomRight',
                        bottom: 50,
                        duration: 2,
                        message: "警告",
                        description: "该计划定义下存在WBS或任务，禁止删除！"
                    }
                )
                return false
            }
            this.setState({
                deleteTip: true
            })
        }
        //打开计划编制
        if (menu.fun == "openplanprepared") {
            if (this.state.rightData.type == "project") {
                const children = this.state.rightData.children;
                const defineIds = [];
                if (children) {
                    for (let i = 0, len = children.length; i < len; i++) {
                        let item = children[i];
                        let defineId = item.id;
                        defineIds.push(defineId);
                    }
                }
                dataUtil.CacheOpenProject().addLastOpenPlan(defineIds, this.state.projectId, this.state.projectName);
                this.props.openMenuByMenuCode("PM-TASK", true);
            } else if (this.state.rightData.type == "define") {
                dataUtil.CacheOpenProject().addLastOpenPlan([this.state.rightData.id], this.state.projectId, this.state.projectName);
            }
            this.props.openMenuByMenuCode("PM-TASK", true);
        }
    }
    //打开新增弹框
    openAddModal = () => {
        this.setState({
            modalVisible: true
        })
    }
    // 关闭新增弹框
    handleCancel = () => {
        this.setState({
            modalVisible: false
        })
    }
    render() {
        const { intl } = this.props.currentLocale;
        const columns = [
            {
                title: intl.get('wsd.i18n.plan.plandefine.planname'), //计划名称
                dataIndex: 'name',
                key: 'name',
                width: "20%",
                render: (text, record) => {
                    if (record.type == 'project') {
                        return <span><MyIcon type='icon-xiangmu' style={{ marginRight: '5px' }} />{text}</span>
                    } else {
                        return <span> <MyIcon type='icon-jihua1' style={{ marginRight: '5px' }} />{text}</span>
                    }
                }
            },
            {
                title: '所属标段', //标段
                dataIndex: 'section',
                key: 'section',
                render: (text) => (<span>{text ? text.name : ""}</span>)
            }, 
            {
                title: intl.get('wsd.i18n.plan.plandefine.orgname'), //责任主体
                dataIndex: 'org',
                key: 'org',
                width: "10%",
                render: (text, record) => <span>{text ? text.name : ''}</span>
            },
            {
                title: intl.get('wsd.i18n.plan.plandefine.username'), //创建人
                dataIndex: 'user',
                key: 'user',
                width: "8%",
                render: (text, record) => <span>{text ? text.name : ''}</span>
            },
            {
                title: intl.get('wsd.i18n.plan.plandefine.planstarttime'), // 计划开始时间
                dataIndex: 'planStartTime',
                key: 'planStartTime',
                width: "8%",
                render: (text, record) => dataUtil.Dates().formatDateString(text)
            },
            {
                title: intl.get('wsd.i18n.plan.plandefine.planendtime'), //计划完成时间
                dataIndex: 'planEndTime',
                key: 'planEndTime',
                width: "8%",
                render: (text, record) => dataUtil.Dates().formatDateString(text)
            },
            {
                title: intl.get('wsd.i18n.plan.plandefine.plantype'), //计划类型
                dataIndex: 'planType',
                key: 'planType',
                width: "8%",
                render: (text, record) => <span> {text ? text.name : ''} </span>
            },
            {
                title: intl.get('wsd.i18n.plan.plandefine.remark'), //备注
                dataIndex: 'remark',
                key: 'remark',
            }
        ];

        let startContent = "项目【" + this.state.projectName + "】,计划定义【" + (this.state.rightData ? this.state.rightData.name : null) + "】";

        return (
            <span>
                <ExtLayout renderWidth={({ contentWidth }) => { this.setState({ contentWidth }) }}>
                    <Toolbar>
                        <TopTags
                            openProject={this.openProject}
                            projectId={this.state.projectId}
                            openAddModal={this.openAddModal}
                            rightData={this.state.rightData}
                            delData={this.delData}
                            editAuth={this.state.editAuth}
                            defineEditAuth={this.state.defineEditAuth}
                        />
                    </Toolbar>
                    <MainContent contentWidth={this.state.contentWidth} contentMinWidth={1500}>

                        <TreeTable onRef={this.onRef} getData={this.initDatas}
                            pagination={false} columns={columns}
                            getRowData={this.getInfo}
                            rightClick={this.rightClickMenu}
                            contentMenu={this.state.contentMenu}
                            expanderLevel={1}
                        />
                    </MainContent>
                    <RightTags rightTagList={this.state.rightTags} rightData={this.state.rightData} projectId={this.state.projectId} upDate={this.upDate}
                        fileRelease={true}
                        menuId = {this.props.menuInfo.id}
                        sectionId={this.state.rightData && this.state.rightData.section ? this.state.rightData.section.id : 0}
                        menuCode={this.props.menuInfo.menuCode}
                        groupCode={this.state.rightData && this.state.rightData.type == "project" ? -1 : 1}
                        bizType='define'
                        bizId={this.state.rightData ? this.state.rightData.id : null}
                        fileEditAuth={true}
                        cprtmEditAuth={true}
                        projectName={this.state.projectName}
                        callBackBanner={this.props.callBackBanner}
                        extInfo={{
                            startContent
                        }}
                    />

                    {/* 删除提示 */}
                    {this.state.deleteTip && <TipModal onOk={this.delData} onCancel={this.closeDeleteTipModal} />}
                    {/* 新增计划 */}
                    {this.state.modalVisible && <AddForm handleCancel={this.handleCancel}
                        projectId={this.state.projectId}
                        projectName={this.state.projectName}
                        addData={this.addData} rightData={this.state.rightData} />}

                </ExtLayout>
            </span>
        )
    }
}

/* *********** connect链接state及方法 start ************* */
export default connect(state => ({
    currentLocale: state.localeProviderData
}))(PlanDefine);
/* *********** connect链接state及方法 end ************* */

