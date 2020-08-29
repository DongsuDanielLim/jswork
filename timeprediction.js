function formatToSecond (time) {
  let hms = time
  let splitedTimeFormat = hms.split(':')

  let second = 0, m = 1
  while (splitedTimeFormat.length > 0) {
    second += m * parseInt(splitedTimeFormat.pop(), 10)
    m *= 60
  }
  return second
}

function secondToFormat (seconds) {
  let hour = Math.floor(seconds / (60 * 60))
  let minute = Math.floor((seconds - (hour * (60 * 60))) / 60)
  let second = Math.floor(seconds - (hour * (60 * 60)) - minute * 60)
  return `${hour}:${minute}:${second}`
}

/**
 * 
 * @param {Object} record 기록, distance 거리(km)
 * @param {Object} purposeDistance 목표 거리
 * [ T 2 = T 1 × (D 2 ÷ D 1 ) 1.06 ]
 * T 1 = 현재의 기록
 * D 1 = 그 기록의 거리
 * D 2 = 앞으로 뛰고자 목표한 거리
 * T 2 = 거리에 대한 예상시간
 */
function timePrediction ({record, distance}, purposeDistance) {
  let t1 = formatToSecond(record)
  let t2 = t1 * ((Number(purposeDistance) / Number(distance)) ** 1.06)
  return secondToFormat(t2)
}

let source = {
  record: '14:16',
  distance: 3
}

let purposeDistance = 10

let result = timePrediction(source, 10)
console.log('result : ', result)

