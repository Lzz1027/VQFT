import axios from "axios";

const service = axios.create({
  baseURL: '/api',
  timeout: 10000,
  headers:{
    'Content-Type':'application/json'
  },
})


// 请求拦截器
service.interceptors.request.use(
  function(config){
    // 请求前处理
    return config
  },
  function (error){
    // 错误处理
    return error
  }
)

// 响应拦截器
service.interceptors.response.use(
  function(response){
    // 成功时
    const res = response.data;
    return res
  },
  function (error) {
    console.log(error);
    return Promise.reject(error)
  }
)

export default service