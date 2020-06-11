/*
 * @Author: wihoo.wanghao
 * @Date: 2019-01-16 16:38:09
 * @Last Modified by: wihoo.wanghao
 * @Last Modified time: 2019-03-21 11:11:56
 */
import React, { Component } from 'react'
import { Table, Icon ,notification} from 'antd'
import { ContextMenu, MenuItem, ContextMenuTrigger, SubMenu } from "react-contextmenu"
import style from './style.less'
import '../../../static/css/react-contextmenu.global.css'
import moment from 'moment'
import TopTags from './TopTags/index'
import RightTags from '../../../components/public/RightTags/index'
import { connect } from 'react-redux'
import * as util from '../../../utils/treeArrayByIdAndType'
import MyIcon from '../../../components/public/TopTags/MyIcon'
import RightClickMenu from "./RightClickMenu"
import AddForm from "./Add"
import TipModal from "../../Components/TipModal"
import axios from '../../../api/axios'
import {defineTree, defineDel, isHasTaskByDefineId, deleteclassifyassign} from '../../../api/api'
import {defineDel_} from '../../../api/suzhou-api'
import {defineTree_} from '../../../api/suzhou-api'
import * as dataUtil from '../../../utils/dataUtil'


export class PlanDefine extends Component {
    constructor(props) {
        super(props)
        this.state = {
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
            projectId: null,
            key:'tableKey'
        }
    }

    initDatas = () =>{

        dataUtil.CacheOpenProjectByType('implmentDefine').getLastOpenProject((data) => {
            const { projectId } = data;
            this.getPlanTreeList(projectId,data)
        },'implmentDefine');
    }

    componentDidMount() {
        //监听全局点击事件
        document.addEventListener('click', this.closeRight)
        // 初始化数据
        this.initDatas();
    }

    componentWillUnmount() {
        //销毁全局点击事件
        document.removeEventListener('click', this.closeRight, false);
    }
    // 关闭右击菜单
    closeRight = () => {
        if (this.state.rightClickShow) {
            this.setState({
                rightClickShow: false
            })
        }
    }

    // 获取计划定义列表
    getPlanTreeList = (projectId = 0,dat = {}) => {
        this.setState({
            rightData: null,
            activeIndex:null,
            projectId: projectId,
            projectName: dat["projectName"]
        })
        if (id != undefined) {
            axios.get(defineTree_(projectId,"3")).then(res => {
                const { data } = res.data
                const dataMap = util.dataMap(data);
                this.setState({
                    data,
                    dataMap,
                    key:'tableKey2'
                })
            })
        }
    }

    getInfo = (record, index) => {
      axios.get(isHasTaskByDefineId(record.id)).then(res => {
        this.setState({
          activeIndex: record.id+record.type,
          rightData: record,
          editAuth: res.data.data
        })
      })
    }

    setClassName = (record, index) => {
        //判断索引相等时添加行的高亮样式
        return record.id+record.type === this.state.activeIndex ? 'tableActivty' : "";
    }
    onSelect = (value) => {
        this.setState({
            value,
            selectedValue: value,
        });
    }
    onChange = date => this.setState({ date })

    handleRightMenuClick = (e, data) => {
        switch (data.action) {
            case 'spread':
                alert('展开')
                break;
            case 'projectPlan':
                alert('项目计划')
                break;
            case 'hideShowColumns':
                alert('隐藏/显示列')
                break;
            default:
                break;
        }
    }

    //新增
    addData = (val) => {
        let { data } = this.state;
        if (data[0].children) {
            data[0].children.push(val);
        } else {
            data[0] = {
                ...data[0],
                children: [val]
            }
        }
        const dataMap = util.dataMap(data);
        this.setState({
            data,
            dataMap
        })
    }

    //删除

    delData = () => {

        let { data, dataMap, rightData } = this.state;
        let url = dataUtil.spliceUrlParams(defineDel_(rightData.id),{"startContent": "项目【"+this.state.projectName+"】"});

        axios.deleted(url , {}, true).then(res => {
            util.deleted(data, dataMap, rightData);
            const dataMap1 = util.dataMap(data);
            this.setState({
                data,
                rightData: null,
                activeIndex: null,
                dataMap: dataMap1
            },()=>{
                //关闭删除提示
                if(this.state.deleteTip){
                    this.closeDeleteTipModal()
                }
            })
        })
    }

