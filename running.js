class Utils {
  static zeroPadding (strNum) {
    const _padding = '00'
    if (!strNum || strNum === _padding) return _padding

    const _size = 2
    const _s = _padding + strNum
    return _s.substring(_s.length - _size)
  }

  static formatToSecond (time) {
    let hms = time
    let splitedTimeFormat = hms.split(':')
  
    let second = 0, m = 1
    while (splitedTimeFormat.length > 0) {
      second += m * parseInt(splitedTimeFormat.pop(), 10)
      m *= 60
    }
    return second
  }
  
  static secondToFormat (seconds) {
    let hour = Math.floor(seconds / (60 * 60))
    let minute = Math.floor((seconds - (hour * (60 * 60))) / 60)
    let second = Math.floor(seconds - (hour * (60 * 60)) - minute * 60)
    
    return `${Utils.zeroPadding(hour)}:${Utils.zeroPadding(minute)}:${Utils.zeroPadding(second)}`
  }
}

/**
 * Pete Riegel 공식
 * @param {Object} record 기록, distance 거리(km)
 * @param {Object} purposeDistance 목표 거리
 * t2 = t1 × (d2 ÷ d1 )^1.06
 * t1 = 기록
 * d2 = 기록의 거리
 * d2 = 목표 거리
 * t2 = 목표 거리 예상 기록
 */

class Running {
  constructor ({record, distance}) {
    this.record = record
    this.recordSecond = Utils.formatToSecond(record)
    this.distance = distance
    this.secondPerKilometer = Math.floor(this.recordSecond / this.distance)
  }

  getRecord () {
    return {
      distance: this.distance,
      record: Utils.secondToFormat(this.recordSecond)
    }
  }

  peteRiegel (purposeDistance) {
    let t2 = this.recordSecond * ((Number(purposeDistance) / this.distance) ** 1.06)
    this._five = this.recordSecond * ((5 / this.distance) ** 1.06)
    this._ten = this.recordSecond * ((10 / this.distance) ** 1.06)
    this._half = this.recordSecond * ((21 / this.distance) ** 1.06)
    this._full = this.recordSecond * ((42.195 / this.distance) ** 1.06)
    
    return Utils.secondToFormat(t2)
  }

  /**
   * Easy run : PB 기준, 1km 페이스 에서 75초 느린 페이스
   */
  easyRun () {
    return Utils.secondToFormat(this.secondPerKilometer + 75)
  }

  /**
   * LSD : 풀코스 예상 기록 기준, 1km 페이스 에서 75초 느린 페이스
   */
  lsd () {
    return Utils.secondToFormat((this._full / 42.195) + 75)
  }

  /**
   * Tempo run : 풀코스 예상 기록 기준, 1km 페이스 에서 10 ~ 15초 빠른 페이스
   */
  tempo () {
    return Utils.secondToFormat((this._full / 42.195) - 15)
  }

  /**
   * 최대 산소 훈련 페이스 : PB 기준, 1km 페이스 에서 10초 빠른 페이스
   */
  voMaxinterval() {
    return Utils.secondToFormat(this.secondPerKilometer - 10)
  }

  /**
   * Bart Yasso 훈련 페이스 : PB 기준, 1km 페이스 대비 800m 페이스
   * 1000 : PB/km = 800 : [Bart Yasso pase]
   */
  bartYasso () {
    return Utils.secondToFormat(Math.floor((this.secondPerKilometer * 800) / 1000))
  }
}

let pb = {record: '12:46', distance: 3}
const running = new Running(pb)
const {record: pbRecord, distance: pbDistance} = running.getRecord()
console.log(`\n ## 현재 PB - 거리 : ${pbDistance}km 기록 : ${pbRecord} ##\n`)

let prediction5kmRecord = running.peteRiegel(5)
let prediction10kmRecord = running.peteRiegel(10)
let predictionHalfRecord = running.peteRiegel(21)
let predictionFullRecord = running.peteRiegel(42.195)
console.log(` 5km 예상기록 :  ${prediction5kmRecord}`)
console.log(` 10km 예상기록 :  ${prediction10kmRecord}`)
console.log(` 21km 예상기록 :  ${predictionHalfRecord}`)
console.log(` 42.195km 예상기록 :  ${predictionFullRecord}`)

console.log('\n ## 훈련 페이스 ##')
let easyRunPace = running.easyRun()
console.log(' Easy Run 페이스 : ', easyRunPace, '\n  -> 훈련 전 워밍업, 훈련 후 쿨다운 페이스\n')

let lsdPace = running.lsd()
console.log(' LSD : ', lsdPace, '\n  -> 장거리 달리기 훈련 페이스\n')

let tempoPace = running.tempo()
console.log(' Tempo Run 페이스 : ', tempoPace, '\n  -> 1.5km + 2분 쿨다운 5세트\n')

let intervalPace = running.voMaxinterval()
console.log(' Interval 훈련 페이스 : ', intervalPace, '\n  -> 800m + 4 ~ 6분 쿨다운 6세트\n')

let bartYassoPace = running.bartYasso()
console.log(' Bart Yasso 훈련 페이스 : ', bartYassoPace, '\n  -> 해당 페이스로 800m + 해당 페이스로 400m 쿨다운. 4세트 도전부터 10세트 달성 목표.\n')