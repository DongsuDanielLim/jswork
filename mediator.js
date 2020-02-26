// Mediator 패턴
(function (global, factory) {
  if (typeof exports != 'undefined') {
    exports.Medoator = factory
  } else if (typeof define === 'function' && define.amd) {
    define('mediator-js', [], function () {
      global.Mediator = factory()
      return global.Mediator()
    })
  } else {
    global.Mediator = factory()
  }
}(this, function () {
  // 나중에 참고하기 위한 클래스 인스턴스용 guid 생성
  // subscriber 인스턴스에는 빠른 참조가 가능한 id가 있음
  function guidGenerator () {
    var S4 = function () {
      return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1)
    }
    return (S4() + S4() + '-' + S4() + '-' + S4() + '-' + S4() + '-' + S4() + S4() + S4())
  }

  function Subscriber(fn, options, context) {
    if (!(this instanceof Subscriber)) {
      return new Subscriber(fn, options, context)
    }
    this.id = guidGenerator()
    this.fn = fn
    this.options = options
    this.context = context
    this.channel = null
  }
  
  // Subscriber에 등록한 fn, options, context 를 수정할 수 있도록 함
  Subscriber.prototype = {
    update: function (options) {
      if (options) {
        this.fn = options.fn || this.fn
        this.context = options.context || this.context
        this.options = options.options || this.options
        if (this.channel && this.options && this.options.priority !== undefined) {
          this.channel.setPriority(this.id, this.options.priority)
        }
      }
    }
  }

  function Channel (namespace, parent) {
    if (!(this instanceof Channel)) {
      return new Channel(namespace)
    }
    this.namespace = namespace || ''
    this._subscribers = []
    this._channels = []
    this._parent = parent
    this.stopped = false
  }

  Channel.prototype = {
    addSubscriber: function (fn, options, context) {
      var subscriber = new Subscriber(fn, options, context)

      if (options && options.priority !== undefined) {
        options.priority = options.priority >> 0
        if (options.priority < 0) options.priority = 0
        if (options.priority >= this._subscribers.length) options.priority = this._subscribers.length - 1

        this._subscribers.splice(options.priority, 0, subscriber)
      } else  {
        this._subscribers.push(subscriber)
      }
      subscriber.channel = this
      return subscriber
    },
    
    stopPropagation: function () {
      this.stopped = true
    },

    getSubscriber: function (identifier) {
      var x = 0,
          y = this._subscribers.length

      for (x, y; x < y; x++) {
        if (this._subscribers[x].id === identifier || this._subscribers[x].fn === identifier) {
          return this._subscribers[x]
        }
      }
    },

    setPriority: function (identifier, priority) {
      var oldIndex = 0,
          x = 0,
          sub, firstHalf, lastHalf, y
      for (x = 0, y = this._subscribers.length; x < y; x ++) {
        if (this._subscribers[x].id === identifier || this._subscribers[x].fn === identifier) {
          break
        }
        oldIndex ++
      }

      sub = this._subscribers[oldIndex]
      firstHalf = this._subscribers.slice(0, oldIndex)
      lastHalf = this._subscribers.slice(oldIndex + 1)
      this._subscribers = firstHalf.concat(lastHalf)
      this._subscribers.splice(priority, 0, sub)
    },

    addChannel: function (channel) {
      this._channels[channel] = new Channel((this.namespace ? this.namespace + ':' : '') + channel, this)
    },

    hasChannel: function (channel) {
      return this._channels.hasOwnProperty(channel)
    },

    returnChannel: function (channel) {
      return this._channels[channel]
    },

    removeSubscriber: function (identifier) {
      var x = this._subscribers.length - 1
      if (!identifier) {
        this._subscribers = []
        return
      }

      for (x; x >= 0; x--) {
        if (this._subscribers[x].fn === identifier || this._subscribers[x].id === identifier) {
          this._subscribers[x].channel = null
          this._subscribers.splice(x, 1)
        }
      }
    },

    // subscriber 에게 argument 전달
    publish: function (data) {
      var x = 0,
          y = this._subscribers.length,
          called = false,
          subscriber, 1,
          subsBefore, subsAfter
      
      for (x, y; x < y; x++) {
        if (!this.stopped) {
          subscriber = this._subscribers[x]; if(subscriber.options !== undefined && typeof subscriber.options.predicate === 'function') { 
            if(subscriber.options.predicate.apply(subscriber.context, data)) { 
              subscriber.fn.apply(subscriber.context, data)
              called = true
            } 
          } else { 
            subsBefore = this._subscribers.length
            subscriber.fn.apply(subscriber.context, data)
            subsAfter = this._subscribers.length
            y = subsAfter
            if (subsAfter === subsBefore - 1) { 
              x--
            } 
            called = true
          }
        }

        if(called && subscriber.options && subscriber.options !== undefined) {
          subscriber.options.calls--
          if(subscriber.options.calls < 1) {
            this.removeSubscriber(subscriber.id)
            y--
            x--
          } 
        }
      }

      this.stopped = false
    }
  }

  function Mediator () {
    if(!(this instanceof Mediator)) {
      return new Mediator()
    } 
    this._channels = new Channel('')
  }

  Mediator.prototype = {
    // namespace channel  qksghks
    // application:chat:message:received
    getChannel: function(namespace) {
      var channel = this._channels,
          namespaceHierarchy = namespace.split(':'),
          x = 0, y = namespaceHierarchy.length
      if(namespace === '') {
        return channel
      }
      if(namespaceHierarchy.length > 0) {
        for(x, y; x < y; x++) {
          if(!channel.hasChannel(namespaceHierarchy[x])) {
            channel.addChannel(namespaceHierarchy[x])
          }
          channel = channel.returnChannel(namespaceHierarchy[x])
        }
      }
      return channel
    },

    // Pass in a channel namespace, function to be called, options, and context 
    // to call the function in to Subscribe. It will create a channel if one 
    // does not exist. Options can include a predicate to determine if it 
    // should be called (based on the data published to it) and a priority 
    // index. 
    // sub channel에 namespace 기반으로 Subscriber 등록하기 
    subscribe: function (channelName, fn, options, context) {
      var channel = this.getChannel(channelName)
      options = options || {}
      context = context || {}
      return channel.addSubscriber(fn, options, context)
    },

    // Pass in a channel namespace, function to be called, options, and context
    // to call the function in to Subscribe. It will create a channel if one
    // does not exist. Options can include a predicate to determine if it
    // should be called (based on the data published to it) and a priority
    // index.
    // 한번 호출하고 끝내기
    once: function(channelName, fn, options, context) {
      options = options || {}
      options.calls = 1
      return this.subscribe(channelName, fn, options, context)
    },

    // Returns a subscriber for a given subscriber id / named function and
    // channel namespace
    // 아이디와 명칭으로 Subscriber 얻어오기 (identifier === GUID) 
    getSubscriber: function(identifier, channel) {
      return this.getChannel(channel || "").getSubscriber(identifier)
    },

    // Remove a subscriber from a given channel namespace recursively based on
    // a passed-in subscriber id or named function. 
    remove: function(channelName, identifier) {
      this.getChannel(channelName).removeSubscriber(identifier)
    },

    // Publishes arbitrary data to a given channel namespace. Channels are
    // called recursively downwards; a post to application:chat will post to
    // application:chat:receive and application:chat:derp:test:beta:bananas.
    // Called using Mediator.publish("application:chat", [ args ]); 
    // 퍼블리싱 
    publish: function(channelName) {
      var args = Array.prototype.slice.call(arguments, 1), 
          channel = this.getChannel(channelName)
      args.push(channel)
      this.getChannel(channelName).publish(args)
    }
  }

  // 일반적으로 사용하는 이름으로도 Aliasing
  // Alias some common names for easy interop 
  Mediator.prototype.on = Mediator.prototype.subscribe
  Mediator.prototype.bind = Mediator.prototype.subscribe
  Mediator.prototype.emit = Mediator.prototype.publish
  Mediator.prototype.trigger = Mediator.prototype.publish
  Mediator.prototype.off = Mediator.prototype.remove
  // Finally, expose it all. 
  
  Mediator.Channel = Channel
  Mediator.Subscriber = Subscriber
  Mediator.version = "0.9.5"
  
  return Mediator
  
}))