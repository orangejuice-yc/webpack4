import React, { Component } from 'react'
import intl from 'react-intl-universal'
import {Table, notification, Progress} from 'antd'
import style from './style.less'
import { connect } from 'react-redux'
import { changeLocaleProvider } from '../../../../../store/localeProvider/action'
import RightTags from '../../../../../components/public/RightTags/index'
import * as util from '../../../../../utils/util';
import * as dataUtil from '../../../../../utils/dataUtil';
import { getFeedbackTreeByIds } from '../../../../../api/api'
import axios from '../../../../../api/axios';

class ReleaseForm extends Component {
    constructor(props) {
        super(props)
        this.state = {
            initDone: false,
            activeIndex: [],
            currentPage: 1,
            pageSize: 10,
            group: 2,
            rightData: [],
            data: [],
            initData: [],
            dataMap: [],
            delivType: [],
            projectData: [],
            taskData: [],
            projectId: null
        }
    }
    componentDidMount() {
        //监听全局点击事件
        document.addEventListener('click', this.closeRight);
        // 初始化数据
        this.initDatas();
    }

    /**
     * 初始化数据
     *
     */
    initDatas = () => {
        this.getReleaseTaskTreeByIds();
    }

    componentWillUnmount() {
        //销毁全局点击事件
        document.removeEventListener('click', this.closeRight, false);
    }

    // 获取选中的列表项
    getInfo = (record) => {
        let group = record.type == "wbs" ? 1 :record.type == "task"? 2 : -1;
        this.setState({
            activeIndex: record.id,
            rightData: record,
            group: group
        })
    }

    // 选中行高亮
    setClassName = (record) => {
        let activeId = this.state.activeIndex;
        //判断索引相等时添加行的高亮样式
        return record.id === activeId ? "tableActivty" : "";
    }

    //获取项目交付物列表
    getReleaseTaskTreeByIds=()=>{
        const {formDatas } = this.props;
        let ids = dataUtil.Arr().toStringByObjectArr(formDatas,"bizId");
        if(ids && ids.length > 0){
          axios.get(getFeedbackTreeByIds(ids)).then(res => {
            const { data } = res.data;
            const dataMap = util.dataMap(data);
            this.setState({
              data: data || [],
              initData: data || [],
              dataMap
            })
          })
        }else{
          this.setState({
            data: [],
            initData: [],
            dataMap: {}
          })
        }
    }
    /**
     * 查询条件
     *
     * @param value
     */
    search = (value) => {
        const { initData} = this.state;
        let newData = dataUtil.search(initData, [{ "key": "name|code", "value": value }], true);
        const dataMap = util.dataMap(newData);
        this.setState({
            data: newData ,
            dataMap
        });
    }

    render() {

        const columns = [
          {
            title: intl.get('wsd.i18n.plan.feedback.name'),
            dataIndex:'name',
            key: 'name',
            width: 240,
            render: (text, record) => dataUtil.getIconCell(record.type,text ,record.taskType)
          },
          {
            title: 'WBS路径',
            dataIndex: 'wbsRoot',
            key: 'wbsRoot',
          },
          {
            title: '已批准完成%',
            dataIndex: 'approvePct',
            key: 'approvePct',
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
            render: (text) =>  dataUtil.Dates().formatDateString(text)
          },
          {
            title: '实际完成时间',
            dataIndex: 'actEndTime',
            key: 'actEndTime',
            render: (text) =>  dataUtil.Dates().formatDateString(text)
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
            render: (text) =>  dataUtil.Dates().formatDateString(text)
          },
          {
            title: intl.get('wsd.i18n.plan.feedback.planendtime'),
            dataIndex: 'planEndTime',
            key: 'planEndTime',
            render: (text) =>  dataUtil.Dates().formatDateString(text)
          },
          {
            title: "本期反馈状态", //计划状态
            dataIndex: 'progressStatus',
            key: 'progressStatus',
            render: (text) => {
              if (text) {
                return <span>{text.name}</span>
              } else {
                return null
              }
            }
          },
        ]

        return (
            <div className={style.main}>
                <div className={style.leftMain} style={{ height: this.props.height }}>
                    <div style={{ minWidth: 'calc(100vw - 60px)' }}>
                        <Table className={style.Infotable1}
                            columns={columns}
                            pagination={false}
                            dataSource={this.state.data}
                            rowClassName={this.setClassName}
                            rowKey={record => record.id}
                            defaultExpandAllRows={true}
                            size={"small"}
                            onRow={(record, index) => {
                                return {
                                    onClick: () => {
                                        this.getInfo(record, index)
                                    }
                                }
                            }} />
                    </div>
                </div>
                <div className={style.rightBox} style={{ height: this.props.height }}>
                    <RightTags
                        menuCode={this.props.menuInfo.menuCode}
                        groupCode={this.state.group}
                        rightData={(this.state.rightData && (this.state.rightData.type=="wbs" ||this.state.rightData.type=="task"))? this.state.rightData:null}
                        getBaseSelectTree={this.getBaseSelectTree}
                        // //用于流程信息页签
                        bizType="ST-SPECIAL-FEEDBACK"
                        processFlag={true}
                        editAuth={false}
                        bizId = {this.state.rightData ? this.state.rightData.id : null}
                        fileEditAuth = {false}
                        projectId={this.state.projectId}
                        isCheckWf={false}
                    />
                </div>
            </div>
        )
    }
}


/* *********** connect链接state及方法 start ************* */
export default connect(state => ({
    currentLocale: state.localeProviderData
}), {changeLocaleProvider})(ReleaseForm);

