import React, { Component } from 'react'
import { Select } from 'antd'
import intl from 'react-intl-universal'
import style from './style.less'
import PublicButton from "../../../../components/public/TopTags/PublicButton"
import DistributionModal from './Distribution'  //分配弹窗
import axios from "../../../../api/axios"
import PlanComponentLog from './detail'
import {
    getPlanTaskPredList_,
    getPlanTaskFollowList_,
    deletePlanTaskPred_,
    updatePlanTaskPred_
} from "../../../../api/suzhou-api"
import * as dataUtil from '../../../../utils/dataUtil';
const Option = Select.Option
import PublicTable from '../../../../components/PublicTable'
import LabelToolbar from '../../../../components/public/Layout/Labels/Table/LabelToolbar'
import LabelTableLayout from '../../../../components/public/Layout/Labels/Table/LabelTableLayout'
import LabelTable from '../../../../components/public/Layout/Labels/Table/LabelTable'


export class PlanComponentsLog extends Component {
    constructor(props) {
        super(props)
        this.state = {
            name: 'PlanComponentsLog',
            initDone: false,
            columns: [
                {
                    title: "名称",
                    dataIndex: 'taskName',
                    key: 'taskName',
                    width : 220
                },
                /*{
                    title: "代码",
                    dataIndex: 'taskCode',
                    key: 'taskCode',
                    width : 100
                },*/
                {
                    title: "所属计划",
                    dataIndex: 'defineName',
                    key: 'defineName',
                    width : 200
                },
                {
                    title: "计划开始",
                    dataIndex: 'planStartTime',
                    key: 'planStartTime',
                    render: data => data && dataUtil.Dates().formatDateString(data),
                    width : 100
                },
                {
                    title: "计划完成",
                    dataIndex: 'planEndTime',
                    key: 'planEndTime',
                    render: data => data && dataUtil.Dates().formatDateString(data),
                    width : 100
                },
                {
                    title: "实际开始",
                    dataIndex: 'actStartTime',
                    key: 'actStartTime',
                    render: data => data && dataUtil.Dates().formatDateString(data),
                    width : 100
                },
                {
                    title: "实际完成",
                    dataIndex: 'actEndTime',
                    key: 'actEndTime',
                    render: data => data && dataUtil.Dates().formatDateString(data),
                    width : 100
                },
                {
                    title: '完成百分比',
                    dataIndex: 'completePct',
                    key: 'completePct',
                    width: 100
                },
                {
                    title: intl.get('wsd.i18n.plan.subTask.iptname'),
                    dataIndex: 'org',
                    key: 'org',
                    render: data => data && data.name,
                    width : 120
                },
                {
                    title: intl.get('wsd.i18n.plan.subTask.username'),
                    dataIndex: 'user',
                    key: 'user',
                    render: data => data && data.name,
                    width : 100
                },
                {
                    title: intl.get('wsd.i18n.plan.subTask.relationtype'),
                    dataIndex: 'relationType',
                    key: 'relationType',
                    edit: {formType : 'Select',required:true,editable : (this.props.menuCode == "ST-IMPLMENT-TASK" && this.props.editAuth),handleSave : this.handleSave,items:[{value:'SF',title:'SF'},{value:'SS',title:'SS'},{value:'FS',title:'FS'},{value:'FF',title:'FF'}]},
                    render: (text, record) => <div className="editable-row-text">{text}</div>,
                    width : 100
                },
                /*{
                    title:'完成状态',
                    dataIndex:'status',
                    key:'status',
                    width:100,
                    render : text => text && text.name
                },*/
                {
                    title:'进展说明',
                    dataIndex:'remark',
                    key:'remark',
                    width:260
                },
                {
                    title: "进展日志",
                    width: 80,
                    render: (text, record) => {
                        return <a onClick={this.viewDetail.bind(this, record)} style={{ cursor: 'pointer' }}>详情</a>
                    }
                },
            ],
            data: [],
            editingKey: '',
            distributionModaVisible: false,
            activeStyle: 1,
            activeIndex: [],
            selectData: [],
            selectedRowKeys : [],
            selectedRows : []
        }
    }

    viewDetail = (record) => {
        this.setState({
            isShowModal: true,
            selectData:record
        });
    }

    handleCancel = () =>{
        this.setState({
            isShowModal: false,
        });
    }

    isEditing = record => record.id === this.state.editingKey;

    cancel = () => {
        this.setState({ editingKey: '' });
    };

    componentDidMount() {

    }
    //注册 父组件即可调用子组件方法
    onRef = (ref) => {
      this.table = ref
    }
    /**
     * 获取数据（紧前任务，后置任务）
     * @param callback
     */
    getDataList = (callback) => {
        const { rightData } = this.props;
        const { activeStyle } = this.state;
        let url;
        if(activeStyle == 1){
          url = getPlanTaskPredList_(rightData[0]['id']);
        }else{
          url = getPlanTaskFollowList_(rightData[0]['id'])
        }
        axios.get(url).then(res => {
          callback(res.data.data);
        })
    }
    /**
     *
     * @param v
     */
    changeTab = (v) => {
      this.setState({activeStyle:v},() => {
        this.refreshDataList();
      })
    }

    /**
     * 刷新数据
     */
    refreshDataList = () =>{
      this.table.getData();
    }

