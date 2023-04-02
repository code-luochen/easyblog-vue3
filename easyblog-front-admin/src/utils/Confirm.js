
import { ElMessage, ElMessageBox } from 'element-plus'

const confirm = (message,okfun)=>{
    ElMessageBox.confirm(
        message,
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'info',
        }
      )
        .then(() => {
         okfun()
        })
        .catch(() => {
        //  可以什么都不做，但是要留这个方法，不然会报错
        })
}

export default confirm


