import { notification } from "antd"

export default function NotificationTIp (title, content){

    notification.warning(
        {
            placement: 'bottomRight',
            bottom: 50,
            duration: 1,
            message: title,
            description: content
        }
    )
    return
}