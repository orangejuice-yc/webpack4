import React, { Component } from 'react'
import intl from 'react-intl-universal'
import { Row, Col } from 'antd'
import style from './style.less'

const locales = {
    "en-US": require('../../../../api/language/en-US.json'),
    "zh-CN": require('../../../../api/language/zh-CN.json')
}

export class PlanFdbackInfo extends Component {
    constructor (props) {
        super(props)
        this.state = {
            initDone: false,
            info: {},
        }
    }

    componentDidMount () {
        this.loadLocales()
        this.setState({
            info: this.props.data
        })
    }

    loadLocales() {
        intl.init({
            currentLocale: 'zh-CN',
            locales,
        }).then(() => {
            this.setState({initDone: true});
        });
    }

    render() {
        return (
            <div className={style.main}>
                <h3 className={style.listTitle}>基本信息</h3>
                <div className={style.rightBoxBd}>
                    <div className={style.infoItems}>
                        <div className={style.infoItem}>
                            <div className={style.gutterRowLabel}>名称：</div>
                            <div className={style.gutterRowSpan}>{this.state.info.name}</div>
                            <div className={style.gutterRowLabel}>代码：</div>
                            <div className={style.gutterRowSpan}>ZGYF</div>
                        </div>
                        <div className={style.infoItem}>
                            <div className={style.gutterRowLabel}>责任主体：</div>
                            <div className={style.gutterRowSpan}>{this.state.info.iptName}</div>
                            <div className={style.gutterRowLabel}>责任人：</div>
                            <div className={style.gutterRowSpan}>孙博宇</div>
                        </div>
                        <div className={style.infoItem}>
                            <div className={style.gutterRowLabel}>计划开始时间：</div>
                            <div className={style.gutterRowSpan}>{this.state.info.planStartTime}</div>
                            <div className={style.gutterRowLabel}>计划完成时间：</div>
                            <div className={style.gutterRowSpan}>{this.state.info.planEndTime}</div>
                        </div>
                    </div>
                    <div className={style.infoItems}>
                        <div className={style.infoItem}>
                            <div className={style.gutterRowLabel}>计划工期：</div>
                            <div className={style.gutterRowSpan}>15d</div>
                            <div className={style.gutterRowLabel}>总工时：</div>
                            <div className={style.gutterRowSpan}>240h</div>
                        </div>
                        <div className={style.infoItem}>
                            <div className={style.gutterRowLabel}>计划类型：</div>
                            <div className={style.gutterRowSpan}>月度计划</div>
                            <div className={style.gutterRowLabel}>计划级别：</div>
                            <div className={style.gutterRowSpan}>一般</div>
                        </div>
                        <div className={style.infoItem}>
                            <div className={style.gutterRowLabel}>作业类型：</div>
                            <div className={style.gutterRowSpan}>任务作业</div>
                            <div className={style.gutterRowLabel}>工期类型：</div>
                            <div className={style.gutterRowSpan}>固定资源用量</div>
                        </div>
                    </div>
                    <div className={style.infoItems}>
                        <div className={style.infoItem}>
                            <div className={style.gutterRowLabel}>控制账户：</div>
                            <div className={style.gutterRowSpan}>是</div>
                            <div className={style.gutterRowLabel}>创建人：</div>
                            <div className={style.gutterRowSpan}>操大赛</div>
                        </div>
                        <div className={style.infoItem}>
                            <div className={style.gutterRowLabel}>发布人：</div>
                            <div className={style.gutterRowSpan}>操大赛</div>
                            <div className={style.gutterRowLabel}>创建日期：</div>
                            <div className={style.gutterRowSpan}>2018-07-10</div>
                        </div>
                        <div className={style.infoItem}>
                            <div className={style.gutterRowLabel}>备注：</div>
                            <div className={style.gutterRowSpan}>暂无</div>
                            <div className={style.gutterRowLabel}>发布日期：</div>
                            <div className={style.gutterRowSpan}>2018-07-10</div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}

export default PlanFdbackInfo
