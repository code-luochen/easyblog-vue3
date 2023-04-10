import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  base:'./',
  plugins: [vue()],
  server:{
    hmr:true,
    port:3001,
    proxy:{
      '/api':{
        target:"http://localhost:8081",// 目标代理接口
        secure:false,
        changeOrigin:true, // 开启代理，在本地建立一个虚拟的服务器
        pathRewrite:{
          '^/api':'/api',
        },
      },
    },
  },
  // 配置path，需要安装和引入
  resolve:{
    // 配置路径别名
    alias:{
      '@':path.resolve(__dirname,'./src'),
    }
  }

})
