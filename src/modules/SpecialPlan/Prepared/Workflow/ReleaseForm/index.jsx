import React, { Component } from 'react'
import intl from 'react-intl-universal'
import { Table } from 'antd'
import style from './style.less'
import { connect } from 'react-redux'
import { changeLocaleProvider } from '../../../../../store/localeProvider/action'
import RightTags from '../../../../../components/public/RightTags/index'
import * as util from '../../../../../utils/util';
import * as dataUtil from '../../../../../utils/dataUtil';
import { getTaskTreeByIds } from '../../../../../api/api'
import axios from '../../../../../api/axios';
import ExtLayout from "../../../../../components/public/Layout/ExtLayout";
import MainContent from "../../../../../components/public/Layout/MainContent";

class Delivery extends Component {
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
        let group = record.nodeType == "wbs" ? 2 :record.nodeType == "task"? 1 : -1;
        this.setState({
            activeIndex: [record.id],
            rightData: [record],
            group: group
        })
    }

    // 选中行高亮
    setClassName = (record) => {
        let activeId = this.state.activeIndex.length > 0 ? this.state.activeIndex[0] : -1;
        //判断索引相等时添加行的高亮样式
        return record.id === activeId ? "tableActivty" : "";
    }

    //获取项目交付物列表
    getReleaseTaskTreeByIds=()=>{
        const {formDatas } = this.props;
        let ids = dataUtil.Arr().toStringByObjectArr(formDatas,"bizId");
        if(ids && ids.length > 0){
          axios.get(getTaskTreeByIds(ids)).then(res => {
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
        const { initData ,tableData} = this.state;
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
              dataIndex: 'name',
              key: 'name',
              render: (text, record) => dataUtil.getIconCell(record.nodeType,text,record.taskType)
          },
          {
              title: intl.get('wsd.i18n.plan.feedback.code'),
              dataIndex: 'code',
              key: 'code',
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
              title: intl.get('wsd.i18n.plan.feedback.iptname'),
              dataIndex: 'org',
              key: 'org',
              render: data => data && data.name
          },
          {
              title: intl.get('wsd.i18n.plan.feedback.username'),
              dataIndex: 'user',
              key: 'user',
              render: data => data && data.name
          }
        ]
        return (
          <ExtLayout renderWidth = {({contentWidth}) => { this.setState({contentWidth}) }}>
            <MainContent contentWidth = {this.state.contentWidth} contentMinWidth = {1500}>
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
            </MainContent>
            <RightTags
                menuCode={this.props.menuInfo.menuCode}
                groupCode={this.state.group}
                rightTagList={this.state.rightTags}
                rightData={this.state.rightData.length  ? this.state.rightData : null}
                getBaseSelectTree={this.getBaseSelectTree}
                bizType="task"
                bizId = {this.state.rightData && this.state.rightData.length > 0 ? this.state.rightData[0].id : null}
                data={this.state.rightData.length ? this.state.rightData[0] : null}
                fileEditAuth = {false}
                projectId={this.state.projectId}
                cprtmEditAuth = {false}
                wfPubliceditAuth = {false}
                editAuth={false}
            />
          </ExtLayout>
        )
    }
}


/* *********** connect链接state及方法 start ************* */
export default connect(state => ({
    currentLocale: state.localeProviderData
}), {changeLocaleProvider})(Delivery);

