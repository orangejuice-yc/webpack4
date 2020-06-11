import React, { Component } from 'react'
import { InputNumber, Icon, Button, Popover } from 'antd';
import style from './style.less'
import { connect } from 'react-redux'
import SelectProjectBtn from '../../../../../components/public/SelectBtn/SelectProjectBtn';
import axios from "../../../../../api/axios"
import * as dataUtil from '../../../../../utils/dataUtil';
import { exportGroupPlanExcel } from '../../../../../api/api'
export class PlanExportExcelTopTags extends Component {
  constructor(props) {
    super(props)
    this.state = {
    }
  }

    /**
   * 选择年
   */
  yearOnChange = (value) => {
    this.props.yearOnChange(value);
  }

  //打开项目
  openProject = (projectId, projectInfo) => {
    this.setState(
      {
        projectId,
        projectName: projectInfo.projectName
      },
      () => {
        this.props.table.getData();
      }
    );
  };
  /**
   * 导出计划
   */
  exportPlanExcel = () =>{
    let projectId = this.props.selectProjectId;
    let year = this.props.year;
    setTimeout(function () {
      let json = {
        projectId: projectId,
        year: year
      }
      axios.down(exportGroupPlanExcel,json).then((e) => {
      });
    }, 1000)
  }

  render() {
    return (
      <div className={style.main}>
        <div className={style.tabMenu}>
          {/*选择项目*/}
          <div className={style.project}>
            <SelectProjectBtn openProject={this.openProject} typeCode={'planExportExcel'}/>
            {/*年度*/}
            {<span style={{marginLeft:10}}> 年度：<InputNumber style={{ width: '70px' }} value={this.props.year}
                                formatter={value => `${value}年`} size="small" onChange={this.yearOnChange}
                                parser={value => value.replace('年', '')}
                                min={1976}
                                max={2999}
            /></span>}
            <Icon type="search" style={{marginTop:5}} className={style.icon} onClick={this.props.search}/>
          </div>
          <div>
            <Button className={style.exportPlanExcel} style={{height:24}} onClick={this.exportPlanExcel}>
              <Icon type="export"/>导出
            </Button>
          </div>
        </div>
      </div>
    );
  }
}



const mapStateToProps = state => {
  return {
    currentLocale: state.localeProviderData,
  }
};


export default connect(mapStateToProps, null)(PlanExportExcelTopTags);
