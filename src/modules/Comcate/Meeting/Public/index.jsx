import React, { Component } from 'react'
import style from './style.less'
import { Modal, Table ,Button, notification} from 'antd';

import Search from '../../../../components/public/Search'
import SubmitButton from "../../../../components/public/TopTags/SubmitButton"
import { getReleaseMeetingList,updateReleaseMeetingList} from '../../../../api/api'
import axios from '../../../../api/axios'
import { connect } from 'react-redux'
import * as dataUtil from "../../../../utils/dataUtil"
export class PlanPreparedRelease extends Component {
    constructor(props) {
        super(props)
        this.state = {
          
            data: [],
            activeIndex:[],
            rightData:[]
        }
    }

    componentDidMount() {
       
       this.getList()
    }
    getList=()=>{
        axios.post(getReleaseMeetingList(this.props.projectId),{title:this.state.title}).then(res=>{
            this.setState({
                data:res.data.data
            })
        })
    }
    search=(value)=>{
        if(value!="" && !value.trim()){
            return
        }
        this.setState({
            title:value
        },()=>{
            this.getList()
        })
    }
    handleOk=()=>{
        const {activeIndex}=this.state
        if(activeIndex.length==0){
            notification.warning(
                {
                    placement: 'bottomRight',
                    bottom: 50,
                    duration: 1,
                    message: '警告',
                    description: '没有勾选数据！'
                }
            )
            return
        }
        let url = dataUtil.spliceUrlParams(updateReleaseMeetingList,{"startContent": "项目【"+ this.props.projectName +"】"});
        axios.put(url,activeIndex,true,null,true).then(res=>{
            this.setState({
                activeIndex:[],
                rightData:[]
            })
            this.props.handleCancel()
            this.props.reflesh()
        })
    }

   
    setClassName = (record, index) => {
        // 判断索引相等时添加行的高亮样式
         //判断索引相等时添加行的高亮样式
         if (this.state.activeIndex.findIndex(value => record.id === value) > -1) {
          return 'tableActivty'
        } else {
          return "";
        }
    
      };
    
   

    render() {
        const { intl } = this.props.currentLocale
        const columns= [
            {
                title: intl.get('wsd.i18n.comu.meeting.title'),
                dataIndex: 'title',
                key: 'title',
                // textWrap: 'word-break',
                // textWrap: 'ellipsis',
                width:"100px",
                render: (text, record) => (
                    <div style={{ wordWrap: 'break-word', wordBreak: 'break-all' }}>
                      {text}
                    </div>
                ),
            },
            {
                title: intl.get('wsd.i18n.comu.meeting.projectname'),
                dataIndex: 'project',
                key: 'project',
            },
            {
                title: intl.get('wsd.i18n.comu.meeting.meetingaddress'),
                dataIndex: 'meetingAddress',
                key: 'meetingAddress',
            },
            {
                title: intl.get('wsd.i18n.comu.meeting.meettime'),
                dataIndex: 'meetingTime',
                key: 'meetingTime',
                render: (text) =>  dataUtil.Dates().formatDateString(text)
            },
            {
                title: intl.get('wsd.i18n.comu.meeting.meetingtype'),
                dataIndex: 'meetingType',
                key: 'meetingType',
                render:text=>text? text.name:null
            }
        ]
        const rowSelection = {
            onChange: (selectedRowKeys, selectedRows) => {
               
                this.setState({
                  activeIndex:selectedRowKeys,
                  rightData:selectedRows,
                })
              },
        };
        return (
            <Modal className={style.main} width="850px"  centered={true} visible={true}
                title={intl.get("wsd.i18n.comu.meeting.direct")}
                mask={false}
                maskClosable={false}
                 onOk={this.handleOk} onCancel={this.props.handleCancel} bodyStyle={{ padding: 0 }}
                 footer={ 
                    <div className="modalbtn">
                    <SubmitButton key={2}  onClick={this.handleCancel} content={intl.get("wsd.global.btn.cancel")} />
                    <SubmitButton key={3} onClick={this.handleOk} type="primary" content={intl.get("wsd.global.btn.sure")} />
                    </div>
                }>
                <div className={style.tableMain}>
                    <div className={style.search}>
                        <Search placeholder={"会议标题"} search={this.search}/>
                    </div>
                    <Table rowKey={record => record.id} defaultExpandAllRows={true} pagination={false} rowClassName={this.setClassName} columns={columns} rowSelection={rowSelection} dataSource={this.state.data} size="small"
                      onRow={(record, index) => {
                        return {
                          onClick: (event) => {
                            event.currentTarget.getElementsByClassName("ant-checkbox-wrapper")[0].click()
                          
                          },
                        };
                      }
                      } />
                </div>
            </Modal>
        )
    }
}

const mapStateToProps = state => {
    return {
        currentLocale: state.localeProviderData,
    }
};


export default connect(mapStateToProps, null)(PlanPreparedRelease);
