import { Modal } from 'antd';

export function infoModal(message) {
  Modal.info({
    title: 'Info',
    content: message,
  });
}

export function successModal(message) {
  Modal.success({
    title: 'Success',
    content: message,
  });
}

export function errorModal(message) {
  Modal.error({
    title: 'Error',
    content: message,
  });
}