import React, { Component } from 'react'
import { Table,Modal, Input, Form,  Popconfirm, Select, notification,InputNumber } from 'antd'
import style from './style.less'
import DistributionModal from './Distribution'  //分配弹窗
import PublicButton from "../../../../components/public/TopTags/PublicButton"
import axios from "../../../../api/axios"
import * as dataUtil from "../../../../utils/dataUtil";
import {
    getPlanTaskChangeFllowList,
    getPlanTaskChangePredList,
    deletePlanChgtaskpred,
    updatePlanChgtaskpred,
    canclePlanTaskChangePred
} from "../../../../api/api"
import * as util from '../../../../utils/util';

const Confirm = Modal.confirm;
const Option = Select.Option

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
        return <InputNumber size="small" min={0} max={999999} style={{ width: 100 }} />;
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
                    title: "计划名称",
                    dataIndex: 'define',
                    key: 'define',
                    width: '15%',
                    render: data => data && data.name
                },
                {
                  title: "变更类型",
                  dataIndex: 'changeType',
                  key: 'changeType',
                  width: '5%',
                  render: data => data && data.name
                },
                {
                    title: "后续任务名称",
                    dataIndex: 'task',
                    key: 'task',
                    width: '10%',
                    render: data => data && data.name
                },
                {
                    title: "后续任务代码",
                    dataIndex: 'task',
                    key: 'task1',
                    width: '10%',
                    render: data => data && data.code
                },
                {
                    title: "责任主体",
                    dataIndex: 'org',
                    key: 'org',
                    width: '10%',
                    render: data => data && data.name
                },
                {
                    title: "责任人",
                    dataIndex: 'user',
                    key: 'user',
                    width: '5%',
                    render: data => data && data.name
                },
                {
                    title: "关系类型",
                    width: '10%',
                    children: [{
                        title: '变更数据',
                        dataIndex: 'newRelationType',
                        className: 'spsColumns',
                        key: 'newRelationType',width: '50%',
                        editable: true,
                        render: (text, record) => <div className="editable-row-text">{text}</div>
                    }, {
                        title: '原数据',
                        dataIndex: 'baseRelationType',width: '50%',
                        key: 'baseRelationType',
                    }]
                },
                {
                    title: "延时",width: '10%',
                    children: [{
                        title: '变更数据',
                        dataIndex: 'newLagNum',
                        className: 'spsColumns',
                        key: 'newLagNum',width: '50%',
                        editable: true,
                        render: (text, record) => <div className="editable-row-text">{text}</div>
                    }, {
                        title: '原数据',width: '50%',
                        dataIndex: 'baseLagNum',
                        key: 'baseLagNum',
                    }]
                },

                {
                    title: "计划开始时间",width: '10%',
                    dataIndex: 'planStartTime',
                    key: 'planStartTime',
                    render: (text) => dataUtil.Dates().formatDateString(text)
                },
                {
                    title: "计划完成时间",width: '10%',
                    dataIndex: 'planEndTime',
                    key: 'planEndTime',
                    render: (text) => dataUtil.Dates().formatDateString(text)
                },
                {
                    title: "操作",
                    key: 'action',
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
                                        <a onClick={() => this.edit(record.id)}>编辑</a>
                                    )}
                            </div>
                        );
                    },
                },
            ],
            data: [],
            editingKey: '',
            distributionModaVisible: false,
            activeStyle: 1,
            activeIndex: [],
            selectData: [],
            menusEdit: { delete: { "1": false }, cancelPlan: { "1": false } },
        }
    }

    isEditing = record => record.id === this.state.editingKey;

    cancel = () => {
        this.setState({ editingKey: '' });
    };

    componentDidMount() {
        this.getPlanTaskPredList()
    }

    // 获取后续任务列表
    getPlanTaskPredList = () => {
        const { rightData } = this.props
        Object.assign(this.state.columns[2], { title: "后续任务代码" })
        Object.assign(this.state.columns[3], { title: "后续任务名称" })
        if (rightData && (rightData[0]['nodeType'] == 'wbs' || rightData[0]['nodeType'] == 'task')) {
            axios.get(getPlanTaskChangeFllowList(rightData[0]['id'], rightData[0]['changeId'] && rightData[0]['changeType'].id == 'ADD' ? 'change' : 'task')).then(res => {
                const { data } = res.data
                this.setState({
                    data,
                    activeStyle: 1
                })
            })
        } else {
            notification.warning(
                {
                    placement: 'bottomRight',
                    bottom: 50,
                    duration: 2,
                    message: '数据类型不符合',
                    description: '所选择的数据类型为task，wbs'
                }
            )
        }
    }

    // 获取紧前任务列表
    getPlanTaskFollowList = () => {
        const { rightData } = this.props
        Object.assign(this.state.columns[2], { title: '紧前任务名称' })
        Object.assign(this.state.columns[3], { title: '紧前任务代码' })
        if (rightData && (rightData[0]['nodeType'] == 'wbs' || rightData[0]['nodeType'] == 'task')) {
            axios.get(getPlanTaskChangePredList(rightData[0]['id'], rightData[0]['changeId'] && rightData[0]['changeType'].id == 'ADD' ? 'change' : 'task')).then(res => {
                const { data } = res.data
                this.setState({
                    data,
                    activeStyle: 2
                })
            })
        }
    }

    save(form, key) {
        form.validateFields((error, row) => {
            if (error) {
                return;
            }
            const newData = [...this.state.data];
            const { activeIndex } = this.state
            const { rightData } = this.props
            const index = newData.findIndex(item => key === item.id);
            const data = {
                //id: newData[index]['id'],
                newRelationType: row.newRelationType,
                newLagNum: row.newLagNum
            }
            newData[index]['changeId'] ? Object.assign(data, { id: newData[index]['changeId'] }) : null
            newData[index]['logicId'] ? Object.assign(data, { logicId: newData[index]['logicId'] }) : null
            let { startContent } = this.props.extInfo || {};
            let url = dataUtil.spliceUrlParams(updatePlanChgtaskpred, { startContent });
            axios.put(url, data, true,null,true).then(res => {
                newData[0].changeId = res.data.data.id
                if (index > -1) {
                    const item = newData[index];
                    newData.splice(index, 1, {
                        ...item,
                        ...row,
                    });
                    this.setState({ data: newData, editingKey: '' });
                } else {
                    newData.push(row);
                    this.setState({ data: newData, editingKey: '' });
                }
            })
        });
    }

    edit(key) {
        this.setState({ editingKey: key });
    }

    getInfo = (record, index) => {

      let delAuth = false;
      let cancelAuth = false;
      if(record["changeId"]){
        delAuth = false;
        cancelAuth = true;
      }else{
        delAuth = true;
        cancelAuth = false;
      }
      this.setState({
          activeIndex: [record.id],
          selectData: [record],
          delAuth,
          cancelAuth
      })

    };

    setClassName = (record, index) => {
        //判断索引相等时添加行的高亮样式
        return record.id == this.state.activeIndex[0] ? `${style['clickRowStyl']}` : "";
    }

    // 删除逻辑关系
    deletePlanTaskPred = () => {
        const { activeIndex, data, selectData } = this.state
        const { rightData } = this.props
        if (selectData[0] && !selectData[0]['changeId']) {
            let {startContent} = this.props.extInfo  || {};
            let url = dataUtil.spliceUrlParams(deletePlanChgtaskpred(selectData[0]['logicId']),{startContent});
            axios.deleted(url, null, true,null,true).then(res => {

                if (this.state.activeStyle == 1) {
                    this.getPlanTaskPredList()
                } else {
                    this.getPlanTaskFollowList()
                }
            })
        } else {
            notification.warning(
                {
                    placement: 'bottomRight',
                    bottom: 50,
                    duration: 2,
                    message: '操作提醒',
                    description: '没有可删除的逻辑关系'
                }
            )
        }

    }

    // 撤销逻辑变更
    canclePlanTaskChangePred = () => {
        const { activeIndex, data, selectData } = this.state
        const { rightData } = this.props
        if (selectData[0] && selectData[0]['changeId']) {
            let {startContent} = this.props.extInfo  || {};
            let url = dataUtil.spliceUrlParams(canclePlanTaskChangePred(selectData[0]['changeId']),{startContent});
            axios.put(url, null, true,null,true).then(res => {
                if (this.state.activeStyle == 1) {
                    this.getPlanTaskPredList()
                } else {
                    this.getPlanTaskFollowList()
                }
            })
        } else {
            notification.warning(
                {
                    placement: 'bottomRight',
                    bottom: 50,
                    duration: 2,
                    message: '操作提醒',
                    description: '没有可取消逻辑变更'
                }
            )
        }

    }

    onClickHandle = () => {
            this.setState({
                distributionModaVisible: true
            })
    }

    //Release弹窗关闭
    handleDistributionCancel = () => {
        this.setState({
            distributionModaVisible: false
        })
    }

    cancleVerify = () =>{
      const { selectData } = this.state;
      if(!selectData || selectData.length == 0 ){
        dataUtil.message("请选择变更数据操作!");
        return false;
      }
      if(!selectData[0]['changeId']) {
        dataUtil.message("该数据不是变更数据，禁止取消变更!");
        return false;
      }
      return true;
    }

    deleteVerify = () =>{
      const { selectData } = this.state;
      if(!selectData || selectData.length == 0 ){
        dataUtil.message("请选择变更数据操作!");
        return false;
      }
      if(selectData[0]['changeId']) {
        dataUtil.message("该数据是变更数据，禁止申请删除变更!");
        return false;
      }
      return true;
    }
    render() {
        const components = {
            body: {
                row: EditableFormRow,
                cell: EditableCell,
            },
        };

        const childColumns = (cols) => {
            return cols.map(col => {
                if (!col.editable) {
                    return col;
                }
                return {
                    ...col,
                    onCell: record => ({
                        record,
                        inputType: col.dataIndex === 'newRelationType' ? 'select' : 'text',
                        dataIndex: col.dataIndex,
                        title: col.title,
                        editing: this.isEditing(record),
                    }),
                };
            })
        }

        const columns = this.state.columns.map((cols, index) => {
            if (cols.children) {
                return {
                    ...cols,
                    children: childColumns(cols.children)
                }
            } else {
                return cols;
            }

        });

        if (this.state.selectData.length != 0) {
            Object.assign(this.state.menusEdit["delete"], { "1": true });
            Object.assign(this.state.menusEdit["cancelPlan"], { "1": true });
        }
        const planType = this.props.rightData[0]['planType'];
        const showBtn = planType && "ST-IMPLMENT-TASK" == planType.id;
        return (
            <div className={style.main}>
                <h3 className={style.listTitle}>前置后续</h3>
                <div className={style.rightTopTogs}>
                    {/*分配*/}
                    {showBtn && <PublicButton title={"新增变更"} edit={this.props.editAuth} icon={"icon-fenpei"} afterCallBack={this.onClickHandle}/>}
                    {/*删除*/}
                    {showBtn && <PublicButton title={"申请删除"} edit={this.props.editAuth && this.state.delAuth} useModel={true}
                                  content = {"您确定对该记录申请删除变更？"} verifyCallBack = {this.deleteVerify} afterCallBack={this.deletePlanTaskPred} icon={"icon-delete"} />}
                    {/**取消变更 */}
                    {showBtn && <PublicButton title={"取消变更"} edit={this.props.editAuth && this.state.cancelAuth } useModel={true}
                                  content = {"您确定要取消该变更记录？"} verifyCallBack = {this.cancleVerify}  afterCallBack={this.canclePlanTaskChangePred} icon={"icon-huanyuan"} />}
                </div>
                <div className={style.tabsToggle}>
                    <a href="javascript:void(0)" onClick={this.getPlanTaskFollowList} className={this.state.activeStyle == 2 ? style.active : ''}>紧前任务</a>
                    <a href="javascript:void(0)" onClick={this.getPlanTaskPredList} className={this.state.activeStyle == 1 ? style.active : ''}>后续任务</a>
                </div>
                <div className={style.mainScorll} style={{ height: 'calc(100% - 57px)' }}>
                    <Table
                        rowKey={record => record.id}
                        components={components}
                        columns={columns}
                        scroll={{ x: '100%', y: this.props.height-'10%'}}
                        dataSource={this.state.data}
                        //size="small"
                        bordered={true}
                        pagination={false}
                        rowClassName={this.setClassName}
                        onRow={record => {
                            return {
                                onClick: this.getInfo.bind(this, record),
                            };
                        }}
                    />
                </div>
                {this.state.distributionModaVisible && <DistributionModal
                    rightData={this.props.rightData}
                    handleCancel={this.handleDistributionCancel}
                    getPlanTaskPredList={this.getPlanTaskPredList}
                    getPlanTaskFollowList={this.getPlanTaskFollowList}
                    extInfo={this.props.extInfo}
                />}
            </div>
        )
    }
}

export default PlanComponentsLog
