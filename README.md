# Z Game

[![cocos](https://badgen.net/badge/icon/Cocos%20Creator%203.x/black?icon=awesome&label)](https://www.npmjs.com/package/zgame)
[![typescript](https://badgen.net/badge/icon/TypeScript?icon=typescript&label)](https://www.npmjs.com/package/zgame)
[![npm](https://badgen.net/npm/v/zgame?color=cyan)](https://www.npmjs.com/package/zgame)
[![publis size](https://badgen.net/packagephobia/publish/zgame?color=green)](https://www.npmjs.com/package/zgame)
[![license](https://badgen.net/github/license/speedphp/zgame)](https://github.com/SpeedPHP/zgame/blob/main/LICENSE)

Game development kit for Cocos Creator 3.x, support annotations by TypeScript.

### Features

- For [Cocos Creator 3.x](https://www.cocos.com/) with TypeScript.
- By decorators, same as Java annotations.
- Event-base MVC, support component autoware, ```@view```, ```@model```, ```@event```, and ```eventCenter```.
- Easier websocket by Event with Socket.io, ```@ws```, ```@ConfigSocketIO```, ```@ioConnect```, and ```socket``` instance.
- Http Request by Event as the same way with annotations， ```@http```, ```eventCenter.get()``` and ```eventCenter.post()```.

### Install

```npm install zgame```

### Usage

**Controller and Events loops**

- Use ```eventCenter``` to emit events for action in somewhere, especially in the View component.
- Methode by the ```@event``` can respond to such events and run the code inside the method.

Somewhere to emit the event:
```
import { eventCenter } from "zgame";

eventCenter.emit(EeventType.ButtonOnClick, {user: "zzz"});
```

And respond the event and get the passed data:
```
import { event } from "zgame";

@event(EeventType.ButtonOnClick)
onButtonClick(user: UserDTO) {
    //console.log("got click action by " + user);
}
```

**WebSocket with Event usage**

- Method with ```@ConfigSocketIO``` in global ```Game.ts``` can set up the Socket.io connection by ```ioConnect```.
- Receive the Socket.io event by methods marked ```@ws```, including ```connect```, ```disconnect``` etc.
- Use the ```socket``` instance by Socket.io to send the event to the websocket server.

Game.ts, the global file for the Cocos script.
```
import { _decorator, Component } from 'cc';
import { ConfigSocketIO, ioConnect } from "zgame";
const { ccclass, executionOrder } = _decorator;

@ccclass('Game')
@executionOrder(-1) // Make Game.ts the first class to be executed
export class Game extends Component {
    @ConfigSocketIO() 
    createSocketIO() { 
        // Build the websocket connection by configuring.
        return ioConnect("http://127.0.0.1:3000", {transports : ['websocket']});
    }
}
```
In somewhere set the member method for receive the event from Socket.io server.
And send the event and data to server by ```socket``` instance.
```
import { ws, socket } from "zgame";

@ws("connect")
onconnect(e) {
    console.log(e);
    socket.emit("message", "I am zzz"); // send msg to server.
}

@ws("message")
getMessage(msg) {
    //console.log(msg);
}
```
About the ```socket``` instance usage, please visit the [Socket.io document](https://socket.io/docs/v4/server-api/#socket).

**Http Request with Event usage**

- Use the ```eventCenter.get()``` or ```eventCenter.post()``` to send a asynchronous http request to some server.
- Method with ```@http``` will listen to the http response.

In some Component we set up the listener for receive the http response:

```
import { http } from "zgame";

@http("infomationByGet")
onInformation(...args) {
    console.log("got a response: " + args);
}

@http("infomationByPost")
onResult(...args) {
    console.log("got another response: " + args);
}
```
And we can send the ```get``` or ```post``` by ```eventCenter````.

```
import { eventCenter } from "zgame";

// example in some start(){} we get
start () {
    eventCenter.get("infomationByGet", 'http://localhost:3000/index.php');
}

// or post with data, and optional response type 
eventCenter.post("infomationByPost",
    'http://localhost:3000/post',
    JSON.stringify({"name":"zzz", isPlayer:true}),
    "json" // response type, default "" for plain.
);

```

**Autoware for view and model**

- Autoware the view and model for convenient use, same as Spring Autoware.
- The ```@view``` can get a Component by passing the path string.
- The ```@model``` can get a singleton object as a domain model. 

Some Component property:
```
import { view } from "zgame";

@view('Main Camera/Canvas/SpriteSplash')
theSpriteSplash: Node;
``` 
It is equivalent to:
```
const theSpriteSplash: Node = find('Main Camera/Canvas/SpriteSplash');
```           
The ```find ``` is the function of Cocos in [document](https://docs.cocos.com/creator/3.3/manual/zh/scripting/access-node-component.html#%E5%85%A8%E5%B1%80%E5%90%8D%E5%AD%97%E6%9F%A5%E6%89%BE).

And ```@model``` in some Component property:
```
import { model } from "zgame";

@model(UserModel)
userModel: UserModel;
```
Then you can get a userModel which is a singleton object.


### About

Github：[https://github.com/speedphp/zgame](https://github.com/speedphp/zgame)

The Z Game project follows the open source agreement of the ```MIT License```.

Thanks: [Cocos Creator](https://www.cocos.com/), [Socket.io](https://socket.io/)

Issue: [https://github.com/SpeedPHP/zgame/issues](https://github.com/SpeedPHP/zgame/issues)