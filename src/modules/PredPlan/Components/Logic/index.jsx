import React, { Component } from 'react'
import { Table, Input, Form, Popconfirm, Select, notification } from 'antd'
import intl from 'react-intl-universal'
import style from './style.less'
import DistributionBtn from "../../../../components/public/TopTags/DistributionBtn"
import PublicButton from "../../../../components/public/TopTags/PublicButton"
import DistributionModal from './Distribution'  //分配弹窗
import axios from "../../../../api/axios"
import {
    getPlanTaskPredList,
    getPlanTaskFollowList,
    deletePlanTaskPred,
    updatePlanTaskPred
} from "../../../../api/api"
import * as dataUtil from '../../../../utils/dataUtil';
const Option = Select.Option
import PublicTable from '../../../../components/PublicTable'
import LabelToolbar from '../../../../components/public/Layout/Labels/Table/LabelToolbar'
import LabelTableLayout from '../../../../components/public/Layout/Labels/Table/LabelTableLayout'
import LabelTable from '../../../../components/public/Layout/Labels/Table/LabelTable'

const FormItem = Form.Item;
const EditableContext = React.createContext();


const EditableRow = ({ form, index, ...props }) => (
    <EditableContext.Provider value={form}>
        <tr {...props} />
    </EditableContext.Provider>
);

const EditableFormRow = Form.create()(EditableRow);

class EditableCell extends React.Component {
    getInput = () => {
        if (this.props.inputType === 'select') {
            return <Select style={{ width: "100%" }} size="small">
                <Option value="SS">SS</Option>
                <Option value="SF">SF</Option>
                <Option value="FS">FS</Option>
                <Option value="FF">FF</Option>
            </Select>;
        }
        return <Input size="small" style={{width: 80}} />;
    };

