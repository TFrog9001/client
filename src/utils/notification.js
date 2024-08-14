import { ElNotification } from 'element-plus';

export function showNotification({ title = 'Thông báo', message = '', type = 'info', position = 'top-right', duration = 3000 }) {
    ElNotification({
        title,
        message,
        type,
        position,
        duration,
    });
}