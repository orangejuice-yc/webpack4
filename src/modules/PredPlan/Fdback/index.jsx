import React, { Component } from 'react'
import { Progress, Table, Icon } from 'antd';
import { ContextMenu, MenuItem } from "react-contextmenu"
import TopTags from './TopTags/index'
import RightTags from '../../../components/public/RightTags/index'
import style from './style.less'
import '../../../static/css/react-contextmenu.global.css'
import { connect } from 'react-redux'
import axios from "../../../api/axios"
import {
  getfeedbackTree,
  getfeedbackList,
  feedbackcancleRelease,
  getTaskEditAuth,
  getPlanChangeTreeList,
} from '../../../api/api';
import * as dataUtil from '../../../utils/dataUtil';
import TreeTable from '../../../components/PublicTable'
import ExtLayout from "../../../components/public/Layout/ExtLayout";
import MainContent from "../../../components/public/Layout/MainContent";
import Toolbar from "../../../components/public/Layout/Toolbar";
import { getSectionIdsByDefineId } from '../../../api/suzhou-api';


export class PlanFdback extends Component {
    constructor(props) {
        
        super(props)
        this.state = {
            name: 'planDefine',
            currentPage: 1,
            pageSize: 10,
            data: [],
            width: '',
            groupCode: -1,
            activeIndex: null,
            rightData: null,
            selectArray: [],//选择计划
            type: "tree",
            expandedRowKeys: []//展开行
        }
    }
    componentDidMount() {
        let loginUser = JSON.parse(sessionStorage.getItem('userInfo'));
        this.setState({
          loginUser
        })
    }

    //注册 父组件即可调用子组件方法
    onRef = (ref) => {
        this.table = ref
    }

    /**
     * 查询
     * @param params
     */
    searchDatas = (params) => {
     
      this.setState({
        searchParams : params
      }, () => {
        this.initDatas();
      });
    }
    getSearchParams = () =>{

      let {searchParams} = this.state || {};
      let ret = {
        ...searchParams,
        fuzzySearch : searchParams.fuzzySearch == undefined ||  searchParams.fuzzySearch == null || searchParams.fuzzySearch == "1",
        children : searchParams.children == undefined ||  searchParams.children == null || searchParams.children == "1",
      }
      return ret;
    }

  //获取树形列表
    getTreeList = (callBack) => {
        // 获取查询条件
        let searchParams = this.getSearchParams();
        let url = dataUtil.spliceUrlParams(getfeedbackTree(this.state.projectIds || 0),{... searchParams});
        axios.get(url).then(res => {
            this.setState({
                data: res.data.data,
                initData: res.data.data,
            }, () => {
                callBack(res.data.data?res.data.data:[])
                //首页定位数据
                let fbbackRecord = JSON.parse(localStorage.getItem("fbbackRecord"))
                localStorage.removeItem('fbbackRecord')
                if (fbbackRecord) {
                    let recod
                    const loop = (array) => {
                        array.forEach(item => {
                            if (fbbackRecord.id == item.id) {
                                recod = item
                            } else {
                                if (item.children) {
                                    loop(item.children)
                                }
                            }
                        })

                    }
                    loop(this.state.data)
                    if (recod) {
                        this.setState({
                            activeIndex: recod.id,
                            rightData: recod,
                            groupCode: 2
                        }, () => {

                            let array = dataUtil.getLocateExpandKeys(this.state.data, recod.id)
                            this.setState({
                                expandedRowKeys: array
                            })
                        })

                    }

                } else {
                    let array = dataUtil.getExpandKeys(this.state.data)
                    this.setState({
                        expandedRowKeys: array
                    })
                }
            })
        })
    }
    //获取平铺列表
    getfeedbackList = (callBack) => {
        // 获取查询条件
        let searchParams = this.getSearchParams();
        let url = dataUtil.spliceUrlParams(getfeedbackList(this.state.projectIds || 0),{... searchParams});
        axios.get(url).then(res => {
            callBack(res.data.data?res.data.data:[])
            this.setState({
                data: res.data.data,
                initData: res.data.data,
            }, () => {
                //首页定位数据
                let fbbackRecord = JSON.parse(localStorage.getItem("fbbackRecord"))
                localStorage.removeItem('fbbackRecord')
                const { data } = this.state
                if (fbbackRecord) {
                    let i = data.findIndex(item => item.id == fbbackRecord.id)
                    if (i > -1) {
                        this.setState({
                            activeIndex: data[i].id,
                            rightData: data[i],
                            groupCode: 2
                        }, () => {

                        })
                    }
                }
            })
        })
    }
    //加载数据
    openPlan = (selectArray, projectId, projectName) => {
        let str = "";
        if (selectArray && selectArray.length > 0) {
            selectArray.forEach((item, i) => {
                if (str) {
                    str = str + "," + item
                } else {
                    str = item;
                }
            })
        }
        this.setState({
            selectArray: selectArray,
            selectProjectId: projectId,
            projectName: projectName,
            projectIds:str
        }, () => {
            this.table.getData()
        })
    }
   //加载数据
   initDatas = () => {
      dataUtil.CacheOpenProjectByType('predFeedBack').getLastOpenPlan((data) => {
          const { planId, projectId, projectName } = data;
          this.openPlan(planId,projectId,projectName);
      },'predFeedBack');
    }
    //切换数据模式
    toggleTableView = (title) => {
        this.setState({
            type: title
        }, () => {
            this.initDatas()
        })
    }
    /**
     *
     */
    getDataList = () =>{

    }

