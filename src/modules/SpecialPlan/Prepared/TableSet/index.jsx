import React, { Component } from 'react'
import { Form, Row, Col, Radio, Input, Button, Checkbox, Icon, Select, DatePicker, Modal, Switch } from 'antd';
import moment from 'moment';
import style from './style.less'
import GanttColor from '../GanttColor'

const CheckboxGroup = Checkbox.Group;
const Option = Select.Option

export class PlanPreparedSchedule extends Component {
    constructor(props) {
        super(props)
        this.state = {
            ganttColorVisible: false,
            ganttSetInfo: {},
            currentGantt: '',
            tableListColors:{}
        }
    }
    componentDidMount(){
        const {tableListColors}=this.props
        this.setState({
            tableListColors:tableListColors||{}
        })
    }
    handleSubmit = (e) => {
        e.preventDefault();
        this.props.form.validateFieldsAndScroll((err, fileitem) => {
            if (!err) {
                
                this.props.saveTableListColor(this.state.tableListColors)
                this.props.handleCancel()
            }
        });
    }

    handleCancel = () => {
        this.setState({
            ganttColorVisible: false
        })
    }

    showGanttColor = (key, e) => {
        this.setState({
            ganttColorVisible: true,
            currentGantt: key
        })
    }
    //
    resetTableColor=()=>{
        this.setState({
            tableListColors:{}
        })
    }
    //设置表格颜色
    setGanttColor=(key,value)=>{
        const {tableListColors}=this.state
        tableListColors[key]=value
        this.setState({
            tableListColors
        })
    }
    render() {
        const { getFieldDecorator, getFieldsError, getFieldError, isFieldTouched } = this.props.form;
        const formItemLayout = {
            labelCol: {
                xs: { span: 24 },
                sm: { span: 6 },
            },
            wrapperCol: {
                xs: { span: 24 },
                sm: { span: 18 },
            },
        };
        const tableColorList = [
            { label: '第一层', value: "t1" },
            { label: '第二层', value: "t2" },
            { label: '第三层', value: "t3" },
            { label: '第四层', value: "t4" },
            { label: '第五层', value: "t5" },
            { label: '第六层', value: "t6" },
            { label: '第七层', value: "t7" },
            { label: '第八层', value: "t8" },
            { label: '第九层', value: "t9" },
            { label: '第十层', value: "t10" }
        ];
        const ganttSetInfo = typeof this.props.ganttSetInfo == 'string' ? JSON.parse(this.props.ganttSetInfo) : this.props.ganttSetInfo
        return (
            <Modal className={style.main} title="表格设置" visible={true} width={466} onCancel={this.props.handleCancel} footer={[
                <Button key="1" onClick={this.resetTableColor}>恢复默认颜色</Button>,
                <Button key="2" type="primary" onClick={this.handleSubmit}>保存</Button>,
            ]}>
                <Form onSubmit={this.handleSubmit}>
                    <div className={style.content}>
                        {tableColorList.map((item,index) => {
                            return (
                                <Form.Item label={item.label} {...formItemLayout} key={index}>
                                    <span className={style.ganttc} style={{ backgroundColor: this.state.tableListColors&&this.state.tableListColors[index+1] || 'transparent' }} onClick={this.showGanttColor.bind(this, index+1)}></span>
                                </Form.Item>
                            )
                        })}
                    </div>
                </Form>
                {this.state.ganttColorVisible && <GanttColor setGanttColor={this.setGanttColor} currentGantt={this.state.currentGantt} handleCancel={this.handleCancel} />}
            </Modal>
        )
    }
}

const PlanPreparedSchedules = Form.create()(PlanPreparedSchedule);
export default PlanPreparedSchedules