    handleSave =(newItem) => {
        let thisobj = this;
        let {id} = newItem;
        let {startContent} = this.props.extInfo  || {};
        let url = dataUtil.spliceUrlParams(updatePlanTaskPred_,{startContent});
        axios.put(url, { ...newItem, id: id }, true,null,true).then(res => {
            thisobj.refreshDataList();
        })
    }

    edit(id) {
        this.setState({ editingKey: id });
    }
    clearEdit = () =>{
      this.setState({ editingKey: null });
    }

    getInfo = (record, index) => {
      this.setState({
          activeIndex: record.id,
          selectData: record
      })
    };
    //删除校验
    deleteVerifyCallBack=()=>{
        const { selectedRowKeys } = this.state
        if (!selectedRowKeys || selectedRowKeys.length == 0) {
            dataUtil.message('请勾选数据进行操作');
            return false
        }else{
            return true
        }
    }
    // 删除逻辑关系
    deletePlanTaskPred = () => {
        const { selectedRowKeys,selectedRows } = this.state
        if (!selectedRowKeys || selectedRowKeys.length == 0) {
            dataUtil.message('请勾选数据进行操作');
            return;
        }
        let {startContent} = this.props.extInfo  || {};
        let url = dataUtil.spliceUrlParams(deletePlanTaskPred_,{startContent});
        axios.deleted(url, { data: selectedRowKeys }, true,null,true).then(res => {
            // 删除Gantt逻辑关系
            this.deletePredecessorLink(selectedRows);
            // 刷新界面
            this.table.getData();
            this.setState({
              selectedRowKeys : [],
              selectedRows : []
            })
        })
    }
    /**
     * 删除Gantt逻辑关系
     * */
    deletePredecessorLink = (selectedRows) =>{
        let deleteLinkArr = new Array();
        selectedRows.forEach(item => {

            let taskId = item.taskId;
            let predTaskId = item.predTaskId;

            if(!predTaskId){
                taskId = item.followTaskId;
                predTaskId = item.taskId;
            }

            let task = this.props.getTaskByID(taskId);
            const {PredecessorLink} = task || {}

            if(PredecessorLink && PredecessorLink.length > 0){
                let dmap = {};
                for(let i = 0, len = PredecessorLink.length; i < len; i++ ){
                    let link = PredecessorLink[i];
                    dmap[link["PredecessorUID"]] = link;
                }
                let link = dmap[predTaskId];
                link && deleteLinkArr.push(link);
            }

        })
        this.props.deleteItem(deleteLinkArr);
    }

    onClickHandle = (name) => {
        if (name == "DistributionBtn") {
            this.setState({
                distributionModaVisible: true
            })
        }
        if (name == "DeleteTopBtn") {
            this.deletePlanTaskPred()
        }
    }

    //Release弹窗关闭
    handleDistributionCancel = () => {
        this.setState({
            distributionModaVisible: false
        })
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

    render() {
        return (

          <LabelTableLayout title = {this.props.title} menuCode = {this.props.menuCode} >
            <LabelToolbar>
              {/*分配*/}
              { this.props.menuCode == "ST-IMPLMENT-TASK" && <PublicButton name={'分配'} edit={this.props.editAuth} title={'分配'} icon={'icon-fenpeirenyuan'} afterCallBack={this.onClickHandle.bind(this, 'DistributionBtn')} />}
              {/*删除*/}
              {this.props.menuCode == "ST-IMPLMENT-TASK" && <PublicButton title={"删除"} edit={this.props.editAuth} useModel={true} verifyCallBack={this.deleteVerifyCallBack} afterCallBack={this.onClickHandle.bind(this, "DeleteTopBtn")} icon={"icon-delete"} />}
            </LabelToolbar>
            <LabelTable labelWidth = {this.props.labelWidth } contentMinWidth = {1000} defaultSurplusHeight = {45}>
              <div className={style.tabsToggle}>
                <a href="javascript:void(0)" onClick={() => { this.changeTab(1) }} className={this.state.activeStyle == 1 ? style.active : ''}>紧前任务</a>
                <a href="javascript:void(0)" onClick={() => { this.changeTab(2) }} className={this.state.activeStyle == 2 ? style.active : ''}>后续任务</a>
              </div>
              <PublicTable istile={true}
                           onRef={this.onRef}
                           getData={this.getDataList}
                           pagination={false}
                           menuCode={this.props.menuCode}
                           columns={this.state.columns}
                           getRowData={this.getInfo}
                           useCheckBox={true}
                           rowSelection={true}
                           onChangeCheckBox={this.getSelectedRowKeys}
              />
            </LabelTable>
            {this.state.distributionModaVisible && <DistributionModal
              rightData={this.props.rightData}
              menuCode={this.props.menuCode}
              handleCancel={this.handleDistributionCancel}
              extInfo={this.props.extInfo}
              addItem = {this.props.addItem }
              refreshDataList = {this.refreshDataList}
            />}
            {this.state.isShowModal &&
                <PlanComponentLog
                    data = {this.state.selectData}
                    extInfo = {this.props.extInfo}
                    menuCode={this.props.menuCode}
                    handleCancel= {this.handleCancel}
            />}
          </LabelTableLayout>
        )
    }
}

export default PlanComponentsLog