    getFeedbackEditAuth = (defineId, taskId, type, id, record) => {
        axios.get(getTaskEditAuth(defineId || 0, taskId || 0)).then(res => {
            const { data } = res.data || {};
            // 状态
            let status = data["status"];
            // 权限
            let auths = data["auths"];
            //反馈状态
            let feedbackStatus = data["feedbackStatus"];
            let isFeedback = data["isFeedback"];
            let edit = status == "RELEASE" && auths && auths.indexOf("PRED-FEEDBACK_EDIT") > -1;
            if (feedbackStatus && feedbackStatus == 2) {
                edit = false;
            }
            if (type == "wbs" && isFeedback != 1) {
                edit = false;
            }
            this.setState({
                fileEditAuth:edit,
                editAuth: edit,
                delvEditAuth: edit,
                activeIndex: id,
                rightData: record,
                groupCode: type == "wbs" ? 1 : 2
            },()=>{
              //根据计划定义id获取标段id
              const { rightData } = this.state
              if(rightData){
                  axios.get(getSectionIdsByDefineId(defineId)).then(res => {
                    this.setState({
                      sectionId: res.data.data,
                    })
                  })
              }
            })
        });
    }

    getInfo = (record, index) => {
        let id = record.id

        if (record.type == "wbs" || record.type == "task") {

            this.getFeedbackEditAuth(record.defineId, record.id, record.type, id, record);
        } else {
            this.setState({
                activeIndex: id,
                rightData: record,
                groupCode: -1
            })
        }



    }
    //展开行事件
    handleOnExpand = (expanded, record) => {

        const { expandedRowKeys } = this.state
        if (expanded) {
            expandedRowKeys.push(record.id)
        } else {
            let i = expandedRowKeys.findIndex(item => item == record.id)
            expandedRowKeys.splice(i, 1)
        }
        this.setState({
            expandedRowKeys
        })
    }
    //取消批准
    cancelHandle = () => {
        const { rightData } = this.state;
        let url = dataUtil.spliceUrlParams(feedbackcancleRelease(rightData.id), { "startContent": "项目【" + this.props.projectName + "】" });
        axios.post(url, null, true, null, true).then(res => {
            this.updateSuccess(res.data.data)
        })
    }
    //更新
    updateSuccess = (value) => {
        const { data, dataMap, rightData } = this.state;
    
        this.table.update(rightData,value)
        this.setState({
            rightData: value,
        });
    }
  

