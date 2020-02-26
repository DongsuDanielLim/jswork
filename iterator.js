// iterator 패턴
var agg = (function () {
  var index = 0
  var data = [1, 2, 3, 4, 5]
  var length = data.length

  return {
    next: function () {
      var element
      if (!this.hasNext()) {
        return null
      }
      element = data[index]
      index += 1
      return element
    },
    hasNext: function () {
      return index < length
    },
    rewind: function () {
      index = 0
    },
    current: function () {
      return data[index]
    }
  }
}())

var element
while (element = agg.next()) {
  console.log(element)
}
