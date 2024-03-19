import request from './index.js'

export function loadDataSet(param){
  return request({
    url: '/load',
    method: 'post',
    data: param,
  })
}

export function searchProp(param){
  return request({
    url: '/searchProp',
    method: 'post',
    data: param,
  })
}

export function searchInDB(param){
  return request({
    url: '/searchInDB',
    method: 'post',
    data: param,
  })
}

export function runCode(param){
  return request({
    url: '/runCode',
    method: 'post',
    data: param,
  })
}