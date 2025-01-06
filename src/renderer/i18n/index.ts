import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  en: {
    translation: {
      welcome: 'Welcome to WiFly',
      dropzone: {
        drop: 'Drop files here',
        dragOrClick: 'Drag and drop files here or click to select',
        supportedFiles: 'All file types supported',
      },
      fileSelect: {
        title: 'Send files to {{deviceName}}',
      },
      notification: {
        fileReceived: {
          title: 'File Received',
          body: 'File {{fileName}} has been saved',
        },
        transfer: {
          progress: 'File Transfer Progress',
          completed: 'File Transfer Completed',
          error: 'File Transfer Error',
          progressBody: '{{fileName}}: {{percentage}}% completed',
          completedBody: '{{fileName}} transferred successfully',
          errorBody: '{{fileName}} transfer failed: {{error}}',
          cancelled: 'Transfer Cancelled',
          cancelledBody: '{{fileName}} transfer cancelled',
        },
      },
      error: {
        fileSave: 'Failed to save file',
        fileTransfer: 'File transfer failed',
      },
      tray: {
        show: 'Show Window',
        hide: 'Hide Window',
        quit: 'Quit',
        openDownloadFolder: 'Open Download Folder',
        settings: 'Settings',
        autoStart: 'Start on Boot',
        minimizeToTray: 'Minimize to Tray',
      },
      history: {
        title: 'Transfer History',
        empty: 'No transfer history',
        clear: 'Clear History',
        type: {
          send: 'Sent',
          receive: 'Received',
        },
        clearConfirm: {
          title: 'Clear History',
          message: 'Are you sure you want to clear all transfer history?',
        },
        export: 'Export History',
        import: 'Import History',
        delete: 'Delete Record',
        importError: 'Failed to import history',
        exportError: 'Failed to export history',
        deleteError: 'Failed to delete record',
      },
      settings: {
        title: 'Settings',
        theme: 'Theme',
        language: 'Language',
        save: 'Save',
        cancel: 'Cancel',
        theme: {
          light: 'Light',
          dark: 'Dark',
          system: 'System',
        },
        languages: {
          en: 'English',
          zh: '中文',
        }
      },
      common: {
        loading: 'Loading...',
        cancel: 'Cancel',
        confirm: 'Confirm',
      },
    },
  },
  zh: {
    translation: {
      welcome: '欢迎使用 WiFly',
      dropzone: {
        drop: '将文件拖放到此处',
        dragOrClick: '将文件拖放到此处或点击选择',
        supportedFiles: '支持所有文件类型',
      },
      fileSelect: {
        title: '发送文件到 {{deviceName}}',
      },
      notification: {
        fileReceived: {
          title: '文件已接收',
          body: '文件 {{fileName}} 已保存',
        },
        transfer: {
          progress: '文件传输进度',
          completed: '文件传输完成',
          error: '文件传输错误',
          progressBody: '{{fileName}}: 已完成 {{percentage}}%',
          completedBody: '{{fileName}} 传输成功',
          errorBody: '{{fileName}} 传输失败：{{error}}',
          cancelled: '传输已取消',
          cancelledBody: '{{fileName}} 传输已取消',
        },
      },
      error: {
        fileSave: '保存文件失败',
        fileTransfer: '文件传输失败',
      },
      tray: {
        show: '显示窗口',
        hide: '隐藏窗口',
        quit: '退出',
        openDownloadFolder: '打开下载文件夹',
        settings: '设置',
        autoStart: '开机启动',
        minimizeToTray: '最小化到托盘',
      },
      history: {
        title: '传输历史',
        empty: '暂无传输记录',
        clear: '清空历史',
        type: {
          send: '已发送',
          receive: '已接收',
        },
        clearConfirm: {
          title: '清空历史',
          message: '确定要清空所有传输历史记录吗？',
        },
        export: '导出历史',
        import: '导入历史',
        delete: '删除记录',
        importError: '导入历史失败',
        exportError: '导出历史失败',
        deleteError: '删除记录失败',
      },
      common: {
        loading: '加载中...',
        cancel: '取消',
        confirm: '确定',
      },
    },
  },
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'en',
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n; 