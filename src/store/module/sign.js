import {
  nowSignRecord
} from '@/api/sign'

export default {
  state: {
    signedList: [],
    unSignList: [],
  },
  mutations: {
    setSignedList(state, list) {
      state.signedList = list
    },
    setUnSignList(state, list) {
      state.unSignList = list
    }

  },
  getters: {
    timeDown: state => state.timeDown
  },
  actions: {
    getNowSignRecord({
      commit
    }) {
      return new Promise((resolve, reject) => {
        nowSignRecord().then(res => {
          if (res.status === 200) {
            commit("setSignedList", res.signed_record)
            commit("setUnSignList", res.unsigned_record)
            resolve()
          } else {
            reject(res.message)
          }
        }).catch(err => {
          reject(err)
        })
      })

    }
  }
}
