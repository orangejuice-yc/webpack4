import React from 'react'
import style from './style.less'
import { Table, Modal, Icon, Popover, Input, Button, DatePicker, Select, Row, Col, notification, Form } from 'antd';
import _ from 'lodash'
import moment from 'moment';
import SubmitButton from "../../../../../components/public/TopTags/SubmitButton"
const Search = Input.Search;
const { RangePicker } = DatePicker;
const Option = Select.Option;
import * as dataUtil from '../../../../../utils/dataUtil';
import axios from "../../../../../api/axios"
import {
    getRsrcUserAssignTree,
    getRsrcEquipAssignTree,
    getRsrcMaterialAssignTree,
    getdetaillist
} from "../../../../../api/api"
import * as util from '../../../../../utils/util';

//分配modal，用于 组织机构，协作团队，项目团队
class Distribute extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            leftData: [],                             //左侧数据
            leftInitData: [],                             //左侧数据
            leftActiveKey: null,                  //左侧标记用于添加点击行样式
            rightActiveKey: null,                 //右侧标记用于添加点击行样式
            visible: true,                        //modal默认显示
            isMove: 'no',                         //配置按钮事件有效状态，right向右添加，left向左操作 no禁止操作
            locale: { emptyText: '暂无分配数据' },    //table初始化
            hovered: false,
            hoverContent: <div>加载中...</div>,
            rightColumns: [                       //右侧表头
                {
                    title: '名称',
                    dataIndex: 'rsrcName',
                    key: 'rsrcName',
                    width: 100
                },
                {
                    title: '申请开始',
                    dataIndex: 'startTime',
                    key: 'startTime',
                    width: 100,
                    render: (text) => dataUtil.Dates().formatDateString(text)
                },
                {
                    title: '申请完成',
                    dataIndex: 'completeTime',
                    key: 'completeTime',
                    width: 100,
                    render: (text) => dataUtil.Dates().formatDateString(text)
                },
                {
                    title: '占用状态',
                    dataIndex: 'rsrcStatus',
                    key: 'rsrcStatus',
                    width: 100,
                    render: data => data || '--'
                },
            ],
            rightData: [],                        //右侧数据
            choiceData: [],                      //选中数据
            selectValue: '人力资源',
            defaultSelectDate: []
        }
    }
    componentDidMount() {
        const { rightData } = this.props
        this.setState({
            defaultSelectDate: [moment(rightData[0].planStartTime), moment(rightData[0].planEndTime)]
        }, () => {
            this.getPlanTaskrsrcList()
        })

    }

    // 获取select值
    getSelectValue = (value) => {
        this.setState({
            selectValue: value
        }, () => {
            this.getPlanTaskrsrcList()
        })
    }

    //搜索
    onChange = (rangeDate, e) => {
        this.setState({defaultSelectDate : rangeDate });
    }

    //获取任务分配资源
    getPlanTaskrsrcList = () => {
        const { rightData } = this.props
        const { selectValue } = this.state
        if (rightData && (rightData[0]['nodeType'] == 'task' || rightData[0]['nodeType'] == 'wbs')) {
            if (selectValue == '设备资源') {
                axios.get(getRsrcEquipAssignTree(dataUtil.Dates().formatTimeString(this.state.defaultSelectDate[0]), dataUtil.Dates().formatTimeString(this.state.defaultSelectDate[1]))).then(res => {
                    const { data } = res.data
                    const loop = (value, _id) => {
                        for (let k = 0; k < value.length; k++) {
                            Object.assign(value[k], {
                                startTime: dataUtil.Dates().formatTimeString(this.state.defaultSelectDate[0]),
                                completeTime: dataUtil.Dates().formatTimeString(this.state.defaultSelectDate[1]),
                            });

                            if (value[k].children) {
                                loop(value[k].children, _id);
                            }
                        }
                    }
                    data.map((v, i) => {
                        loop(data, v.id)
                    })

                    this.setState({
                        leftData: data,
                        leftInitData: data,
                    }, () => {
                      this.searchData();
                    })
                })
            } else if (selectValue == '材料资源') {
                axios.get(getRsrcMaterialAssignTree(dataUtil.Dates().formatTimeString(this.state.defaultSelectDate[0]), dataUtil.Dates().formatTimeString(this.state.defaultSelectDate[1]))).then(res => {
                    const { data } = res.data
                    const loop = (value, _id) => {
                        for (let k = 0; k < value.length; k++) {
                            Object.assign(value[k], {
                                startTime: dataUtil.Dates().formatTimeString(this.state.defaultSelectDate[0]),
                                completeTime: dataUtil.Dates().formatTimeString(this.state.defaultSelectDate[1]),
                            });

                            if (value[k].children) {
                                loop(value[k].children, _id);
                            }
                        }
                    }
                    data.map((v, i) => {
                        loop(data, v.id)
                    })
                    this.setState({
                        leftData: data,
                        leftInitData: data,
                    }, () => {
                      this.searchData();
                    })
                })
            } else {
                axios.get(getRsrcUserAssignTree(dataUtil.Dates().formatTimeString(this.state.defaultSelectDate[0]), dataUtil.Dates().formatTimeString(this.state.defaultSelectDate[1]))).then(res => {
                    const { data } = res.data
                    const loop = (value, _id) => {
                        for (let k = 0; k < value.length; k++) {
                            Object.assign(value[k], {
                                startTime: dataUtil.Dates().formatTimeString(this.state.defaultSelectDate[0]),
                                completeTime: dataUtil.Dates().formatTimeString(this.state.defaultSelectDate[1]),
                            });

                            if (value[k].children) {
                                loop(value[k].children, _id);
                            }
                        }
                    }
                    data.map((v, i) => {
                        loop(data, v.id)
                    })
                    this.setState({
                        leftData: data,
                        leftInitData: data,
                    }, () => {
                      this.searchData();
                    })
                })
            }

        } else {
            notification.warning(
                {
                    placement: 'bottomRight',
                    bottom: 50,
                    duration: 2,
                    message: '数据类型不符合',
                    description: '所选择的数据类型为wbs、task'
                }
            )
        }
    }

    //确认操作
    handleSubmit = () => {
        this.props.distribute(this.state.rightData)
        this.props.handleCancel()
    }

    //获取选中数据
    getInfo = (record, index, type) => {
        if (type == 'left') {
            if (record.rsrcType == "user" || record.rsrcType == "equip" || record.rsrcType == "material") {
                let isMove = null;
                if (record.id) {
                    var index = _.findIndex(this.state.rightData, function (e) {
                        return e.id == record.id
                    })
                    if (index != '-1' || record.rsrcStatus == '占用') {
                        isMove = 'no'
                    } else {
                        isMove = 'right'
                    }
                }
                this.setState({
                    leftActiveKey: record.id + record.rsrcType,
                    rightActiveKey: null,
                    isMove: isMove,
                    choiceData: record
                })
            }

        } else {
            this.setState({
                isMove: 'left',
                leftActiveKey: null,
                rightActiveKey: record.id,
                choiceData: record
            })
        }

    }
    //查询功能
    search = (value) => {
      this.setState({searchValue : value},() => {
        this.getPlanTaskrsrcList();
      })
    }

    searchData = () =>{
      const { leftInitData,searchValue } = this.state;
      let newData = leftInitData;
      newData = dataUtil.search(leftInitData, [{ "key": "rsrcName", "value": searchValue }], true);
      this.setState({
        leftData: newData
      });
    }

    //左侧table，点击时添加背景色
    setLeftClassName = (record, index) => {
        //判断索引相等时添加行的高亮样式
        return record.id + record.rsrcType === this.state.leftActiveKey ? 'tableActivty' : "";
    }

    //右侧table，点击时添加背景色
    setRightClassName = (record, index) => {
        //判断索引相等时添加行的高亮样式
        return record.id === this.state.rightActiveKey ? 'tableActivty' : "";
    }

    //左右按钮选择操作数据
    moveData = (type) => {
        var rightData = this.state.rightData
        if (type == 'left') {
            var choiceData = this.state.choiceData
            var index = _.findIndex(rightData, function (e) {
                return e.id == choiceData.id
            })
            if (index != '-1') {
                rightData.splice(index, 1);
            }
        } else {
            rightData.unshift(this.state.choiceData)
        }
        this.setState({
            rightData: rightData,
            isMove: 'no'
        })
    }
    //双击处理
    handleDoubleClick = (type, record) => {
        var rightData = this.state.rightData

        if (type == 'left') {

            var index = _.findIndex(rightData, function (e) {
                return e.id == record.id
            })
            if (index != '-1') {
                rightData.splice(index, 1);
            }
        } else {
            let index = rightData.findIndex(item => item.id == record.id)
            if (index == -1 && record.rsrcStatus != '占用') {
                rightData.unshift(record)
            }

        }
        this.setState({
            rightData: rightData,
            isMove: 'no'
        })
    }

    handleHoverChange = (record, flag) => {
        if (flag) {
            this.setState({ hoveredId: record.id})
            axios.get(getdetaillist(record.id, record.rsrcType, record.startTime, record.completeTime)).then(res => {
             
                if (res.data.data) {
                    const Columns1=[
                        {
                        title: '项目名称',
                        dataIndex: 'projectName',
                        key: 'projectName',
                        width:150,
                    },
                    {
                        title: '任务名称',
                        dataIndex: 'taskName',
                        key: 'taskName',
                        width:150,
                    },
                    {
                        title: '开始时间',
                        dataIndex: 'planStartDate',
                        key: 'planStartDate',
                        width:140,
                    },
                    {
                        title: '完成时间',
                        dataIndex: 'planEndDate',
                        key: 'planEndDate'
                    },
                ]
                    const content = (
                      <Table
                      rowKey={(record, index) => record.id}
                      columns={Columns1}
                      scroll={{ y: 270 }}
                      dataSource={res.data.data} pagination={false}
                      size="small"
                      bordered />)
                   
                    this.setState({
                        hoverContent: content
                    })
                }
            })
        } else {
            this.setState({
                hoveredId: null,
                hoverContent:<div>加载中...</div>
            })
        }
    }
    render() {
        let leftColumns = null;
        if (this.state.selectValue == "人力资源") {
            leftColumns = [                        //左侧表头
                {
                    title: '名称',
                    dataIndex: 'rsrcName',
                    key: 'rsrcName',
                    width: 300,
                    render: (text, record) => {
                        if (record.rsrcType == "equip" || record.rsrcType == "material") {
                            return dataUtil.getIconCell(record.rsrcType, text)
                        } else {
                            return dataUtil.getIconCell("user", text, record.rsrcType)
                        }
                    }

                },
                {
                    title: '占用状态',
                    dataIndex: 'rsrcStatus',
                    key: 'rsrcStatus',
                    render: (data, record) => {
                        if (data == "占用") {
                            return <Popover placement="right"
                                content={this.state.hoverContent}
                                title={<h4>任务清单</h4>}
                                trigger="hover"
                                visible={this.state.hoveredId==record.id}
                                onVisibleChange={this.handleHoverChange.bind(this, record)}>
                                <span style={{color:"red",borderBottom:"1px red solid"}}>{data}</span>
                            </Popover>
                        } else {
                            return data || '--'
                        }
                    }
                }
            ];
        } else {

            leftColumns = [                        //左侧表头
                {
                    title: '名称',
                    dataIndex: 'rsrcName',
                    key: 'rsrcName',
                    width: 200,
                    render: (text, record) => {
                        if (record.rsrcType == "equip" || record.rsrcType == "material") {
                            return dataUtil.getIconCell(record.rsrcType, text)
                        } else {
                            return dataUtil.getIconCell("user", text, record.rsrcType)
                        }
                    }

                },
                {
                    title: '计量单位',
                    dataIndex: 'unit',
                    key: 'unit',
                    width: 100,
                    render: data => data ? data.name : '--'
                },
                {
                    title: '占用状态',
                    dataIndex: 'rsrcStatus',
                    key: 'rsrcStatus',
                    render: (data, record) => {
                        if (data == "占用") {
                            return <Popover placement="right"
                                content={this.state.hoverContent}
                                title="清单项"
                                trigger="hover"
                                visible={this.state.hoveredId==record.id}
                                onVisibleChange={this.handleHoverChange.bind(this, record)}>
                                <span style={{color:"red",borderBottom:"1px red solid"}}>{data}</span>
                            </Popover>
                        } else {
                            return data || '--'
                        }
                    }
                },
            ];
        }

        const {
            getFieldDecorator, getFieldsError, getFieldError, isFieldTouched
        } = this.props.form;
        return (
            <Modal className={style.main}
                mask={false}
                maskClosable={false}
                bodyStyle={{ height: 400 }}
                title="分配"
                width={1000}
                visible={true}
                onCancel={this.props.handleCancel}
                centered={true}
                footer={
                    <div className="modalbtn">
                        <SubmitButton key="1" onClick={this.props.handleCancel} content="取消" />
                        <SubmitButton key="2" type="primary" onClick={this.handleSubmit} content="确认" />
                    </div>
                }
            >
                <div className={style.search}>
                    <Row gutter={20}>
                        <Col span={4}>
                            <Select defaultValue="人力资源" style={{ width: '100%' }} onChange={this.getSelectValue}>
                                <Option value="人力资源">人力资源</Option>
                                <Option value="设备资源">设备资源</Option>
                                <Option value="材料资源">材料资源</Option>
                            </Select>
                        </Col>
                        <Col span={8}>
                            <RangePicker
                                format="YYYY-MM-DD"
                                defaultValue={this.state.defaultSelectDate}
                                onChange={this.onChange}
                                placeholder={['申请开始', '申请完成']}
                                style={{ width: '100%' }}
                            />
                        </Col>

                        <Col span={8} style={{marginLeft:"7px"}}>
                          <Search
                            placeholder="名称"
                            enterButton="搜索"
                            onSearch={value => { this.search(value) }}
                          />
                        </Col>

                      </Row>
                </div>
                <div className={style.box}>
                    <Table className={style.tableBox}
                        rowKey={(record, index) => record.id + record.rsrcType}
                        columns={leftColumns}
                        scroll={{ y: 270 }}
                        dataSource={this.state.leftData} pagination={false}
                        size="small"
                        bordered
                        locale={this.state.locale}
                        rowClassName={this.setLeftClassName}
                        onRow={(record, index) => {
                            return {
                                onClick: (event) => {
                                    this.getInfo(record, index, 'left')
                                },
                                onDoubleClick: event => {
                                    if (record.rsrcType == "user" || record.rsrcType == "equip" || record.rsrcType == "material") {
                                        this.handleDoubleClick('right', record)
                                    }
                                },
                            }
                        }
                        }
                    />
                    <div className={style.border}>
                        <div>
                            <Button onClick={this.moveData.bind(this, 'right')} disabled={this.state.isMove == 'right' ? false : 'disabled'}
                                icon='double-right' style={{ marginBottom: 10 }} />
                            <Button onClick={this.moveData.bind(this, 'left')} disabled={this.state.isMove == 'left' ? false : 'disabled'}
                                icon='double-left' />
                        </div>
                    </div>
                    <Table className={style.tableBox}
                        rowKey={(record, index) => record.id}
                        columns={this.state.rightColumns}
                        scroll={{ y: 260 }}
                        size="small"
                        dataSource={this.state.rightData} pagination={false}
                        bordered
                        locale={this.state.locale}
                        rowClassName={this.setRightClassName}
                        onRow={(record, index) => {
                            return {
                                onClick: (event) => {
                                    this.getInfo(record, index, 'right')
                                },
                                onDoubleClick: event => {
                                    this.handleDoubleClick('left', record)
                                },
                            }
                        }
                        }
                    />
                </div>
            </Modal>
        )
    }
}

const Distributes = Form.create()(Distribute);
export default Distributes
