/*
 * @Author: wihoo.wanghao 
 * @Date: 2019-01-17 11:35:16 
 * @Last Modified by: mikey.zhaopeng
 * @Last Modified time: 2019-02-23 15:23:11
 */

import React from 'react'
import { Icon, Popover, Button, Table, Checkbox } from 'antd';
import { connect } from 'react-redux'
import style from './style.less'
import axios from "../../../../api/axios"
import {importUserRsrc} from "../../../../api/api"
class SelectProjectBtn extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            addnewusers:"No", //追加新用户
            visible: false,
            updateexists:"No",//更新已存在的用户
            deleteinexistent:"No"//删除不存在的用
              
        }
    }
   
    componentDidMount() {

   
    }
    onChange1=(e)=>{
        this.setState({
            updateexists: e.target.checked? "YES" :"No"
        })
    }
    onChange2=(e)=>{
        this.setState({
            addnewusers: e.target.checked? "YES" :"No"
        })
    }
    onChange3=(e)=>{
        this.setState({
            deleteinexistent: e.target.checked? "YES" :"No"
        })
    }
    handleClose = () => {
        this.setState({
            visible: false,
        });
    }
    handleOpen = () => {
        this.setState({
            visible: false,
        });
    }
    handleVisibleChange = (visible) => {
        this.setState({ visible });
    }
    submit=()=>{
     
        axios.post(importUserRsrc(this.state.addnewusers,this.state.updateexists,this.state.deleteinexistent),null,true).then(res=>{
                this.props.refresh()
        })
    }

    
    render() {
     
        const { intl } = this.props.currentLocale
        const content = (
            <div className={style.main}>
              
                <div className={style.project} >
                  <Checkbox value={this.state.updateexists} onChange={this.onChange1}>更新已存在用户</Checkbox>
                  <br/>
                  <Checkbox value={this.state.addnewusers} onChange={this.onChange2}>追加新用户</Checkbox>
                  <br/>
                  <Checkbox value={this.state.deleteinexistent} onChange={this.onChange3}>删除不存在用户</Checkbox>
                </div>
          
                    <div className={style.btn}>
                       
                        <Button type="primary" size="small" onClick={this.submit}>更新</Button>
                    </div>
               
            </div>
        );
        return (

            <div className={style.main}>
                
                    <Popover
                        placement="bottomLeft"
                        content={content} trigger="click"
                        visible={this.state.visible}
                        onVisibleChange={this.handleVisibleChange}
                    >
                        <div className={`topBtnActivity ${style.main}`}>
                            <Icon type="download" style={{ paddingRight: "5px" }} />
                            <a>导入</a>
                        </div>
                    </Popover>
                
            </div>
        )
    }
}

const mapStateToProps = state => {
    return {
        currentLocale: state.localeProviderData,
    }
};


export default connect(mapStateToProps, null)(SelectProjectBtn);