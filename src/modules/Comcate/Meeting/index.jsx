import React, { Component } from 'react'
import style from './style.less'
import ExtLayout from "../../../components/public/Layout/ExtLayout";
import MainContent from "../../../components/public/Layout/MainContent";
import Toolbar from "../../../components/public/Layout/Toolbar";
import TopTags from './TopTags/index'
import RightTags from '../../../components/public/RightTags/index'
import { meetingList } from '../../../api/api'
import axios from '../../../api/axios'
import PublicTable from '../../../components/PublicTable'
/* *********** 引入redux及redux方法 start ************* */
import { connect } from 'react-redux'
import * as dataUtil from "../../../utils/dataUtil";

export class ComcateMeeting extends Component {
    constructor(props) {
        super(props)
        this.state = {

            columns: [],
            date: new Date(),
            currentPage: 1,
            pageSize: 10,
            selectedDeleId: '',
            data: [],
            activeIndex: null,
            rightData: null,
            selectedRowKeys: [],
            rightTags: [
                { icon: 'iconjibenxinxi', title: '基本信息', fielUrl: 'Comcate/Meeting/MeetInfo' },
                { icon: 'iconwenjian', title: '文件信息', fielUrl: 'Components/FileInfo' },
                { icon: 'iconicon-1', title: '会议行动项', fielUrl: 'Comcate/Meeting/MeetAction' },
                { icon: 'iconliuchengxinxi', title: '流程信息', fielUrl: 'MyProcess/ProcessInfo' },
            ],
            /* *********** 初始化rightTag ************* */
        }
    }

    componentDidMount() {
        this.initDatas();
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


    //table表格单行点击回调
    getInfo = (record, index) => {
        this.setState({
            rightData: record
        })
    }

    /**
     * 初始化数据
     */
    initDatas = () => {
        dataUtil.CacheOpenProject().getLastOpenProjectByTask((data) => {
            const { projectId, projectName } = data;
            if (projectId) {
                this.setState({
                    projectId,
                    projectName
                })
            }
        });
    }

     /**
   * 验证复选框是否可操作
   * @method checkboxStatus
   * @return {boolean}
   */
  checkboxStatus = (record) => {
    if (record.status.id == 'EDIT') {
      return false
    } else {
      return true
    }
  }

    //刷新table数据
    refresh = () => {
        this.table.getData();
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

    getMeetingListByProject = (projectId, project) => {
        project = project || {}
        this.setState({
            projectId,
            projectName: project.projectName
        }, () => {
            this.table.getData();
        })
    }

    // 获取会议管理列表
    getMeetingList = (currentPageNum, pageSize, callBack) => {
        axios.get(meetingList(this.state.projectId || -1, pageSize, currentPageNum) + (this.state.searcher ? "/" + this.state.searcher : "")).then((result) => {
            callBack(result.data.data ? result.data.data : [])
            let data = result.data.data;
            this.setState({
                data,
                total: result.data.total,
                rightData: null,
                selectedRowKeys: [],
            })
        })
    }
    //搜索
    search = (value) => {

        this.setState({
            searcher: value
        }, () => {
            this.table.getData();
        })
    }

    //新增
    addData = (value) => {
        this.table.getData();
    }
    //修改
    updateSuccess = (value) => {
        this.table.update(this.state.rightData, value)
    }
    //删除
    deleteData = () => {
        
        this.table.getData();
    }
    render() {
        const { intl } = this.props.currentLocale
        const columns = [
            {
                title: intl.get('wsd.i18n.comu.meeting.title'),
                dataIndex: 'title',
                key: 'title',
                width:200,
            },

            {
                title: intl.get('wsd.i18n.comu.meeting.projectname'),
                dataIndex: 'project',
                key: 'project',
                width:150,
            },
            {
                title: intl.get('wsd.i18n.plan.plandefine.orgname'),
                dataIndex: 'org',
                key: 'org',
                width:100,
                render: text => text ? text.name : null
            },
            {
                title: intl.get('wsd.i18n.comu.meeting.meetingaddress'),
                dataIndex: 'meetingAddress',
                key: 'meetingAddress',
                width:150,
                render: text => text ? text.substr(0, 10) : null
            },
            {
                title: intl.get('wsd.i18n.comu.meeting.meettime'),
                dataIndex: 'meetingTime',
                key: 'meetingTime',
                width:100,
                render: (text) => dataUtil.Dates().formatDateString(text)
            },
            {
                title: intl.get('wsd.i18n.comu.meeting.meetingtype'),
                dataIndex: 'meetingType',
                key: 'meetingType',
                width:100,
                render: text => text ? text.name : null
            },
            {
                title: intl.get('wsd.i18n.comu.meeting.status'),
                dataIndex: 'status',
                key: 'status',
                width:100,
                render: text => text ? text.name : null
            },
        ]

        let startContent = "项目【" + this.state.projectName + "】,会议管理【" + (this.state.rightData ? this.state.rightData.title : null) + "】";
        return (
            
            <ExtLayout renderWidth = {({contentWidth}) => { this.setState({contentWidth}) }}>
            <Toolbar>
            <TopTags selectedDeleId={this.state.selectedDeleId}
                    getMeetingList={this.refresh}
                    openProject={this.getMeetingListByProject}
                    addData={this.addData}
                    projectId={this.state.projectId}
                    projectName={this.state.projectName}
                    data={this.state.selectedRowKeys}
                    selectData={this.state.selectedRows}
                    initDatas={this.initDatas}
                    deleteData={this.deleteData} search={this.search}
                    meetActionEditAuth={this.state.rightData && this.state.rightData.status.id == "EDIT" ? true : false}  
                     />
            </Toolbar>
            <MainContent contentWidth = {this.state.contentWidth} contentMinWidth = {1000}>
            {this.state.projectId && (
                                <PublicTable onRef={this.onRef}
                                    pagination={true}
                                    rowSelection={true}
                                    useCheckBox={true}
                                    getData={this.getMeetingList}
                                    columns={columns}
                                    onChangeCheckBox={this.getSelectedRowKeys}                        
                                    getRowData={this.getInfo}
                                    total={this.state.total}
                                    checkboxStatus={this.checkboxStatus}
                                />
                            )}
            </MainContent>
            <RightTags rightTagList={this.state.rightTags} rightData={this.state.rightData}
                            updateSuccess={this.updateSuccess}
                            callBackBanner={this.props.callBackBanner}
                            openMenuByMenuCode={this.props.openMenuByMenuCode}
                            menuInfo={this.props.menuInfo}
                            bizType='meeting'
                            bizId={this.state.rightData ? this.state.rightData.id : null}
                            fileEditAuth={this.state.rightData && this.state.rightData.status.id == "EDIT" ? true : false}
                            menuId = {this.props.menuInfo.id}
                            menuCode={this.props.menuInfo.menuCode}
                            groupCode={1}
                            projectId={this.state.projectId}
                            projectName={this.state.projectName}
                            extInfo={{
                                startContent
                            }}
                            meetActionEditAuth={this.state.rightData && this.state.rightData.status.id == "EDIT" ? true : false}  //会议行动编辑权限，只有编制中的权限
                        />

          </ExtLayout>
           

        )
    }
}

/* *********** connect链接state及方法 start ************* */

const mapStateToProps = state => {
    return {
        currentLocale: state.localeProviderData,
    }
};


export default connect(mapStateToProps, null)(ComcateMeeting);
