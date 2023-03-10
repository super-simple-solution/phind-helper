import axios from 'axios'

axios.defaults.withCredentials = false
axios.defaults.mode = 'no-cors'

const service = axios.create({
  baseURL: `${location.origin}/`,
  timeout: 30000, // 请求超时时间
})

// service.interceptors.request.use(
//   (config) => {
//     return config
//   },
//   (error) => {
//     return Promise.reject(error)
//   },
// )

service.interceptors.response.use(
  (response) => {
    const data = response.data
    return data
  },
  (error) => {
    return Promise.reject(error)
  },
)

export default service
