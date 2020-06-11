import React, { Component } from 'react'
import { connect } from 'react-redux'
import ProcLabel from "../../../../Components/Workflow/ProcLabel"
import { getApplyIdsByTaskId } from "../../../../../api/api"
import axios from "../../../../../api/axios"

class ChangeProcLabel extends Component {
    constructor(props) {
        super(props)
        this.state = {
            show : false,
            workflowBizIds: [],
            wokrflowType: "ST-IMPLMENT-CHANGE"
        }
    }

    componentDidMount() {
        let bizId = 0;
        let type = "task";
        let rightData = this.props.rightData[0];
        if(rightData.changeType && rightData.changeType.id == "ADD"){
            bizId = rightData.id;
            type = "change";
        }else{
            bizId = rightData.id;
            type = "task"
        }
        axios.get(getApplyIdsByTaskId(bizId,type)).then(res => {
            const workflowBizIds = res.data.data
            this.setState({
                workflowBizIds: workflowBizIds,
                show: true
            })
        })
    }

    render() {

        return (
            this.state.show && 
            (
                <ProcLabel  {...this.props} workflowBizIds={this.state.workflowBizIds} wokrflowType={this.state.wokrflowType}  ></ProcLabel>
            )
        )
    }
}

export default connect(state => ({
    currentLocale: state.localeProviderData
  }))(ChangeProcLabel);
