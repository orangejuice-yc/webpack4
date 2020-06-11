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
            currentGantt: ''
        }
    }
    componentDidMount(){
        const {ganttSetInfo}=this.props
        this.setState({
            ganttSetInfo
        })
    }
    resetGanttColor=()=>{
        this.setState({
            ganttSetInfo:{
                stillNeedGantt: '#40cf00', //尚需横道
                actualGantt: '#76bbfd', //实际横道
                scheduleGantt: '#27d64a', //进度横道
                aimsGantt: '#e9c84a', //目标横道
                wbsGantt: '#66659b', //WBS横道
                ganttVisiable: [4], //1显示WBS横道 2显示计划横道 3显示基线横道 4显示关键路径
                topScale: 'year', //顶层刻度
                bottomScale: 'day' //底层刻度
            }
        })
    }

    handleSubmit = (e) => {
        e.preventDefault();
        this.props.form.validateFieldsAndScroll((err, fileitem) => {
            if (!err) {
                const {ganttSetInfo}=this.state
                ganttSetInfo.topScale=fileitem.topScale
                ganttSetInfo.bottomScale=fileitem.bottomScale
                ganttSetInfo.ganttVisiable=fileitem.ganttVisiable
                ganttSetInfo.lineMode = fileitem.lineMode
                this.props.saveGanttByStorage(ganttSetInfo)
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
    setGanttColor=(key,value)=>{
        const {ganttSetInfo}=this.state
        ganttSetInfo[key]=value
        this.setState({
            ganttSetInfo
        })
    }
    //显示计划横道 和 显示基线横道互斥
    selectHandle=(value)=>{
       if(value.length>1){
           //最后选择项
           let lastselect=value[value.length-1]
           if(lastselect==2){
               let flag=value.findIndex(item=>item==3)
               if(flag>-1){
                   value.splice(flag,1)
               }
           }
           if(lastselect==3){
            let flag=value.findIndex(item=>item==2)
            if(flag>-1){
                value.splice(flag,1)
            }
        }
       }
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
        const plainOptions = [

            { label: '显示基线横道', value: 2 },
            // { label: '显示横道', value: 3 },
            { label: '显示关键路径', value: 4 },
            { label: '显示前锋线', value: 'showLine' }
        ];
        const ganttSetInfo = this.state.ganttSetInfo
        return (
            <Modal className={style.main} title="横道设置" visible={true} width={466} onCancel={this.props.handleCancel} footer={[
                <Button key="1" onClick={this.resetGanttColor}>恢复默认颜色</Button>,
                <Button key="2" type="primary" onClick={this.handleSubmit}>保存</Button>,
            ]}>
                {ganttSetInfo && <Form onSubmit={this.handleSubmit}>
                    <div className={style.content}>
                        <Form.Item label="尚需横道" {...formItemLayout}>
                            <span className={style.ganttc} style={{ backgroundColor: ganttSetInfo.stillNeedGantt || 'transparent' }} onClick={this.showGanttColor.bind(this, 'stillNeedGantt')}></span>
                        </Form.Item>
                        <Form.Item label="实际横道" {...formItemLayout}>
                            <span className={`${style.ganttc}`} style={{ backgroundColor: ganttSetInfo.actualGantt || 'transparent' }} onClick={this.showGanttColor.bind(this, 'actualGantt')}></span>
                        </Form.Item>
                        {/* <Form.Item label="进度横道" {...formItemLayout}>
                            <span className={`${style.ganttc}`} style={{ backgroundColor: ganttSetInfo.scheduleGantt || 'transparent' }} onClick={this.showGanttColor.bind(this, 'scheduleGantt')}></span>
                        </Form.Item> */}
                        <Form.Item label="目标横道" {...formItemLayout}>
                            <span className={`${style.ganttc}`} style={{ backgroundColor: ganttSetInfo.aimsGantt || 'transparent' }} onClick={this.showGanttColor.bind(this, 'aimsGantt')}></span>
                        </Form.Item>
                        <Form.Item label="WBS横道" {...formItemLayout}>
                            <span className={`${style.ganttc}`} style={{ backgroundColor: ganttSetInfo.wbsGantt || 'transparent' }} onClick={this.showGanttColor.bind(this, 'wbsGantt')}></span>
                        </Form.Item>
                        <Form.Item label="顶层刻度" {...formItemLayout}>
                            {getFieldDecorator('topScale', {
                                initialValue: ganttSetInfo.topScale,
                                rules: [],
                            })(
                                <Select style={{ width: 75 }}>
                                    <Option value="year">年</Option>
                                    <Option value="halfyear">半年</Option>
                                    <Option value="quarter">季度</Option>
                                    <Option value="month">月</Option>
                                    <Option value="week">周</Option>
                                </Select>
                            )}
                        </Form.Item>
                        <Form.Item label="底层刻度" {...formItemLayout}>
                            {getFieldDecorator('bottomScale', {
                                initialValue: ganttSetInfo.bottomScale,
                                rules: [],
                            })(
                                <Select style={{ width: 75 }}>
                                    <Option value="year">年</Option>
                                    <Option value="halfyear">半年</Option>
                                    <Option value="quarter">季度</Option>
                                    <Option value="month">月</Option>
                                    <Option value="week">周</Option>
                                    <Option value="day">日</Option>
                                </Select>
                            )}

                        </Form.Item>
                      <Form.Item label="前锋线" {...formItemLayout} buttonStyle="solid">
                        {getFieldDecorator('lineMode', {
                          initialValue: ganttSetInfo.lineMode ? ganttSetInfo.lineMode :'1',
                          rules: [],
                        })(
                          <Radio.Group>
                            <Radio.Button value="1">模式1</Radio.Button>
                            <Radio.Button value="2">模式2</Radio.Button>
                          </Radio.Group>
                        )}

                      </Form.Item>
                    </div>
                    <div className={style.select}>
                        {getFieldDecorator('ganttVisiable', {
                            initialValue: ganttSetInfo.ganttVisiable,
                            rules: [],
                        })(
                            <CheckboxGroup options={plainOptions} onChange={this.selectHandle.bind(this)}></CheckboxGroup>
                        )}
                    </div>
                </Form>}
                {this.state.ganttColorVisible && <GanttColor setGanttColor={this.setGanttColor} currentGantt={this.state.currentGantt} handleCancel={this.handleCancel} />}
            </Modal>
        )
    }
}

const PlanPreparedSchedules = Form.create()(PlanPreparedSchedule);
export default PlanPreparedSchedules
