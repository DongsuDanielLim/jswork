// factory 패턴
function CarMaker () {}
CarMaker.prototype.drive = function () {
  return ['Vroom, I have', this.doors, 'doors'].join(' ')
}
CarMaker.factory = function (type) {
  var constr = type
  var newcar
  if (typeof CarMaker[constr] !== 'function') {
    throw { name: 'Error', message: constr + "doesn't exist" }
  }

  if (typeof CarMaker[constr].prototype.drive !== 'function') {
    CarMaker[constr].prototype = new CarMaker()
  }

  newcar = new CarMaker[constr]()
  return newcar
}

CarMaker.Compact = function () {
  this.doors = 4
}

CarMaker.Convertible = function () {
  this.doors = 2
}

CarMaker.SUV = function () {
  this.doors = 24
}

var corolla = CarMaker.factory('Compact')
var solstice = CarMaker.factory('Convertible')

var test1 = corolla.drive()
var test2 = solstice.drive()
console.log(`test1 ${test1} test2 ${test2}`)