    //修改
    upDate = (val) => {
        let { data, dataMap, rightData } = this.state;
        util.modify(data, dataMap, rightData, val);
        this.setState({
            data,
            dataMap
        })
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
        if (menu == "add") {
            this.setState({
                modalVisible: true
            })
        }
        //删除
        if (menu == "delete") {
            if (this.state.rightData.type=="project") {
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
        if (menu == "openplanprepared") {
            dataUtil.CacheOpenProject().addLastOpenPlan([this.state.rightData.id],this.state.projectId,this.state.projectName);
            this.props.openMenuByMenuCode("PM-TASK",true);
        }
        //关闭右击菜单
        this.setState({
            rightClickShow: false
        })
    }
    //打开新增弹框
    openAddModal=()=>{
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
                title: '计划名称', //计划名称
                dataIndex: 'name',
                key: 'name',
                width: 360,
                render: (text, record) => {
                    if (record.type == 'project'){
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
            // {
            //     title: intl.get('wsd.i18n.plan.plandefine.plancode'), //代码
            //     dataIndex: 'code',
            //     key: 'code',
            // },
            {
                title: intl.get('wsd.i18n.plan.plandefine.orgname'), //责任主体
                dataIndex: 'org',
                key: 'org',
                render: (text) => <span>{text ? text.name : ''}</span>
            },
            {
                title: intl.get('wsd.i18n.plan.plandefine.username'), //创建人
                dataIndex: 'user',
                key: 'user',
                render: (text) => <span>{text ? text.name : ''}</span>
            },
            {
                title: intl.get('wsd.i18n.plan.plandefine.planstarttime'), // 计划开始时间
                dataIndex: 'planStartTime',
                key: 'planStartTime',
                render: (text) =>  dataUtil.Dates().formatDateString(text)
            },
            {
                title: intl.get('wsd.i18n.plan.plandefine.planendtime'), //计划完成时间
                dataIndex: 'planEndTime',
                key: 'planEndTime',
                render: (text) =>  dataUtil.Dates().formatDateString(text)
            },
            {
                title: intl.get('wsd.i18n.plan.plandefine.plantype'), //计划类型
                dataIndex: 'planType',
                key: 'planType',
                render: (text) => <span> {text ? text.name : ''} </span>
            },
            {
                title: intl.get('wsd.i18n.plan.plandefine.remark'), //备注
                dataIndex: 'remark',
                key: 'remark',
            }
        ];

        let startContent = "项目【"+ this.state.projectName +"】,计划定义【"+ (this.state.rightData ? this.state.rightData.name : null) +"】";

        return (

            <div>
                <TopTags
                    openProject = {this.getPlanTreeList}
                    projectId={this.state.projectId}
                    openAddModal={this.openAddModal}
                    rightData={this.state.rightData}
                    delData={this.delData}
                    editAuth={this.state.editAuth}
                />
                <div className={style.main}>
                    <div className={style.leftMain} style={{ height: this.props.height }} >
                    <div style={{ minWidth: 'calc(100vw - 60px)' }}>
                            <Table rowKey={record => record.id + record.type} defaultExpandAllRows={true} key={this.state.key} pagination={false}
                                name={this.props.name} columns={columns} size='small'
                                dataSource={this.state.data} rowClassName={this.setClassName} onRow={(record, index) => {
                                    return {
                                        onClick: (event) => {
                                            this.getInfo(record, index)
                                        },
                                        //右击事件
                                        onContextMenu: (event) => {
                                            //取消事件的默认动作
                                            event.preventDefault()
                                            this.setState({
                                                rightClickShow: true,
                                                activeIndex: record.id+record.type,
                                                rightData: record,
                                                x: event.clientX,
                                                y: event.clientY - 120,
                                            })
                                        }
                                    }
                                }
                                } />
                       </div>
                    </div>
                    <div className={style.rightBox} style={{ height: this.props.height }}>
                     
                        <RightTags rightTagList={this.state.rightTags} rightData={this.state.rightData} projectId={this.state.projectId} upDate={this.upDate}
                            fileRelease={true}
                            menuId = {this.props.menuInfo.id}
                            sectionId={this.state.rightData && this.state.rightData.section ? this.state.rightData.section.id : 0}
                            menuCode={this.props.menuInfo.menuCode}
                            groupCode={this.state.rightData && this.state.rightData.type=="project"? -1:1}
                            bizType='define'
                            bizId = {this.state.rightData ? this.state.rightData.id : null}
                            fileEditAuth = {true}
                            cprtmEditAuth = {true}
                            projectName = {this.state.projectName }
                            extInfo = {{
                              startContent
                            }}
                        />
                    </div>
                </div>
                {/* 右击菜单 */}
                {this.state.rightClickShow &&
                    <RightClickMenu name={this.state.clickTreeName} x={this.state.x} y={(this.state.y > this.props.height - 100) ? this.props.height - 100 : this.state.y}
                        handleClick={this.rightClickMenu} />}

                {/* 删除提示 */}
                {this.state.deleteTip && <TipModal onOk={this.delData} onCancel={this.closeDeleteTipModal} />}
                {/* 新增计划 */}
                {this.state.modalVisible && <AddForm handleCancel={this.handleCancel}
                    projectId={this.state.projectId}
                    projectName = {this.state.projectName }
                    addData={this.addData} rightData={this.state.rightData}/>}
            </div>
        )
    }
}

/* *********** connect链接state及方法 start ************* */
export default connect(state => ({
    currentLocale: state.localeProviderData
}))(PlanDefine);
/* *********** connect链接state及方法 end ************* */

