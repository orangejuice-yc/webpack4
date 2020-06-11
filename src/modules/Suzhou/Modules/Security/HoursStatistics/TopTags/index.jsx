import React from 'react';
import PublicButton from '@/components/public/TopTags/PublicButton';
// import AddFormComponent from '../AddForm';
import SearchVeiw from '../SearchVeiw';
import { Select, DatePicker } from 'antd';
import style from './style.less';
import axios from '@/api/axios';
import { queryGrDep, getLearnHoursStatistics } from '@/modules/Suzhou/api/suzhou-api';
import moment from 'moment';
const { Option } = Select;

export default class extends React.Component {
  state = {
    isopen: false,
    time: null,
    sponsorDep: [],
  };
  // 获取发起部门
  getSponsorDep = () => {
    axios.get(queryGrDep).then(res => {
      this.setState({
        sponsorDep: res.data.data.map(item => item.orgName),
      });
    });
  };
  // 导出
  handleExport = () => {
    axios.down(getLearnHoursStatistics+`?dep=${this.props.params.dep}&year=${this.props.params.year}`);
  };
  render() {
    const props = this.props;
    return (
      <div className={style.main}>
        <div className={style.tabMenu}>
          {/* <AddFormComponent handleAddData={props.handleAddData} /> */}
          {props.permission.indexOf('HOURSSTATISTICS_EXPORT-INTRAIN-HOURS')!==-1 && ( 
          <PublicButton
            name={'导出'}
            title={'导出'}
            icon={'icon-iconziyuan2'}
            res={'MENU_EDIT'}
            edit={true}
            afterCallBack={this.handleExport}
            show={this.props.data.length > 0}
          />)}
        </div>
        <div className={style.rightLayout}>
          <span> 部门：</span>
          <Select
            size="small"
            style={{ width: 150 }}
            placeholder="请选择"
            onFocus={this.getSponsorDep}
            onChange={value => {
              this.props.handleSearch({
                dep: value,
              });
            }}
          >
            {this.state.sponsorDep.map((item, index) => {
              return (
                <Option value={item} key={index}>
                  {item}
                </Option>
              );
            })}
          </Select>
          <span style={{ marginLeft: 10 }}> 年份：</span>
          <DatePicker
            format="YYYY"
            placeholder="请选择年份"
            size="small"
            mode="year"
            value={this.state.time}
            style={{ width: 150 }}
            open={this.state.isopen}
            onChange={value => {
              this.setState({ time: value });
            }}
            onPanelChange={value => {
              this.setState({ time: value, isopen: false });
              this.props.handleSearch({
                year: moment(value).format('YYYY'),
              });
              this.props.getYear(moment(value).format('YYYY'));
            }}
            onOpenChange={status => {
              if (status) {
                this.setState({ isopen: true });
              } else {
                this.setState({ isopen: false });
              }
            }}
          />
          {/* <SearchVeiw handleSearch={props.handleSearch} /> */}
        </div>
      </div>
    );
  }
}