    handleRightMenuClick = (e, data) => {
        switch (data.action) {
            case 'refresh':
                alert('刷新')
                break;
            case 'hideShowColumns':
                alert('隐藏/显示列')
                break;
            default:
                break;
        }
    }
    approvalHandle = () => {
        this.setState({
            activeIndex: null,
            rightData: null,
        }, () => {
          this.table.getData();
        })
    }
    render() {
        const { intl } = this.props.currentLocale
        const columns = [
            {
                title: intl.get('wsd.i18n.plan.feedback.name'),
                dataIndex: 'name',
                key: 'name',
                width: 300,
                render: (text, record) => dataUtil.getIconCell(record.type, text, record.taskType)
            },
            {
                title: '完成百分比',
                dataIndex: 'approvePct',
                key: 'approvePct',
                width: 180,
                render: text => {
                    if (text) {
                        return <div style={{paddingRight:20}}><Progress percent={text} strokeWidth={10} /></div>
                    } else {
                        return "--"
                    }
                }
            },
            // {
            //     title: '本期申请完成%',
            //     dataIndex: 'applyPct',
            //     render: text => {
            //         if (text) {
            //             return <Progress percent={text} strokeWidth={10} />
            //         } else {
            //             return "--"
            //         }
            //     }
            // },
            {
                title: '实际开始时间',
                dataIndex: 'actStartTime',
                key: 'actStartTime',
                render: (text) => dataUtil.Dates().formatDateString(text)
            },
            {
                title: '实际完成时间',
                dataIndex: 'actEndTime',
                key: 'actEndTime',
                render: (text) => dataUtil.Dates().formatDateString(text)
            },
            {
                title: intl.get('wsd.i18n.plan.feedback.plantype'),
                dataIndex: 'planType',
                key: 'planType',
                render: (text) => {
                    if (text) {
                        return <span>{text.name}</span>
                    } else {
                        return null
                    }
                }
            },
            {
                title: intl.get('wsd.i18n.plan.feedback.iptname'),
                dataIndex: 'org',
                key: 'org',
                render: (text) => {
                    if (text) {
                        return <span>{text.name}</span>
                    } else {
                        return null
                    }
                }
            },
            {
                title: intl.get('wsd.i18n.plan.feedback.username'),
                dataIndex: 'user',
                key: 'user',
                render: (text) => {
                    if (text) {
                        return <span>{text.name}</span>
                    } else {
                        return null
                    }
                }
            },
            {
                title: intl.get('wsd.i18n.plan.feedback.planstarttime'),
                dataIndex: 'planStartTime',
                key: 'planStartTime',
                render: (text) => dataUtil.Dates().formatDateString(text)
            },
            {
                title: intl.get('wsd.i18n.plan.feedback.planendtime'),
                dataIndex: 'planEndTime',
                key: 'planEndTime',
                render: (text) => dataUtil.Dates().formatDateString(text)
            },
            {
                title: "本期反馈状态", //
                dataIndex: 'progressStatus',
                key: 'progressStatus',
                render: (text) => {
                    if (text) {
                        return <span>{text.name}</span>
                    } else {
                        return null
                    }
                }
            }
        ]
        const columns1 = [
            {
                title: intl.get('wsd.i18n.plan.feedback.name'),
                dataIndex: 'name',
                key: 'name',
                width: 240,
                render: (text, record) => dataUtil.getIconCell(record.type, text, record.taskType)
            },
            {
                title: 'WBS路径',
                dataIndex: 'wbsRoot',
                key: 'wbsRoot',
                width: 100,
            },
            {
                title: '已批准完成%',
                dataIndex: 'approvePct',
                key: 'approvePct',
                width: 100,
                render: text => {
                    if (text) {
                        return <Progress percent={text} className={style.myProgress} strokeWidth={10} />
                    } else {
                        return "--"
                    }
                }
            },
            {
                title: '本期申请完成%',
                dataIndex: 'applyPct',
                width: 100,
                render: text => {
                    if (text) {
                        return <Progress percent={text} className={style.myProgress} strokeWidth={10} />
                    } else {
                        return "--"
                    }
                }

            },

            {
                title: '实际开始时间',
                dataIndex: 'actStartTime',
                key: 'actStartTime',
                width: 100,
                render: (text) => dataUtil.Dates().formatDateString(text)
            },
            {
                title: '实际完成时间',
                dataIndex: 'actEndTime',
                key: 'actEndTime',
                width: 100,
                render: (text) => dataUtil.Dates().formatDateString(text)
            },

            {
                title: intl.get('wsd.i18n.plan.feedback.plantype'),
                dataIndex: 'planType',
                key: 'planType',
                width: 100,
                render: (text) => {
                    if (text) {
                        return <span>{text.name}</span>
                    } else {
                        return null
                    }
                }
            },
            {
                title: intl.get('wsd.i18n.plan.feedback.iptname'),
                dataIndex: 'org',
                key: 'org',
                width: 150,
                render: (text) => {
                    if (text) {
                        return <span>{text.name}</span>
                    } else {
                        return null
                    }
                }
            },
            {
                title: intl.get('wsd.i18n.plan.feedback.username'),
                dataIndex: 'user',
                key: 'user',
                width: 100,
                render: (text) => {
                    if (text) {
                        return <span>{text.name}</span>
                    } else {
                        return null
                    }
                }
            },
            {
                title: intl.get('wsd.i18n.plan.feedback.planstarttime'),
                dataIndex: 'planStartTime',
                key: 'planStartTime',
                width: 100,
                render: (text) => dataUtil.Dates().formatDateString(text)
            },
            {
                title: intl.get('wsd.i18n.plan.feedback.planendtime'),
                dataIndex: 'planEndTime',
                key: 'planEndTime',
                width: 100,
                render: (text) => dataUtil.Dates().formatDateString(text)
            },
            {
                title: "本期反馈状态",
                dataIndex: 'progressStatus',
                key: 'progressStatus',
                width: 100,
                render: (text) => {
                    if (text) {
                        return <span>{text.name}</span>
                    } else {
                        return null
                    }
                }
            },
        ]

        let startContent
        if (this.state.rightData && (this.state.rightData.type == "wbs" || this.state.rightData.type == "task")) {
            startContent = "项目【" + this.state.projectName + "】," + (this.state.rightData.type == "wbs" ? "WBS" : "任务") + "【" + (this.state.rightData ? this.state.rightData.name : null) + "】";
        }
        return (

          <ExtLayout renderWidth = {({contentWidth}) => {
            this.setState({contentWidth});
          }}>
            <Toolbar>
              <TopTags toggleTableView={this.toggleTableView}
                       openPlan={this.openPlan}
                       selectArray={this.state.selectArray}
                       refreshData={this.initDatas}
                       cancelHandle={this.cancelHandle}
                       data={this.state.rightData}
                       searchDatas={this.searchDatas}
                       selectProjectId={this.state.selectProjectId}
                       selectProjectName={this.state.projectName}
                       approvalHandle={this.approvalHandle}
              />
            </Toolbar>
            <MainContent contentWidth = {this.state.contentWidth} contentMinWidth = {1500}>
              {this.state.type=='tree' &&(
                <TreeTable onRef={this.onRef} getData={this.getTreeList}
                           pagination={false} columns={columns}
                           expanderLevel={10}
                           initLoadData = {false}
                           //scroll={{ x: 1390, y: this.props.height - 50 }}
                           getRowData={this.getInfo}
                />
              )}
              {this.state.type !='tree' &&(
                <TreeTable onRef={this.onRef} getData={this.getfeedbackList}
                           pagination={false} columns={columns1}
                           //scroll={{ x: 1390, y: this.props.height - 50 }}
                           initLoadData = {false}
                           getRowData={this.getInfo}
                />
              )}
            </MainContent>
            <RightTags rightData={(this.state.rightData && (this.state.rightData.type == "wbs" || this.state.rightData.type == "task")) ? this.state.rightData : null}
                       data={(this.state.rightData && (this.state.rightData.type == "wbs" || this.state.rightData.type == "task")) ? this.state.rightData : null}
                       updateSuccess={this.updateSuccess}
                       callBackBanner={this.props.callBackBanner}
                       sectionId={this.state.sectionId ? this.state.sectionId : 0}
                       menuId = {this.props.menuInfo.id}
                       menuInfo={this.props.menuInfo}
                       editAuth={this.state.editAuth}
                       delvEditAuth={this.state.delvEditAuth}
                       fileEditAuth={this.state.fileEditAuth}
                       projectId={this.state.selectProjectId}
                       menuCode={this.props.menuInfo.menuCode}
                       groupCode={this.state.groupCode}
                       openWorkFlowMenu={this.props.openWorkFlowMenu}
                       projectName={this.state.projectName}
                       //用于流程信息页签
                       bizType = 'ST-PRED-FEEDBACK'
                       bizId={this.state.activeIndex}
                       extInfo={{
                         startContent
                       }}
                       loginUserId = {this.state.loginUser ? this.state.loginUser.id : ''}
                       isEdit = {true}
                       problemShow={true} problemSendShow={true}
                       isShow={true}
                       isCheckWf={true}
            />
            <ContextMenu id="planFdback__rightContextMenu">
              <MenuItem data={{ action: 'refresh' }} onClick={this.handleRightMenuClick}><Icon type="sync" /> 刷新</MenuItem>
              <MenuItem data={{ action: 'hideShowColumns' }} onClick={this.handleRightMenuClick}><Icon type="menu-unfold" /> 隐藏/显示列</MenuItem>
            </ContextMenu>
          </ExtLayout>
        )
    }
}

const mapStateToProps = state => {
    return {
        currentLocale: state.localeProviderData,
    }
};


export default connect(mapStateToProps, null)(PlanFdback);