    render() {
        const {
            editing,
            dataIndex,
            title,
            record,
            ...restProps
        } = this.props;
        return (
            <EditableContext.Consumer>
                {(form) => {
                    const { getFieldDecorator } = form;
                    return (
                        <td {...restProps}>
                            {editing ? (
                                <FormItem style={{ margin: 0 }}>
                                    {getFieldDecorator(dataIndex, {
                                        rules: [{
                                            required: true,
                                            message: `请输入 ${title}!`,
                                        }],
                                        initialValue: record[dataIndex],
                                    })(this.getInput())}
                                </FormItem>
                            ) : restProps.children}
                        </td>
                    );
                }}
            </EditableContext.Consumer>
        );
    }
}

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
                    width : '15%'
                },
                {
                    title: "代码",
                    dataIndex: 'taskCode',
                    key: 'taskCode',
                    width : '10%'
                },
                {
                    title: "所属计划",
                    dataIndex: 'defineName',
                    key: 'defineName',
                    width : '15%'
                },
                {
                    title: "计划开始",
                    dataIndex: 'planStartTime',
                    key: 'planStartTime',
                    render: data => data && data.substr(0,16),
                    width : '8%'
                },
                {
                    title: "计划完成",
                    dataIndex: 'planEndTime',
                    key: 'planEndTime',
                    render: data => data && data.substr(0,16),
                    width : '8%'
                },
                {
                    title: intl.get('wsd.i18n.plan.subTask.iptname'),
                    dataIndex: 'org',
                    key: 'org',
                    render: data => data && data.name,
                    width : '10%'
                },
                {
                    title: intl.get('wsd.i18n.plan.subTask.username'),
                    dataIndex: 'user',
                    key: 'user',
                    render: data => data && data.name,
                    width : '6%'
                },
                {
                    title: intl.get('wsd.i18n.plan.subTask.relationtype'),
                    dataIndex: 'relationType',
                    key: 'relationType',
                    editable: true,
                    render: (text, record) => <div className="editable-row-text">{text}</div>,
                    width : '8%'
                },
                {
                    title: "延时",
                    dataIndex: 'lagNum',
                    key: 'lagNum',
                    editable: true,
                    render: (text, record) => <div className="editable-row-text">{text}</div>,
                    width : '8%'
                },
                {
                    title: '操作',
                    key: 'action',
                    width : '6%',
                    render: (text, record) => {
                        const editable = this.isEditing(record);
                        return (
                            <div className="editable-row-operations">
                                {editable ? (
                                    <span>
                                        <EditableContext.Consumer>
                                            {form => (
                                                <a
                                                    href="javascript:;"
                                                    onClick={() => this.save(form, record.id)}
                                                    style={{ marginRight: 8 }}
                                                >
                                                    保存
                                                </a>
                                            )}
                                        </EditableContext.Consumer>
                                        <Popconfirm
                                            title="确定取消?"
                                            onConfirm={() => this.cancel(record.id)}
                                            okText="确认"
                                            cancelText="取消"
                                        >
                                            <a>取消</a>
                                        </Popconfirm>
                                    </span>
                                ) : (
                                        <a disabled={!this.props.editAuth} onClick={() => this.edit(record.id)}>编辑</a>
                                    )}
                            </div>
                        );
                    },
                }
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
          url = getPlanTaskPredList(rightData[0]['id']);
        }else{
          url = getPlanTaskFollowList(rightData[0]['id'])
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

    save(form, id) {
        let thisobj = this;
        form.validateFields((error, row) => {
            if (error) {
                return;
            }
            let {startContent} = this.props.extInfo  || {};
            let url = dataUtil.spliceUrlParams(updatePlanTaskPred,{startContent});
            axios.put(url, { ...row, id: id }, true,null,true).then(res => {
                thisobj.refreshDataList();
                thisobj.clearEdit();
            })
        });
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
        let url = dataUtil.spliceUrlParams(deletePlanTaskPred,{startContent});
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
        const components = {
            body: {
                row: EditableFormRow,
                cell: EditableCell,
            },
        };
        const columns = this.state.columns.map((col) => {
            if (!col.editable) {
                return col;
            }
            return {
                ...col,
                onCell: record => ({
                    record,
                    inputType: col.dataIndex === 'relationType' ? 'select' : 'text',
                    dataIndex: col.dataIndex,
                    title: col.title,
                    editing: this.isEditing(record),
                }),
            };
        });
        return (

          <LabelTableLayout title = {this.props.title} menuCode = {this.props.menuCode} >
            <LabelToolbar>
              {/*分配*/}
              <PublicButton name={'分配'} edit={this.props.editAuth} title={'分配'} icon={'icon-fenpeirenyuan'} afterCallBack={this.onClickHandle.bind(this, 'DistributionBtn')} />
              {/*删除*/}
              <PublicButton title={"删除"} edit={this.props.editAuth} useModel={true} verifyCallBack={this.deleteVerifyCallBack} afterCallBack={this.onClickHandle.bind(this, "DeleteTopBtn")} icon={"icon-delete"} />
            </LabelToolbar>
            <LabelTable labelWidth = {this.props.labelWidth } contentMinWidth = {1000} defaultSurplusHeight = {45}>
              <div className={style.tabsToggle}>
                <a href="javascript:void(0)" onClick={() => { this.changeTab(1) }} className={this.state.activeStyle == 1 ? style.active : ''}>紧前任务</a>
                <a href="javascript:void(0)" onClick={() => { this.changeTab(2) }} className={this.state.activeStyle == 2 ? style.active : ''}>后续任务</a>
              </div>
              <PublicTable istile={true}
                           onRef={this.onRef}
                           components={components}
                           getData={this.getDataList}
                           pagination={false}
                           columns={columns}
                           getRowData={this.getInfo}
                           useCheckBox={true}
                           rowSelection={true}
                           onChangeCheckBox={this.getSelectedRowKeys}
              />
            </LabelTable>
            {this.state.distributionModaVisible && <DistributionModal
              rightData={this.props.rightData}
              handleCancel={this.handleDistributionCancel}
              extInfo={this.props.extInfo}
              addItem = {this.props.addItem }
              refreshDataList = {this.refreshDataList}
            />}
          </LabelTableLayout>
        )
    }
}

export default PlanComponentsLog
