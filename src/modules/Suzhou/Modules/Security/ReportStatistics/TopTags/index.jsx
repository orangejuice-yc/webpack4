import React, {Component} from 'react';
// import dynamic from 'next/dynamic';
import {Modal, message,Select,notification,DatePicker} from 'antd';
import {connect} from 'react-redux';
import moment from 'moment';
import {curdCurrentData} from '../../../../../../store/curdData/action';
import Search from '@/modules/Suzhou/components/Search';
import SelectProBtn from '@/modules/Suzhou/components/SelectBtn/SelectProBtn';
import SelectSectionBtn from '@/modules/Suzhou/components/SelectBtn/SelectSectionBtn';
import style from './style.less';
import axios from '@/api/axios';
import {exportDetailReport} from '@/modules/Suzhou/api/suzhou-api';
import PublicButton from '@/components/public/TopTags/PublicButton';
import notificationFun from '@/utils/notificationTip';
import * as dataUtil from '@/utils/dataUtil';
const { Option } = Select;
const { RangePicker } = DatePicker;
export class TopTags extends Component{
    constructor(props){
        super(props);
        this.state = {
            modalVisible:false, //增加修改弹窗
        }
    }
    componentWillReceiveProps() {
        this.props.zqStart
          ? this.setState({ zqStart: this.props.zqStart, showStartTime: this.props.zqStart })
          : '';
        this.props.zqEnd
          ? this.setState({ zqEnd: this.props.zqEnd, showEndTime: this.props.zqEnd })
          : '';
      }
    //判断是否有选中数据
    hasRecord=()=>{
        if(this.props.selectedRows.length == 0){
            notificationFun('未选中数据','请选择数据进行操作');
            return false;
        }else {
            return true
        }
    }
    btnClicks = (name, type) => {
        const {record,selectedRows} = this.props;
        if(name == 'ExportFile'){
            axios.down(exportDetailReport+`?viewType=${this.props.viewType}&zqStart=${this.state.zqStart}&zqEnd=${this.state.zqEnd}`).then((res)=>{
            })
        }
    }
    //搜索
    search = val => {
        const { showStartTime, showEndTime } = this.state;
        this.setState(
        {
            companyName: val,
            zqStart: showStartTime,
            zqEnd: showEndTime,
        },
            () => {
                this.props.successSearch(val,showStartTime,showEndTime);
            }
        );
    };
    onChangeTime = (times, dateString) => {
        this.setState({
          showStartTime: !dateString[0]
            ? ''
            : dataUtil
                .Dates()
                .formatTimeString(dateString[0])
                .substr(0, 10),
          showEndTime: !dateString[1]
            ? ''
            : dataUtil
                .Dates()
                .formatTimeString(dateString[1])
                .substr(0, 10),
        });
    };
    render(){
        const dateFormat = 'YYYY-MM-DD';
        return(
            <div className={style.main}>
                <div className={style.search}>
                <span>
                    时间
                    <RangePicker
                    format="YYYY-MM-DD "
                    placeholder={['开始时间', '结束时间']}
                    size="small"
                    onChange={this.onChangeTime}
                    style={{ width: 220 }}
                    value={
                        this.state.showStartTime === undefined ||
                        this.state.showEndTime === undefined ||
                        this.state.showStartTime === '' ||
                        this.state.showEndTime === ''
                        ? null
                        : [
                            moment(this.state.showStartTime, dateFormat),
                            moment(this.state.showEndTime, dateFormat),
                            ]
                    }
                    />
                </span>
                    <Search search={this.search} placeholder={'组织名称'} />
                </div>
                <div className={style.tabMenu}>
                {this.props.permission.indexOf('REPORTSTATISTICS_EXPORT-REPORT-CENSUS')!==-1 && (
                    <PublicButton name={'导出'} title={'导出'} icon={'icon-iconziyuan2'}
                        afterCallBack={this.btnClicks.bind(this,'ExportFile')}
                        res={'MENU_EDIT'} />)}
                    <span style={{marginLeft:'10px'}}>
                        人员类型：{' '}
                        <Select
                            onChange={this.props.selectType}
                            defaultValue="0"
                            size="small"
                            style={{ width: 150, marginRight: 10 }}
                            >
                            <Option value="0" key="0">
                                各设备部
                            </Option>
                            <Option value="1" key="1">
                                外部单位
                            </Option>
                        </Select>
                    </span>
                </div>
            </div>
        )
    }
}
export default TopTags;