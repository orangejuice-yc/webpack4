import React, { Component } from 'react'
import { connect } from 'react-redux'
import ProcLabel from "../../../../Components/Workflow/ProcLabel"
import { getFeedbackWorkflowByIds } from "../../../../../api/api"
import axios from "../../../../../api/axios"

class FeedbackProcLabel extends Component {
    constructor(props) {
        super(props)
        this.state = {
            show : false,
            workflowBizIds: [],
            wokrflowType: "ST-PRED-FEEDBACK"
        }
    }

    componentDidMount() {
      let {id} = this.props.rightData || {};
      //获取流程数据
      axios.get(getFeedbackWorkflowByIds(id)).then(res => {
        let datas = [];
        let list = res.data.data;
        if(list){
          list.forEach(item => {
            datas.push(item.id);
          })
          this.setState({
            workflowBizIds : datas,
            show : true
          })
        }
      })
    }

    render() {

        return (
            this.state.show && 
            (
                <ProcLabel  {...this.props} workflowBizIds={this.state.workflowBizIds} wokrflowType={this.state.wokrflowType} isCheckWf={this.props.isCheckWf}  ></ProcLabel>
            )
        )
    }
}

export default connect(state => ({
    currentLocale: state.localeProviderData
  }))(FeedbackProcLabel);
