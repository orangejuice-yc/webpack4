import React from 'react';
import PublicButton from '@/components/public/TopTags/PublicButton';
import { Select, DatePicker } from 'antd';
import style from './style.less';
import axios from '@/api/axios';
import Search from '@/modules/Suzhou/components/Search';
import SelectProBtn from '@/modules/Suzhou/components/SelectBtn/SelectProBtn';
import SelectSectionBtn from '@/modules/Suzhou/components/SelectBtn/SelectSectionBtn';
import { queryGrDep, getOutLearnHoursStatistics } from '@/modules/Suzhou/api/suzhou-api';
import * as dataUtil from "@/utils/dataUtil";

import moment from 'moment';
const { Option } = Select;

export default class extends React.Component {
  state = {
    isopen: false,
    time: null,
    // sponsorDep: [],
  };
  // 导出
  handleExport = () => {
    const url = dataUtil.spliceUrlParams(getOutLearnHoursStatistics,this.props.params)
    axios.down(url);
  };
  render() {
    const props = this.props;
    return (
      <div className={style.main}>
        <div className={style.tabMenu}>
          <SelectProBtn  openPro={this.props.openPro} />
          <SelectSectionBtn openSection={this.props.openSection} data1={this.props.projectId} />
          {props.permission.indexOf('OUTHOURSSTATISTICS_EXPORT-OUTTRAINHOURS')!==-1 && ( 
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
            <Search search={this.props.search} placeholder={'单位'} />
        </div>
      </div>
    );
  }
}
