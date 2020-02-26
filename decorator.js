function Sale (price) {
  this.price = price || 100
}
Sale.prototype.getPrice = function () {
  return this.price
}
Sale.prototype.decorate = function (decorator) {
  var F = function () {}
  var overrides = this.constructor.decorators[decorator]
  var i
  var newobj

  F.prototype = this
  newobj = new F()
  newobj.uber = F.prototype
  for (i in overrides) {
    if (overrides.hasOwnProperty(i)) {
      newobj[i] = overrides[i]
    }
  }
  return newobj
}

Sale.decorators = {}
Sale.decorators.fedtax = {
  getPrice: function () {
    var price = this.uber.getPrice()

    price += price * 5 / 100
    return price
  }
}
Sale.decorators.money = {
  getPrice: function () {
    return '$' + this.uber.getPrice().toFixed(2)
  }
}

var test = new Sale(100)
test = test.decorate('fedtax')
test = test.decorate('money')
test = test.getPrice()
console.log('result : ', test)
