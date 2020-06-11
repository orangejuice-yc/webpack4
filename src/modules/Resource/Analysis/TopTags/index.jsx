/*
 * @Author: wihoo.wanghao 
 * @Date: 2019-01-17 11:43:11 
 * @Last Modified by: mikey.zhaopeng
 * @Last Modified time: 2019-01-25 11:17:47
 */

import React, { Component } from 'react'
// import dynamic from 'next/dynamic'
import Search from '../../../../components/public/Search'
import style from './style.less'
import PublicViewButton from "../../../../components/public/TopTags/PublicViewButton"
export class PlanDefineTopTags extends Component {
    constructor(props) {
        super(props)
        this.state = {
            roleBtnData: [
                {
                    id: 1,
                    name: 'ResAnalyBtn',
                    aliasName: '资源分析'
                },
                // {
                //     id: 2,
                //     name: 'SetDateBtn',
                //     aliasName: '设置日期'
                // },
                // {
                //     id: 4,
                //     name: 'OpenProjectBtn',
                //     aliasName: '打开项目'
                // }

            ]
        }
    }
    // modal取消
    handleCancel = () => {
        this.setState({
            modalVisible: false
        })
    }
    onClickHandle = (name, menu) => {
        // 删除
        if (name === 'ResAnalyBtn') {
            this.props.switchRes(menu)
        }



    }
    render() {
      

        return (
            <div className={style.main}>
                <div className={style.search}>
                    <Search search={this.props.search}/>
                </div>
                <div className={style.tabMenu}>
                          {/* <ResAnalyBtn  onClickHandle={this.onClickHandle} />     */}
                          <PublicViewButton afterCallBack={this.props.switchRes} icon={"icon-ziyuanshituxuanze"} currentIndex={this.props.view=="equip" ? 1:0}
                        menus={[{ key: "user", label: "人力资源", edit: true },
                        { key: "equip", label: "设备资源", edit: true}]}/>   
                </div>


            </div>

        )
    }
}

export default PlanDefineTopTags
